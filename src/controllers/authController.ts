import { Request, Response } from 'express';
import { AuthenticatedRequest, LoginRequest, RegisterRequest, ApiResponse } from '../types';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { createError, asyncHandler } from '../middleware/errorHandler';
import prisma from '../utils/database';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, schoolName, role, password }: RegisterRequest = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Determine user role
  let userRole: 'USER' | 'ADMINISTRATOR' = 'USER';
  if (role && role.toLowerCase() === 'administrator') {
    userRole = 'ADMINISTRATOR';
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      schoolName,
      role: userRole,
      password: hashedPassword,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      schoolName: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  };

  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    throw createError('Account is suspended or banned', 403);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
    },
  };

  res.json(response);
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('User not found', 404);
  }

  const { password: _, ...userWithoutPassword } = req.user;

  const response: ApiResponse = {
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: userWithoutPassword },
  };

  res.json(response);
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('User not found', 404);
  }

  const { firstName, lastName, schoolName } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(schoolName && { schoolName }),
    },
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
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  };

  res.json(response);
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw createError('User not found', 404);
  }

  const { currentPassword, newPassword } = req.body;

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, req.user.password);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedNewPassword },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully',
  };

  res.json(response);
});

