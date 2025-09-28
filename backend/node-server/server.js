const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5000; // <-- MOVE THIS UP

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
mongoose.connect("mongodb+srv://sharmisubramanian13_db_user:JHJh1qKE4vSMJub1@cluster0.sihj7jv.mongodb.net/smart-safety?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB Models
const Emergency = require('./models/Emergency');
const User = require('./models/User');
const SafetyData = require('./models/SafetyData');


// Real-time Socket.io for live updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for specific location updates
  socket.on('join-location', (location) => {
    socket.join(`location:${location}`);
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
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server - KEEP ONLY THIS ONE
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});
