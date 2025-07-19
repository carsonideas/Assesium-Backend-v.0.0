"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = exports.deleteUser = exports.updateUserStatus = exports.getUserById = exports.getAllUsers = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../utils/database"));
exports.getAllUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [users, totalUsers] = await Promise.all([
        database_1.default.user.findMany({
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
        database_1.default.user.count(),
    ]);
    const totalPages = Math.ceil(totalUsers / limit);
    const response = {
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
exports.getUserById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const user = await database_1.default.user.findUnique({
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
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const response = {
        success: true,
        message: 'User retrieved successfully',
        data: { user },
    };
    res.json(response);
});
exports.updateUserStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    if (req.user?.id === userId) {
        throw (0, errorHandler_1.createError)('Cannot change your own status', 400);
    }
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    if (user.role === 'ADMINISTRATOR' && req.user?.id !== userId) {
        throw (0, errorHandler_1.createError)('Cannot change status of other administrators', 403);
    }
    const updatedUser = await database_1.default.user.update({
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
    const response = {
        success: true,
        message: `User status updated to ${status.toLowerCase()}`,
        data: { user: updatedUser },
    };
    res.json(response);
});
exports.deleteUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (req.user?.id === userId) {
        throw (0, errorHandler_1.createError)('Cannot delete your own account', 400);
    }
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    if (user.role === 'ADMINISTRATOR') {
        throw (0, errorHandler_1.createError)('Cannot delete other administrators', 403);
    }
    await database_1.default.user.delete({
        where: { id: userId },
    });
    const response = {
        success: true,
        message: 'User deleted successfully',
    };
    res.json(response);
});
exports.getAdminStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const [totalUsers, activeUsers, suspendedUsers, bannedUsers, totalBlogPosts, recentUsers, recentBlogPosts,] = await Promise.all([
        database_1.default.user.count(),
        database_1.default.user.count({ where: { status: 'ACTIVE' } }),
        database_1.default.user.count({ where: { status: 'SUSPENDED' } }),
        database_1.default.user.count({ where: { status: 'BANNED' } }),
        database_1.default.blogPost.count(),
        database_1.default.user.findMany({
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
        database_1.default.blogPost.findMany({
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
    const response = {
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
//# sourceMappingURL=adminController.js.map