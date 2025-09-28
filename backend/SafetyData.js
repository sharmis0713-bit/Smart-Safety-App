const mongoose = require('mongoose');

const safetyDataSchema = new mongoose.Schema({
  location: {
    latitude: Number,
    longitude: Number,
    zone: String
  },
  riskFactors: {
    timeOfDay: Number,
    dayOfWeek: Number,
    weather: Number,
    areaType: Number,
    historicalIncidents: Number,
    policePresence: Number,
    lighting: Number,
    populationDensity: Number
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100
  },
  confidence: Number,
  predictions: {
    nextHour: Number,
    nextThreeHours: Number,
    nextDay: Number
  },
  timestamp: { type: Date, default: Date.now },
  dataSource: String // 'ai-model', 'user-report', 'police-data'
});

// Index for geospatial queries
safetyDataSchema.index({ location: '2dsphere' });
safetyDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SafetyData', safetyDataSchema);
