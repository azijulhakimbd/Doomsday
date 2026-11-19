export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number; // 1 to 300 minutes
  prerequisites: string[]; // List of movie IDs
  watched: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface Cinema {
  id: string;
  name: string;
  bundleSizes: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BundleItem {
  size: number;
  quantity: number;
  totalSeats: number;
}

export interface BookingQuoteResult {
  possible: boolean;
  message?: string;
  cinemaId: string;
  cinemaName?: string;
  groupSize: number;
  totalBundles?: number;
  bundles?: BundleItem[];
  formatted?: string;
}
