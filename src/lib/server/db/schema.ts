import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

/* ─────────────────────────────────────────────
   WATCHED
   One row per user per media
   Stores rating + watch metadata
───────────────────────────────────────────── */

export const watched = pgTable(
  'watched',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    mediaId: text('media_id').notNull(),      // TMDB ID
    mediaType: text('media_type').notNull(),  // 'movie' | 'tv'

    title: text('title').notNull(),
    posterPath: text('poster_path'),
    releaseYear: integer('release_year'),
    genreIds: integer('genre_ids').array(),

    // ⭐ Rating: 0.0 – 5.0 (half stars allowed)
    rating: numeric('rating', { precision: 2, scale: 1 }),

    watchedAt: timestamp('watched_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    index('watched_user_idx').on(table.userId),
    index('watched_media_idx').on(table.mediaId),
    uniqueIndex('watched_user_media_unique').on(
      table.userId,
      table.mediaId,
      table.mediaType
    )
  ]
);

/* ─────────────────────────────────────────────
   WATCH NEXT
   User watchlist / queue
───────────────────────────────────────────── */

export const watchNext = pgTable(
  'watch_next',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    mediaId: text('media_id').notNull(),
    mediaType: text('media_type').notNull(),

    title: text('title').notNull(),
    posterPath: text('poster_path'),
    releaseYear: integer('release_year'),

    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [
    index('watch_next_user_idx').on(table.userId),
    index('watch_next_media_idx').on(table.mediaId),
    uniqueIndex('watch_next_user_media_unique').on(
      table.userId,
      table.mediaId,
      table.mediaType
    )
  ]
);

/* ─────────────────────────────────────────────
   REVIEW
   Long-form content (optional, public/private)
───────────────────────────────────────────── */

export const review = pgTable(
  'review',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    mediaId: text('media_id').notNull(),
    mediaType: text('media_type').notNull(),

    body: text('body').notNull(),

    spoiler: boolean('spoiler').default(false).notNull(),

    // 🔒 Visibility control
    isPrivate: boolean('is_private').default(false).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [
    index('review_user_idx').on(table.userId),
    index('review_media_idx').on(table.mediaId),
    uniqueIndex('review_user_media_unique').on(
      table.userId,
      table.mediaId,
      table.mediaType
    )
  ]
);

/* ─────────────────────────────────────────────
   GENRE
   Cached TMDB genres
───────────────────────────────────────────── */

export const genre = pgTable(
  'genre',
  {
    id: integer('id').primaryKey(), // TMDB genre id
    name: text('name').notNull(),
    backdropPath: text('backdrop_path'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull()
  },
  (table) => [
    uniqueIndex('genre_name_unique').on(table.name)
  ]
);


export * from './auth.schema';
