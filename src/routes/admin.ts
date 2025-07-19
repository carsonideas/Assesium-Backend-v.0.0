import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAdminStats,
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateUserStatus, handleValidationErrors } from '../utils/validation';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Admin statistics
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/status', validateUserStatus, handleValidationErrors, updateUserStatus);
router.delete('/users/:userId', deleteUser);

export default router;

