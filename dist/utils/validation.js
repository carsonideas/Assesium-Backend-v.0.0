"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHtml = exports.isValidUrl = exports.handleValidationErrors = exports.validateUserStatus = exports.validateBlogPost = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('schoolName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('School name must not exceed 100 characters'),
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
exports.validateBlogPost = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters long'),
    (0, express_validator_1.body)('imageUrl')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL'),
];
exports.validateUserStatus = [
    (0, express_validator_1.body)('status')
        .isIn(['ACTIVE', 'SUSPENDED', 'BANNED'])
        .withMessage('Status must be ACTIVE, SUSPENDED, or BANNED'),
];
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
const sanitizeHtml = (html) => {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
};
exports.sanitizeHtml = sanitizeHtml;
//# sourceMappingURL=validation.js.map