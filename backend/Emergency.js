const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['critical', 'medical', 'security', 'support'],
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: String
  },
  safetyData: {
    score: Number,
    zone: String,
    riskFactors: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'responding', 'resolved'],
    default: 'pending'
  },
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [{
    userId: mongoose.Schema.Types.ObjectId,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Emergency', emergencySchema);
