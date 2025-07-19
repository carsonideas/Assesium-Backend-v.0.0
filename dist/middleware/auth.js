"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const database_1 = __importDefault(require("../utils/database"));
const authenticateToken = async (req, res, next) => {
    try {
        const token = (0, auth_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required',
            });
            return;
        }
        const decoded = (0, auth_1.verifyToken)(token);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (user.status !== 'ACTIVE') {
            res.status(403).json({
                success: false,
                message: 'Account is suspended or banned',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }
    if (req.user.role !== 'ADMINISTRATOR') {
        res.status(403).json({
            success: false,
            message: 'Administrator access required',
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, auth_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const decoded = (0, auth_1.verifyToken)(token);
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId },
            });
            if (user && user.status === 'ACTIVE') {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map