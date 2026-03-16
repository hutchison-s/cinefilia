import { error } from '@sveltejs/kit';
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { connection } from '$lib/server/db/schema';
import { user as userTable } from '$lib/server/db/auth.schema';
import { ConnectionRepo } from '$lib/server/repos/connection.repo';

export const CONNECTION_STATUSES = ['pending', 'accepted', 'rejected'] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

type ConnectionRecord = typeof connection.$inferSelect;

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeStatus(status: ConnectionStatus) {
  return {
    status,
    acceptedAt: status === 'accepted' ? new Date() : null,
    rejectedAt: status === 'rejected' ? new Date() : null
  };
}

export class ConnectionService {
  static async createLinkInvite(initiatorUserId: string) {
    const shareId = crypto.randomUUID();

    await db.insert(connection).values({
      shareId,
      status: 'pending',
      initiatorUserId
    });

    return shareId;
  }

  static async createEmailInvite(initiatorUserId: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw error(400, 'Enter a full email address.');
    }

    const [recipient] = await db
      .select({
        id: userTable.id,
        email: userTable.email,
        name: userTable.name
      })
      .from(userTable)
      .where(sql`lower(${userTable.email}) = ${normalizedEmail}`)
      .limit(1);

    if (!recipient) {
      throw error(404, 'No user found for that exact email.');
    }

    if (recipient.id === initiatorUserId) {
      throw error(400, 'You cannot connect with yourself.');
    }

    const existing = await ConnectionService.findBetweenUsers(initiatorUserId, recipient.id);

    if (existing) {
      await db
        .update(connection)
        .set({
          status: 'pending',
          pendingAt: new Date(),
          acceptedAt: null,
          rejectedAt: null
        })
        .where(eq(connection.id, existing.id));

      return {
        recipient,
        recordId: existing.id
      };
    }

    const shareId = crypto.randomUUID();
    const [created] = await db
      .insert(connection)
      .values({
        shareId,
        status: 'pending',
        initiatorUserId,
        recipientUserId: recipient.id
      })
      .returning({ id: connection.id });

    return {
      recipient,
      recordId: created.id
    };
  }

  static async respondToLinkInvite(shareId: string, recipientUserId: string, status: ConnectionStatus) {
    const existingForUser = await ConnectionService.findForShareAndRecipient(shareId, recipientUserId);

    if (existingForUser) {
      if (existingForUser.initiatorUserId === recipientUserId) {
        throw error(400, 'You cannot accept your own invite link.');
      }

      await db
        .update(connection)
        .set(normalizeStatus(status))
        .where(eq(connection.id, existingForUser.id));

      return existingForUser;
    }

    const template = await ConnectionService.findInviteTemplate(shareId);

    if (!template) {
      throw error(404, 'That invite link does not exist.');
    }

    if (template.initiatorUserId === recipientUserId) {
      throw error(400, 'You cannot accept your own invite link.');
    }

    if (template.recipientUserId === null) {
      await db
        .update(connection)
        .set({
          recipientUserId,
          ...normalizeStatus(status)
        })
        .where(eq(connection.id, template.id));

      return template;
    }

    const [created] = await db
      .insert(connection)
      .values({
        shareId: template.shareId,
        status,
        initiatorUserId: template.initiatorUserId,
        recipientUserId,
        pendingAt: template.pendingAt,
        acceptedAt: status === 'accepted' ? new Date() : null,
        rejectedAt: status === 'rejected' ? new Date() : null
      })
      .returning();

    return created;
  }

  static async respondToDirectInvite(recordId: string, recipientUserId: string, status: ConnectionStatus) {
    const [record] = await db
      .select()
      .from(connection)
      .where(and(eq(connection.id, recordId), eq(connection.recipientUserId, recipientUserId)))
      .limit(1);

    if (!record) {
      throw error(404, 'Invite not found.');
    }

    if (record.initiatorUserId === recipientUserId) {
      throw error(400, 'Invalid invite.');
    }

    await db
      .update(connection)
      .set(normalizeStatus(status))
      .where(eq(connection.id, record.id));
  }

  static async stopConnection(recordId: string, userId: string) {
    const [record] = await db
      .select({ id: connection.id })
      .from(connection)
      .where(
        and(
          eq(connection.id, recordId),
          or(eq(connection.initiatorUserId, userId), eq(connection.recipientUserId, userId))
        )
      )
      .limit(1);

    if (!record) {
      throw error(404, 'Connection not found.');
    }

    await db.delete(connection).where(eq(connection.id, recordId));
  }

  static async getConnections(userId: string) {
    return ConnectionRepo.forUser(userId).list();
  }

  static async hasConnection(userId: string, otherUserId: string) {
    return ConnectionRepo.forUser(userId).hasConnection(otherUserId);
  }

  static async getInvite(shareId: string, currentUserId: string) {
    const [existingForUser, template] = await Promise.all([
      ConnectionService.findForShareAndRecipient(shareId, currentUserId),
      db
        .select({
          shareId: connection.shareId,
          initiatorUserId: connection.initiatorUserId,
          initiatorUserName: userTable.name,
          initiatorUserEmail: userTable.email
        })
        .from(connection)
        .innerJoin(userTable, eq(connection.initiatorUserId, userTable.id))
        .where(eq(connection.shareId, shareId))
        .orderBy(desc(connection.createdAt))
        .limit(1)
    ]);

    return {
      existingForUser,
      template: template[0] ?? null
    };
  }

  private static async findBetweenUsers(initiatorUserId: string, recipientUserId: string) {
    const [record] = await db
      .select()
      .from(connection)
      .where(
        and(
          eq(connection.initiatorUserId, initiatorUserId),
          eq(connection.recipientUserId, recipientUserId)
        )
      )
      .orderBy(desc(connection.updatedAt))
      .limit(1);

    return record ?? null;
  }

  private static async findForShareAndRecipient(shareId: string, recipientUserId: string) {
    const [record] = await db
      .select()
      .from(connection)
      .where(and(eq(connection.shareId, shareId), eq(connection.recipientUserId, recipientUserId)))
      .orderBy(desc(connection.updatedAt))
      .limit(1);

    return record ?? null;
  }

  private static async findInviteTemplate(shareId: string): Promise<ConnectionRecord | null> {
    const [nullRecipientRecord, anyRecord] = await Promise.all([
      db
        .select()
        .from(connection)
        .where(and(eq(connection.shareId, shareId), isNull(connection.recipientUserId)))
        .orderBy(desc(connection.createdAt))
        .limit(1),
      db
        .select()
        .from(connection)
        .where(eq(connection.shareId, shareId))
        .orderBy(desc(connection.createdAt))
        .limit(1)
    ]);

    return nullRecipientRecord[0] ?? anyRecord[0] ?? null;
  }
}

export function parseConnectionEmail(formData: FormData) {
  return normalizeEmail(formData.get('email'));
}
