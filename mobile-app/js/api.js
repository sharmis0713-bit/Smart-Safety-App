// API Client for backend communication
const apiClient = {
    baseURL: 'http://localhost:5000/api',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // Safety data endpoints
    async getSafetyData(lat, lng, radius = 1) {
        return this.request(`/safety/location?lat=${lat}&lng=${lng}&radius=${radius}`);
    },
    
    async getHeatmapData(bounds) {
        return this.request(`/safety/heatmap?bounds=${JSON.stringify(bounds)}`);
    },
    
    async submitSafetyReport(reportData) {
        return this.request('/safety/report', {
            method: 'POST',
            body: JSON.stringify(reportData)
        });
    },
    
    // Emergency endpoints
    async sendEmergencyAlert(emergencyData) {
        return this.request('/emergencies', {
            method: 'POST',
            body: JSON.stringify(emergencyData)
        });
    },
    
    async getEmergencyUpdates(emergencyId) {
        return this.request(`/emergencies/${emergencyId}`);
    },
    
    // AI Prediction endpoint
    async getAIPrediction(features) {
        return this.request('http://localhost:5001/predict', {
            method: 'POST',
            body: JSON.stringify({ features })
        });
    }
};

// Socket.io for real-time updates
const socket = io('http://localhost:5000');

socket.on('new-emergency', (emergency) => {
    if (safetyApp && emergency.location) {
        // Update map with new emergency
        safetyApp.addEmergencyMarker(emergency);
    }
});

socket.on('emergency-update', (update) => {
    // Update emergency status in real-time
    safetyApp.updateEmergencyStatus(update);
});

// Make available globally
window.apiClient = apiClient;
window.safetySocket = socket;
