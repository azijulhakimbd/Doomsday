import { Router, Request, Response } from 'express';
import { movieStore } from '../store/movieStore.js';
import { computeRewatchOrder } from '../services/movieAlgorithm.js';

export const movieRouter = Router();

// GET /api/movies - List all movies
movieRouter.get('/', (req: Request, res: Response) => {
  try {
    const movies = movieStore.getAll();
    res.json(movies);
  } catch (error: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

// GET /api/movies/:id - Get a single movie by ID
movieRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const movie = movieStore.getById(id);
    if (!movie) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Movie with ID "${id}" not found` });
      return;
    }
    res.json(movie);
  } catch (error: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

// POST /api/movies - Create a movie
movieRouter.post('/', (req: Request, res: Response) => {
  try {
    const { title, releaseYear, runtime, prerequisites, watched } = req.body;
    const movie = movieStore.create({
      title,
      releaseYear,
      runtime,
      prerequisites,
      watched,
    });
    res.status(201).json(movie);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.code || 'BAD_REQUEST',
      message: error.message,
    });
  }
});

// PATCH /api/movies/:id - Update a movie, including watched and prerequisites
movieRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = movieStore.update(id, req.body);
    res.json(updated);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.code || 'BAD_REQUEST',
      message: error.message,
    });
  }
});

// GET /api/movies/:id/rewatch-order - Rewatch order (Feature 1)
movieRouter.get('/:id/rewatch-order', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const movie = movieStore.getById(id);
    if (!movie) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Movie with ID "${id}" not found` });
      return;
    }

    const result = computeRewatchOrder(id, movieStore.getMap());
    res.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.code || 'BAD_REQUEST',
      message: error.message,
    });
  }
});

// DELETE /api/movies/:id - Delete a movie
movieRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const success = movieStore.delete(id);
    if (!success) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Movie with ID "${id}" not found` });
      return;
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

// POST /api/movies/seed - Reset to MCU default sample data
movieRouter.post('/seed', (req: Request, res: Response) => {
  try {
    movieStore.resetToDefaultMCU();
    res.json({ message: 'MCU sample catalog reset successfully', movies: movieStore.getAll() });
  } catch (error: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});
