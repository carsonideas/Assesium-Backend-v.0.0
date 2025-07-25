"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
router.post('/register', validation_1.validateRegister, validation_1.handleValidationErrors, authController_1.register);
router.post('/login', validation_1.validateLogin, validation_1.handleValidationErrors, authController_1.login);
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
router.put('/profile', auth_1.authenticateToken, authController_1.updateProfile);
router.put('/change-password', auth_1.authenticateToken, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map