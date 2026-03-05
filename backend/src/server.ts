import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { errorHandler } from './middlewares/errorHandler';
import createTables from './config/migration';
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ngrok "Visit Site" bypass
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// ─── Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '💈 Kuaför Randevu Sistemi API çalışıyor!',
        timestamp: new Date().toISOString(),
    });
});

// ─── Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─── Error Handler
app.use(errorHandler);

const startServer = async () => {
    try {
        await createTables();
        app.listen(config.port, () => {
            console.log(`🚀 Server çalışıyor: http://localhost:${config.port}`);
            console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
            console.log(`🔐 Auth: http://localhost:${config.port}/api/auth`);
            console.log(`💈 Services: http://localhost:${config.port}/api/services`);
            console.log(`📅 Appointments: http://localhost:${config.port}/api/appointments`);
        });
    } catch (error) {
        console.error('❌ Server başlatılamadı:', error);
        process.exit(1);
    }
};

startServer();