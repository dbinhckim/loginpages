const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./config/database'); 
const logger = require('./utils/logger');
const routes = require('./routes');
const { User, systemLog } = require('./models');
// ----------------------------------------------------

const bcrypt = require('bcryptjs');

// 1. ĐỊNH NGHĨA CỔNG & HOST
const API_PORT = process.env.PORT || 5000;
const STATIC_PORT = process.env.STATIC_PORT || 8080;
const HOST = process.env.HOST || 'localhost';
const isDev = process.env.NODE_ENV === 'development';

// ✅ KHAI BÁO CÁC NGUỒN (ORIGINS) ĐƯỢC PHÉP TRUY CẬP API
const allowedOrigins = [
    `http://${HOST}:${STATIC_PORT}`, // http://localhost:8080 (cổng mặc định của StaticApp)
    'http://localhost:3000',          // Cổng Docker map ra ngoài (cổng Frontend thực tế)
];

// ----------------------------------------------------
// --- CẤU HÌNH CONTENT SECURITY POLICY (CSP) ---
const cspConfig = {
    contentSecurityPolicy: {
        directives: {
            scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', "'unsafe-inline'"],
            scriptSrcElem: ["'self'", 'https://cdnjs.cloudflare.com', "'unsafe-inline'"],
            styleSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com', "'unsafe-inline'"],
            fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com', 'data:'],
            connectSrc: ["'self'", `http://${HOST}:${API_PORT}`, 'http://localhost:3000'], // Thêm cổng 3000 vào CSP
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:'],
        },
    },
};
// ----------------------------------------------------


// ----------------------------------------------------
// --- ỨNG DỤNG 1: BACKEND API (Cổng 5000) ---
const apiApp = express();

// Middleware
apiApp.use(helmet(cspConfig));

// ✅ FIX CORS: Cấu hình origin để cho phép nhiều nguồn
apiApp.use(cors({
    origin: (origin, callback) => {
        // Cho phép các nguồn có trong allowedOrigins và cả các yêu cầu không có Origin (như curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy blocks access from: ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: true }));
apiApp.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Đường dẫn này ĐÚNG (vì 'uploads' nằm ngoài 'src')
apiApp.use('/uploads', express.static(path.join(__dirname, (process.env.UPLOAD_DIR || 'uploads'))));

// API routes
apiApp.use('/api', routes);

// Global error handler
apiApp.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(isDev && { stack: err.stack })
    });
});
// ----------------------------------------------------


// ----------------------------------------------------
// --- ỨNG DỤNG 2: STATIC/FRONTEND (Cổng 8080) ---
const staticApp = express();

// Middleware
staticApp.use(helmet(cspConfig));
staticApp.use(express.urlencoded({ extended: true }));

// ✅ Dòng này đã CHÍNH XÁC (vì 'static' nằm ngoài 'src')
staticApp.use('/static', express.static(path.join(__dirname, 'static')));

// ✅ Dòng này đã CHÍNH XÁC (vì 'templates' nằm ngoài 'src')
const templatesDir = path.resolve(__dirname, './templates');
console.log('📁 Templates Directory:', templatesDir);

// Trang mặc định
staticApp.get('/', (req, res) => res.redirect('/login'));

// Các route HTML
// LƯU Ý: Frontend của bạn đang sử dụng /pages/login.html, nên các route này cần được cập nhật
staticApp.get('/login', (req, res) => res.sendFile(path.join(templatesDir, 'login.html')));
staticApp.get('/register', (req, res) => res.sendFile(path.join(templatesDir, 'register.html')));
staticApp.get('/forgot-password', (req, res) => res.sendFile(path.join(templatesDir, 'forgot_password.html')));
staticApp.get('/terms', (req, res) => res.sendFile(path.join(templatesDir, 'terms.html')));
staticApp.get('/applicant/home', (req, res) => res.sendFile(path.join(templatesDir, 'applicant_home.html')));
staticApp.get('/recruiter/home', (req, res) => res.sendFile(path.join(templatesDir, 'recruiter_home.html')));
// ----------------------------------------------------


// ----------------------------------------------------
// 3. KẾT NỐI DB VÀ KHỞI ĐỘNG CẢ HAI SERVER
db.authenticate()
    .then(() => {
        logger.info('Database connection established successfully.');

        // API Server
        apiApp.listen(API_PORT, '0.0.0.0', () => {
            logger.info(`✅ API Server running on http://${HOST}:${API_PORT}`);
        });

        // Static Server
        staticApp.listen(STATIC_PORT, '0.0.0.0', () => {
            logger.info(`🌐 Static (Frontend) Server running on http://${HOST}:${STATIC_PORT}`);
        });
    })
    .catch(err => {
        logger.error('Unable to connect to the database:', err);
        process.exit(1);
    });

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

module.exports = apiApp;