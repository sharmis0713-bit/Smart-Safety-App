const express = require('express');
const SafetyData = require('../models/SafetyData');
const Emergency = require('../models/Emergency');
const router = express.Router();

// Get safety analytics for dashboard
router.get('/safety', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Safety score trends
    const safetyTrends = await SafetyData.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            hour: { $hour: "$timestamp" }
          },
          avgSafety: { $avg: "$safetyScore" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1, "_id.hour": 1 } }
    ]);

    // Risk factor analysis
    const riskFactors = await SafetyData.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $project: {
          factors: "$riskFactors"
        }
      },
      {
        $unwind: "$factors"
      },
      {
        $group: {
          _id: "$factors",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Zone safety rankings
    const zoneSafety = await SafetyData.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$location.zone",
          avgSafety: { $avg: "$safetyScore" },
          minSafety: { $min: "$safetyScore" },
          maxSafety: { $max: "$safetyScore" },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgSafety: -1 } }
    ]);

    res.json({
      safetyTrends,
      riskFactors,
      zoneSafety,
      period: `${days} days`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emergency response analytics
router.get('/response', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const responseStats = await Emergency.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          status: "resolved"
        }
      },
      {
        $group: {
          _id: {
            type: "$type",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
          },
          avgResponseTime: { $avg: "$responseTime" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    const typeEfficiency = await Emergency.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          avgResponseTime: { $avg: "$responseTime" }
        }
      }
    ]);

    res.json({
      responseStats,
      typeEfficiency,
      period: `${days} days`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Current active emergencies
    const activeEmergencies = await Emergency.countDocuments({
      status: { $in: ['pending', 'assigned', 'responding'] }
    });

    // Recent safety reports
    const recentSafetyReports = await SafetyData.countDocuments({
      timestamp: { $gte: oneHourAgo }
    });

    // Average safety score
    const currentSafety = await SafetyData.aggregate([
      {
        $match: {
          timestamp: { $gte: oneHourAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgSafety: { $avg: "$safetyScore" }
        }
      }
    ]);

    // Emergency trends
    const emergencyTrend = await Emergency.countDocuments({
      timestamp: { $gte: twentyFourHoursAgo }
    });

    res.json({
      activeEmergencies,
      recentSafetyReports,
      avgSafetyScore: currentSafety[0]?.avgSafety || 75,
      emergenciesLast24h: emergencyTrend,
      lastUpdated: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
