require('dotenv').config();

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');

// Import route handlers
const superadminRoutes = require('./routes/superadmin');
const adminRoutes = require('./routes/admin');
const childRoutes = require('./routes/child');
const reportRoutes = require('./routes/reports');

// Verify critical environment variables before starting
if (!process.env.MONGO_URI) {
  console.error('\n❌ FATAL ERROR: MONGO_URI is not defined in your .env file.');
  console.error('👉 Please create a .env file in the backend folder and add: MONGO_URI=mongodb://127.0.0.1:27017/expressiontracker (or your MongoDB Atlas URL)\n');
  process.exit(1);
}

// Initialize Express application
const app = express();

// Create an HTTP server instance with Express
const server = http.createServer(app);

// Initialize Socket.IO server with CORS and transport configurations
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware setup
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.set('io', io);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Health check / API info (backend has no UI at /)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Expression Tracker API is running. Use the frontend at http://localhost:5173/',
    endpoints: ['/superadmin', '/admin', '/child', '/api/reports'],
  });
});

// Route middleware
app.use('/superadmin', superadminRoutes);
app.use('/admin', adminRoutes);
app.use('/child', childRoutes);
app.use('/api/reports', reportRoutes);


// Socket.IO connection handler for real-time updates
io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id);
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ FATAL ERROR: Port ${PORT} is already in use. Please close the app using it or change the PORT in your .env file.\n`);
      process.exit(1);
    }
    console.error(err);
  });