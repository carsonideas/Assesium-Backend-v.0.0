"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = __importDefault(require("./utils/database"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://assesium-landing-webpage-v1-0-0-henna.vercel.app',
        'https://assesium.vercel.app',
        process.env.FRONTEND_URL,
        process.env.DEPLOYED_FRONTEND_URL,
    ].filter((url) => Boolean(url)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}
app.use('/api', routes_1.default);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Assesium API',
        version: '1.0.0',
        documentation: '/api/health',
    });
});
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await database_1.default.$connect();
        console.log('✅ Database connected successfully');
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API URL: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await database_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await database_1.default.$disconnect();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map