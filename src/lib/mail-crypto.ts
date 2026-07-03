/**
 * Symmetric encryption for stored mailbox credentials. The key is derived from
 * a server-only secret (MAIL_ENCRYPTION_KEY, falling back to CRON_SECRET) — it
 * never reaches the client. Passwords are only ever decrypted server-side to
 * open an IMAP connection.
 */
import crypto from "node:crypto";

function key(): Buffer | null {
  const secret = process.env.MAIL_ENCRYPTION_KEY || process.env.CRON_SECRET || "";
  if (!secret) return null;
  return crypto.createHash("sha256").update(secret).digest();
}

export function cryptoConfigured(): boolean {
  return key() !== null;
}

export interface Encrypted {
  enc: string;
  iv: string;
  tag: string;
}

export function encrypt(plain: string): Encrypted | null {
  const k = key();
  if (!k) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return {
    enc: enc.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decrypt(e: Encrypted): string | null {
  const k = key();
  if (!k) return null;
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", k, Buffer.from(e.iv, "base64"));
    decipher.setAuthTag(Buffer.from(e.tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(e.enc, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
