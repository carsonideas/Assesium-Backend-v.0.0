import { Router } from 'express';
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  uploadImage,
  getUserBlogPosts,
} from '../controllers/blogController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { upload } from '../utils/cloudinary';
import { validateBlogPost, handleValidationErrors } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllBlogPosts);
router.get('/:id', getBlogPostById);

// Protected routes
router.post('/', authenticateToken, validateBlogPost, handleValidationErrors, createBlogPost);
router.put('/:id', authenticateToken, validateBlogPost, handleValidationErrors, updateBlogPost);
router.delete('/:id', authenticateToken, deleteBlogPost);

// Image upload
router.post('/upload-image', authenticateToken, upload.single('image'), uploadImage);

// User's blog posts
router.get('/user/posts', authenticateToken, getUserBlogPosts);

export default router;

