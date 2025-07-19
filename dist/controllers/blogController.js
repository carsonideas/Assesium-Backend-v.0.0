"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBlogPosts = exports.uploadImage = exports.deleteBlogPost = exports.updateBlogPost = exports.getBlogPostById = exports.getAllBlogPosts = exports.createBlogPost = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../utils/validation");
const cloudinary_1 = require("../utils/cloudinary");
const database_1 = __importDefault(require("../utils/database"));
exports.createBlogPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Authentication required', 401);
    }
    const { title, content, imageUrl } = req.body;
    const sanitizedContent = (0, validation_1.sanitizeHtml)(content);
    if (imageUrl && !(0, validation_1.isValidUrl)(imageUrl)) {
        throw (0, errorHandler_1.createError)('Invalid image URL', 400);
    }
    const blogPost = await database_1.default.blogPost.create({
        data: {
            title,
            content: sanitizedContent,
            imageUrl,
            authorId: req.user.id,
        },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
    const response = {
        success: true,
        message: 'Blog post created successfully',
        data: { blogPost },
    };
    res.status(201).json(response);
});
exports.getAllBlogPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', authorId, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (authorId) {
        where.authorId = authorId;
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [blogPosts, totalPosts] = await Promise.all([
        database_1.default.blogPost.findMany({
            where,
            skip,
            take: limitNum,
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        }),
        database_1.default.blogPost.count({ where }),
    ]);
    const totalPages = Math.ceil(totalPosts / limitNum);
    const response = {
        success: true,
        message: 'Blog posts retrieved successfully',
        data: {
            blogPosts,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalPosts,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
        },
    };
    res.json(response);
});
exports.getBlogPostById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const blogPost = await database_1.default.blogPost.findUnique({
        where: { id },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
    if (!blogPost) {
        throw (0, errorHandler_1.createError)('Blog post not found', 404);
    }
    const response = {
        success: true,
        message: 'Blog post retrieved successfully',
        data: { blogPost },
    };
    res.json(response);
});
exports.updateBlogPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Authentication required', 401);
    }
    const { id } = req.params;
    const { title, content, imageUrl } = req.body;
    const existingPost = await database_1.default.blogPost.findUnique({
        where: { id },
    });
    if (!existingPost) {
        throw (0, errorHandler_1.createError)('Blog post not found', 404);
    }
    if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMINISTRATOR') {
        throw (0, errorHandler_1.createError)('Not authorized to update this blog post', 403);
    }
    const sanitizedContent = content ? (0, validation_1.sanitizeHtml)(content) : undefined;
    if (imageUrl && !(0, validation_1.isValidUrl)(imageUrl)) {
        throw (0, errorHandler_1.createError)('Invalid image URL', 400);
    }
    if (imageUrl !== existingPost.imageUrl && existingPost.imageUrl) {
        const publicId = (0, cloudinary_1.extractPublicIdFromUrl)(existingPost.imageUrl);
        if (publicId) {
            await (0, cloudinary_1.deleteImage)(publicId);
        }
    }
    const updatedPost = await database_1.default.blogPost.update({
        where: { id },
        data: {
            ...(title && { title }),
            ...(sanitizedContent && { content: sanitizedContent }),
            ...(imageUrl !== undefined && { imageUrl }),
        },
        include: {
            author: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
    const response = {
        success: true,
        message: 'Blog post updated successfully',
        data: { blogPost: updatedPost },
    };
    res.json(response);
});
exports.deleteBlogPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Authentication required', 401);
    }
    const { id } = req.params;
    const existingPost = await database_1.default.blogPost.findUnique({
        where: { id },
    });
    if (!existingPost) {
        throw (0, errorHandler_1.createError)('Blog post not found', 404);
    }
    if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMINISTRATOR') {
        throw (0, errorHandler_1.createError)('Not authorized to delete this blog post', 403);
    }
    if (existingPost.imageUrl) {
        const publicId = (0, cloudinary_1.extractPublicIdFromUrl)(existingPost.imageUrl);
        if (publicId) {
            await (0, cloudinary_1.deleteImage)(publicId);
        }
    }
    await database_1.default.blogPost.delete({
        where: { id },
    });
    const response = {
        success: true,
        message: 'Blog post deleted successfully',
    };
    res.json(response);
});
exports.uploadImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Authentication required', 401);
    }
    if (!req.file) {
        throw (0, errorHandler_1.createError)('No image file provided', 400);
    }
    const response = {
        success: true,
        message: 'Image uploaded successfully',
        data: {
            imageUrl: req.file.path,
            publicId: req.file.filename,
        },
    };
    res.json(response);
});
exports.getUserBlogPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Authentication required', 401);
    }
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [blogPosts, totalPosts] = await Promise.all([
        database_1.default.blogPost.findMany({
            where: { authorId: req.user.id },
            skip,
            take: limitNum,
            orderBy: {
                createdAt: 'desc',
            },
        }),
        database_1.default.blogPost.count({ where: { authorId: req.user.id } }),
    ]);
    const totalPages = Math.ceil(totalPosts / limitNum);
    const response = {
        success: true,
        message: 'User blog posts retrieved successfully',
        data: {
            blogPosts,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalPosts,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
        },
    };
    res.json(response);
});
//# sourceMappingURL=blogController.js.map