import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { errorHandler } from './middlewares/errorHandler';
import createTables from './config/migration';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '🏥 Kuaför Randevu Sistemi API çalışıyor!',
        timestamp: new Date().toISOString(),
    });
});

// ─── Routes
app.use('/api/auth', authRoutes);

// ─── Error Handler (en sonda!)
app.use(errorHandler);

const startServer = async () => {
    try {
        await createTables();
        app.listen(config.port, () => {
            console.log(`🚀 Server çalışıyor: http://localhost:${config.port}`);
            console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
            console.log(`🔐 Auth API: http://localhost:${config.port}/api/auth`);
        });
    } catch (error) {
        console.error('❌ Server başlatılamadı:', error);
        process.exit(1);
    }
};

startServer();