import { Response } from 'express';
import { AuthenticatedRequest, UpdateUserStatusRequest, ApiResponse } from '../types';
import { createError, asyncHandler } from '../middleware/errorHandler';
import prisma from '../utils/database';

export const getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        schoolName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            blogPosts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  const response: ApiResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  };

  res.json(response);
});

export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      schoolName: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      blogPosts: {
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
      _count: {
        select: {
          blogPosts: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'User retrieved successfully',
    data: { user },
  };

  res.json(response);
});

export const updateUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { status }: UpdateUserStatusRequest = req.body;

  // Prevent admin from changing their own status
  if (req.user?.id === userId) {
    throw createError('Cannot change your own status', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Prevent changing status of other administrators
  if (user.role === 'ADMINISTRATOR' && req.user?.id !== userId) {
    throw createError('Cannot change status of other administrators', 403);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      schoolName: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const response: ApiResponse = {
    success: true,
    message: `User status updated to ${status.toLowerCase()}`,
    data: { user: updatedUser },
  };

  res.json(response);
});

export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  // Prevent admin from deleting themselves
  if (req.user?.id === userId) {
    throw createError('Cannot delete your own account', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Prevent deleting other administrators
  if (user.role === 'ADMINISTRATOR') {
    throw createError('Cannot delete other administrators', 403);
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully',
  };

  res.json(response);
});

export const getAdminStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    bannedUsers,
    totalBlogPosts,
    recentUsers,
    recentBlogPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'SUSPENDED' } }),
    prisma.user.count({ where: { status: 'BANNED' } }),
    prisma.blogPost.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.blogPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  const response: ApiResponse = {
    success: true,
    message: 'Admin statistics retrieved successfully',
    data: {
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          banned: bannedUsers,
        },
        blogPosts: {
          total: totalBlogPosts,
        },
      },
      recentActivity: {
        recentUsers,
        recentBlogPosts,
      },
    },
  };

  res.json(response);
});

