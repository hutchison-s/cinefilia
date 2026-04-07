export type HomeDiscoveryMovie = {
  mediaId: number | string;
  title: string;
  posterPath: string | null;
  rating: number;
  releaseDate?: string;
  releaseYear?: number | null;
};

export type HomeDiscoveryRecommendationSection = {
  id: 'connections' | 'genre' | 'actor';
  title: string;
  movies: HomeDiscoveryMovie[];
  viewMoreLink?: string;
};

export type HomeDiscoveryPayload = {
  inTheaters: HomeDiscoveryMovie[];
  recommendationSections: HomeDiscoveryRecommendationSection[];
};
