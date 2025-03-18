import express from "express";
import bodyParser from "body-parser";

import colors from "colors";
import dotenv from "dotenv";
import connectDB from './config/db.js';
import morgan from "morgan";
import cors from 'cors';
import cookieParser from "cookie-parser";  // ✅ Required to parse cookies
import authRoutes from "./routes/authRoutes.js";
import recipieRoutes from "./routes/recipieRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
// Load environment variables
dotenv.config();

// Database connection
connectDB();

// Initialize Express app
const app = express();
app.use(bodyParser.json());  // Parses JSON request body
app.use(bodyParser.urlencoded({ extended: true }));

// Middlewares
app.use(express.json());
app.use(cookieParser());  // ✅ Allows access to cookies in requests
app.use(morgan('dev'));

// ✅ Configure CORS properly (if using cookies for authentication)
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow frontend requests
    credentials: true // ✅ Allow cookies to be sent
}));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/recipie', recipieRoutes);
app.use('/api/v1/category',categoryRoutes)

// Default route
app.get('/', (req, res) => {
    res.status(200).send("<h1>Welcome to the home page</h1>");
});

// Start server
const PORT = process.env.PORT || 5000;  // Default to 5000 if PORT is missing
app.listen(PORT, () => {
    console.log(colors.bgGreen(`Server is running on port ${PORT}`));
});
