// Tourist Safety Application
const safetyApp = {
    // App configuration
    config: {
        emergencyTypes: {
            'CRITICAL': { 
                name: 'Critical Emergency', 
                description: 'Immediate danger response',
                color: '#dc3545'
            },
            'MEDICAL': { 
                name: 'Medical Assistance', 
                description: 'Health emergency response',
                color: '#28a745'
            },
            'SECURITY': { 
                name: 'Security Assistance', 
                description: 'Law enforcement response', 
                color: '#ff9500'
            },
            'SUPPORT': { 
                name: 'Emergency Support', 
                description: 'Local authorities connection',
                color: '#2196F3'
            }
        }
    },

    // App state
    state: {
        map: null,
        userMarker: null,
        userLocation: null,
        emergencies: [],
        watchId: null,
        locationAccessGranted: false,
        isOnline: true
    },

    // Initialize the application
    init() {
        this.checkAuthentication();
        this.initMap();
        this.setupEventListeners();
        this.startMetricsUpdates();
        
        // Auto-attempt location access
        setTimeout(() => {
            this.getLocation();
        }, 1000);
        
        console.log('SafeTravel Guardian Tourist Dashboard initialized');
    },

    // NEW: Check authentication
    checkAuthentication() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        
        if (currentUser.type !== 'tourist') {
            window.location.href = 'index.html';
            return;
        }
        
        // Update UI with user info if available
        if (currentUser.user && currentUser.user.name) {
            const welcomeElement = document.querySelector('.user-welcome');
            if (welcomeElement) {
                welcomeElement.textContent = `Welcome, ${currentUser.user.name}`;
            }
        }
    },

    // Initialize the map
    initMap() {
        const defaultLocation = { lat: 11.166737, lng: 76.966926 };
        
        this.state.map = L.map('map').setView([defaultLocation.lat, defaultLocation.lng], 15);
        
        // Use a more professional map style
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.state.map);
        
        this.state.userMarker = L.marker([defaultLocation.lat, defaultLocation.lng])
            .addTo(this.state.map)
            .bindPopup('Waiting for location access')
            .openPopup();
            
        this.updateLocationStatus('Location access required for emergency services');
    },

    // Get user location
    getLocation() {
        this.updateLocationStatus('Requesting location access...');
        
        if (!navigator.geolocation) {
            this.updateLocationStatus('Geolocation not supported by this browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => this.handleLocationSuccess(position),
            (error) => this.handleLocationError(error),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    },

    // Handle successful location acquisition
    handleLocationSuccess(position) {
        this.state.locationAccessGranted = true;
        this.state.userLocation = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
        };
        
        // Update map view
        this.state.map.setView([this.state.userLocation.lat, this.state.userLocation.lng], 15);
        this.state.userMarker.setLatLng([this.state.userLocation.lat, this.state.userLocation.lng])
                     .setPopupContent('Your current location - Monitoring active')
                     .openPopup();
        
        // Update UI
        const accuracy = position.coords.accuracy ? `±${position.coords.accuracy.toFixed(1)}m` : 'High accuracy';
        this.updateLocationStatus('Location tracking active');
        
        document.getElementById('locationCoordinates').textContent = 
            `Lat: ${this.state.userLocation.lat.toFixed(6)} | Lng: ${this.state.userLocation.lng.toFixed(6)}`;
        
        document.getElementById('locationAccuracy').textContent = `Accuracy: ${accuracy}`;
        
        // Start continuous tracking
        this.startWatchingLocation();
    },

    // Handle location errors
    handleLocationError(error) {
        this.state.locationAccessGranted = false;
        let errorMessage = 'Unable to access location';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Enable permissions for emergency features.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location unavailable. Check your connection.';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timeout. Please try again.';
                break;
        }
        
        this.updateLocationStatus(errorMessage);
    },

    // Start watching location changes
    startWatchingLocation() {
        if (this.state.watchId !== null) {
            navigator.geolocation.clearWatch(this.state.watchId);
        }
        
        this.state.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.state.userLocation = { 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude 
                };
                this.state.userMarker.setLatLng([this.state.userLocation.lat, this.state.userLocation.lng]);
                
                if (position.coords.accuracy) {
                    document.getElementById('locationAccuracy').textContent = 
                        `Accuracy: ±${position.coords.accuracy.toFixed(1)}m`;
                }
            },
            (error) => {
                console.warn('Location tracking error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    },

    // Send emergency alert
    sendEmergency(type) {
        if (!this.state.locationAccessGranted || !this.state.userLocation) {
            this.showModal(
                'Location Access Required',
                'Please enable location tracking to send emergency alerts. This ensures responders can reach you quickly.'
            );
            this.getLocation();
            return;
        }

        const emergencyConfig = this.config.emergencyTypes[type];
        const emergency = {
            id: Date.now(),
            type: type,
            name: emergencyConfig.name,
            location: `${this.state.userLocation.lat.toFixed(6)}, ${this.state.userLocation.lng.toFixed(6)}`,
            timestamp: new Date().toLocaleString(),
            status: 'PENDING',
            responder: null
        };

        this.state.emergencies.unshift(emergency);
        this.updateEmergencyHistory();

        // Show confirmation modal
        this.showModal(
            'EMERGENCY ALERT SENT',
            `Emergency Type: <strong>${emergencyConfig.name}</strong><br>
             Location: <code>${emergency.location}</code><br>
             Time: ${emergency.timestamp}<br><br>
             <span style="color: var(--success);">Emergency services have been notified and help is on the way.</span>`
        );

        // Update response status
        this.updateResponseStatus('Dispatching emergency response...');

        // Simulate emergency response
        this.simulateEmergencyResponse(emergency);
    },

    // Simulate emergency response process
    simulateEmergencyResponse(emergency) {
        setTimeout(() => {
            this.updateResponseStatus('Emergency received by control room');
            
            setTimeout(() => {
                emergency.status = 'ASSIGNED';
                emergency.responder = `Unit_${Math.floor(1000 + Math.random() * 9000)}`;
                this.updateEmergencyHistory();
                this.updateResponseStatus(`Responder assigned: ${emergency.responder}`);
                
                // Update risk level if critical
                if (emergency.type === 'CRITICAL') {
                    document.querySelector('.risk-level').textContent = 'HIGH';
                    document.querySelector('.risk-level').style.color = 'var(--danger)';
                }
            }, 2000);
        }, 1000);
    },

    // Update emergency history display
    updateEmergencyHistory() {
        const historyContainer = document.getElementById('emergencyHistory');
        const countElement = document.getElementById('emergencyCount');
        
        if (this.state.emergencies.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <p>No emergency alerts</p>
                    <small>Your safety status is actively monitored</small>
                </div>
            `;
            if (countElement) {
                countElement.textContent = 'No recent alerts';
            }
            return;
        }
        
        if (countElement) {
            countElement.textContent = `${this.state.emergencies.length} recent alert(s)`;
        }
        
        historyContainer.innerHTML = this.state.emergencies.map(emergency => `
            <div class="emergency-item">
                <strong>${emergency.name}</strong><br>
                <small>Location: ${emergency.location} | Time: ${emergency.timestamp}</small><br>
                <small>Status: <span style="color: ${emergency.status === 'PENDING' ? 'var(--warning)' : 'var(--success)'}">
                    ${emergency.status}${emergency.responder ? ` • ${emergency.responder}` : ''}
                </span></small>
            </div>
        `).join('');
    },

    // Update response status display
    updateResponseStatus(message) {
        const responseStatus = document.getElementById('responseStatus');
        if (responseStatus) {
            responseStatus.textContent = message;
        }
    },

    // Update location status display
    updateLocationStatus(message) {
        const locationText = document.getElementById('locationText');
        if (locationText) {
            locationText.textContent = message;
        }
    },

    // Show modal dialog
    showModal(title, content) {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        const modal = document.getElementById('emergencyModal');
        
        if (modalTitle && modalContent && modal) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.style.display = 'block';
        }
    },

    // Close modal dialog
    closeModal() {
        const modal = document.getElementById('emergencyModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // Close modal when clicking outside
        const modal = document.getElementById('emergencyModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'emergencyModal') this.closeModal();
            });
        }

        // Refresh location when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.state.locationAccessGranted) {
                this.getLocation();
            }
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.updateResponseStatus('System online');
        });

        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.updateResponseStatus('Offline - Limited functionality');
        });
    },

    // Start metrics updates
    startMetricsUpdates() {
        // Update response time periodically
        setInterval(() => {
            const responseTime = document.getElementById('responseTime');
            const activeResponders = document.getElementById('activeResponders');
            
            if (responseTime) {
                responseTime.textContent = (1.5 + Math.random() * 2).toFixed(1) + 's average';
            }
            if (activeResponders) {
                activeResponders.textContent = Math.floor(10 + Math.random() * 5) + ' online';
            }
        }, 5000);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    safetyApp.init();
});
// Broadcast to authority dashboard
 const emergencyId = emergencyBroadcaster.broadcastEmergency(emergencyData);

        const emergency = {
            id: emergencyId,
            type: type,
            name: emergencyConfig.name,
            location: coordinates,
            timestamp: new Date().toLocaleString(),
            status: 'ACTIVE',
            responder: null
        };

        this.state.emergencies.unshift(emergency);
        this.updateEmergencyHistory();

        // Show confirmation with live tracking info
        this.showModal(
            '🚨 EMERGENCY ALERT SENT',
            `Emergency Type: <strong>${emergencyConfig.name}</strong><br>
             Location: <code>${emergency.location}</code><br>
             Time: ${emergency.timestamp}<br>
             <span style="color: var(--success);">✓ Live location sharing active</span><br>
             <span style="color: var(--success);">✓ Nearest responders notified</span>`
        );

        this.updateResponseStatus('Live location sharing with authorities...');

        // Start live location updates for this emergency
        this.startLiveLocationSharing(emergencyId);
    },

    // Start continuous location sharing for active emergency
    startLiveLocationSharing(emergencyId) {
        const locationUpdateInterval = setInterval(() => {
            if (this.state.userLocation) {
                emergencyBroadcaster.updateEmergency(emergencyId, {
                    coordinates: `${this.state.userLocation.lat},${this.state.userLocation.lng}`,
                    lastUpdate: new Date().toISOString()
                });
            }
        }, 5000); // Update every 5 seconds

        // Store interval ID to clear later
        this.state.activeEmergencyInterval = locationUpdateInterval;
    },

    // Get approximate address from coordinates
    getAddressFromCoordinates(coords) {
        // In real app, you'd use reverse geocoding API
        return `Near ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    },

    // Generate unique tourist ID
    getTouristId() {
        let touristId = localStorage.getItem('touristId');
        if (!touristId) {
            touristId = 'TOURIST_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('touristId', touristId);
        }
        return touristId;
    },

    // Get additional emergency information
    getAdditionalEmergencyInfo(type) {
        const info = {
            batteryLevel: navigator.getBattery ? 'Unknown' : 'N/A',
            networkType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
            timestamp: new Date().toISOString()
        };

        if (type === 'MEDICAL') {
            info.medicalNotes = 'Automatic medical alert - urgent assistance required';
        } else if (type === 'CRITICAL') {
            info.priority = 'HIGHEST';
        }

        return info;
    },

    // ... rest of existing code ...
};
