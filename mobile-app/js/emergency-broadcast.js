// emergency-broadcast.js - Real-time emergency communication
class EmergencyBroadcaster {
    constructor() {
        this.activeEmergencies = new Map();
        this.authorityListeners = [];
        this.touristListeners = [];
        this.emergencyIdCounter = 1;
        
        // Initialize with sample data for testing
        this.initializeSampleData();
        console.log('🚨 Emergency Broadcast System Started');
    }

    initializeSampleData() {
        // Add sample emergencies for testing
        const sampleEmergencies = [
            {
                id: 'EMG-001',
                type: 'critical',
                title: 'Critical Emergency',
                location: 'Connaught Place, Delhi',
                coordinates: [28.6139, 77.2090],
                timestamp: new Date().toISOString(),
                status: 'active',
                tourist: 'Sarah M.',
                touristId: 'TOUR-001',
                phone: '+91 98765 43210',
                safetyScore: 45
            },
            {
                id: 'EMG-002', 
                type: 'medical',
                title: 'Medical Assistance Needed',
                location: 'Marine Drive, Mumbai',
                coordinates: [19.0760, 72.8777],
                timestamp: new Date().toISOString(),
                status: 'active',
                tourist: 'John D.',
                touristId: 'TOUR-002',
                phone: '+91 98765 43211',
                safetyScore: 60
            }
        ];

        sampleEmergencies.forEach(emergency => {
            this.activeEmergencies.set(emergency.id, emergency);
        });
    }

    // Register authority dashboard to receive emergencies
    addAuthorityListener(callback) {
        this.authorityListeners.push(callback);
        console.log('🏢 Authority dashboard registered for emergency updates');
        
        // Send current active emergencies to the new listener
        this.activeEmergencies.forEach(emergency => {
            callback(emergency, 'existing');
        });
    }

    // Register tourist app to send emergencies  
    addTouristListener(callback) {
        this.touristListeners.push(callback);
        console.log('👤 Tourist app registered for emergency broadcasting');
    }

    // Tourist app calls this to report emergency
    reportEmergency(emergencyData) {
        const emergency = {
            id: `EMG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'active',
            ...emergencyData
        };

        console.log('🚨 NEW EMERGENCY REPORTED:', emergency);

        // Store the emergency
        this.activeEmergencies.set(emergency.id, emergency);

        // Notify all authority dashboards
        this.authorityListeners.forEach(callback => {
            try {
                callback(emergency, 'new');
            } catch (error) {
                console.error('Error notifying authority:', error);
            }
        });

        return emergency.id;
    }

    // Update emergency status
    updateEmergency(emergencyId, updates) {
        const emergency = this.activeEmergencies.get(emergencyId);
        if (emergency) {
            Object.assign(emergency, updates);
            console.log('📝 Emergency updated:', emergencyId, updates);

            // Notify all authority dashboards
            this.authorityListeners.forEach(callback => {
                try {
                    callback(emergency, 'update');
                } catch (error) {
                    console.error('Error notifying authority:', error);
                }
            });

            return true;
        }
        return false;
    }

    // Resolve emergency
    resolveEmergency(emergencyId) {
        return this.updateEmergency(emergencyId, { 
            status: 'resolved',
            resolvedAt: new Date().toISOString()
        });
    }

    // Get all active emergencies
    getActiveEmergencies() {
        return Array.from(this.activeEmergencies.values())
            .filter(emergency => emergency.status === 'active');
    }

    // Get emergency by ID
    getEmergency(emergencyId) {
        return this.activeEmergencies.get(emergencyId);
    }

    // Simulate tourist movement (for demo)
    simulateTouristMovement(emergencyId) {
        const emergency = this.activeEmergencies.get(emergencyId);
        if (emergency && emergency.status === 'active') {
            // Add small random movement
            const latChange = (Math.random() - 0.5) * 0.001;
            const lngChange = (Math.random() - 0.5) * 0.001;
            
            if (Array.isArray(emergency.coordinates)) {
                emergency.coordinates[0] += latChange;
                emergency.coordinates[1] += lngChange;
            }
            
            emergency.lastUpdate = new Date().toISOString();

            // Notify authorities about movement
            this.authorityListeners.forEach(callback => {
                try {
                    callback(emergency, 'location_update');
                } catch (error) {
                    console.error('Error notifying movement:', error);
                }
            });
        }
    }
}

// Create global instance
window.emergencyBroadcaster = new EmergencyBroadcaster();

// Start movement simulation for demo emergencies
setInterval(() => {
    window.emergencyBroadcaster.activeEmergencies.forEach((emergency, id) => {
        if (emergency.status === 'active') {
            window.emergencyBroadcaster.simulateTouristMovement(id);
        }
    });
}, 8000); // Update every 8 seconds

console.log('📡 Emergency Broadcast System Ready - Listening for emergencies...');
