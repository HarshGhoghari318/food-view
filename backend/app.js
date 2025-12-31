// Load environment variables FIRST before any other imports
import './config/env.js';

import express from 'express';

const app = express();
import connectDB from'./src/db/db.js';
import foodRoutes from './src/routes/food.routes.js';
import authRoutes from './src/routes/auth-route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

app.use(
  cors({
    origin: [
      "http://localhost:5173",               
      "https://food-flix-h13.vercel.app"     
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

connectDB();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/food',foodRoutes);
app.use('/api/getpartnerFtoken',authRoutes)



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});




