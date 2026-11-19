import express from 'express';
import cors from 'cors';
import { movieRouter } from './routes/movieRoutes.js';
import { cinemaRouter } from './routes/cinemaRoutes.js';
import { movieStore } from './store/movieStore.js';
import { cinemaStore } from './store/cinemaStore.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/movies', movieRouter);
app.use('/api/cinemas', cinemaRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'doomsday-ready-server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Root welcome route for browser and API clients
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    const movieCount = movieStore.getAll().length;
    const cinemaCount = cinemaStore.getAll().length;

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doomsday Ready — API Server</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #070a0e;
      color: #f1f5f9;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
      position: relative;
    }
    .glow-circle {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      filter: blur(60px);
    }
    .card {
      background: rgba(15, 23, 35, 0.85);
      border: 1px solid rgba(16, 185, 129, 0.3);
      box-shadow: 0 0 40px rgba(16, 185, 129, 0.15);
      backdrop-filter: blur(16px);
      border-radius: 24px;
      max-width: 680px;
      width: 100%;
      padding: 36px;
      position: relative;
      z-index: 10;
    }
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(6, 78, 59, 0.6);
      border: 1px solid rgba(16, 185, 129, 0.5);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6ee7b7;
      margin-bottom: 16px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    h1 {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 0.05em;
      background: linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #fcd34d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    p.subtitle {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-box {
      background: rgba(7, 10, 14, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 14px;
      text-align: center;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 900;
      color: #f8fafc;
      margin-top: 4px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #cbd5e1;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 28px;
    }
    .endpoint-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(7, 10, 14, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 10px 14px;
      text-decoration: none;
      color: #e2e8f0;
      font-size: 13px;
      transition: all 0.2s ease;
    }
    .endpoint-item:hover {
      border-color: rgba(16, 185, 129, 0.5);
      background: rgba(16, 185, 129, 0.08);
      transform: translateX(4px);
    }
    .method-get {
      font-size: 10px;
      font-weight: 800;
      color: #34d399;
      background: rgba(6, 78, 59, 0.5);
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 6px;
      padding: 2px 6px;
      margin-right: 10px;
    }
    .path { font-family: monospace; font-size: 12px; color: #cbd5e1; }
    .desc { font-size: 11px; color: #64748b; }
    .cta-container {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn-frontend {
      flex: 1;
      min-width: 200px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35);
      transition: all 0.2s ease;
    }
    .btn-frontend:hover {
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
      transform: translateY(-1px);
    }
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: #475569;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="glow-circle"></div>
  <div class="card">
    <div class="badge-status">
      <span class="status-dot"></span>
      Backend Server Active & Ready
    </div>

    <h1>Doomsday Ready API</h1>
    <p class="subtitle">
      Welcome to the Marvel Cinematic Universe rewatch planner and opening-night watch-party seat optimizer server.
    </p>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">MCU Movies</div>
        <div class="stat-value" style="color: #6ee7b7;">${movieCount}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Cinemas</div>
        <div class="stat-value" style="color: #fcd34d;">${cinemaCount}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Port</div>
        <div class="stat-value" style="color: #38bdf8;">${port}</div>
      </div>
    </div>

    <div class="section-title">⚡ Available API Endpoints</div>
    <div class="endpoints-list">
      <a href="/api/movies" target="_blank" class="endpoint-item">
        <div><span class="method-get">GET</span><span class="path">/api/movies</span></div>
        <span class="desc">List all MCU movies</span>
      </a>
      <a href="/api/movies/doomsday/rewatch-order" target="_blank" class="endpoint-item">
        <div><span class="method-get">GET</span><span class="path">/api/movies/doomsday/rewatch-order</span></div>
        <span class="desc">Avengers: Doomsday Topological Order</span>
      </a>
      <a href="/api/cinemas" target="_blank" class="endpoint-item">
        <div><span class="method-get">GET</span><span class="path">/api/cinemas</span></div>
        <span class="desc">List opening-night cinema venues</span>
      </a>
      <a href="/api/cinemas/stark-imax/booking?groupSize=44" target="_blank" class="endpoint-item">
        <div><span class="method-get">GET</span><span class="path">/api/cinemas/.../booking?groupSize=44</span></div>
        <span class="desc">Fewest bundles quote algorithm</span>
      </a>
      <a href="/api/health" target="_blank" class="endpoint-item">
        <div><span class="method-get">GET</span><span class="path">/api/health</span></div>
        <span class="desc">Service health status</span>
      </a>
    </div>

    <div class="cta-container">
      <a href="http://localhost:3000" class="btn-frontend">
        🚀 Open Next.js Frontend (Port 3000) →
      </a>
    </div>
  </div>

  <div class="footer">
    Doomsday Ready • Built for Marvel Fans • Zero external algorithm libraries
  </div>
</body>
</html>`);
    return;
  }

  // JSON fallback
  res.json({
    name: 'Doomsday Ready API Server',
    status: 'online',
    version: '1.0.0',
    description: 'Backend API for Avengers: Doomsday MCU Rewatch Planner & Watch-Party Optimizer',
    frontend: 'http://localhost:3000',
    endpoints: {
      health: 'GET /api/health',
      movies: 'GET /api/movies',
      createMovie: 'POST /api/movies',
      updateMovie: 'PATCH /api/movies/:id',
      rewatchOrder: 'GET /api/movies/:id/rewatch-order',
      cinemas: 'GET /api/cinemas',
      createCinema: 'POST /api/cinemas',
      bookingQuote: 'GET /api/cinemas/:id/booking?groupSize=:size',
    },
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Doomsday Ready Server running on port ${port}`);
  });
}

export default app;
