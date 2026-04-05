import { and, eq, inArray, or } from 'drizzle-orm';
import { Profile } from '$lib/server/profile';
import { TMDB } from '$lib/server/tmdb/controller';
import { db } from '$lib/server/db';
import { connection, watchNext, watched } from '$lib/server/db/schema';
import { user as userTable } from '$lib/server/db/auth.schema';
import type { Actions, PageServerLoad } from './$types';

function formatStars(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function joinNames(names: string[]) {
  if (names.length === 0) {
    return '';
  }

  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }

  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function buildWatchedActivity(
  entries: Array<{ userName: string; rating: number | null }>
) {
  if (entries.length === 0) {
    return null;
  }

  const ratedEntries = entries.filter((entry) => entry.rating !== null);

  if (entries.length === 1) {
    const [entry] = entries;

    return {
      headline:
        entry.rating !== null
          ? `${entry.userName} rated this ${formatStars(entry.rating)} stars!`
          : `${entry.userName} watched this`,
      entries,
      expandable: false
    };
  }

  if (entries.length > 3) {
    if (ratedEntries.length > 0) {
      const average =
        ratedEntries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) / ratedEntries.length;

      return {
        headline: `Your connections rated this average ${formatStars(average)} stars!`,
        entries,
        expandable: true
      };
    }

    return {
      headline: `${entries.length} connections have watched this`,
      entries,
      expandable: false
    };
  }

  if (ratedEntries.length > 0) {
    return {
      headline: `${joinNames(ratedEntries.map((entry) => entry.userName))} rated this`,
      entries,
      expandable: true
    };
  }

  return {
    headline: `${joinNames(entries.map((entry) => entry.userName))} watched this`,
    entries,
    expandable: false
  };
}

function buildWatchNextActivity(entries: Array<{ userName: string }>) {
  if (entries.length === 0) {
    return null;
  }

  if (entries.length === 1) {
    return {
      headline: `${entries[0].userName} has this in their Watch Next list!`,
      entries,
      expandable: false
    };
  }

  if (entries.length > 3) {
    return {
      headline: `${entries.length} connections have this in their watch next list!`,
      entries,
      expandable: false
    };
  }

  return {
    headline: `${joinNames(entries.map((entry) => entry.userName))} have this in their Watch Next lists`,
    entries,
    expandable: false
  };
}

export const load: PageServerLoad = async ({ params, parent, locals, url }) => {
  const { watched: watchedItems, watchNext: watchNextItems, reviews } = await parent();
  const id = Number(params.id);
  const movie = await TMDB.getMovie(Number(id), [
    'credits',
    'images',
    'recommendations'
  ].join(','));

  let connectionActivity = {
    watched: null as
      | {
          headline: string;
          entries: Array<{ userName: string; rating: number | null }>;
          expandable: boolean;
        }
      | null,
    watchNext: null as
      | {
          headline: string;
          entries: Array<{ userName: string }>;
          expandable: boolean;
        }
      | null
  };

  if (locals.user) {
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
            eq(connection.initiatorUserId, locals.user.id),
            eq(connection.recipientUserId, locals.user.id)
          )
        )
      );

    const connectedUserIds = acceptedConnections
      .map((row) =>
        row.initiatorUserId === locals.user!.id
          ? row.recipientUserId
          : row.initiatorUserId
      )
      .filter((value): value is string => Boolean(value));

    if (connectedUserIds.length > 0) {
      const [watchedEntries, watchNextEntries] = await Promise.all([
        db
          .select({
            userName: userTable.name,
            rating: watched.rating
          })
          .from(watched)
          .innerJoin(userTable, eq(watched.userId, userTable.id))
          .where(
            and(
              eq(watched.mediaId, id.toString()),
              eq(watched.mediaType, 'movie'),
              inArray(watched.userId, connectedUserIds)
            )
          ),
        db
          .select({
            userName: userTable.name
          })
          .from(watchNext)
          .innerJoin(userTable, eq(watchNext.userId, userTable.id))
          .where(
            and(
              eq(watchNext.mediaId, id.toString()),
              eq(watchNext.mediaType, 'movie'),
              inArray(watchNext.userId, connectedUserIds)
            )
          )
      ]);

      connectionActivity = {
        watched: buildWatchedActivity(
          watchedEntries.map((entry) => ({
            userName: entry.userName,
            rating: entry.rating ? Number(entry.rating) : null
          }))
        ),
        watchNext: buildWatchNextActivity(watchNextEntries)
      };
    }
  }

  return {
    movie,
    movieWatched: watchedItems?.find(item => item.mediaId === id.toString()) || null,
    movieWatchNext: watchNextItems?.find(item => item.mediaId === id.toString()) || null,
    movieReview: reviews?.find(r => r.mediaId === id.toString() && r.mediaType === 'movie') || null,
    connectionActivity,
    ogImageUrl: `${url.origin}/movie/${id}/og`
  };
};

export const actions: Actions = {
  addToWatchNext: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    const movie = await TMDB.getMovie(id);
    const {title, poster_path, release_date} = movie;
    await profile.watchNext.add({
      mediaId: id.toString(),
      mediaType: 'movie',
      title: title ?? 'Untitled',
      posterPath: poster_path ?? undefined,
      releaseYear: release_date ? new Date(release_date).getFullYear() : undefined
    });
    return { success: true, message: 'Movie added to watchlist' }; 
  },
  removeFromWatchNext: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    await profile.watchNext.remove(id.toString());
    return { success: true, message: 'Movie removed from watchlist' }; 
  },
  markWatched: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    const movie = await TMDB.getMovie(id);
    const {title, poster_path, release_date, genres} = movie;
    await profile.watched.add({
      mediaId: id.toString(),
      title: title ?? 'Untitled',
      mediaType: 'movie',
      posterPath: poster_path ?? undefined,
      releaseYear: release_date ? new Date(release_date).getFullYear() : undefined,
      genreIds: genres?.slice(0,4).map(g => g.id) || []
    });
    return { success: true, message: 'Movie marked as watched' }; 
  },
  removeFromWatched: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    await profile.watched.remove(id.toString());
    await profile.reviews.remove(id.toString());
    return { success: true, message: 'Movie removed from watched list' }; 
  },
  addReview: async ({ request, locals, params }) => {
      if (!locals.user) {
        return { success: false, message: 'User not logged in' };
      }
      const formData = await request.formData();
      const rating = Number(formData.get('rating'));
      const reviewText = String(formData.get('reviewText') || '');
      const id = Number(params.id);
      const profile = Profile.forUser(locals.user.id);
      const existingReviews = await profile.reviews.list()
      const existingReview = existingReviews.find(r => r.mediaId === id.toString() && r.mediaType === 'movie');
      if (existingReview) {
        await profile.reviews.update(
          id.toString(),
          { body: reviewText}
        );
      } else {
        await profile.reviews.create({
          mediaId: id.toString(),
          mediaType: 'movie',
          body: reviewText
        });
      }
      await profile.watched.updateRating(id.toString(), rating);
      return { success: true, message: 'Review added successfully' }; 
    }
}
