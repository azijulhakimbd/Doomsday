import { describe, it, expect, beforeEach } from 'vitest';
import { Movie } from '../types/movie.js';
import { wouldCauseCycle, computeRewatchOrder } from '../services/movieAlgorithm.js';

describe('Feature 1: Movie Dependency & Rewatch Order Algorithms', () => {
  let moviesMap: Map<string, Movie>;

  /**
   * Sample Dataset from the Specification:
   * 1. Iron Man: None
   * 2. Captain America: The First Avenger: None
   * 3. The Avengers: Iron Man, The First Avenger
   * 4. Captain America: Civil War: The Avengers
   * 5. Thor: Ragnarok: None
   * 6. Avengers: Infinity War: Civil War, Ragnarok
   * 7. Avengers: Endgame: Infinity War
   * 8. Avengers: Doomsday: Endgame
   */
  beforeEach(() => {
    moviesMap = new Map<string, Movie>();

    const sampleMovies: Movie[] = [
      {
        id: 'iron-man',
        title: 'Iron Man',
        releaseYear: 2008,
        runtime: 126,
        prerequisites: [],
        watched: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'first-avenger',
        title: 'Captain America: The First Avenger',
        releaseYear: 2011,
        runtime: 124,
        prerequisites: [],
        watched: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'the-avengers',
        title: 'The Avengers',
        releaseYear: 2012,
        runtime: 143,
        prerequisites: ['iron-man', 'first-avenger'],
        watched: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'civil-war',
        title: 'Captain America: Civil War',
        releaseYear: 2016,
        runtime: 147,
        prerequisites: ['the-avengers'],
        watched: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ragnarok',
        title: 'Thor: Ragnarok',
        releaseYear: 2017,
        runtime: 130,
        prerequisites: [],
        watched: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'infinity-war',
        title: 'Avengers: Infinity War',
        releaseYear: 2018,
        runtime: 149,
        prerequisites: ['civil-war', 'ragnarok'],
        watched: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'endgame',
        title: 'Avengers: Endgame',
        releaseYear: 2019,
        runtime: 181,
        prerequisites: ['infinity-war'],
        watched: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doomsday',
        title: 'Avengers: Doomsday',
        releaseYear: 2026,
        runtime: 180,
        prerequisites: ['endgame'],
        watched: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const movie of sampleMovies) {
      moviesMap.set(movie.id, movie);
    }
  });

  describe('Rewatch Order Calculations', () => {
    it('Expected Result: Rewatch order for Avengers: Doomsday returns all 7 other movies in valid topological order', () => {
      const result = computeRewatchOrder('doomsday', moviesMap);

      expect(result.totalMovies).toBe(7);
      expect(result.rewatchOrder.map((m) => m.id)).not.toContain('doomsday');

      const orderIds = result.rewatchOrder.map((m) => m.id);
      expect(orderIds).toContain('iron-man');
      expect(orderIds).toContain('first-avenger');
      expect(orderIds).toContain('the-avengers');
      expect(orderIds).toContain('civil-war');
      expect(orderIds).toContain('ragnarok');
      expect(orderIds).toContain('infinity-war');
      expect(orderIds).toContain('endgame');

      // Verify prerequisite ordering constraints:
      // Iron Man and First Avenger must appear BEFORE The Avengers
      expect(orderIds.indexOf('iron-man')).toBeLessThan(orderIds.indexOf('the-avengers'));
      expect(orderIds.indexOf('first-avenger')).toBeLessThan(orderIds.indexOf('the-avengers'));

      // The Avengers must appear BEFORE Civil War
      expect(orderIds.indexOf('the-avengers')).toBeLessThan(orderIds.indexOf('civil-war'));

      // Civil War and Ragnarok must appear BEFORE Infinity War
      expect(orderIds.indexOf('civil-war')).toBeLessThan(orderIds.indexOf('infinity-war'));
      expect(orderIds.indexOf('ragnarok')).toBeLessThan(orderIds.indexOf('infinity-war'));

      // Infinity War must appear BEFORE Endgame
      expect(orderIds.indexOf('infinity-war')).toBeLessThan(orderIds.indexOf('endgame'));

      // Check watched and runtime stats:
      // Watched in test setup: iron-man (126), first-avenger (124), ragnarok (130) -> 3 watched
      // Unwatched: the-avengers (143), civil-war (147), infinity-war (149), endgame (181) -> 4 unwatched
      // Unwatched runtime = 143 + 147 + 149 + 181 = 620 minutes
      expect(result.watchedCount).toBe(3);
      expect(result.unwatchedCount).toBe(4);
      expect(result.unwatchedRuntime).toBe(620);
    });

    it('Expected Result: Rewatch order for Captain America: Civil War returns Iron Man and The First Avenger, then The Avengers', () => {
      const result = computeRewatchOrder('civil-war', moviesMap);

      expect(result.totalMovies).toBe(3);
      const orderIds = result.rewatchOrder.map((m) => m.id);

      expect(orderIds).toContain('iron-man');
      expect(orderIds).toContain('first-avenger');
      expect(orderIds).toContain('the-avengers');

      // Iron Man and First Avenger before The Avengers
      expect(orderIds.indexOf('iron-man')).toBeLessThan(orderIds.indexOf('the-avengers'));
      expect(orderIds.indexOf('first-avenger')).toBeLessThan(orderIds.indexOf('the-avengers'));
    });

    it('Expected Result: Rewatch order for Thor: Ragnarok returns an empty list', () => {
      const result = computeRewatchOrder('ragnarok', moviesMap);

      expect(result.rewatchOrder).toEqual([]);
      expect(result.totalMovies).toBe(0);
      expect(result.watchedCount).toBe(0);
      expect(result.unwatchedCount).toBe(0);
      expect(result.unwatchedRuntime).toBe(0);
    });
  });

  describe('Cycle Detection (409 CIRCULAR_DEPENDENCY validation)', () => {
    it('Expected Result: Making Avengers: Endgame a prerequisite of Iron Man detects a circular dependency', () => {
      // Endgame depends on Infinity War -> Civil War -> The Avengers -> Iron Man
      // Making Endgame a prereq of Iron Man creates a cycle!
      const hasCycle = wouldCauseCycle('iron-man', ['endgame'], moviesMap);
      expect(hasCycle).toBe(true);
    });

    it('Detects direct self-dependency (Iron Man depends on Iron Man)', () => {
      const hasCycle = wouldCauseCycle('iron-man', ['iron-man'], moviesMap);
      expect(hasCycle).toBe(true);
    });

    it('Detects indirect 2-node cycle (The Avengers depends on Civil War)', () => {
      // Civil War currently depends on The Avengers
      const hasCycle = wouldCauseCycle('the-avengers', ['civil-war'], moviesMap);
      expect(hasCycle).toBe(true);
    });

    it('Allows valid non-circular dependencies', () => {
      // Adding Ragnarok as a prerequisite to Civil War (no cycle exists)
      const hasCycle = wouldCauseCycle('civil-war', ['the-avengers', 'ragnarok'], moviesMap);
      expect(hasCycle).toBe(false);
    });
  });
});
