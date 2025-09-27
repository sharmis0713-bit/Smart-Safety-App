// Shared utilities and helpers
const sharedUtils = {
    // Format date and time
    formatDateTime(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Generate random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Format location coordinates
    formatCoordinates(lat, lng) {
        return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    },

    // Calculate distance between two coordinates (in km)
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

    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Local storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },

        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('Storage get error:', error);
                return null;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        }
    }
};
// js/shared.js - Real-time emergency sharing
class EmergencyBroadcaster {
    constructor() {
        this.emergencies = JSON.parse(localStorage.getItem('activeEmergencies') || '[]');
        this.listeners = [];
        this.setupStorageListener();
    }

    // Broadcast new emergency to all authority dashboards
    broadcastEmergency(emergencyData) {
        const emergency = {
            id: Date.now(),
            touristId: emergencyData.touristId || 'anonymous',
            type: emergencyData.type,
            location: emergencyData.location,
            coordinates: emergencyData.coordinates,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            assignedResponder: null,
            updates: []
        };

        this.emergencies.unshift(emergency);
        this.saveToStorage();
        this.notifyListeners(emergency);
        
        return emergency.id;
    }

    // Update emergency status
    updateEmergency(emergencyId, updates) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (emergency) {
            Object.assign(emergency, updates);
            emergency.updates.push({
                timestamp: new Date().toISOString(),
                message: updates.status || 'Status updated'
            });
            this.saveToStorage();
            this.notifyListeners(emergency, 'update');
        }
    }

    // Get all active emergencies
    getActiveEmergencies() {
        return this.emergencies.filter(e => e.status === 'ACTIVE');
    }

    // Authority dashboard listens for new emergencies
    addEmergencyListener(callback) {
        this.listeners.push(callback);
    }

    // Notify all listening authority dashboards
    notifyListeners(emergency, action = 'new') {
        this.listeners.forEach(callback => {
            callback(emergency, action);
        });
    }

    // Save to localStorage (simulates database)
    saveToStorage() {
        localStorage.setItem('activeEmergencies', JSON.stringify(this.emergencies));
        // Trigger storage event for cross-tab communication
        window.dispatchEvent(new Event('storage'));
    }

    // Listen for storage changes (multiple authority tabs)
    setupStorageListener() {
        window.addEventListener('storage', () => {
            this.emergencies = JSON.parse(localStorage.getItem('activeEmergencies') || '[]');
        });
    }
}

// Global instance
const emergencyBroadcaster = new EmergencyBroadcaster();
// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sharedUtils;
}
