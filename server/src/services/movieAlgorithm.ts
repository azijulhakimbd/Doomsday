import { Movie, RewatchOrderResult } from '../types/movie.js';

/**
 * Custom Cycle Detection Algorithm
 * 
 * Determines whether updating or creating `movieId` with `proposedPrerequisites`
 * would introduce a directed cycle in the dependency graph.
 * 
 * Rules:
 * - A movie cannot depend on itself directly (movieId in proposedPrerequisites).
 * - A movie cannot depend on itself indirectly (a path exists from any proposed prerequisite back to movieId).
 * 
 * @param movieId The movie being created or updated
 * @param proposedPrerequisites The list of movie IDs that movieId intends to depend on
 * @param allMovies Map of all existing movies
 * @returns true if a cycle would be created, false otherwise
 */
export function wouldCauseCycle(
  movieId: string,
  proposedPrerequisites: string[],
  allMovies: Map<string, Movie>
): boolean {
  // 1. Direct self-dependency check
  if (proposedPrerequisites.includes(movieId)) {
    return true;
  }

  // 2. Indirect cycle check:
  // If we make movieId depend on P, check if P (or any prerequisite of P) already depends on movieId.
  // We perform Breadth-First Search (BFS) starting from each proposed prerequisite.
  const visited = new Set<string>();
  const queue: string[] = [...proposedPrerequisites];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // If traversal reaches movieId, a cycle would form!
    if (currentId === movieId) {
      return true;
    }

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    const movie = allMovies.get(currentId);
    if (!movie) {
      continue;
    }

    // Traverse currentId's prerequisites
    for (const prereqId of movie.prerequisites) {
      if (prereqId === movieId) {
        return true;
      }
      if (!visited.has(prereqId)) {
        queue.push(prereqId);
      }
    }
  }

  return false;
}

/**
 * Custom Topological Sorting & Rewatch Order Algorithm
 * 
 * Given a target movie, returns every movie needed before it (its prerequisites,
 * their prerequisites, and so on), each exactly once, in an order where every movie
 * comes after its prerequisites (chronological watching order).
 * 
 * Does NOT include the target movie itself.
 * Also returns counts of watched/unwatched movies and total runtime of unwatched ones.
 * 
 * @param targetMovieId ID of the target movie
 * @param allMovies Map of all existing movies
 * @returns RewatchOrderResult
 */
export function computeRewatchOrder(
  targetMovieId: string,
  allMovies: Map<string, Movie>
): RewatchOrderResult {
  const targetMovie = allMovies.get(targetMovieId);
  if (!targetMovie) {
    throw new Error(`Movie with ID "${targetMovieId}" not found`);
  }

  // Step 1: Collect transitive prerequisites using BFS
  const requiredIds = new Set<string>();
  const queue: string[] = [...targetMovie.prerequisites];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === targetMovieId) {
      continue; // Target itself is excluded
    }

    if (requiredIds.has(currentId)) {
      continue;
    }

    const movie = allMovies.get(currentId);
    if (!movie) {
      continue;
    }

    requiredIds.add(currentId);

    for (const prereqId of movie.prerequisites) {
      if (!requiredIds.has(prereqId)) {
        queue.push(prereqId);
      }
    }
  }

  // If there are no prerequisites, return empty order
  if (requiredIds.size === 0) {
    return {
      targetMovie,
      rewatchOrder: [],
      totalMovies: 0,
      watchedCount: 0,
      unwatchedCount: 0,
      unwatchedRuntime: 0,
      totalRuntime: 0,
    };
  }

  // Step 2: Custom Topological Sort (Kahn's Algorithm adapted for Subgraph)
  // We only sort nodes in requiredIds.
  // In watch order: if A is a prerequisite of B, A must appear before B.
  // in-degree of B = count of A in requiredIds where A is a prerequisite of B.
  const inDegree = new Map<string, number>();
  const dependentsMap = new Map<string, string[]>(); // A -> list of movies in requiredIds that depend on A

  for (const id of requiredIds) {
    inDegree.set(id, 0);
    dependentsMap.set(id, []);
  }

  for (const id of requiredIds) {
    const movie = allMovies.get(id)!;
    for (const prereqId of movie.prerequisites) {
      if (requiredIds.has(prereqId)) {
        // movie depends on prereqId
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
        dependentsMap.get(prereqId)!.push(id);
      }
    }
  }

  // Find all movies with in-degree 0 (movies that have no prerequisites within requiredIds)
  const readyQueue: string[] = [];
  for (const id of requiredIds) {
    if (inDegree.get(id) === 0) {
      readyQueue.push(id);
    }
  }

  // Sort initially by releaseYear then title for deterministic tie-breaking
  readyQueue.sort((a, b) => {
    const ma = allMovies.get(a)!;
    const mb = allMovies.get(b)!;
    if (ma.releaseYear !== mb.releaseYear) {
      return ma.releaseYear - mb.releaseYear;
    }
    return ma.title.localeCompare(mb.title);
  });

  const orderedMovies: Movie[] = [];

  while (readyQueue.length > 0) {
    const currentId = readyQueue.shift()!;
    const movie = allMovies.get(currentId)!;
    orderedMovies.push(movie);

    const dependents = dependentsMap.get(currentId) || [];
    for (const depId of dependents) {
      const newDegree = (inDegree.get(depId) || 1) - 1;
      inDegree.set(depId, newDegree);
      if (newDegree === 0) {
        readyQueue.push(depId);
        // Maintain deterministic order
        readyQueue.sort((a, b) => {
          const ma = allMovies.get(a)!;
          const mb = allMovies.get(b)!;
          if (ma.releaseYear !== mb.releaseYear) {
            return ma.releaseYear - mb.releaseYear;
          }
          return ma.title.localeCompare(mb.title);
        });
      }
    }
  }

  // Calculate statistics
  const watchedCount = orderedMovies.filter((m) => m.watched).length;
  const unwatchedMovies = orderedMovies.filter((m) => !m.watched);
  const unwatchedCount = unwatchedMovies.length;
  const unwatchedRuntime = unwatchedMovies.reduce((sum, m) => sum + m.runtime, 0);
  const totalRuntime = orderedMovies.reduce((sum, m) => sum + m.runtime, 0);

  return {
    targetMovie,
    rewatchOrder: orderedMovies,
    totalMovies: orderedMovies.length,
    watchedCount,
    unwatchedCount,
    unwatchedRuntime,
    totalRuntime,
  };
}
