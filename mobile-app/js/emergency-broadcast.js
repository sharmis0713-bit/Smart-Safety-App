// js/emergency-broadcast.js - Enhanced with live tracking
class EmergencyBroadcast {
    constructor() {
        this.storageKey = 'touristEmergencies';
        this.listeners = [];
        this.activeTrackers = new Map();
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Enhanced SOS broadcast with live tracking
    broadcastSOS(emergencyData) {
        const emergencies = this.getEmergencies();
        
        const newEmergency = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            type: emergencyData.type,
            touristId: emergencyData.touristId || 'Anonymous_Tourist',
            tourist: emergencyData.tourist || 'Unknown Tourist',
            location: emergencyData.location,
            coordinates: emergencyData.coordinates,
            timestamp: new Date().toISOString(),
            status: 'active',
            severity: this.getSeverity(emergencyData.type),
            assignedTo: null,
            updates: [],
            lastUpdate: new Date().toISOString()
        };

        emergencies.unshift(newEmergency);
        this.saveEmergencies(emergencies);
        this.notifyListeners(newEmergency, 'new');
        
        // Start live tracking for this emergency
        this.startLiveTracking(newEmergency.id, newEmergency.coordinates);
        
        return newEmergency.id;
    }

    // Live location tracking
    startLiveTracking(emergencyId, initialCoords) {
        const tracker = {
            emergencyId,
            coordinates: initialCoords,
            interval: setInterval(() => {
                this.simulateMovement(emergencyId);
            }, 5000) // Update every 5 seconds
        };
        
        this.activeTrackers.set(emergencyId, tracker);
        return tracker;
    }

    simulateMovement(emergencyId) {
        const emergencies = this.getEmergencies();
        const emergencyIndex = emergencies.findIndex(e => e.id === emergencyId);
        
        if (emergencyIndex === -1) return;

        const emergency = emergencies[emergencyIndex];
        
        // Add small random movement to coordinates
        const latChange = (Math.random() - 0.5) * 0.001;
        const lngChange = (Math.random() - 0.5) * 0.001;
        
        let newCoords;
        if (Array.isArray(emergency.coordinates)) {
            newCoords = [
                emergency.coordinates[0] + latChange,
                emergency.coordinates[1] + lngChange
            ];
        } else {
            const [lat, lng] = emergency.coordinates.split(',').map(Number);
            newCoords = [lat + latChange, lng + lngChange];
        }

        // Update emergency coordinates
        emergency.coordinates = newCoords;
        emergency.lastUpdate = new Date().toISOString();

        // Save updated emergencies
        this.saveEmergencies(emergencies);

        // Notify listeners about location update
        this.notifyListeners(emergency, 'location_update');
    }

    stopLiveTracking(emergencyId) {
        const tracker = this.activeTrackers.get(emergencyId);
        if (tracker && tracker.interval) {
            clearInterval(tracker.interval);
        }
        this.activeTrackers.delete(emergencyId);
    }

   // In emergency-broadcast.js - Enhanced for live tracking
class EmergencyBroadcast {
    // ... existing code ...

    // Method to update tourist location (called from tourist app)
    updateTouristLocation(emergencyId, newCoordinates) {
        const emergency = this.getEmergency(emergencyId);
        if (emergency) {
            emergency.coordinates = newCoordinates;
            emergency.lastUpdate = new Date().toISOString();
            
            // Broadcast location update to authority dashboard
            this.broadcastToAuthorities(emergency, 'location_update');
        }
    }

    // Enhanced emergency creation with live tracking
    createEmergency(emergencyData) {
        const emergency = {
            id: Date.now(),
            type: emergencyData.type,
            title: emergencyData.title,
            location: emergencyData.location,
            coordinates: emergencyData.coordinates,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
            status: 'active',
            tourist: emergencyData.tourist,
            phone: emergencyData.phone,
            touristId: emergencyData.touristId,
            lastUpdate: new Date().toISOString()
        };

        this.activeEmergencies.push(emergency);
        this.broadcastToAuthorities(emergency, 'new');
        
        return emergency;
    }
}

    // Get active emergencies
    getActiveEmergencies() {
        return this.getEmergencies().filter(e => e.status === 'active');
    }

    // Get all emergencies
    getEmergencies() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    saveEmergencies(emergencies) {
        localStorage.setItem(this.storageKey, JSON.stringify(emergencies));
        window.dispatchEvent(new Event('storage'));
    }

    addEmergencyListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(emergency, action) {
        this.listeners.forEach(callback => callback(emergency, action));
    }

    getSeverity(type) {
        const severityMap = {
            'critical': 'HIGH',
            'medical': 'HIGH', 
            'security': 'MEDIUM',
            'support': 'LOW'
        };
        return severityMap[type] || 'MEDIUM';
    }
}

// Global instance
const emergencyBroadcast = new EmergencyBroadcast();
