const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectToDb } = require('./db/db'); // <-- Destructure it properly

// ✅ Connect to database BEFORE importing routes
connectToDb();
// Import routes

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resume.routes');
const jobRoutes = require('./routes/job.routes');

const app = express();

// Connect to database


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


// Routes
app.get('/', (req, res) => {
    res.send('Hello World');
});


app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes); 
app.use('/api', jobRoutes);
console.log("User routes loaded");

// Debug: Log registered routes
console.log("Registered Routes:");
app._router.stack.forEach((r) => {
    if (r.route) {
        console.log(`Route: ${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
    }
});

module.exports = app;