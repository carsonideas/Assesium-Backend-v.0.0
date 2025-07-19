"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const auth_1 = require("../middleware/auth");
const cloudinary_1 = require("../utils/cloudinary");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, blogController_1.getAllBlogPosts);
router.get('/:id', blogController_1.getBlogPostById);
router.post('/', auth_1.authenticateToken, validation_1.validateBlogPost, validation_1.handleValidationErrors, blogController_1.createBlogPost);
router.put('/:id', auth_1.authenticateToken, validation_1.validateBlogPost, validation_1.handleValidationErrors, blogController_1.updateBlogPost);
router.delete('/:id', auth_1.authenticateToken, blogController_1.deleteBlogPost);
router.post('/upload-image', auth_1.authenticateToken, cloudinary_1.upload.single('image'), blogController_1.uploadImage);
router.get('/user/posts', auth_1.authenticateToken, blogController_1.getUserBlogPosts);
exports.default = router;
//# sourceMappingURL=blog.js.map