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
