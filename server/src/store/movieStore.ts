import { Movie, CreateMovieDto, UpdateMovieDto } from '../types/movie.js';
import { wouldCauseCycle } from '../services/movieAlgorithm.js';

export class MovieStore {
  private movies: Map<string, Movie> = new Map();

  constructor() {
    this.seedDefaultMCU();
  }

  public getMap(): Map<string, Movie> {
    return this.movies;
  }

  public getAll(): Movie[] {
    return Array.from(this.movies.values()).sort((a, b) => a.releaseYear - b.releaseYear);
  }

  public getById(id: string): Movie | undefined {
    return this.movies.get(id);
  }

  public getByTitle(title: string): Movie | undefined {
    const normalized = title.trim().toLowerCase();
    for (const movie of this.movies.values()) {
      if (movie.title.trim().toLowerCase() === normalized) {
        return movie;
      }
    }
    return undefined;
  }

  public create(dto: CreateMovieDto): Movie {
    const title = dto.title?.trim();
    if (!title) {
      const err = new Error('Title is required');
      (err as any).statusCode = 400;
      throw err;
    }

    if (this.getByTitle(title)) {
      const err = new Error(`Movie with title "${title}" already exists`);
      (err as any).statusCode = 409;
      throw err;
    }

    const runtime = Number(dto.runtime);
    if (isNaN(runtime) || runtime < 1 || runtime > 300) {
      const err = new Error('Runtime must be between 1 and 300 minutes');
      (err as any).statusCode = 400;
      throw err;
    }

    const releaseYear = Number(dto.releaseYear);
    if (isNaN(releaseYear) || releaseYear < 1888 || releaseYear > 2100) {
      const err = new Error('Release year must be a valid year');
      (err as any).statusCode = 400;
      throw err;
    }

    const prerequisites = Array.isArray(dto.prerequisites) ? [...dto.prerequisites] : [];

    // Verify all prerequisites exist
    for (const prereqId of prerequisites) {
      if (!this.movies.has(prereqId)) {
        const err = new Error(`Prerequisite movie with ID "${prereqId}" does not exist`);
        (err as any).statusCode = 400;
        throw err;
      }
    }

    // Generate unique ID based on title slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let id = baseSlug || `movie-${Date.now()}`;
    let counter = 1;
    while (this.movies.has(id)) {
      id = `${baseSlug}-${counter++}`;
    }

    // Check for circular dependency
    if (wouldCauseCycle(id, prerequisites, this.movies)) {
      const err = new Error('Circular dependency detected. A movie cannot depend on itself directly or indirectly.');
      (err as any).statusCode = 409;
      (err as any).code = 'CIRCULAR_DEPENDENCY';
      throw err;
    }

    const now = new Date().toISOString();
    const movie: Movie = {
      id,
      title,
      releaseYear,
      runtime,
      prerequisites,
      watched: Boolean(dto.watched),
      createdAt: now,
      updatedAt: now,
    };

    this.movies.set(id, movie);
    return movie;
  }

