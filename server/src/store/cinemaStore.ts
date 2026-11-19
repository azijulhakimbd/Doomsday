import { Cinema, CreateCinemaDto } from '../types/cinema.js';

export class CinemaStore {
  private cinemas: Map<string, Cinema> = new Map();

  constructor() {
    this.seedDefaultCinemas();
  }

  public getAll(): Cinema[] {
    return Array.from(this.cinemas.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  public getById(id: string): Cinema | undefined {
    return this.cinemas.get(id);
  }

  public getByName(name: string): Cinema | undefined {
    const normalized = name.trim().toLowerCase();
    for (const cinema of this.cinemas.values()) {
      if (cinema.name.trim().toLowerCase() === normalized) {
        return cinema;
      }
    }
    return undefined;
  }

  public create(dto: CreateCinemaDto): Cinema {
    const name = dto.name?.trim();
    if (!name) {
      const err = new Error('Cinema name is required');
      (err as any).statusCode = 400;
      throw err;
    }

    if (this.getByName(name)) {
      const err = new Error(`Cinema with name "${name}" already exists`);
      (err as any).statusCode = 409;
      throw err;
    }

    if (!Array.isArray(dto.bundleSizes) || dto.bundleSizes.length === 0) {
      const err = new Error('Cinema must have between 1 and 10 bundle sizes');
      (err as any).statusCode = 400;
      throw err;
    }

    // Clean and validate bundle sizes: 1 to 10 distinct integers, each 1 to 500
    const rawSizes = dto.bundleSizes.map((s) => Number(s));
    const uniqueSizes = Array.from(new Set(rawSizes)).filter((s) => Number.isInteger(s));

    if (uniqueSizes.length < 1 || uniqueSizes.length > 10) {
      const err = new Error('Cinema must have between 1 and 10 different bundle sizes');
      (err as any).statusCode = 400;
      throw err;
    }

    for (const size of uniqueSizes) {
      if (size < 1 || size > 500) {
        const err = new Error(`Each bundle size must hold between 1 and 500 seats (got ${size})`);
        (err as any).statusCode = 400;
        throw err;
      }
    }

    // Sort ascending for clean storage
    uniqueSizes.sort((a, b) => a - b);

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let id = baseSlug || `cinema-${Date.now()}`;
    let counter = 1;
    while (this.cinemas.has(id)) {
      id = `${baseSlug}-${counter++}`;
    }

    const now = new Date().toISOString();
    const cinema: Cinema = {
      id,
      name,
      bundleSizes: uniqueSizes,
      createdAt: now,
      updatedAt: now,
    };

    this.cinemas.set(id, cinema);
    return cinema;
  }

  public delete(id: string): boolean {
    return this.cinemas.delete(id);
  }

  public resetToDefault(): void {
    this.cinemas.clear();
    this.seedDefaultCinemas();
  }

  private seedDefaultCinemas(): void {
    const now = new Date().toISOString();
    const defaults: Cinema[] = [
      {
        id: 'stark-imax',
        name: 'Stark Tower IMAX (New York)',
        bundleSizes: [6, 9, 20],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'avengers-campus',
        name: 'Avengers Campus Premiere Hall',
        bundleSizes: [2, 5],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'wakanda-multiplex',
        name: 'Wakanda Grand Royal Multiplex',
        bundleSizes: [1, 3, 4],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'baxter-theater',
        name: 'Baxter Plaza Cinema',
        bundleSizes: [4, 6],
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const c of defaults) {
      this.cinemas.set(c.id, c);
    }
  }
}

export const cinemaStore = new CinemaStore();
