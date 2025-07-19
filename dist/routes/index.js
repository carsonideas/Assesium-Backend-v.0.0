"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const admin_1 = __importDefault(require("./admin"));
const blog_1 = __importDefault(require("./blog"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Assesium API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
router.use('/auth', auth_1.default);
router.use('/admin', admin_1.default);
router.use('/blog', blog_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map