  public update(id: string, dto: UpdateMovieDto): Movie {
    const existing = this.movies.get(id);
    if (!existing) {
      const err = new Error(`Movie with ID "${id}" not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    // Title update validation
    let title = existing.title;
    if (dto.title !== undefined) {
      const trimmed = dto.title.trim();
      if (!trimmed) {
        const err = new Error('Title cannot be empty');
        (err as any).statusCode = 400;
        throw err;
      }
      const withSameTitle = this.getByTitle(trimmed);
      if (withSameTitle && withSameTitle.id !== id) {
        const err = new Error(`Movie with title "${trimmed}" already exists`);
        (err as any).statusCode = 409;
        throw err;
      }
      title = trimmed;
    }

    // Runtime update validation
    let runtime = existing.runtime;
    if (dto.runtime !== undefined) {
      const parsedRuntime = Number(dto.runtime);
      if (isNaN(parsedRuntime) || parsedRuntime < 1 || parsedRuntime > 300) {
        const err = new Error('Runtime must be between 1 and 300 minutes');
        (err as any).statusCode = 400;
        throw err;
      }
      runtime = parsedRuntime;
    }

    // Release year update validation
    let releaseYear = existing.releaseYear;
    if (dto.releaseYear !== undefined) {
      const parsedYear = Number(dto.releaseYear);
      if (isNaN(parsedYear) || parsedYear < 1888 || parsedYear > 2100) {
        const err = new Error('Release year must be a valid year');
        (err as any).statusCode = 400;
        throw err;
      }
      releaseYear = parsedYear;
    }

    // Prerequisites update validation & circular dependency check
    let prerequisites = existing.prerequisites;
    if (dto.prerequisites !== undefined) {
      if (!Array.isArray(dto.prerequisites)) {
        const err = new Error('Prerequisites must be an array of movie IDs');
        (err as any).statusCode = 400;
        throw err;
      }

      for (const prereqId of dto.prerequisites) {
        if (!this.movies.has(prereqId)) {
          const err = new Error(`Prerequisite movie with ID "${prereqId}" does not exist`);
          (err as any).statusCode = 400;
          throw err;
        }
      }

      if (wouldCauseCycle(id, dto.prerequisites, this.movies)) {
        const err = new Error('Circular dependency detected. A movie cannot depend on itself directly or indirectly.');
        (err as any).statusCode = 409;
        (err as any).code = 'CIRCULAR_DEPENDENCY';
        throw err;
      }

      prerequisites = [...new Set(dto.prerequisites)]; // Deduplicate
    }

    // Watched update
    let watched = existing.watched;
    if (dto.watched !== undefined) {
      watched = Boolean(dto.watched);
    }

    const updated: Movie = {
      ...existing,
      title,
      releaseYear,
      runtime,
      prerequisites,
      watched,
      updatedAt: new Date().toISOString(),
    };

    this.movies.set(id, updated);
    return updated;
  }

  public delete(id: string): boolean {
    if (!this.movies.has(id)) {
      return false;
    }

    this.movies.delete(id);

    // Remove this movie from all other movies' prerequisites
    for (const movie of this.movies.values()) {
      if (movie.prerequisites.includes(id)) {
        movie.prerequisites = movie.prerequisites.filter((p) => p !== id);
        movie.updatedAt = new Date().toISOString();
      }
    }

    return true;
  }

  public resetToDefaultMCU(): void {
    this.movies.clear();
    this.seedDefaultMCU();
  }

  private seedDefaultMCU(): void {
    const now = new Date().toISOString();
    const defaults: Movie[] = [
      {
        id: 'iron-man',
        title: 'Iron Man',
        releaseYear: 2008,
        runtime: 126,
        prerequisites: [],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'first-avenger',
        title: 'Captain America: The First Avenger',
        releaseYear: 2011,
        runtime: 124,
        prerequisites: [],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'the-avengers',
        title: 'The Avengers',
        releaseYear: 2012,
        runtime: 143,
        prerequisites: ['iron-man', 'first-avenger'],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'civil-war',
        title: 'Captain America: Civil War',
        releaseYear: 2016,
        runtime: 147,
        prerequisites: ['the-avengers'],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ragnarok',
        title: 'Thor: Ragnarok',
        releaseYear: 2017,
        runtime: 130,
        prerequisites: [],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'infinity-war',
        title: 'Avengers: Infinity War',
        releaseYear: 2018,
        runtime: 149,
        prerequisites: ['civil-war', 'ragnarok'],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'endgame',
        title: 'Avengers: Endgame',
        releaseYear: 2019,
        runtime: 181,
        prerequisites: ['infinity-war'],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doomsday',
        title: 'Avengers: Doomsday',
        releaseYear: 2026,
        runtime: 180,
        prerequisites: ['endgame'],
        watched: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const m of defaults) {
      this.movies.set(m.id, m);
    }
  }
}

export const movieStore = new MovieStore();
