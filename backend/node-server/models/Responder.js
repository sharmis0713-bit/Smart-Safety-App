const mongoose = require('mongoose');

const responderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorityId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    enum: ['officer', 'supervisor', 'commander'],
    default: 'officer'
  },
  specialization: {
    type: String,
    enum: ['medical', 'police', 'fire', 'general'],
    default: 'general'
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  currentEmergency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency'
  },
  responseStats: {
    totalEmergencies: { type: Number, default: 0 },
    avgResponseTime: Number,
    successRate: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Index for geospatial queries
responderSchema.index({ currentLocation: '2dsphere' });
responderSchema.index({ status: 1 });

module.exports = mongoose.model('Responder', responderSchema);
