import { Request, Response } from 'express';
import { AuthenticatedRequest, BlogPostRequest, BlogPostQuery, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { sanitizeHtml, isValidUrl } from '../utils/validation';
import { extractPublicIdFromUrl, deleteImage } from '../utils/cloudinary';
import prisma from '../utils/database';

export const createBlogPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const { title, content, imageUrl }: BlogPostRequest = req.body;

  // Sanitize content
  const sanitizedContent = sanitizeHtml(content);

  // Validate image URL if provided
  if (imageUrl && !isValidUrl(imageUrl)) {
    throw createError('Invalid image URL', 400);
  }

  const blogPost = await prisma.blogPost.create({
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

  const response: ApiResponse = {
    success: true,
    message: 'Blog post created successfully',
    data: { blogPost },
  };

  res.status(201).json(response);
});

export const getAllBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '10', authorId, search }: BlogPostQuery = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};
  
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
    prisma.blogPost.findMany({
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
    prisma.blogPost.count({ where }),
  ]);

  const totalPages = Math.ceil(totalPosts / limitNum);

  const response: ApiResponse = {
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

export const getBlogPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const blogPost = await prisma.blogPost.findUnique({
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
    throw createError('Blog post not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Blog post retrieved successfully',
    data: { blogPost },
  };

  res.json(response);
});

export const updateBlogPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const { id } = req.params;
  const { title, content, imageUrl }: BlogPostRequest = req.body;

  const existingPost = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!existingPost) {
    throw createError('Blog post not found', 404);
  }

  // Check if user owns the post or is an admin
  if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMINISTRATOR') {
    throw createError('Not authorized to update this blog post', 403);
  }

  // Sanitize content
  const sanitizedContent = content ? sanitizeHtml(content) : undefined;

  // Validate image URL if provided
  if (imageUrl && !isValidUrl(imageUrl)) {
    throw createError('Invalid image URL', 400);
  }

  // If image URL is being changed and old image was from Cloudinary, delete it
  if (imageUrl !== existingPost.imageUrl && existingPost.imageUrl) {
    const publicId = extractPublicIdFromUrl(existingPost.imageUrl);
    if (publicId) {
      await deleteImage(publicId);
    }
  }

  const updatedPost = await prisma.blogPost.update({
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

  const response: ApiResponse = {
    success: true,
    message: 'Blog post updated successfully',
    data: { blogPost: updatedPost },
  };

  res.json(response);
});

export const deleteBlogPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const { id } = req.params;

  const existingPost = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!existingPost) {
    throw createError('Blog post not found', 404);
  }

  // Check if user owns the post or is an admin
  if (existingPost.authorId !== req.user.id && req.user.role !== 'ADMINISTRATOR') {
    throw createError('Not authorized to delete this blog post', 403);
  }

  // Delete image from Cloudinary if it exists
  if (existingPost.imageUrl) {
    const publicId = extractPublicIdFromUrl(existingPost.imageUrl);
    if (publicId) {
      await deleteImage(publicId);
    }
  }

  await prisma.blogPost.delete({
    where: { id },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Blog post deleted successfully',
  };

  res.json(response);
});

export const uploadImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Image uploaded successfully',
    data: {
      imageUrl: req.file.path,
      publicId: req.file.filename,
    },
  };

  res.json(response);
});

export const getUserBlogPosts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('Authentication required', 401);
  }

  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [blogPosts, totalPosts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { authorId: req.user.id },
      skip,
      take: limitNum,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.blogPost.count({ where: { authorId: req.user.id } }),
  ]);

  const totalPages = Math.ceil(totalPosts / limitNum);

  const response: ApiResponse = {
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

