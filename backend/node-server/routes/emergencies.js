const express = require('express');
const Emergency = require('../models/Emergency');
const User = require('../models/User');
const Responder = require('../models/Responder');
const router = express.Router();

// Create emergency
router.post('/', async (req, res) => {
  try {
    const { userId, type, location, safetyData } = req.body;

    const emergency = new Emergency({
      userId,
      type,
      location,
      safetyData,
      status: 'pending'
    });

    await emergency.save();

    // Find nearest available responders
    const responders = await Responder.find({
      status: 'available',
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: 5000 // 5km radius
        }
      }
    }).limit(3);

    res.status(201).json({
      message: 'Emergency created successfully',
      emergency,
      nearbyResponders: responders.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all emergencies
router.get('/', async (req, res) => {
  try {
    const { status, type, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const emergencies = await Emergency.find(filter)
      .populate('userId', 'name phone')
      .populate('responderId', 'authorityId department')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single emergency
router.get('/:id', async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('userId', 'name phone emergencyContacts')
      .populate('responderId', 'authorityId department rank');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update emergency status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, responderId } = req.body;

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status, responderId },
      { new: true }
    ).populate('responderId', 'authorityId department');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Update responder status if assigned
    if (responderId && status === 'assigned') {
      await Responder.findByIdAndUpdate(responderId, {
        status: 'busy',
        currentEmergency: emergency._id
      });
    }

    res.json({ message: 'Emergency status updated', emergency });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add message to emergency
router.post('/:id/messages', async (req, res) => {
  try {
    const { userId, message } = req.body;

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          messages: { userId, message }
        }
      },
      { new: true }
    );

    res.json({ message: 'Message added', emergency });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emergency statistics
router.get('/analytics/stats', async (req, res) => {
  try {
    const totalEmergencies = await Emergency.countDocuments();
    const pendingEmergencies = await Emergency.countDocuments({ status: 'pending' });
    const resolvedEmergencies = await Emergency.countDocuments({ status: 'resolved' });
    
    const typeStats = await Emergency.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const hourlyStats = await Emergency.aggregate([
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      totalEmergencies,
      pendingEmergencies,
      resolvedEmergencies,
      typeStats,
      hourlyStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
