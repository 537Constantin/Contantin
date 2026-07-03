/**
 * Server-side mailbox config storage. The IMAP credentials live in a StoreItem
 * (kind "mailbox") written and read ONLY by the server (never via the generic
 * /api/store), with the password encrypted at rest. Scoped per signed-in user.
 */
import { Prisma } from "@prisma/client";
import { db, dbEnabled } from "@/lib/db";
import { clerkEnabled } from "@/lib/auth";
import { encrypt, decrypt, type Encrypted } from "@/lib/mail-crypto";

const KIND = "mailbox";

export interface MailboxConfig {
  host: string;
  port: number;
  secure: boolean;
  email: string;
  updatedAt: string;
}

interface StoredMailbox extends MailboxConfig {
  cred: Encrypted;
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

export async function saveMailbox(
  scope: string,
  cfg: { host: string; port: number; secure: boolean; email: string; password: string },
): Promise<boolean> {
  if (!dbEnabled || !db) return false;
  const cred = encrypt(cfg.password);
  if (!cred) return false;
  const data: StoredMailbox = {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    email: cfg.email,
    updatedAt: new Date().toISOString(),
    cred,
  };
  await db.storeItem.upsert({
    where: { id: rowId(scope) },
    create: { id: rowId(scope), scope, kind: KIND, data: data as unknown as Prisma.InputJsonValue, createdAt: new Date() },
    update: { data: data as unknown as Prisma.InputJsonValue },
  });
  return true;
}

/** Public config (no credentials) for the UI. */
export async function getMailboxConfig(scope: string): Promise<MailboxConfig | null> {
  if (!dbEnabled || !db) return null;
  const row = await db.storeItem.findUnique({ where: { id: rowId(scope) } });
  if (!row) return null;
  const d = row.data as unknown as StoredMailbox;
  return { host: d.host, port: d.port, secure: d.secure, email: d.email, updatedAt: d.updatedAt };
}

/** Full config incl. decrypted password — server IMAP use only. */
export async function getMailboxWithPassword(
  scope: string,
): Promise<{ host: string; port: number; secure: boolean; email: string; password: string } | null> {
  if (!dbEnabled || !db) return null;
  const row = await db.storeItem.findUnique({ where: { id: rowId(scope) } });
  if (!row) return null;
  const d = row.data as unknown as StoredMailbox;
  const password = decrypt(d.cred);
  if (password === null) return null;
  return { host: d.host, port: d.port, secure: d.secure, email: d.email, password };
}

export async function deleteMailbox(scope: string): Promise<void> {
  if (!dbEnabled || !db) return;
  await db.storeItem.deleteMany({ where: { id: rowId(scope) } });
}
