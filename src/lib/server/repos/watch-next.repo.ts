import { db } from '../db';
import { watchNext } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class WatchNextRepo {
  private readonly userId: string;

  constructor(userId: string) {
    if (!userId) throw new Error('WatchNextRepo requires userId');
    this.userId = userId;
  }

  add(data: {
    mediaId: string;
    mediaType: string;
    title: string;
    posterPath?: string;
    releaseYear?: number;
  }) {
    return db.insert(watchNext).values({
      userId: this.userId,
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath,
      releaseYear: data.releaseYear
    });
  }

  remove(mediaId: string) {
    return db
      .delete(watchNext)
      .where(
        and(
          eq(watchNext.userId, this.userId),
          eq(watchNext.mediaId, mediaId)
        )
      );
  }

  list() {
    return db
      .select()
      .from(watchNext)
      .where(eq(watchNext.userId, this.userId));
  }

  static forUser(userId: string) {
    return new WatchNextRepo(userId);
  }
}
