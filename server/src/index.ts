import express from 'express';
import cors from 'cors';
import { movieRouter } from './routes/movieRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/movies', movieRouter);
// We will mount cinemaRouter in Feature 2

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Doomsday Ready Server running on port ${port}`);
  });
}

export default app;
