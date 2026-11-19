import { Movie, RewatchOrderResult, Cinema, BookingQuoteResult } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      // response wasn't JSON
    }
    const message = errorData.message || res.statusText || 'Unknown error';
    const code = errorData.error;
    throw new ApiError(message, res.status, code);
  }
  return res.json();
}

// Movies API
export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/movies`);
  return handleResponse<Movie[]>(res);
}

export async function createMovie(movie: {
  title: string;
  releaseYear: number;
  runtime: number;
  prerequisites?: string[];
  watched?: boolean;
}): Promise<Movie> {
  const res = await fetch(`${API_BASE}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movie),
  });
  return handleResponse<Movie>(res);
}

export async function updateMovie(
  id: string,
  updates: Partial<Pick<Movie, 'title' | 'releaseYear' | 'runtime' | 'prerequisites' | 'watched'>>
): Promise<Movie> {
  const res = await fetch(`${API_BASE}/movies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse<Movie>(res);
}

export async function deleteMovie(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/movies/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string }>(res);
}

export async function getRewatchOrder(movieId: string): Promise<RewatchOrderResult> {
  const res = await fetch(`${API_BASE}/movies/${movieId}/rewatch-order`);
  return handleResponse<RewatchOrderResult>(res);
}

export async function seedMovies(): Promise<{ message: string; movies: Movie[] }> {
  const res = await fetch(`${API_BASE}/movies/seed`, {
    method: 'POST',
  });
  return handleResponse<{ message: string; movies: Movie[] }>(res);
}

// Cinemas API
export async function getCinemas(): Promise<Cinema[]> {
  const res = await fetch(`${API_BASE}/cinemas`);
  return handleResponse<Cinema[]>(res);
}

export async function createCinema(cinema: {
  name: string;
  bundleSizes: number[];
}): Promise<Cinema> {
  const res = await fetch(`${API_BASE}/cinemas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cinema),
  });
  return handleResponse<Cinema>(res);
}

export async function deleteCinema(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/cinemas/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string }>(res);
}

export async function getBookingQuote(cinemaId: string, groupSize: number): Promise<BookingQuoteResult> {
  const res = await fetch(`${API_BASE}/cinemas/${cinemaId}/booking?groupSize=${groupSize}`);
  return handleResponse<BookingQuoteResult>(res);
}
