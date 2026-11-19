import { BundleItem, BookingQuoteResult } from '../types/cinema.js';

/**
 * Custom Fewest Bundles Booking Quote Algorithm
 * 
 * Given cinema bundle sizes and a target group size (1–10,000), finds the
 * fewest total bundles whose seats add up to EXACTLY the group size,
 * so nobody pays for an empty seat.
 * 
 * Implemented using Dynamic Programming (Unbounded Coin Change with Fewest Items)
 * and path reconstruction.
 * 
 * @param bundleSizes Array of available bundle sizes (1 to 500)
 * @param groupSize Target group size (1 to 10,000)
 * @param cinemaId ID of the cinema
 * @param cinemaName Name of the cinema
 * @returns BookingQuoteResult
 */
export function calculateBookingQuote(
  bundleSizes: number[],
  groupSize: number,
  cinemaId: string,
  cinemaName?: string
): BookingQuoteResult {
  // Validate group size
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 10000) {
    throw new Error('Group size must be an integer between 1 and 10,000');
  }

  // Filter and deduplicate valid bundle sizes, sort descending
  const uniqueSizes = Array.from(new Set(bundleSizes.filter((s) => s > 0))).sort((a, b) => b - a);
  if (uniqueSizes.length === 0) {
    return {
      possible: false,
      message: 'Not possible',
      cinemaId,
      cinemaName,
      groupSize,
    };
  }

  // DP Arrays
  // dp[w] = minimum number of bundles needed to form exactly weight w
  // parent[w] = the bundle size used in the optimal transition to w
  const dp: number[] = new Array(groupSize + 1).fill(Infinity);
  const parent: number[] = new Array(groupSize + 1).fill(-1);

  dp[0] = 0;

  // We iterate through bundle sizes (sorted descending so larger bundles are tested first)
  // To minimize total bundles, for any state w:
  // if dp[w - s] + 1 < dp[w], we take the new minimum.
  for (const s of uniqueSizes) {
    for (let w = s; w <= groupSize; w++) {
      if (dp[w - s] !== Infinity) {
        const candidate = dp[w - s] + 1;
        if (candidate < dp[w]) {
          dp[w] = candidate;
          parent[w] = s;
        }
      }
    }
  }

  // If target groupSize is unreachable
  if (dp[groupSize] === Infinity) {
    return {
      possible: false,
      message: 'Not possible',
      cinemaId,
      cinemaName,
      groupSize,
    };
  }

  // Reconstruct the exact combination from parent pointers
  const quantityMap = new Map<number, number>();
  let current = groupSize;

  while (current > 0) {
    const s = parent[current];
    if (s <= 0) {
      break;
    }
    quantityMap.set(s, (quantityMap.get(s) || 0) + 1);
    current -= s;
  }

  // Format bundle items sorted descending by bundle size
  const bundleItems: BundleItem[] = Array.from(quantityMap.entries())
    .map(([size, quantity]) => ({
      size,
      quantity,
      totalSeats: size * quantity,
    }))
    .sort((a, b) => b.size - a.size);

  const totalBundles = dp[groupSize];

  // Build human-readable formatted string, e.g. "4 bundles: 20 × 1, 9 × 2, 6 × 1"
  const formattedParts = bundleItems.map((item) => `${item.size} × ${item.quantity}`);
  const bundleWord = totalBundles === 1 ? 'bundle' : 'bundles';
  const formatted = `${totalBundles} ${bundleWord}: ${formattedParts.join(', ')}`;

  return {
    possible: true,
    cinemaId,
    cinemaName,
    groupSize,
    totalBundles,
    bundles: bundleItems,
    formatted,
  };
}
