/**
 * Server-side access to stored items across ALL users. Used by background jobs
 * (the scheduler and event webhooks) that run without a browser session, so
 * they can find scheduled/event workflows and append run history.
 *
 * Only works when a database is configured; returns empty results otherwise.
 * Item ids are namespaced as `${scope}:${kind}:${clientId}` (see /api/store).
 */
import { Prisma } from "@prisma/client";
import { db, dbEnabled } from "@/lib/db";

export interface ScopedItem<T> {
  scope: string;
  data: T;
}

/** All items of a kind across every user, with their owning scope. */
export async function getAllItems<T>(kind: string): Promise<ScopedItem<T>[]> {
  if (!dbEnabled || !db) return [];
  try {
    const rows = await db.storeItem.findMany({ where: { kind } });
    return rows.map((r) => ({ scope: r.scope, data: r.data as T }));
  } catch {
    return [];
  }
}

/** Append one item to a specific user's scope (e.g. a workflow run). */
export async function appendItem(scope: string, kind: string, item: { id: string; createdAt?: string }): Promise<boolean> {
  if (!dbEnabled || !db) return false;
  try {
    await db.storeItem.create({
      data: {
        id: `${scope}:${kind}:${item.id}`,
        scope,
        kind,
        data: item as unknown as Prisma.InputJsonValue,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      },
    });
    return true;
  } catch {
    return false;
  }
}
