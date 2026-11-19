import { describe, it, expect } from 'vitest';
import { calculateBookingQuote } from '../services/bookingAlgorithm.js';

describe('Feature 2: Cinema Watch-Party Booking DP Algorithm', () => {
  it('Expected Result 1: Bundle sizes [1, 3, 4] and group size 6 returns 2 bundles: 3 × 2', () => {
    const quote = calculateBookingQuote([1, 3, 4], 6, 'test-cinema', 'Test Cinema');

    expect(quote.possible).toBe(true);
    expect(quote.totalBundles).toBe(2);
    expect(quote.formatted).toBe('2 bundles: 3 × 2');
    expect(quote.bundles).toEqual([
      { size: 3, quantity: 2, totalSeats: 6 },
    ]);
  });

  it('Expected Result 2: Bundle sizes [2, 5] and group size 11 returns 4 bundles: 5 × 1, 2 × 3', () => {
    const quote = calculateBookingQuote([2, 5], 11, 'test-cinema', 'Test Cinema');

    expect(quote.possible).toBe(true);
    expect(quote.totalBundles).toBe(4);
    expect(quote.formatted).toBe('4 bundles: 5 × 1, 2 × 3');
    expect(quote.bundles).toEqual([
      { size: 5, quantity: 1, totalSeats: 5 },
      { size: 2, quantity: 3, totalSeats: 6 },
    ]);
  });

  it('Expected Result 3: Bundle sizes [6, 9, 20] and group size 44 returns 4 bundles: 20 × 1, 9 × 2, 6 × 1', () => {
    const quote = calculateBookingQuote([6, 9, 20], 44, 'test-cinema', 'Test Cinema');

    expect(quote.possible).toBe(true);
    expect(quote.totalBundles).toBe(4);
    expect(quote.formatted).toBe('4 bundles: 20 × 1, 9 × 2, 6 × 1');
    expect(quote.bundles).toEqual([
      { size: 20, quantity: 1, totalSeats: 20 },
      { size: 9, quantity: 2, totalSeats: 18 },
      { size: 6, quantity: 1, totalSeats: 6 },
    ]);
    // Total seats: 20*1 + 9*2 + 6*1 = 44
    const totalSeats = quote.bundles!.reduce((sum, b) => sum + b.totalSeats, 0);
    expect(totalSeats).toBe(44);
  });

  it('Expected Result 4: Bundle sizes [4, 6] and group size 7 returns Not possible', () => {
    const quote = calculateBookingQuote([4, 6], 7, 'test-cinema', 'Test Cinema');

    expect(quote.possible).toBe(false);
    expect(quote.message).toBe('Not possible');
    expect(quote.bundles).toBeUndefined();
    expect(quote.totalBundles).toBeUndefined();
  });

  it('Handles large group sizes up to 10,000 efficiently', () => {
    const start = performance.now();
    const quote = calculateBookingQuote([50, 100, 250, 500], 10000, 'mega-cinema', 'Mega IMAX');
    const elapsed = performance.now() - start;

    expect(quote.possible).toBe(true);
    expect(quote.totalBundles).toBe(20); // 500 × 20 = 10,000
    expect(quote.bundles).toEqual([
      { size: 500, quantity: 20, totalSeats: 10000 },
    ]);
    expect(elapsed).toBeLessThan(100); // Executed in under 100ms
  });

  it('Throws error for invalid group sizes (< 1 or > 10,000)', () => {
    expect(() => calculateBookingQuote([2, 5], 0, 'cinema')).toThrow();
    expect(() => calculateBookingQuote([2, 5], 10001, 'cinema')).toThrow();
    expect(() => calculateBookingQuote([2, 5], 3.5, 'cinema')).toThrow();
  });
});
