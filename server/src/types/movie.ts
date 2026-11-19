export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number; // 1 to 300 minutes
  prerequisites: string[]; // List of movie IDs required before watching this movie
  watched: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovieDto {
  title: string;
  releaseYear: number;
  runtime: number;
  prerequisites?: string[];
  watched?: boolean;
}

export interface UpdateMovieDto {
  title?: string;
  releaseYear?: number;
  runtime?: number;
  prerequisites?: string[];
  watched?: boolean;
}

export interface RewatchOrderResult {
  targetMovie: Movie;
  rewatchOrder: Movie[];
  totalMovies: number;
  watchedCount: number;
  unwatchedCount: number;
  unwatchedRuntime: number;
  totalRuntime: number;
}
