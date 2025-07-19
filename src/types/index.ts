import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  schoolName?: string;
  role?: string;
  password: string;
}

export interface BlogPostRequest {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface BlogPostQuery extends PaginationQuery {
  authorId?: string;
  search?: string;
}

