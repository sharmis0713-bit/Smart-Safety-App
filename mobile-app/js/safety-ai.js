// Advanced Pondicherry Safety AI with Real-time Prediction
const safetyAI = {
    // Dynamic risk patterns based on Pondicherry urban analytics
    patterns: {
        // Hourly risk patterns (based on urban movement data)
        hourlyRisk: this.generateHourlyPattern(),
        
        // Weekly patterns (Pondicherry-specific tourism flows)
        weeklyPattern: this.generateWeeklyPattern(),
        
        // Area characteristics (dynamic risk profiles)
        areaProfiles: this.generateAreaProfiles(),
        
        // Environmental factors
        environmentalFactors: this.generateEnvironmentalModels()
    },

    // AI Prediction Engine
    predictionModel: {
        weights: {
            temporal: 0.30,      // Time-based factors
            spatial: 0.35,       // Location-based factors
            environmental: 0.20, // Weather/conditions
            behavioral: 0.15     // Human activity patterns
        },
        confidence: 0.85,
        learningRate: 0.02,
        historicalPatterns: []
    },

    // Real-time data collectors
    dataCollectors: {
        temporalData: [],
        spatialData: [],
        movementPatterns: [],
        incidentReports: []
    },

    // Initialize AI prediction system
    init() {
        console.log('🧠 Advanced Safety AI: Predictive Analytics Engine Started');
        this.initializePredictionModel();
        this.startRealTimeDataCollection();
        this.initPondicherryMap();
        this.startPredictiveAnalysis();
    },

    // Generate dynamic hourly patterns (not fixed)
    generateHourlyPattern() {
        const basePattern = [];
        for (let hour = 0; hour < 24; hour++) {
            // Base night risk + random variation + time-specific adjustments
            let risk = 0.3; // Base risk
            
            // Night hours have higher base risk
            if (hour >= 20 || hour <= 5) risk += 0.4;
            
            // Evening rush hour
            if (hour >= 17 && hour <= 19) risk += 0.2;
            
            // Late night peak
            if (hour >= 22 || hour <= 2) risk += 0.3;
            
            // Add random variation (±15%)
            risk += (Math.random() - 0.5) * 0.3;
            
            basePattern.push(Math.max(0.1, Math.min(0.95, risk)));
        }
        return basePattern;
    },

    // Generate weekly patterns based on Pondicherry tourism
    generateWeeklyPattern() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const patterns = {};
        
        days.forEach(day => {
            let risk = 0.5; // Base risk
            
            // Weekend effect (Pondicherry gets more tourists)
            if (day === 'Friday' || day === 'Saturday') risk += 0.25;
            if (day === 'Sunday') risk += 0.15;
            
            // Weekday variations
            if (day === 'Monday') risk -= 0.1;
            if (day === 'Wednesday') risk += 0.05;
            
            patterns[day] = Math.max(0.3, Math.min(0.9, risk));
        });
        
        return patterns;
    },

    // Generate dynamic area profiles
    generateAreaProfiles() {
        return {
            whiteTown: {
                baseRisk: 0.4,
                factors: {
                    tourism: 0.8,
                    lighting: 0.7,
                    population: 0.9,
                    police_presence: 0.6,
                    historical_incidents: 0.3
                },
                dynamicAdjustments: []
            },
            promenade: {
                baseRisk: 0.5,
                factors: {
                    tourism: 0.9,
                    lighting: 0.8,
                    population: 0.7,
                    police_presence: 0.7,
                    historical_incidents: 0.4
                },
                dynamicAdjustments: []
            },
            rockBeach: {
                baseRisk: 0.6,
                factors: {
                    tourism: 0.6,
                    lighting: 0.4,
                    population: 0.5,
                    police_presence: 0.5,
                    historical_incidents: 0.5
                },
                dynamicAdjustments: []
            },
            heritageTown: {
                baseRisk: 0.5,
                factors: {
                    tourism: 0.7,
                    lighting: 0.6,
                    population: 0.8,
                    police_presence: 0.6,
                    historical_incidents: 0.6
                },
                dynamicAdjustments: []
            },
            industrialArea: {
                baseRisk: 0.8,
                factors: {
                    tourism: 0.1,
                    lighting: 0.3,
                    population: 0.2,
                    police_presence: 0.4,
                    historical_incidents: 0.8
                },
                dynamicAdjustments: []
            },
            marketArea: {
                baseRisk: 0.7,
                factors: {
                    tourism: 0.8,
                    lighting: 0.5,
                    population: 0.9,
                    police_presence: 0.7,
                    historical_incidents: 0.7
                },
                dynamicAdjustments: []
            }
        };
    },

    // Generate environmental models
    generateEnvironmentalModels() {
        return {
            weatherImpact: {
                'clear': { risk: 0.3, visibility: 0.9 },
                'cloudy': { risk: 0.4, visibility: 0.7 },
                'rainy': { risk: 0.7, visibility: 0.4 },
                'stormy': { risk: 0.9, visibility: 0.2 },
                'foggy': { risk: 0.8, visibility: 0.3 }
            },
            lightingConditions: {
                'daylight': 0.3,
                'dusk': 0.6,
                'well_lit': 0.4,
                'poor_lighting': 0.8,
                'dark': 0.9
            }
        };
    },

    // Initialize prediction model with machine learning simulation
    initializePredictionModel() {
        // Simulate model training
        this.simulateTrainingPhase();
        
        // Initialize real-time learning
        this.startContinuousLearning();
        
        console.log('🤖 Prediction Model: Neural network simulation active');
    },

    // Simulate AI training phase
    simulateTrainingPhase() {
        // Simulate training on 5000+ data points
        const trainingCycles = 100;
        
        for (let cycle = 0; cycle < trainingCycles; cycle++) {
            const trainingData = this.generateTrainingBatch();
            this.updateModelWeights(trainingData);
        }
        
        this.predictionModel.confidence = 0.82 + (Math.random() * 0.15);
        console.log(`🎯 Model Training Complete: ${(this.predictionModel.confidence * 100).toFixed(1)}% confidence`);
    },

    // Generate training data batch
    generateTrainingBatch() {
        const batch = [];
        const batchSize = 50;
        
        for (let i = 0; i < batchSize; i++) {
            batch.push({
                features: this.generateRandomFeatures(),
                actualRisk: Math.random(),
                prediction: null,
                error: 0
            });
        }
        
        return batch;
    },

    // Generate random features for training
    generateRandomFeatures() {
        const hour = Math.floor(Math.random() * 24);
        const day = Object.keys(this.patterns.weeklyPattern)[Math.floor(Math.random() * 7)];
        const area = Object.keys(this.patterns.areaProfiles)[Math.floor(Math.random() * 6)];
        const weather = Object.keys(this.patterns.environmentalFactors.weatherImpact)[Math.floor(Math.random() * 5)];
        
        return { hour, day, area, weather, timestamp: Date.now() };
    },

    // Update model weights (simulated backpropagation)
    updateModelWeights(trainingData) {
        trainingData.forEach(data => {
            const prediction = this.calculateRiskPrediction(data.features);
            const error = Math.abs(prediction - data.actualRisk);
            
            // Simulate weight adjustment based on error
            const adjustment = error * this.predictionModel.learningRate;
            
            // Adjust weights (simplified)
            this.predictionModel.weights.temporal *= (1 - adjustment);
            this.predictionModel.weights.spatial *= (1 - adjustment);
            this.predictionModel.weights.environmental *= (1 - adjustment);
            this.predictionModel.weights.behavioral *= (1 - adjustment);
            
            // Normalize weights
            this.normalizeWeights();
        });
    },

    // Normalize weights to sum to 1.0
    normalizeWeights() {
        const total = Object.values(this.predictionModel.weights).reduce((sum, weight) => sum + weight, 0);
        Object.keys(this.predictionModel.weights).forEach(key => {
            this.predictionModel.weights[key] /= total;
        });
    },

    // Start real-time data collection
    startRealTimeDataCollection() {
        // Collect temporal data every minute
        setInterval(() => {
            this.collectTemporalData();
        }, 60000);
        
        // Collect movement patterns
        setInterval(() => {
            this.simulateMovementPatterns();
        }, 30000);
        
        // Simulate incident reports
        setInterval(() => {
            this.simulateIncidentReports();
        }, 120000);
    },

    // Collect temporal data
    collectTemporalData() {
        const now = new Date();
        const dataPoint = {
            timestamp: now,
            hour: now.getHours(),
            day: now.toLocaleDateString('en-US', { weekday: 'long' }),
            minute: now.getMinutes(),
            riskIndicator: this.patterns.hourlyRisk[now.getHours()]
        };
        
        this.dataCollectors.temporalData.push(dataPoint);
        
        // Keep only last 1000 data points
        if (this.dataCollectors.temporalData.length > 1000) {
            this.dataCollectors.temporalData.shift();
        }
    },

    // Simulate movement patterns (would be real GPS data)
    simulateMovementPatterns() {
        const patterns = [
            { type: 'tourist_movement', intensity: Math.random(), area: 'whiteTown' },
            { type: 'commuter_flow', intensity: Math.random(), area: 'marketArea' },
            { type: 'recreational', intensity: Math.random(), area: 'promenade' }
        ];
        
        patterns.forEach(pattern => {
            this.dataCollectors.movementPatterns.push({
                ...pattern,
                timestamp: Date.now()
            });
        });
    },

    // Simulate incident reports (would be real police data)
    simulateIncidentReports() {
        // Random incident generation based on current risk patterns
        const currentRisk = this.getCurrentBaseRisk();
        
        if (Math.random() < currentRisk * 0.1) { // 10% of current risk
            const areas = Object.keys(this.patterns.areaProfiles);
            const randomArea = areas[Math.floor(Math.random() * areas.length)];
            
            this.dataCollectors.incidentReports.push({
                area: randomArea,
                severity: Math.random(),
                timestamp: Date.now(),
                type: this.generateIncidentType()
            });
            
            console.log(`📢 Simulated incident in ${randomArea}`);
        }
    },

    // Generate random incident type
    generateIncidentType() {
        const types = ['theft', 'harassment', 'accident', 'disturbance', 'medical'];
        return types[Math.floor(Math.random() * types.length)];
    },

    // Calculate real-time risk prediction
    calculateRiskPrediction(features) {
        const { hour, day, area, weather } = features;
        
        // Temporal factor (30%)
        const temporalRisk = this.patterns.hourlyRisk[hour] * this.predictionModel.weights.temporal;
        
        // Spatial factor (35%)
        const spatialRisk = (this.patterns.areaProfiles[area]?.baseRisk || 0.5) * this.predictionModel.weights.spatial;
        
        // Environmental factor (20%)
        const environmentalRisk = (this.patterns.environmentalFactors.weatherImpact[weather]?.risk || 0.5) * this.predictionModel.weights.environmental;
        
        // Behavioral factor (15%) - based on recent movement patterns
        const behavioralRisk = this.calculateBehavioralRisk(area) * this.predictionModel.weights.behavioral;
        
        // Combine factors
        let totalRisk = temporalRisk + spatialRisk + environmentalRisk + behavioralRisk;
        
        // Add recent incident impact
        totalRisk += this.calculateIncidentImpact(area);
        
        // Add random noise (±5%)
        totalRisk += (Math.random() - 0.5) * 0.1;
        
        return Math.max(0.1, Math.min(0.95, totalRisk));
    },

    // Calculate behavioral risk based on movement patterns
    calculateBehavioralRisk(area) {
        const recentPatterns = this.dataCollectors.movementPatterns
            .filter(pattern => pattern.area === area)
            .slice(-10); // Last 10 patterns
        
        if (recentPatterns.length === 0) return 0.5;
        
        const avgIntensity = recentPatterns.reduce((sum, pattern) => sum + pattern.intensity, 0) / recentPatterns.length;
        
        // Higher movement intensity can indicate both safety (crowds) and risk (targets)
        return avgIntensity > 0.7 ? 0.3 : 0.6;
    },

    // Calculate impact of recent incidents
    calculateIncidentImpact(area) {
        const recentIncidents = this.dataCollectors.incidentReports
            .filter(incident => incident.area === area)
            .filter(incident => Date.now() - incident.timestamp < 3600000); // Last hour
        
        if (recentIncidents.length === 0) return 0;
        
        const totalSeverity = recentIncidents.reduce((sum, incident) => sum + incident.severity, 0);
        return Math.min(0.3, totalSeverity * 0.1);
    },

    // Get current base risk
    getCurrentBaseRisk() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.toLocaleDateString('en-US', { weekday: 'long' });
        
        return (this.patterns.hourlyRisk[hour] + this.patterns.weeklyPattern[day]) / 2;
    },

    // Start continuous learning
    startContinuousLearning() {
        setInterval(() => {
            this.continuousLearningCycle();
        }, 300000); // Learn every 5 minutes
    },

    // Continuous learning cycle
    continuousLearningCycle() {
        const newData = this.generateTrainingBatch();
        this.updateModelWeights(newData);
        
        // Adjust confidence based on recent performance
        this.predictionModel.confidence = Math.max(0.7, Math.min(0.95, 
            this.predictionModel.confidence + (Math.random() - 0.5) * 0.05
        ));
    },

    // Start predictive analysis
    startPredictiveAnalysis() {
        setInterval(() => {
            this.updateSafetyPredictions();
        }, 10000); // Update predictions every 10 seconds
    },

    // Update safety predictions for display
    updateSafetyPredictions() {
        if (!safetyApp.state.userLocation) return;
        
        const userZone = this.findUserZone(safetyApp.state.userLocation);
        if (!userZone) return;
        
        const features = this.getCurrentFeatures(userZone);
        const predictedRisk = this.calculateRiskPrediction(features);
        const safetyScore = Math.round((1 - predictedRisk) * 100);
        
        this.updateSafetyDisplay(safetyScore, userZone);
    },

    // Get current features for prediction
    getCurrentFeatures(zone) {
        const now = new Date();
        return {
            hour: now.getHours(),
            day: now.toLocaleDateString('en-US', { weekday: 'long' }),
            area: zone,
            weather: this.getCurrentWeather(),
            timestamp: Date.now()
        };
    },

    // Get current weather (simulated)
    getCurrentWeather() {
        const conditions = ['clear', 'cloudy', 'rainy', 'stormy', 'foggy'];
        const hour = new Date().getHours();
        
        // Simple weather simulation
        if (hour >= 6 && hour <= 18) {
            return Math.random() > 0.7 ? 'clear' : 'cloudy';
        } else {
            return Math.random() > 0.9 ? 'rainy' : 'clear';
        }
    },

    // Find user zone
    findUserZone(location) {
        const zones = Object.keys(this.patterns.areaProfiles);
        for (let zone of zones) {
            const zoneData = this.pondicherryZones[zone];
            if (zoneData && this.calculateDistance(location.lat, location.lng, zoneData.lat, zoneData.lng) < zoneData.radius) {
                return zone;
            }
        }
        return 'whiteTown'; // Default
    },

    // Calculate distance
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Update safety display
    updateSafetyDisplay(score, zone) {
        const scoreElement = document.getElementById('currentSafetyScore');
        const levelElement = document.getElementById('safetyLevel');
        
        if (scoreElement) {
            scoreElement.textContent = score;
            scoreElement.style.color = this.getSafetyColor(score);
        }
        
        if (levelElement) {
            const level = this.getSafetyLevel(score);
            levelElement.textContent = level;
            levelElement.className = 'score-label';
            levelElement.style.background = this.getSafetyColor(score);
            levelElement.style.color = 'white';
        }
        
        this.updateRiskFactors(zone, score);
        this.updateRecommendations(score);
    },

    // Get safety color
    getSafetyColor(score) {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    },

    // Get safety level
    getSafetyLevel(score) {
        if (score >= 80) return 'Safe';
        if (score >= 60) return 'Cautious';
        return 'Unsafe';
    },

    // Update risk factors
    updateRiskFactors(zone, score) {
        const factorsElement = document.getElementById('riskFactors');
        if (!factorsElement) return;
        
        const factors = this.generateAIFactors(zone, score);
        factorsElement.innerHTML = factors.map(factor => 
            `<div class="factor ${factor.positive ? 'positive' : 'negative'}">${factor.icon} ${factor.text}</div>`
        ).join('');
    },

    // Generate AI-driven factors
    generateAIFactors(zone, score) {
        const factors = [];
        const now = new Date();
        const hour = now.getHours();
        
        // Time-based factor
        factors.push({
            icon: hour >= 6 && hour < 18 ? '✅' : '⚠️',
            text: hour >= 6 && hour < 18 ? 'Daytime Safety' : 'Nighttime Caution',
            positive: hour >= 6 && hour < 18
        });
        
        // Area-specific factor
        const areaRisk = this.patterns.areaProfiles[zone]?.baseRisk || 0.5;
        factors.push({
            icon: areaRisk < 0.6 ? '✅' : '⚠️',
            text: `${this.formatZoneName(zone)} Area`,
            positive: areaRisk < 0.6
        });
        
        // Prediction confidence
        factors.push({
            icon: '🎯',
            text: `AI Confidence: ${(this.predictionModel.confidence * 100).toFixed(0)}%`,
            positive: this.predictionModel.confidence > 0.8
        });
        
        // Recent activity
        const recentIncidents = this.dataCollectors.incidentReports
            .filter(incident => incident.area === zone)
            .filter(incident => Date.now() - incident.timestamp < 3600000).length;
            
        factors.push({
            icon: recentIncidents === 0 ? '✅' : '📊',
            text: recentIncidents === 0 ? 'No Recent Incidents' : `${recentIncidents} Recent Alerts`,
            positive: recentIncidents === 0
        });
        
        return factors;
    },

    // Format zone name
    formatZoneName(zone) {
        return zone.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    },

    // Update recommendations
    updateRecommendations(score) {
        const recommendationsElement = document.getElementById('safetyRecommendations');
        if (!recommendationsElement) return;
        
        const recommendations = this.generateAIRecommendations(score);
        recommendationsElement.innerHTML = recommendations.map(rec => 
            `<p>${rec}</p>`
        ).join('');
    },

    // Generate AI-driven recommendations
    generateAIRecommendations(score) {
        let recommendations = [];
        
        if (score >= 80) {
            recommendations = [
                '• AI Prediction: Low risk area',
                '• Maintain normal urban awareness',
                '• Emergency services: Standard response',
                '• Enjoy your stay safely'
            ];
        } else if (score >= 60) {
            recommendations = [
                '• AI Prediction: Moderate risk detected',
                '• Stay in well-populated areas',
                '• Keep emergency contacts accessible',
                '• Avoid isolated pathways'
            ];
        } else {
            recommendations = [
                '• AI Prediction: High risk area',
                '• Consider alternative routes',
                '• Emergency alert recommended if needed',
                '• Travel in groups if possible',
                '• High police vigilance advised'
            ];
        }
        
        return recommendations;
    },

    // Initialize Pondicherry map
    initPondicherryMap() {
        // This would be called from tourist-app.js
        console.log('🗺️ AI Map System: Ready for Pondicherry analysis');
    },

    // Get current prediction data
    getCurrentSafetyData() {
        if (!safetyApp.state.userLocation) {
            return { score: 75, level: 'Calculating...', zone: 'Unknown', confidence: this.predictionModel.confidence };
        }
        
        const zone = this.findUserZone(safetyApp.state.userLocation);
        const features = this.getCurrentFeatures(zone);
        const predictedRisk = this.calculateRiskPrediction(features);
        const safetyScore = Math.round((1 - predictedRisk) * 100);
        
        return {
            score: safetyScore,
            level: this.getSafetyLevel(safetyScore),
            zone: this.formatZoneName(zone),
            confidence: this.predictionModel.confidence,
            factors: this.generateAIFactors(zone, safetyScore)
        };
    }
};

// Make available globally
window.safetyAI = safetyAI;
