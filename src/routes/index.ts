import { Router } from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import blogRoutes from './blog';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Assesium API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/blog', blogRoutes);

export default router;

