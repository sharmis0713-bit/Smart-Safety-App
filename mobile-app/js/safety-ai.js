// Pondicherry Safety AI Engine
const safetyAI = {
    // Pondicherry area coordinates and zones
    pondicherryZones: {
        whiteTown: { 
            lat: 11.9340, 
            lng: 79.8300, 
            radius: 1.0, 
            baseSafety: 75,
            name: "White Town",
            type: "tourist"
        },
        promenade: { 
            lat: 11.9280, 
            lng: 79.8380, 
            radius: 0.8, 
            baseSafety: 80,
            name: "Beach Promenade",
            type: "recreational"
        },
        rockBeach: { 
            lat: 11.9320, 
            lng: 79.8420, 
            radius: 0.7, 
            baseSafety: 70,
            name: "Rock Beach",
            type: "recreational"
        },
        heritageTown: { 
            lat: 11.9400, 
            lng: 79.8200, 
            radius: 1.2, 
            baseSafety: 65,
            name: "Heritage Town",
            type: "cultural"
        },
        industrialArea: { 
            lat: 11.9500, 
            lng: 79.8000, 
            radius: 1.5, 
            baseSafety: 50,
            name: "Industrial Area",
            type: "industrial"
        },
        marketArea: { 
            lat: 11.9250, 
            lng: 79.8150, 
            radius: 0.9, 
            baseSafety: 60,
            name: "Market Area",
            type: "commercial"
        }
    },

    // Risk factors database
    riskFactors: {
        timeOfDay: {
            '06:00-18:00': { score: +20, description: 'Daytime - Generally safe' },
            '18:00-21:00': { score: -5, description: 'Evening - Exercise caution' },
            '21:00-06:00': { score: -25, description: 'Night - Increased risk' }
        },
        dayOfWeek: {
            'Monday-Thursday': { score: +5, description: 'Weekday - Normal activity' },
            'Friday-Sunday': { score: -10, description: 'Weekend - Higher crowds' }
        },
        weather: {
            'clear': { score: +10, description: 'Good visibility' },
            'rainy': { score: -15, description: 'Poor visibility, slippery' },
            'stormy': { score: -25, description: 'Dangerous conditions' }
        },
        areaType: {
            'tourist': { score: -5, description: 'Tourist area - Watch belongings' },
            'residential': { score: +15, description: 'Residential - Generally safe' },
            'commercial': { score: +5, description: 'Commercial - Moderate safety' },
            'industrial': { score: -20, description: 'Industrial - Higher risk' },
            'recreational': { score: +10, description: 'Recreational - Generally safe' },
            'cultural': { score: +5, description: 'Cultural - Moderate safety' }
        },
        lighting: {
            'good': { score: +15, description: 'Well-lit area' },
            'moderate': { score: 0, description: 'Moderate lighting' },
            'poor': { score: -20, description: 'Poorly lit - Avoid' }
        }
    },

    // Historical incident data (simulated)
    incidentHistory: {
        'whiteTown': { incidents: 2, lastIncident: '2024-01-15', severity: 'low' },
        'promenade': { incidents: 5, lastIncident: '2024-02-20', severity: 'medium' },
        'rockBeach': { incidents: 3, lastIncident: '2024-01-30', severity: 'low' },
        'heritageTown': { incidents: 8, lastIncident: '2024-03-05', severity: 'high' },
        'industrialArea': { incidents: 12, lastIncident: '2024-03-10', severity: 'high' },
        'marketArea': { incidents: 6, lastIncident: '2024-02-28', severity: 'medium' }
    },

    // Current state
    currentZone: null,
    safetyScore: 85,
    safetyLevel: 'Good',

    // Initialize safety system
    init() {
        console.log('🚀 Safety AI Engine Initialized for Pondicherry');
        this.initPondicherryMap();
        this.startRealTimeUpdates();
        this.updateSafetyDisplay();
    },

    // Initialize Pondicherry map with safety zones
    initPondicherryMap() {
        // Center map on Pondicherry
        const pondicherryCenter = { lat: 11.9416, lng: 79.8083 };
        
        // Wait for safetyApp to be initialized
        setTimeout(() => {
            if (safetyApp.state.map) {
                safetyApp.state.map.setView([pondicherryCenter.lat, pondicherryCenter.lng], 13);
                this.addPondicherryZones();
                this.createSafetyOverlay();
            }
        }, 1000);
    },

    // Add Pondicherry safety zones to map
    addPondicherryZones() {
        Object.keys(this.pondicherryZones).forEach(zoneKey => {
            const zone = this.pondicherryZones[zoneKey];
            const safetyScore = this.calculateZoneSafety(zoneKey);
            const zoneColor = this.getSafetyColor(safetyScore);
            
            // Create zone circle
            const zoneCircle = L.circle([zone.lat, zone.lng], {
                color: zoneColor,
                fillColor: zoneColor,
                fillOpacity: 0.2,
                radius: zone.radius * 1000, // Convert km to meters
                weight: 2
            }).addTo(safetyApp.state.map);
            
            // Add zone label
            const zoneLabel = L.marker([zone.lat, zone.lng], {
                icon: L.divIcon({
                    className: 'zone-label',
                    html: `<div style="background: ${zoneColor}; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold;">${zone.name}<br>${safetyScore}</div>`,
                    iconSize: [80, 30]
                })
            }).addTo(safetyApp.state.map);
            
            zoneLabel.bindPopup(`
                <strong>${zone.name}</strong><br>
                Safety Score: ${safetyScore}/100<br>
                Type: ${zone.type}<br>
                <small>${this.getSafetyDescription(safetyScore)}</small>
            `);
        });
    },

    // Create safety overlay (simulated heatmap)
    createSafetyOverlay() {
        // Generate safety data points
        const safetyPoints = this.generateSafetyPoints();
        
        safetyPoints.forEach(point => {
            const pointColor = this.getSafetyColor(point.safety);
            
            L.circleMarker([point.lat, point.lng], {
                color: pointColor,
                fillColor: pointColor,
                fillOpacity: 0.6,
                radius: 8
            }).addTo(safetyApp.state.map);
        });
    },

    // Generate safety data points across Pondicherry
    generateSafetyPoints() {
        const points = [];
        const gridSize = 0.02; // Degree intervals
        
        // Pondicherry bounds
        const north = 11.9600, south = 11.9100, east = 79.8500, west = 79.7800;
        
        for (let lat = south; lat <= north; lat += gridSize) {
            for (let lng = west; lng <= east; lng += gridSize) {
                const zone = this.findZoneForLocation({ lat, lng });
                if (zone) {
                    const safetyScore = this.calculateZoneSafety(zone);
                    points.push({
                        lat: lat + (Math.random() - 0.5) * gridSize * 0.5,
                        lng: lng + (Math.random() - 0.5) * gridSize * 0.5,
                        safety: safetyScore
                    });
                }
            }
        }
        
        return points;
    },

    // Calculate safety score for a zone
    calculateZoneSafety(zoneKey) {
        const zone = this.pondicherryZones[zoneKey];
        if (!zone) return 50;
        
        let score = zone.baseSafety;
        
        // Time of day factor
        score += this.getTimeOfDayScore();
        
        // Day of week factor
        score += this.getDayOfWeekScore();
        
        // Historical incidents factor
        score += this.getHistoricalFactor(zoneKey);
        
        // Area type factor
        score += this.getAreaTypeFactor(zone.type);
        
        // Random variation (±5 points)
        score += (Math.random() - 0.5) * 10;
        
        // Ensure score is between 0-100
        return Math.max(0, Math.min(100, Math.round(score)));
    },

    // Get time of day score
    getTimeOfDayScore() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) return 20;      // Daytime
        if (hour >= 18 && hour < 21) return -5;     // Evening
        return -25;                                 // Night
    },

    // Get day of week score
    getDayOfWeekScore() {
        const day = new Date().getDay();
        return (day >= 1 && day <= 4) ? 5 : -10;    // Weekday vs Weekend
    },

    // Get historical incident factor
    getHistoricalFactor(zoneKey) {
        const incidents = this.incidentHistory[zoneKey];
        if (!incidents) return 0;
        
        const incidentCount = incidents.incidents;
        const daysSinceIncident = this.getDaysSince(incidents.lastIncident);
        
        let factor = -incidentCount * 2;
        
        // Recent incidents have more impact
        if (daysSinceIncident < 30) factor -= 10;
        if (daysSinceIncident < 7) factor -= 15;
        
        return factor;
    },

    // Get area type factor
    getAreaTypeFactor(areaType) {
        const factors = {
            'residential': +15,
            'recreational': +10,
            'cultural': +5,
            'commercial': +5,
            'tourist': -5,
            'industrial': -20
        };
        return factors[areaType] || 0;
    },

    // Get safety color based on score
    getSafetyColor(score) {
        if (score >= 80) return '#10b981';    // Green - Safe
        if (score >= 60) return '#f59e0b';    // Yellow - Cautious
        return '#ef4444';                     // Red - Unsafe
    },

    // Get safety level text
    getSafetyLevel(score) {
        if (score >= 80) return 'Safe';
        if (score >= 60) return 'Cautious';
        return 'Unsafe';
    },

    // Get safety description
    getSafetyDescription(score) {
        if (score >= 80) return 'Generally safe area with low risk';
        if (score >= 60) return 'Exercise normal precautions';
        return 'Higher risk area - exercise caution';
    },

    // Find which zone a location belongs to
    findZoneForLocation(location) {
        let closestZone = null;
        let minDistance = Infinity;
        
        Object.keys(this.pondicherryZones).forEach(zoneKey => {
            const zone = this.pondicherryZones[zoneKey];
            const distance = this.calculateDistance(
                location.lat, location.lng,
                zone.lat, zone.lng
            );
            
            if (distance < minDistance && distance < zone.radius) {
                minDistance = distance;
                closestZone = zoneKey;
            }
        });
        
        return closestZone;
    },

    // Calculate distance between coordinates (in km)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Get days since incident
    getDaysSince(dateString) {
        const incidentDate = new Date(dateString);
        const today = new Date();
        return Math.floor((today - incidentDate) / (1000 * 60 * 60 * 24));
    },

    // Update safety display
    updateSafetyDisplay() {
        if (!safetyApp.state.userLocation) {
            // Use default location for demo
            const demoLocation = { lat: 11.9340, lng: 79.8300 }; // White Town
            this.currentZone = this.findZoneForLocation(demoLocation);
        } else {
            this.currentZone = this.findZoneForLocation(safetyApp.state.userLocation);
        }
        
        if (this.currentZone) {
            this.safetyScore = this.calculateZoneSafety(this.currentZone);
            this.safetyLevel = this.getSafetyLevel(this.safetyScore);
            this.updateSafetyUI();
        }
    },

    // Update safety UI
    updateSafetyUI() {
        // Update safety score display
        const scoreElement = document.getElementById('currentSafetyScore');
        const levelElement = document.getElementById('safetyLevel');
        
        if (scoreElement) {
            scoreElement.textContent = this.safetyScore;
            scoreElement.style.color = this.getSafetyColor(this.safetyScore);
        }
        
        if (levelElement) {
            levelElement.textContent = this.safetyLevel;
            levelElement.className = 'score-label';
            levelElement.style.background = this.getSafetyColor(this.safetyScore);
            levelElement.style.color = 'white';
        }
        
        // Update risk factors
        this.updateRiskFactors();
        
        // Update recommendations
        this.updateRecommendations();
    },

    // Update risk factors display
    updateRiskFactors() {
        const factorsElement = document.getElementById('riskFactors');
        if (!factorsElement) return;
        
        const factors = this.generateRiskFactors();
        factorsElement.innerHTML = factors.map(factor => 
            `<div class="factor ${factor.positive ? 'positive' : 'negative'}">${factor.icon} ${factor.text}</div>`
        ).join('');
    },

    // Generate risk factors for current zone
    generateRiskFactors() {
        const factors = [];
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour < 18;
        const isWeekend = [0, 6].includes(new Date().getDay());
        
        factors.push({
            icon: isDaytime ? '✅' : '⚠️',
            text: isDaytime ? 'Daytime Hours' : 'Nighttime Hours',
            positive: isDaytime
        });
        
        factors.push({
            icon: isWeekend ? '⚠️' : '✅',
            text: isWeekend ? 'Weekend Crowds' : 'Weekday Activity',
            positive: !isWeekend
        });
        
        if (this.currentZone) {
            const zone = this.pondicherryZones[this.currentZone];
            factors.push({
                icon: this.getAreaIcon(zone.type),
                text: zone.name,
                positive: ['residential', 'recreational'].includes(zone.type)
            });
        }
        
        factors.push({
            icon: '📊',
            text: `Safety Score: ${this.safetyScore}/100`,
            positive: this.safetyScore >= 60
        });
        
        return factors;
    },

    // Get icon for area type
    getAreaIcon(areaType) {
        const icons = {
            'tourist': '👥',
            'residential': '🏠',
            'commercial': '🏪',
            'industrial': '🏭',
            'recreational': '🌴',
            'cultural': '🏛️'
        };
        return icons[areaType] || '📍';
    },

    // Update safety recommendations
    updateRecommendations() {
        const recommendationsElement = document.getElementById('safetyRecommendations');
        if (!recommendationsElement) return;
        
        const recommendations = this.generateRecommendations();
        recommendationsElement.innerHTML = recommendations.map(rec => 
            `<p>${rec}</p>`
        ).join('');
    },

    // Generate safety recommendations
    generateRecommendations() {
        let recommendations = [];
        
        if (this.safetyLevel === 'Unsafe') {
            recommendations = [
                '• Avoid this area if possible',
                '• Stay in well-populated areas',
                '• Keep emergency contacts ready',
                '• Travel in groups if necessary',
                '• Be extra vigilant with belongings'
            ];
        } else if (this.safetyLevel === 'Cautious') {
            recommendations = [
                '• Stay alert to surroundings',
                '• Avoid isolated pathways',
                '• Keep valuables secure',
                '• Check in regularly',
                '• Stick to main roads'
            ];
        } else {
            recommendations = [
                '• Maintain normal precautions',
                '• Stay in visible areas',
                '• Keep phone charged',
                '• Enjoy your stay safely',
                '• Be aware of emergency exits'
            ];
        }
        
        // Add time-specific recommendations
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) {
            recommendations.push('• Use well-lit routes after dark');
        }
        
        return recommendations;
    },

    // Start real-time updates
    startRealTimeUpdates() {
        // Update every 30 seconds
        setInterval(() => {
            this.updateSafetyDisplay();
            console.log('🔄 Safety AI: Updated safety assessment');
        }, 30000);
        
        // Also update when location changes
        if (safetyApp.state.map) {
            safetyApp.state.map.on('moveend', () => {
                setTimeout(() => this.updateSafetyDisplay(), 500);
            });
        }
        
        // Initial update
        this.updateSafetyDisplay();
    },

    // Get current safety data (for other parts of the app)
    getCurrentSafetyData() {
        return {
            zone: this.currentZone ? this.pondicherryZones[this.currentZone].name : 'Unknown',
            score: this.safetyScore,
            level: this.safetyLevel,
            factors: this.generateRiskFactors(),
            recommendations: this.generateRecommendations()
        };
    }
};

// Make it available globally
window.safetyAI = safetyAI;

