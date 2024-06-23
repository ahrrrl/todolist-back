import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import todoRoutes from './routes/todos.js';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
import authMiddleware from './middleware/auth.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(
  cors({
    origin: ['https://todolist-front-opal.vercel.app', 'http://localhost:5173'], // 허용할 도메인들
    credentials: true, // 쿠키를 포함한 요청을 허용
  })
);
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Atlas connection error', err);
  });

app.use('/api', authRoutes);
app.use('/api/todos', authMiddleware, todoRoutes);

export default app;
