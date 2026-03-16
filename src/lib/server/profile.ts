import { WatchedRepo } from './repos/watched.repo';
import { WatchNextRepo } from './repos/watch-next.repo';
import { ReviewRepo } from './repos/review.repo';
import { ConnectionRepo } from './repos/connection.repo';
import { db } from './db';

export class Profile {
  readonly userId: string;

  readonly watched: WatchedRepo;
  readonly watchNext: WatchNextRepo;
  readonly reviews: ReviewRepo;
  readonly connections: ConnectionRepo;

  private constructor(userId: string) {
    if (!userId) {
      throw new Error('Profile requires userId');
    }

    this.userId = userId;

    this.watched = new WatchedRepo(userId);
    this.watchNext = new WatchNextRepo(userId);
    this.reviews = new ReviewRepo(userId);
    this.connections = new ConnectionRepo(userId);
  }

  /* ───────────── Factory ───────────── */

  static forUser(userId: string) {
    return new Profile(userId);
  }

  /* ───────────── Domain workflows (optional, add as needed) ───────────── */

  /**
   * Move an item from watch-next → watched
   * (example of cross-repo orchestration)
   */
  async markAsWatched(data: {
    mediaId: string;
    mediaType: string;
    title: string;
    posterPath?: string;
    releaseYear?: number;
    genreIds?: number[];
    rating?: number;
  }) {
    return db.transaction(async (tx) => {
      // note: repos currently use the global db
      // if you want true transactional repos later,
      // you can inject `tx` instead
      await this.watchNext.remove(data.mediaId);
      await this.watched.add(data);
    });
  }

  /**
   * Convenience helper: rate something already watched
   */
  async rate(mediaId: string, rating: number) {
    return this.watched.updateRating(mediaId, rating);
  }

  /**
   * Convenience helper: add a review
   */
  async reviewMedia(data: {
    mediaId: string;
    mediaType: string;
    body: string;
    spoiler?: boolean;
    isPrivate?: boolean;
  }) {
    return this.reviews.create(data);
  }
}
