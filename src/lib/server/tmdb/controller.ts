import { env } from '$env/dynamic/private';

type TMDBListResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

type Pagination = {
  page?: number;
};

export class TMDB {
  private static readonly BASE_URL = 'https://api.themoviedb.org/3';

  private static get headers() {
    return {
      Authorization: `Bearer ${env.TMDB_API_TOKEN}`,
      Accept: 'application/json'
    };
  }

  private static async fetch<T>(
    path: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    const url = new URL(`${this.BASE_URL}${path}`);

    // Fallback for endpoints that require api_key explicitly
    if (env.API_KEY) {
      url.searchParams.set('api_key', env.API_KEY);
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const res = await fetch(url.toString(), {
      headers: this.headers
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TMDB error ${res.status}: ${text}`);
    }

    return res.json();
  }

  // ─────────────────────────────────────────────
  // Pagination helper
  // ─────────────────────────────────────────────
  static paginate<T>(response: TMDBListResponse<T>) {
    return {
      ...response,
      hasNextPage: response.page < response.total_pages,
      hasPrevPage: response.page > 1,
      nextPage: response.page < response.total_pages ? response.page + 1 : null,
      prevPage: response.page > 1 ? response.page - 1 : null
    };
  }

  // ─────────────────────────────────────────────
  // Movie lists
  // ─────────────────────────────────────────────

  static async getPopular({ page = 1 }: Pagination = {}) {
    const data = await this.fetch<TMDBListResponse<any>>('/movie/popular', {
      page
    });

    return this.paginate(data);
  }

  static async getTopRated({ page = 1 }: Pagination = {}) {
    const data = await this.fetch<TMDBListResponse<any>>('/movie/top_rated', {
      page
    });

    return this.paginate(data);
  }

  static async getNowPlaying({ page = 1 }: Pagination = {}) {
    const data = await this.fetch<TMDBListResponse<any>>('/movie/now_playing', {
      page
    });

    return this.paginate(data);
  }

  // ─────────────────────────────────────────────
  // Discover filters
  // ─────────────────────────────────────────────

  static async getByGenre(
    genreId: number,
    { page = 1 }: Pagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<any>>('/discover/movie', {
      with_genres: genreId,
      page
    });

    return this.paginate(data);
  }

  static async getByYear(
    year: number,
    { page = 1 }: Pagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<any>>('/discover/movie', {
      primary_release_year: year,
      page,
      sort_by: 'popularity.desc'
    });

    return this.paginate(data);
  }

  static async getByGenreAndYear(
    genreId: number,
    year: number,
    { page = 1 }: Pagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<any>>('/discover/movie', {
      with_genres: genreId,
      primary_release_year: year,
      page,
      sort_by: 'popularity.desc'
    });

    return this.paginate(data);
  }

  // ─────────────────────────────────────────────
  // Movie details
  // ─────────────────────────────────────────────

  static async getMovie(id: number, append?: string) {
    return this.fetch(`/movie/${id}`, {
      append_to_response: append
    });
  }

  static async getCredits(id: number) {
    return this.fetch(`/movie/${id}/credits`);
  }

  // ─────────────────────────────────────────────
  // Genres
  // ─────────────────────────────────────────────

  static async getGenres() {
    return this.fetch('/genre/movie/list');
  }
}
