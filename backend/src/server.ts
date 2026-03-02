 import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { errorHandler } from './middlewares/errorHandler';
import createTables from './config/migration';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '🏥 Randevu Sistemi API çalışıyor!',
        timestamp: new Date().toISOString(),
    });
});

app.use(errorHandler);

const startServer = async () => {
    try {
        await createTables();

        app.listen(config.port, () => {
            console.log(`🚀 Server çalışıyor: http://localhost:${config.port}`);
            console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
        });
    } catch (error) {
        console.error('❌ Server başlatılamadı:', error);
        process.exit(1);
    }
};

startServer();