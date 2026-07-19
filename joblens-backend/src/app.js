import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import jobsRoutes from './modules/jobs/jobs.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import matchingRoutes from './modules/matching/matching.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';

const app = express();

app.use(helmet());
const allowedOrigins = [
  ...(process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  'http://localhost:5173',
  'https://job-lens-theta.vercel.app',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/matches', matchingRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Backward-compatible aliases for clients built with the API host but no /api/v1 prefix.
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/jobs', jobsRoutes);
app.use('/matches', matchingRoutes);
app.use('/notifications', notificationRoutes);

app.use(errorHandler);

export default app;
