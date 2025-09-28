const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Redis client for real-time data
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safety-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB Models
const Emergency = require('./models/Emergency');
const User = require('./models/User');
const SafetyData = require('./models/SafetyData');

// Connect to Redis
redisClient.connect().catch(console.error);

// Real-time Socket.io for live updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for specific location updates
  socket.on('join-location', (location) => {
    socket.join(`location:${location}`);
  });

  // Handle emergency alerts
  socket.on('emergency-alert', async (data) => {
    try {
      const emergency = new Emergency(data);
      await emergency.save();
      
      // Notify all authorities
      io.emit('new-emergency', emergency);
      
      // Store in Redis for quick access
      await redisClient.setEx(
        `emergency:${emergency._id}`, 
        3600, 
        JSON.stringify(emergency)
      );
    } catch (error) {
      console.error('Emergency alert error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/emergencies', require('./routes/emergencies'));
app.use('/api/safety', require('./routes/safety'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      redis: redisClient.isOpen ? 'Connected' : 'Disconnected'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});
