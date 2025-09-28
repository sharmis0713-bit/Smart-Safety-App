// js/emergency-broadcast.js - Real-time SOS sharing system
class EmergencyBroadcast {
    constructor() {
        this.storageKey = 'touristEmergencies';
        this.listeners = [];
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }
// emergency-broadcast.js - Add these functions
class EmergencyBroadcaster {
    constructor() {
        this.activeEmergencies = new Map();
        this.locationWatchers = new Map();
        this.listeners = [];
    }

    // Add live location tracking for tourists
    startLiveTracking(emergencyId, touristId, initialCoords) {
        const tracker = {
            emergencyId,
            touristId,
            coordinates: initialCoords,
            interval: setInterval(() => {
                // Simulate tourist movement (in real app, this would come from GPS)
                this.simulateMovement(emergencyId);
            }, 5000) // Update every 5 seconds
        };
        
        this.locationWatchers.set(emergencyId, tracker);
        return tracker;
    }

    simulateMovement(emergencyId) {
        const emergency = this.activeEmergencies.get(emergencyId);
        if (!emergency) return;

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

        // Notify listeners about location update
        this.notifyListeners(emergency, 'location_update');
    }

    stopLiveTracking(emergencyId) {
        const tracker = this.locationWatchers.get(emergencyId);
        if (tracker && tracker.interval) {
            clearInterval(tracker.interval);
        }
        this.locationWatchers.delete(emergencyId);
    }

    // Add emergency with live tracking
    addEmergencyWithTracking(emergencyData) {
        const emergency = this.addEmergency(emergencyData);
        this.startLiveTracking(emergency.id, emergency.touristId, emergency.coordinates);
        return emergency;
    }

    // Update existing methods to include tracking
    updateEmergency(emergencyId, updates) {
        const emergency = this.activeEmergencies.get(emergencyId);
        if (emergency) {
            Object.assign(emergency, updates);
            this.notifyListeners(emergency, 'update');
        }
    }

    resolveEmergency(emergencyId) {
        this.stopLiveTracking(emergencyId);
        const emergency = this.activeEmergencies.get(emergencyId);
        if (emergency) {
            emergency.status = 'resolved';
            emergency.resolvedAt = new Date().toISOString();
            this.notifyListeners(emergency, 'resolved');
        }
    }
}
    // Tourist sends SOS
    broadcastSOS(emergencyData) {
        const emergencies = this.getEmergencies();
        
        const newEmergency = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            type: emergencyData.type,
            touristId: emergencyData.touristId || 'Anonymous_Tourist',
            location: emergencyData.location,
            coordinates: emergencyData.coordinates,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            severity: this.getSeverity(emergencyData.type),
            assignedTo: null,
            updates: []
        };

        emergencies.unshift(newEmergency);
        this.saveEmergencies(emergencies);
        this.notifyListeners(newEmergency, 'new');
        
        return newEmergency.id;
    }

    // Authority gets active emergencies
    getActiveEmergencies() {
        return this.getEmergencies().filter(e => e.status === 'ACTIVE');
    }

    updateEmergency(emergencyId, updates) {
        const emergencies = this.getEmergencies();
        const emergencyIndex = emergencies.findIndex(e => e.id === emergencyId);
        
        if (emergencyIndex !== -1) {
            Object.assign(emergencies[emergencyIndex], updates);
            emergencies[emergencyIndex].updates.push({
                timestamp: new Date().toISOString(),
                message: updates.status || 'Status updated'
            });
            
            this.saveEmergencies(emergencies);
            this.notifyListeners(emergencies[emergencyIndex], 'update');
        }
    }

    addEmergencyListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(emergency, action) {
        this.listeners.forEach(callback => callback(emergency, action));
    }

    getEmergencies() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    saveEmergencies(emergencies) {
        localStorage.setItem(this.storageKey, JSON.stringify(emergencies));
        window.dispatchEvent(new Event('storage'));
    }

    getSeverity(type) {
        const severityMap = {
            'CRITICAL': 'HIGH',
            'MEDICAL': 'HIGH', 
            'SECURITY': 'MEDIUM',
            'SUPPORT': 'LOW'
        };
        return severityMap[type] || 'MEDIUM';
    }
}

// Global instance
const emergencyBroadcast = new EmergencyBroadcast();
