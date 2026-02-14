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
type DiscoverPagination = Pagination & {
  sortBy?: string;
  originCountry?: string;
  releaseDateGte?: string;
  releaseDateLte?: string;
};

export type SearchType = 'multi' | 'movie' | 'tv' | 'person';
export type ExploreType = 'genre' | 'decade' | 'actor';

type SearchOptions = Pagination & {
  query: string;
  includeAdult?: boolean;
  year?: number; // movie-only
};

// ─────────────────────────────────────────────
// Movie Details Types
// ─────────────────────────────────────────────

type Collection = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
};

type Genre = {
  id: number;
  name: string;
};

export type TMDBMovieListItem = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
};

export type TMDBPerson = {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for_department?: string;
  birthday?: string | null;
  deathday?: string | null;
};

type Cast = {
  adult: boolean;
  cast_id: number;
  character: string;
  credit_id: string;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  order: number;
  original_name: string;
  popularity: number;
  profile_path: string | null;
};

type ProductionCompany = {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
};

type ProductionCountry = {
  iso_3166_1: string;
  name: string;
};

type SpokenLanguage = {
  english_name: string;
  iso_639_1: string;
  name: string;
};

export type MovieDetails = {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: Collection | null;
  budget: number;
  genres: Genre[];
  credits: {
    cast: Cast[];
  };
  images: {
    backdrops: Array<{
      file_path: string;
    }>;
    posters: Array<{
      file_path: string;
    }>;
  };
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};


export class TMDB {
  private static readonly BASE_URL = 'https://api.themoviedb.org/3';
  private static readonly MIN_SEARCH_POPULARITY = 2;

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

  static async getByReleaseDateRange(
    {
      page = 1,
      sortBy = 'popularity.desc',
      releaseDateGte,
      releaseDateLte
    }: DiscoverPagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<TMDBMovieListItem>>('/discover/movie', {
      page,
      sort_by: sortBy,
      'primary_release_date.gte': releaseDateGte,
      'primary_release_date.lte': releaseDateLte
    });

    return this.paginate(data);
  }

  // ─────────────────────────────────────────────
  // Discover filters
  // ─────────────────────────────────────────────


  static async listGenres() {
    const data = await this.fetch<{genres: Genre[]}>('/genre/movie/list')
    return data.genres
  }

  static async getByGenre(
    genreId: number,
    { page = 1, sortBy = 'popularity.desc' }: DiscoverPagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<any>>('/discover/movie', {
      with_genres: genreId,
      sort_by: sortBy,
      page
    });

    return this.paginate(data);
  }

  static async getByYear(
    year: number,
    { page = 1, sortBy = 'popularity.desc' }: DiscoverPagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<any>>('/discover/movie', {
      primary_release_year: year,
      page,
      sort_by: sortBy
    });

    return this.paginate(data);
  }

  static async getByGenreAndYear(
    genreId: number,
    year: number,
    { page = 1, sortBy = 'popularity.desc' }: DiscoverPagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<any>>('/discover/movie', {
      with_genres: genreId,
      primary_release_year: year,
      page,
      sort_by: sortBy
    });

    return this.paginate(data);
  }

  static async getByDecade(
    decadeStart: number,
    { page = 1, sortBy = 'popularity.desc' }: DiscoverPagination = {}
  ) {
    const decadeEnd = decadeStart + 9;
    const data = await this.fetch<TMDBListResponse<TMDBMovieListItem>>(
      '/discover/movie',
      {
        'primary_release_date.gte': `${decadeStart}-01-01`,
        'primary_release_date.lte': `${decadeEnd}-12-31`,
        sort_by: sortBy,
        page
      }
    );

    return this.paginate(data);
  }

  static async getPopularPeople({ page = 1 }: Pagination = {}) {
    const data = await this.fetch<TMDBListResponse<TMDBPerson>>('/person/popular', {
      page
    });

    return this.paginate(data);
  }

  static async getByPerson(
    personId: number,
    {
      page = 1,
      sortBy = 'popularity.desc',
      originCountry
    }: DiscoverPagination = {}
  ) {
    const data = await this.fetch<TMDBListResponse<TMDBMovieListItem>>('/discover/movie', {
      with_cast: personId,
      sort_by: sortBy,
      with_origin_country: originCountry,
      page
    });

    return this.paginate(data);
  }

  static async getPerson(personId: number): Promise<TMDBPerson> {
    return this.fetch<TMDBPerson>(`/person/${personId}`);
  }

  // ─────────────────────────────────────────────
  // Movie details
  // ─────────────────────────────────────────────

  static async getMovie(id: number, append?: string): Promise<MovieDetails> {
    return this.fetch<MovieDetails>(`/movie/${id}`, {
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

  // ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────

private static sortByPopularity<T extends { popularity?: number }>(
  results: T[]
) {
  return [...results].sort(
    (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
  );
}

private static filterLowPopularity<T extends { popularity?: number }>(
  results: T[],
  minPopularity = this.MIN_SEARCH_POPULARITY
) {
  return results.filter((item) => (item.popularity ?? 0) >= minPopularity);
}

static async search(
  type: SearchType,
  {
    query,
    page = 1,
    includeAdult = false,
    year
  }: SearchOptions
) {
  if (!query?.trim()) {
    return this.paginate({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    });
  }

  const params: Record<string, string | number | undefined> = {
    query,
    page,
    include_adult: includeAdult ? 'true' : 'false'
  };

  if (type === 'movie' && year) {
    params.year = year;
  }

  const data = await this.fetch<TMDBListResponse<any>>(
    `/search/${type}`,
    params
  );

  const filteredResults = this.filterLowPopularity(data.results);

  return this.paginate({
    ...data,
    results: this.sortByPopularity(filteredResults)
  });
}

}
