import { and, count, desc, eq, inArray, isNotNull, or } from 'drizzle-orm';
import { db } from '../db';
import { connection, watchNext, watched } from '../db/schema';
import { user as userTable } from '../db/auth.schema';

export class ConnectionRepo {
  private readonly userId: string;

  constructor(userId: string) {
    if (!userId) throw new Error('ConnectionRepo requires userId');
    this.userId = userId;
  }

  async connectedUserIds() {
    const acceptedConnections = await db
      .select({
        initiatorUserId: connection.initiatorUserId,
        recipientUserId: connection.recipientUserId
      })
      .from(connection)
      .where(
        and(
          eq(connection.status, 'accepted'),
          or(
            eq(connection.initiatorUserId, this.userId),
            eq(connection.recipientUserId, this.userId)
          )
        )
      );

    return acceptedConnections
      .map((row) =>
        row.initiatorUserId === this.userId
          ? row.recipientUserId
          : row.initiatorUserId
      )
      .filter((value): value is string => Boolean(value));
  }

  async connectionCountsByMedia() {
    const connectedUserIds = await this.connectedUserIds();

    if (connectedUserIds.length === 0) {
      return {};
    }

    const [watchedConnections, watchNextConnections] = await Promise.all([
      db
        .select({
          mediaId: watched.mediaId,
          userId: watched.userId
        })
        .from(watched)
        .where(inArray(watched.userId, connectedUserIds)),
      db
        .select({
          mediaId: watchNext.mediaId,
          userId: watchNext.userId
        })
        .from(watchNext)
        .where(inArray(watchNext.userId, connectedUserIds))
    ]);

    const counts = new Map<string, Set<string>>();

    for (const entry of [...watchedConnections, ...watchNextConnections]) {
      const existing = counts.get(entry.mediaId) ?? new Set<string>();
      existing.add(entry.userId);
      counts.set(entry.mediaId, existing);
    }

    return Object.fromEntries(
      Array.from(counts.entries()).map(([mediaId, userIds]) => [mediaId, userIds.size])
    ) as Record<string, number>;
  }

  async hasConnection(otherUserId: string) {
    const [record] = await db
      .select({ id: connection.id })
      .from(connection)
      .where(
        and(
          or(
            and(eq(connection.initiatorUserId, this.userId), eq(connection.recipientUserId, otherUserId)),
            and(eq(connection.initiatorUserId, otherUserId), eq(connection.recipientUserId, this.userId))
          ),
          eq(connection.status, 'accepted')
        )
      )
      .limit(1);

    return Boolean(record);
  }

  async incomingPendingCount() {
    const [result] = await db
      .select({ count: count() })
      .from(connection)
      .where(and(eq(connection.recipientUserId, this.userId), eq(connection.status, 'pending')));

    return result ? Number(result.count) : 0;
  }

  async list() {
    const [incomingPending, outgoingPending, acceptedAsInitiator, acceptedAsRecipient] =
      await Promise.all([
        db
          .select({
            id: connection.id,
            shareId: connection.shareId,
            status: connection.status,
            pendingAt: connection.pendingAt,
            initiatorUserId: connection.initiatorUserId,
            initiatorUserName: userTable.name,
            initiatorUserEmail: userTable.email
          })
          .from(connection)
          .innerJoin(userTable, eq(connection.initiatorUserId, userTable.id))
          .where(and(eq(connection.recipientUserId, this.userId), eq(connection.status, 'pending')))
          .orderBy(desc(connection.pendingAt)),
        db
          .select({
            id: connection.id,
            shareId: connection.shareId,
            status: connection.status,
            pendingAt: connection.pendingAt,
            recipientUserId: connection.recipientUserId,
            recipientUserName: userTable.name,
            recipientUserEmail: userTable.email
          })
          .from(connection)
          .leftJoin(userTable, eq(connection.recipientUserId, userTable.id))
          .where(
            and(
              eq(connection.initiatorUserId, this.userId),
              eq(connection.status, 'pending'),
              isNotNull(connection.recipientUserId)
            )
          )
          .orderBy(desc(connection.pendingAt)),
        db
          .select({
            id: connection.id,
            acceptedAt: connection.acceptedAt,
            otherUserId: connection.recipientUserId,
            otherUserName: userTable.name,
            otherUserEmail: userTable.email
          })
          .from(connection)
          .leftJoin(userTable, eq(connection.recipientUserId, userTable.id))
          .where(
            and(
              eq(connection.initiatorUserId, this.userId),
              eq(connection.status, 'accepted'),
              isNotNull(connection.recipientUserId)
            )
          )
          .orderBy(desc(connection.acceptedAt)),
        db
          .select({
            id: connection.id,
            acceptedAt: connection.acceptedAt,
            otherUserId: connection.initiatorUserId,
            otherUserName: userTable.name,
            otherUserEmail: userTable.email
          })
          .from(connection)
          .innerJoin(userTable, eq(connection.initiatorUserId, userTable.id))
          .where(and(eq(connection.recipientUserId, this.userId), eq(connection.status, 'accepted')))
          .orderBy(desc(connection.acceptedAt))
      ]);

    const acceptedConnections = [...acceptedAsInitiator, ...acceptedAsRecipient].sort((a, b) => {
      const left = a.acceptedAt ? new Date(a.acceptedAt).getTime() : 0;
      const right = b.acceptedAt ? new Date(b.acceptedAt).getTime() : 0;
      return right - left;
    });

    return {
      incomingPending,
      outgoingPending,
      acceptedConnections
    };
  }

  static forUser(userId: string) {
    return new ConnectionRepo(userId);
  }
}
