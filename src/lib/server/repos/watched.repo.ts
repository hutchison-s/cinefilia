import { db } from '../db';
import { watched } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class WatchedRepo {
  private readonly userId: string;

  constructor(userId: string) {
    if (!userId) throw new Error('WatchedRepo requires userId');
    this.userId = userId;
  }

  add(data: {
    mediaId: string;
    mediaType: string;
    title: string;
    posterPath?: string;
    releaseYear?: number;
    rating?: number;
  }) {
    return db.insert(watched).values({
      userId: this.userId,
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath,
      releaseYear: data.releaseYear,
      rating: data.rating !== undefined ? data.rating.toString() : undefined
    });
  }

  remove(mediaId: string) {
    return db
      .delete(watched)
      .where(
        and(
          eq(watched.userId, this.userId),
          eq(watched.mediaId, mediaId)
        )
      );
  }

  list() {
    return db
      .select()
      .from(watched)
      .where(eq(watched.userId, this.userId));
  }

  updateRating(mediaId: string, rating: number) {
    return db
      .update(watched)
      .set({ rating: rating.toString() })
      .where(
        and(
          eq(watched.userId, this.userId),
          eq(watched.mediaId, mediaId)
        )
      );
  }

  /* Optional static helpers */
  static forUser(userId: string) {
    return new WatchedRepo(userId);
  }
}
