import { db } from '../db';
import { review } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class ReviewRepo {
  private readonly userId: string;

  constructor(userId: string) {
    if (!userId) throw new Error('ReviewRepo requires userId');
    this.userId = userId;
  }

  create(data: {
    mediaId: string;
    mediaType: string;
    body: string;
    spoiler?: boolean;
    isPrivate?: boolean;
  }) {
    return db.insert(review).values({
      userId: this.userId,
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      body: data.body,
      spoiler: data.spoiler ?? false,
      isPrivate: data.isPrivate ?? false
    });
  }

  update(
    mediaId: string,
    data: {
      body?: string;
      spoiler?: boolean;
      isPrivate?: boolean;
    }
  ) {
    return db
      .update(review)
      .set(data)
      .where(
        and(
          eq(review.userId, this.userId),
          eq(review.mediaId, mediaId)
        )
      );
  }

  remove(mediaId: string) {
    return db
      .delete(review)
      .where(
        and(
          eq(review.userId, this.userId),
          eq(review.mediaId, mediaId)
        )
      );
  }

  list() {
    return db
      .select()
      .from(review)
      .where(eq(review.userId, this.userId));
  }

  /* Static, non-user-scoped queries */

  static publicForMedia(mediaId: string) {
    return db
      .select()
      .from(review)
      .where(
        and(
          eq(review.mediaId, mediaId),
          eq(review.isPrivate, false)
        )
      );
  }

  static forUser(userId: string) {
    return new ReviewRepo(userId);
  }
}
