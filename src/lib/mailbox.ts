/**
 * Server-side mailbox config storage. Mailbox credentials live in a StoreItem
 * (kind "mailbox") written and read ONLY by the server (never via the generic
 * /api/store). Two auth types are supported:
 *   - "password": IMAP with an app password (encrypted at rest)
 *   - "oauth":    Google OAuth (encrypted refresh token; access tokens are
 *                 minted on demand and never stored)
 * Scoped per signed-in user.
 */
import { Prisma } from "@prisma/client";
import { db, dbEnabled } from "@/lib/db";
import { clerkEnabled } from "@/lib/auth";
import { encrypt, decrypt, type Encrypted } from "@/lib/mail-crypto";
import { googleRefreshAccessToken, microsoftRefreshAccessToken } from "@/lib/oauth";

const KIND = "mailbox";

export type MailAuthType = "password" | "oauth";

export interface MailboxConfig {
  authType: MailAuthType;
  provider: string; // "imap" | "google"
  host: string;
  port: number;
  secure: boolean;
  email: string;
  updatedAt: string;
}

interface StoredMailbox extends MailboxConfig {
  cred?: Encrypted; // password (authType "password")
  refreshToken?: Encrypted; // OAuth refresh token (authType "oauth")
}

/** ImapFlow-ready connection info. Exactly one of pass/accessToken is set. */
export interface ImapConnection {
  host: string;
  port: number;
  secure: boolean;
  email: string;
  pass?: string;
  accessToken?: string;
}

/** "user:<id>" when authed, "default" in demo mode, null when auth is on but no user. */
export async function resolveScope(): Promise<string | null> {
  if (!clerkEnabled) return "default";
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ? `user:${userId}` : null;
  } catch {
    return null;
  }
}

function rowId(scope: string) {
  return `${scope}:${KIND}:default`;
}

async function upsert(scope: string, data: StoredMailbox): Promise<boolean> {
  if (!dbEnabled || !db) return false;
  await db.storeItem.upsert({
    where: { id: rowId(scope) },
    create: { id: rowId(scope), scope, kind: KIND, data: data as unknown as Prisma.InputJsonValue, createdAt: new Date() },
    update: { data: data as unknown as Prisma.InputJsonValue },
  });
  return true;
}

/** Save an IMAP mailbox authenticated with an app password. */
export async function saveMailbox(
  scope: string,
  cfg: { host: string; port: number; secure: boolean; email: string; password: string },
): Promise<boolean> {
  const cred = encrypt(cfg.password);
  if (!cred) return false;
  return upsert(scope, {
    authType: "password",
    provider: "imap",
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    email: cfg.email,
    updatedAt: new Date().toISOString(),
    cred,
  });
}

/** Save an OAuth mailbox (currently Google → Gmail IMAP with XOAUTH2). */
export async function saveOAuthMailbox(
  scope: string,
  cfg: { provider: string; email: string; refreshToken: string; host: string; port: number },
): Promise<boolean> {
  const refreshToken = encrypt(cfg.refreshToken);
  if (!refreshToken) return false;
  return upsert(scope, {
    authType: "oauth",
    provider: cfg.provider,
    host: cfg.host,
    port: cfg.port,
    secure: true,
    email: cfg.email,
    updatedAt: new Date().toISOString(),
    refreshToken,
  });
}

async function readStored(scope: string): Promise<StoredMailbox | null> {
  if (!dbEnabled || !db) return null;
  const row = await db.storeItem.findUnique({ where: { id: rowId(scope) } });
  if (!row) return null;
  return row.data as unknown as StoredMailbox;
}

/** Public config (no credentials) for the UI. */
export async function getMailboxConfig(scope: string): Promise<MailboxConfig | null> {
  const d = await readStored(scope);
  if (!d) return null;
  return {
    authType: d.authType ?? "password",
    provider: d.provider ?? "imap",
    host: d.host,
    port: d.port,
    secure: d.secure,
    email: d.email,
    updatedAt: d.updatedAt,
  };
}

/**
 * Everything needed to open an IMAP connection — server-only. For OAuth
 * mailboxes this refreshes the Google access token on the fly.
 */
export async function getImapConnection(scope: string): Promise<ImapConnection | null> {
  const d = await readStored(scope);
  if (!d) return null;

  if ((d.authType ?? "password") === "oauth") {
    if (!d.refreshToken) return null;
    const refresh = decrypt(d.refreshToken);
    if (refresh === null) return null;
    const accessToken =
      d.provider === "microsoft"
        ? await microsoftRefreshAccessToken(refresh)
        : await googleRefreshAccessToken(refresh);
    if (!accessToken) return null;
    return { host: d.host, port: d.port, secure: d.secure, email: d.email, accessToken };
  }

  if (!d.cred) return null;
  const pass = decrypt(d.cred);
  if (pass === null) return null;
  return { host: d.host, port: d.port, secure: d.secure, email: d.email, pass };
}

export async function deleteMailbox(scope: string): Promise<void> {
  if (!dbEnabled || !db) return;
  await db.storeItem.deleteMany({ where: { id: rowId(scope) } });
}
