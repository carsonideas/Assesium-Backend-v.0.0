"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
router.get('/stats', adminController_1.getAdminStats);
router.get('/users', adminController_1.getAllUsers);
router.get('/users/:userId', adminController_1.getUserById);
router.put('/users/:userId/status', validation_1.validateUserStatus, validation_1.handleValidationErrors, adminController_1.updateUserStatus);
router.delete('/users/:userId', adminController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=admin.js.map