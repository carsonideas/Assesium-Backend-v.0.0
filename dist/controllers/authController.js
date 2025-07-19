"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const auth_1 = require("../utils/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../utils/database"));
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, email, schoolName, role, password } = req.body;
    const existingUser = await database_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw (0, errorHandler_1.createError)('User with this email already exists', 409);
    }
    const hashedPassword = await (0, auth_1.hashPassword)(password);
    let userRole = 'USER';
    if (role && role.toLowerCase() === 'administrator') {
        userRole = 'ADMINISTRATOR';
    }
    const user = await database_1.default.user.create({
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
    const token = (0, auth_1.generateToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    const response = {
        success: true,
        message: 'User registered successfully',
        data: {
            user,
            token,
        },
    };
    res.status(201).json(response);
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await database_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    if (user.status !== 'ACTIVE') {
        throw (0, errorHandler_1.createError)('Account is suspended or banned', 403);
    }
    const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    const token = (0, auth_1.generateToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    const { password: _, ...userWithoutPassword } = user;
    const response = {
        success: true,
        message: 'Login successful',
        data: {
            user: userWithoutPassword,
            token,
        },
    };
    res.json(response);
});
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const { password: _, ...userWithoutPassword } = req.user;
    const response = {
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: userWithoutPassword },
    };
    res.json(response);
});
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const { firstName, lastName, schoolName } = req.body;
    const updatedUser = await database_1.default.user.update({
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
    const response = {
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
    };
    res.json(response);
});
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const { currentPassword, newPassword } = req.body;
    const isCurrentPasswordValid = await (0, auth_1.comparePassword)(currentPassword, req.user.password);
    if (!isCurrentPasswordValid) {
        throw (0, errorHandler_1.createError)('Current password is incorrect', 400);
    }
    const hashedNewPassword = await (0, auth_1.hashPassword)(newPassword);
    await database_1.default.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword },
    });
    const response = {
        success: true,
        message: 'Password changed successfully',
    };
    res.json(response);
});
//# sourceMappingURL=authController.js.map