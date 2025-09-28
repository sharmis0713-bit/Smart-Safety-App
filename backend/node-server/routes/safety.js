const express = require('express');
const SafetyData = require('../models/SafetyData');
const router = express.Router();

// Get safety data for location
router.get('/location', async (req, res) => {
  try {
    const { lat, lng, radius = 1 } = req.query;
    
    const safetyData = await SafetyData.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .sort({ timestamp: -1 })
    .limit(10);

    res.json(safetyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get safety heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const { bounds } = req.query; // sw_lat, sw_lng, ne_lat, ne_lng
    
    const heatmapData = await SafetyData.aggregate([
      {
        $match: {
          location: {
            $geoWithin: {
              $box: [
                [parseFloat(bounds.sw_lng), parseFloat(bounds.sw_lat)],
                [parseFloat(bounds.ne_lng), parseFloat(bounds.ne_lat)]
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            lat: { $round: ['$location.latitude', 2] },
            lng: { $round: ['$location.longitude', 2] }
          },
          avgSafety: { $avg: '$safetyScore' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit user safety report
router.post('/report', async (req, res) => {
  try {
    const { location, safetyScore, riskFactors, confidence } = req.body;
    
    const safetyReport = new SafetyData({
      location,
      safetyScore,
      riskFactors,
      confidence,
      dataSource: 'user-report'
    });
    
    await safetyReport.save();
    
    // Trigger AI model update
    // This would call the Python AI server
    // await updateAIModel(safetyReport);
    
    res.json({ message: 'Safety report submitted', id: safetyReport._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
