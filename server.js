// Import necessary modules and packages
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Import Middleware
import authMiddleware from './middleware/authMiddleware.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import beneficiosRoutes from './routes/beneficiosRoutes.js';
import devolucoesRoutes from './routes/devolucoesRoutes.js';
import documentosRoutes from './routes/documentosRoutes.js';
import eventosRoutes from './routes/eventosRoutes.js';
import relatoriosRoutes from './routes/relatoriosRoutes.js';
import reservasRoutes from './routes/reservasRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import veiculosRoutes from './routes/veiculosRoutes.js'

// Load environment variables from .env file
process.env.DOTENV_CONFIG_SILENT = true;
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ========== DATABASE CONNECTION ==========
// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// ========== MIDDLEWARE SETUP ==========
// Enable CORS for external HTML5 client
const allowedOrigins = process.env.ALLOWED_ORIGINS;

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ========== API KEY MIDDLEWARE ==========
// Protect all API routes with API key authentication
app.use('/api', (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    // Check if API key is provided and valid
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            error: 'Invalid API key'
        });
    }

    // API key is valid, proceed to next middleware
    next();
});

// ========== CUSTOM MIDDLEWARE ==========
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
    next();
});

// ========== API ROUTES SETUP ==========
// Public routes (no authentication required)
app.use('/api/v1/auth', authRoutes);
// Protected routes (require JWT authentication)
app.use('/api/v1/veiculos', authMiddleware, veiculosRoutes);
app.use('/api/v1/veiculos', authMiddleware, documentosRoutes);
app.use('/api/v1/beneficios', authMiddleware, beneficiosRoutes);
app.use('/api/v1/reservas', authMiddleware, reservasRoutes);
app.use('/api/v1/devolucoes', authMiddleware, devolucoesRoutes);
app.use('/api/v1/eventos', authMiddleware, eventosRoutes);
app.use('/api/v1/relatorios', authMiddleware, relatoriosRoutes);
app.use('/api/v1/usuarios', authMiddleware, usuariosRoutes);

// ========== BASIC ROUTES ==========
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Frota de Veículos',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/v1/auth',
            veiculos: '/api/v1/veiculos',
            documentos: '/api/v1/veiculos',
            beneficios: '/api/v1/beneficios',
            reservas: '/api/v1/reservas',
            devolucoes: '/api/v1/devolucoes',
            eventos: '/api/v1/eventos',
            relatorios: '/api/v1/relatorios',
            usuarios: '/api/v1/usuarios'
        },
        documentation: 'See API documentation for available endpoints and usage'
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API status route
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API is operational',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// ========== ERROR HANDLING MIDDLEWARE ==========
// 404 Not Found middleware
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /api/status',
            'GET /api/items'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            error: 'CORS policy: Origin not allowed'
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Duplicate record found'
        });
    }

    // Mongoose CastError (invalid ID)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format'
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ========== SERVER STARTUP ==========
// Start the server only after database connection
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`
                ╔══════════════════════════════════════════════════════════════╗
                ║                🚀 API Server Iniciado com Sucesso!          ║
                ╠══════════════════════════════════════════════════════════════╣
                ║ 📍 Porta: ${PORT}                                            ║
                ║ 🌐 Ambiente: ${process.env.NODE_ENV || 'development'}        ║
                ║ 🗄️  Banco de Dados: MongoDB                                 ║
                ║ 📊 Status: Conectado                                        ║
                ╠══════════════════════════════════════════════════════════════╣
                ║ 📍 URL Base: http://localhost:${PORT}                       ║
                ║ ❓ Health Check: http://localhost:${PORT}/health            ║
                ║ 🔍 Status da API: http://localhost:${PORT}/api/status       ║
                ╠══════════════════════════════════════════════════════════════╣
                ║                      ENDPOINTS DA API                       ║
                ╠══════════════════════════════════════════════════════════════╣
                ║ 🔐 Auth: http://localhost:${PORT}/api/v1/auth              ║
                ║ 🚗 Veículos: http://localhost:${PORT}/api/v1/veiculos      ║
                ║ 📄 Documentos: http://localhost:${PORT}/api/v1/veiculos    ║
                ║ 🎁 Benefícios: http://localhost:${PORT}/api/v1/beneficios  ║
                ║ 📅 Reservas: http://localhost:${PORT}/api/v1/reservas      ║
                ║ 🔄 Devoluções: http://localhost:${PORT}/api/v1/devolucoes  ║
                ║ 📋 Eventos: http://localhost:${PORT}/api/v1/eventos        ║
                ║ 📊 Relatórios: http://localhost:${PORT}/api/v1/relatorios  ║
                ╚══════════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Recebido sinal de desligamento...');
    await mongoose.connection.close();
    console.log('✅ Conexão com MongoDB fechada');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Recebido sinal de término...');
    await mongoose.connection.close();
    console.log('✅ Conexão com MongoDB fechada');
    process.exit(0);
});

// Start the application
startServer();