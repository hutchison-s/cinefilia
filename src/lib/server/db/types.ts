// db/types.ts
import { watched, watchNext, review } from './schema';

export type WatchedItem = typeof watched.$inferSelect;
export type NewWatched = typeof watched.$inferInsert;

export type WatchNextItem = typeof watchNext.$inferSelect;
export type NewWatchNext = typeof watchNext.$inferInsert;

export type ReviewItem = typeof review.$inferSelect;
export type NewReview = typeof review.$inferInsert;
