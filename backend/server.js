import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import { setupMediasoup } from './controllers/liveStream.js';

dotenv.config();

const app = express();
const server = http.createServer(app); 


const io = new SocketServer(server, {
  cors: {
    origin: 'http://localhost:8081',
    credentials: true,
  }
});

app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json());


app.use('/api/auth', authRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  await connectDB();
  await setupMediasoup(io); // ✅ Start mediasoup socket handlers
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
