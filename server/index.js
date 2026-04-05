import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import sheetRoutes from './routes/sheets.js';
import codeRoutes from './routes/codes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

/* ── Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/codes', codeRoutes);

/* ── Health check ── */
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

/* ── Start ── */
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 KGT Server running on http://localhost:${PORT}`);
  });
};

start();
