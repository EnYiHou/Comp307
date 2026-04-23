import express from 'express';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'

const app = express();

const allowedOrigins = new Set([
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/page1', (req, res) => {
  res.send('Express route: /page1');
});

app.get('/page2', (req, res) => {
  res.send('Express route: /page2');
});


app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.name === 'ValidationError' ? 400 : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
});

export default app;