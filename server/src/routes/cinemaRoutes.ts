import { Router, Request, Response } from 'express';
import { cinemaStore } from '../store/cinemaStore.js';
import { calculateBookingQuote } from '../services/bookingAlgorithm.js';

export const cinemaRouter = Router();

// GET /api/cinemas - List all cinemas
cinemaRouter.get('/', (req: Request, res: Response) => {
  try {
    const cinemas = cinemaStore.getAll();
    res.json(cinemas);
  } catch (error: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

// GET /api/cinemas/:id - Get a single cinema
cinemaRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const cinema = cinemaStore.getById(id);
    if (!cinema) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Cinema with ID "${id}" not found` });
      return;
    }
    res.json(cinema);
  } catch (error: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

// POST /api/cinemas - Create a cinema
cinemaRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, bundleSizes } = req.body;
    const cinema = cinemaStore.create({ name, bundleSizes });
    res.status(201).json(cinema);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.code || 'BAD_REQUEST',
      message: error.message,
    });
  }
});

// GET /api/cinemas/:id/booking?groupSize=6 - Booking quote (Feature 2)
cinemaRouter.get('/:id/booking', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const cinema = cinemaStore.getById(id);
    if (!cinema) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Cinema with ID "${id}" not found` });
      return;
    }

    const groupSizeRaw = req.query.groupSize;
    if (groupSizeRaw === undefined || groupSizeRaw === null || groupSizeRaw === '') {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Query parameter "groupSize" is required' });
      return;
    }

    const groupSize = Number(groupSizeRaw);
    if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 10000) {
      res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'groupSize must be an integer between 1 and 10,000',
      });
      return;
    }

    const quote = calculateBookingQuote(cinema.bundleSizes, groupSize, cinema.id, cinema.name);
    res.json(quote);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.code || 'BAD_REQUEST',
      message: error.message,
    });
  }
});

// DELETE /api/cinemas/:id - Delete a cinema
cinemaRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const success = cinemaStore.delete(id);
    if (!success) {
      res.status(404).json({ error: 'NOT_FOUND', message: `Cinema with ID "${id}" not found` });
      return;
    }
    res.json({ message: 'Cinema deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});
