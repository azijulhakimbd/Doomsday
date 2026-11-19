export interface Cinema {
  id: string;
  name: string;
  bundleSizes: number[]; // 1 to 10 sizes, each 1 to 500
  createdAt: string;
  updatedAt: string;
}

export interface CreateCinemaDto {
  name: string;
  bundleSizes: number[];
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
