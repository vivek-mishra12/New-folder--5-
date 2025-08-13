import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import questionsRouter from './routes/questions.js';
import { initGameSocket } from './game/socket.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// simple healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// REST routes
app.use('/api/questions', questionsRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    methods: ['GET', 'POST']
  }
});

initGameSocket(io);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Mongo connected');
    server.listen(PORT, () => console.log(`✅ Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Mongo error:', err.message);
    process.exit(1);
  });
