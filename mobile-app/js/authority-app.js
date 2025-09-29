// authority-app.js - Enhanced with all features
class AuthorityApp {
    constructor() {
        this.map = null;
        this.emergencies = [];
        this.responders = [];
        this.heatmapEnabled = false;
        this.emergencyMarkers = new Map();
        this.selectedEmergency = null;
        this.liveTracks = new Map();
        this.charts = {};
        this.liveTrackers = new Map(); // Track moving tourists
        this.locationUpdateInterval = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initializeMap();
        this.loadResponders();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.initializeLiveTracking();
        this.initializeAnalytics();
        
        console.log('Authority Dashboard - All Systems Active');
    }
// Enhanced method to handle new SOS alerts with live tracking
    handleNewEmergency(emergency) {
        // Check if emergency already exists
        const existingIndex = this.emergencies.findIndex(e => e.id === emergency.id);
        
        if (existingIndex === -1) {
            this.emergencies.unshift(emergency);
            // Start live tracking for new emergency
            this.startLiveTracking(emergency.id);
        } else {
            this.emergencies[existingIndex] = emergency;
        }
        
        this.addEmergencyToMap(emergency);
        this.updateEmergencyDisplay();
        this.showEmergencyNotification(emergency);
        
        // Start location updates if not already running
        if (!this.locationUpdateInterval) {
            this.startLocationUpdates();
        }
    }

    // Start live tracking for an emergency
    startLiveTracking(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (!emergency || emergency.status !== 'active') return;

        // Create live tracker entry
        this.liveTrackers.set(emergencyId, {
            emergency: emergency,
            marker: null,
            polyline: null,
            path: [],
            lastUpdate: Date.now()
        });

        // Update marker to show live tracking
        this.updateEmergencyMarkerForTracking(emergencyId);
    }

    // Enhanced marker creation for live tracking
    updateEmergencyMarkerForTracking(emergencyId) {
        const tracker = this.liveTrackers.get(emergencyId);
        if (!tracker) return;

        const emergency = tracker.emergency;
        let coordinates;
        
        if (Array.isArray(emergency.coordinates)) {
            coordinates = emergency.coordinates;
        } else if (typeof emergency.coordinates === 'string') {
            coordinates = emergency.coordinates.split(',').map(Number);
        } else {
            return;
        }

        // Remove existing marker
        if (tracker.marker) {
            this.map.removeLayer(tracker.marker);
        }

        // Create animated marker for live tracking
        const marker = L.marker(coordinates, {
            icon: L.divIcon({
                className: `live-tracker-marker ${emergency.type}`,
                html: `
                    <div class="live-marker-pulse">
                        <div class="live-marker-inner">
                            ${this.getEmergencyIcon(emergency.type)}
                        </div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(this.map);

        marker.bindPopup(this.createLiveTrackingPopup(emergency));

        tracker.marker = marker;
        
        // Update movement trail
        this.updateMovementTrail(emergencyId, coordinates);
    }

    // Create enhanced popup for live tracking
    createLiveTrackingPopup(emergency) {
        const lastUpdate = emergency.lastUpdate ? 
            new Date(emergency.lastUpdate).toLocaleTimeString() : 
            'Just now';
            
        return `
            <div class="live-tracking-popup" style="min-width: 280px;">
                <h4>${this.getEmergencyIcon(emergency.type)} LIVE TRACKING - ${emergency.type.toUpperCase()}</h4>
                <div style="margin: 10px 0;">
                    <p><strong>👤 Tourist:</strong> ${emergency.tourist || 'Unknown'}</p>
                    <p><strong>📱 Tourist ID:</strong> ${emergency.touristId || 'N/A'}</p>
                    <p><strong>📍 Live Location:</strong> ${emergency.location}</p>
                    <p><strong>🕒 SOS Time:</strong> ${new Date(emergency.timestamp).toLocaleString()}</p>
                    <p><strong>📡 Last Update:</strong> ${lastUpdate}</p>
                    <p><strong>🎯 Status:</strong> <span class="live-tracking-badge">LIVE TRACKING ACTIVE</span></p>
                </div>
                <div class="tracking-controls" style="display: grid; gap: 5px; margin-top: 10px;">
                    <button onclick="authorityApp.centerOnTourist(${emergency.id})" 
                            class="primary-btn small">🎯 Center & Follow</button>
                    <button onclick="authorityApp.assignToNearestResponder(${emergency.id})" 
                            class="secondary-btn small">🚑 Assign Responder</button>
                    <button onclick="authorityApp.contactTourist(${emergency.id})" 
                            class="secondary-btn small">📞 Call Tourist</button>
                </div>
            </div>
        `;
    }

    // Start periodic location updates
    startLocationUpdates() {
        this.locationUpdateInterval = setInterval(() => {
            this.updateAllLivePositions();
        }, 3000); // Update every 3 seconds
    }

    // Update positions for all tracked emergencies
    updateAllLivePositions() {
        this.liveTrackers.forEach((tracker, emergencyId) => {
            if (tracker.emergency.status === 'active') {
                // In real app, this would get actual location from tourist's device
                // For demo, we'll simulate movement
                this.simulateTouristMovement(emergencyId);
            }
        });
    }

    // Enhanced movement simulation (replace with real location updates)
    simulateTouristMovement(emergencyId) {
        const tracker = this.liveTrackers.get(emergencyId);
        if (!tracker) return;

        const emergency = tracker.emergency;
        
        // Add realistic movement (small random changes)
        const latChange = (Math.random() - 0.5) * 0.0005; // ~50 meters
        const lngChange = (Math.random() - 0.5) * 0.0005;
        
        if (Array.isArray(emergency.coordinates)) {
            emergency.coordinates[0] += latChange;
            emergency.coordinates[1] += lngChange;
        }
        
        emergency.lastUpdate = new Date().toISOString();
        
        // Update the marker and trail
        this.updateEmergencyMarkerForTracking(emergencyId);
        
        // Update emergency list display
        this.updateEmergencyDisplay();
    }

    // Enhanced movement trail with better visualization
    updateMovementTrail(emergencyId, newCoords) {
        const tracker = this.liveTrackers.get(emergencyId);
        if (!tracker) return;

        if (!tracker.polyline) {
            // Create new trail
            tracker.polyline = L.polyline([newCoords], {
                color: this.getMarkerColor(tracker.emergency.type),
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1,
                lineCap: 'round'
            }).addTo(this.map);
            
            tracker.path = [newCoords];
        } else {
            // Update existing trail
            tracker.path.push(newCoords);
            
            // Keep only last 20 positions for trail (about 1 minute of movement)
            if (tracker.path.length > 20) {
                tracker.path.shift();
            }
            
            tracker.polyline.setLatLngs(tracker.path);
        }
    }

    // Enhanced center on tourist with follow mode
    centerOnTourist(emergencyId) {
        const tracker = this.liveTrackers.get(emergencyId);
        if (!tracker) return;

        const emergency = tracker.emergency;
        let coordinates;
        
        if (Array.isArray(emergency.coordinates)) {
            coordinates = emergency.coordinates;
        } else if (typeof emergency.coordinates === 'string') {
            coordinates = emergency.coordinates.split(',').map(Number);
        }
        
        if (coordinates) {
            this.map.setView(coordinates, 16, {
                animate: true,
                duration: 1
            });
            
            // Flash the marker to highlight
            if (tracker.marker) {
                this.flashMarker(tracker.marker, 5);
            }
            
            this.showNotification(`🎯 Now tracking ${emergency.tourist || 'tourist'} - Live movement active`);
            
            // Enable auto-follow for this tourist
            this.enableAutoFollow(emergencyId);
        }
    }

    // Auto-follow mode for specific tourist
    enableAutoFollow(emergencyId) {
        // Disable any existing auto-follow
        if (this.autoFollowInterval) {
            clearInterval(this.autoFollowInterval);
        }
        
        // Set up auto-follow
        this.autoFollowInterval = setInterval(() => {
            const tracker = this.liveTrackers.get(emergencyId);
            if (tracker && tracker.emergency.status === 'active') {
                const coordinates = Array.isArray(tracker.emergency.coordinates) ? 
                    tracker.emergency.coordinates : 
                    tracker.emergency.coordinates.split(',').map(Number);
                
                this.map.panTo(coordinates, {
                    animate: true,
                    duration: 1
                });
            } else {
                // Stop auto-follow if emergency is resolved
                clearInterval(this.autoFollowInterval);
            }
        }, 2000); // Update every 2 seconds
    }

    // Enhanced emergency display with live tracking indicators
    updateEmergencyDisplay() {
        const container = document.getElementById('emergenciesContainer');
        const activeCount = this.emergencies.filter(e => e.status === 'active').length;

        if (this.emergencies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No active emergencies</p>
                    <small>All systems monitoring normally</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.emergencies.map(emergency => {
            const isLiveTracking = this.liveTrackers.has(emergency.id) && emergency.status === 'active';
            const lastUpdate = emergency.lastUpdate ? 
                new Date(emergency.lastUpdate).toLocaleTimeString() : 'Just now';
            
            return `
                <div class="emergency-item ${emergency.type} ${isLiveTracking ? 'live-tracking' : ''}" 
                     onclick="authorityApp.viewEmergencyDetails(${emergency.id})">
                    <div class="emergency-icon">
                        ${this.getEmergencyIcon(emergency.type)}
                        ${isLiveTracking ? '<div class="live-indicator"></div>' : ''}
                    </div>
                    <div class="emergency-info">
                        <h4>${emergency.title || emergency.type + ' Emergency'} 
                            ${isLiveTracking ? '<span class="live-badge">LIVE TRACKING</span>' : ''}
                            ${emergency.status === 'active' ? '<span class="active-badge">ACTIVE</span>' : ''}
                        </h4>
                        <p>📍 ${emergency.location}</p>
                        <div class="emergency-meta">
                            <small>👤 ${emergency.tourist || 'Unknown Tourist'}</small>
                            <small>📱 ${emergency.touristId || 'N/A'}</small>
                            <small>📡 ${lastUpdate}</small>
                        </div>
                        ${emergency.assignedTo ? `<div class="assigned-to">🚑 Assigned: ${emergency.assignedTo}</div>` : ''}
                    </div>
                    <div class="emergency-actions">
                        <button class="track-btn" onclick="event.stopPropagation(); authorityApp.centerOnTourist(${emergency.id})">
                            🎯 Track
                        </button>
                        <div class="emergency-status ${emergency.status}">
                            ${emergency.status.toUpperCase()}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Clean up when emergency is resolved
    resolveEmergency() {
        if (!this.selectedEmergency) return;
        
        const emergencyId = this.selectedEmergency.id;
        const tracker = this.liveTrackers.get(emergencyId);
        
        // Stop tracking
        if (tracker) {
            if (tracker.marker) this.map.removeLayer(tracker.marker);
            if (tracker.polyline) this.map.removeLayer(tracker.polyline);
            this.liveTrackers.delete(emergencyId);
        }
        
        // Stop auto-follow if this was the followed emergency
        if (this.autoFollowInterval) {
            clearInterval(this.autoFollowInterval);
        }
        
        this.selectedEmergency.status = 'resolved';
        
        // Free up the assigned responder
        if (this.selectedEmergency.assignedTo) {
            const responder = this.responders.find(r => r.name === this.selectedEmergency.assignedTo);
            if (responder) {
                responder.status = 'online';
            }
        }
        
        this.updateEmergencyDisplay();
        this.updateResponderDisplay();
        this.updateAnalytics();
        this.closeModal();
        this.showNotification('Emergency marked as resolved - Live tracking stopped');
    }
}
    checkAuthentication() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (currentUser.type !== 'authority') {
            window.location.href = 'index.html';
            return;
        }
        
        document.getElementById('authorityName').textContent = currentUser.name || 'Response Unit';
    }

    initializeMap() {
        // Center on India
        const defaultLocation = [20.5937, 78.9629];
        this.map = L.map('authorityMap').setView(defaultLocation, 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        console.log('India Map initialized successfully');
    }

    // 1. LIVE EMERGENCY FEED
    loadEmergencies() {
        // Get real emergencies from broadcast system
        if (typeof emergencyBroadcast !== 'undefined') {
            this.emergencies = emergencyBroadcast.getActiveEmergencies();
            
            // Listen for new emergencies in real-time
            emergencyBroadcast.addEmergencyListener((emergency, action) => {
                if (action === 'new') {
                    this.handleNewEmergency(emergency);
                } else if (action === 'update') {
                    this.updateEmergencyMarker(emergency);
                } else if (action === 'location_update') {
                    this.handleLocationUpdate(emergency);
                }
            });
        } else {
            // Fallback to sample data with live tracking
            this.emergencies = this.getSampleEmergencies();
        }

        this.updateEmergencyDisplay();
        this.plotEmergenciesOnMap();
        this.updateAnalytics();
    }

    getSampleEmergencies() {
        return [
            {
                id: 1,
                type: "critical",
                title: "Critical Emergency",
                location: "Connaught Place, Delhi",
                coordinates: [28.6139, 77.2090],
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString(),
                status: "active",
                tourist: "John Doe",
                phone: "+1234567890",
                touristId: "T001",
                lastUpdate: new Date().toISOString()
            },
            {
                id: 2,
                type: "medical",
                title: "Medical Assistance Needed",
                location: "Marine Drive, Mumbai",
                coordinates: [19.0760, 72.8777],
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString(),
                status: "active",
                tourist: "Jane Smith",
                phone: "+1234567891",
                touristId: "T002",
                lastUpdate: new Date().toISOString()
            }
        ];
    }

    // 2. LIVE LOCATION TRACKING
    initializeLiveTracking() {
        // Set up interval to update live positions
        setInterval(() => {
            this.updateLivePositions();
        }, 3000);
    }

    updateLivePositions() {
        this.emergencies.forEach(emergency => {
            if (emergency.status === 'active' && this.liveTracks.has(emergency.id)) {
                this.updateEmergencyMarker(emergency);
            }
        });
    }

    updateEmergencyMarker(emergency) {
        const marker = this.emergencyMarkers.get(emergency.id);
        if (marker) {
            let coordinates;
            
            if (Array.isArray(emergency.coordinates)) {
                coordinates = emergency.coordinates;
            } else if (typeof emergency.coordinates === 'string') {
                coordinates = emergency.coordinates.split(',').map(Number);
            } else {
                return;
            }
            
            // Smooth animation for movement
            marker.setLatLng(coordinates, {
                duration: 1000,
                easeLinearity: 0.25
            });
            
            // Update popup with latest info
            marker.setPopupContent(this.createEmergencyPopup(emergency));
            
            // Add movement trail/polyline
            this.updateMovementTrail(emergency.id, coordinates);
        }
    }

    updateMovementTrail(emergencyId, newCoords) {
        if (!this.liveTracks.has(emergencyId)) {
            // Create new trail
            const polyline = L.polyline([newCoords], {
                color: this.getMarkerColor(this.emergencies.find(e => e.id === emergencyId)?.type),
                weight: 3,
                opacity: 0.7,
                smoothFactor: 1
            }).addTo(this.map);
            
            this.liveTracks.set(emergencyId, {
                polyline: polyline,
                path: [newCoords]
            });
        } else {
            // Update existing trail
            const track = this.liveTracks.get(emergencyId);
            track.path.push(newCoords);
            
            // Keep only last 10 positions for trail
            if (track.path.length > 10) {
                track.path.shift();
            }
            
            track.polyline.setLatLngs(track.path);
        }
    }

    plotEmergenciesOnMap() {
        // Clear existing markers
        this.emergencyMarkers.forEach(marker => this.map.removeLayer(marker));
        this.emergencyMarkers.clear();

        this.emergencies.forEach(emergency => {
            this.addEmergencyToMap(emergency);
            
            // Start live tracking for active emergencies
            if (emergency.status === 'active') {
                this.startTrackingEmergency(emergency.id);
            }
        });

        // Adjust map view if we have emergencies
        if (this.emergencies.length > 0) {
            const markersArray = Array.from(this.emergencyMarkers.values());
            const group = L.featureGroup(markersArray);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    addEmergencyToMap(emergency) {
        let coordinates;
        
        if (Array.isArray(emergency.coordinates)) {
            coordinates = emergency.coordinates;
        } else if (typeof emergency.coordinates === 'string') {
            coordinates = emergency.coordinates.split(',').map(Number);
        } else {
            console.error('Invalid coordinates format:', emergency.coordinates);
            return;
        }

        const markerColor = this.getMarkerColor(emergency.type);
        const marker = L.marker(coordinates, {
            icon: L.divIcon({
                className: `emergency-marker ${emergency.type} ${emergency.status === 'active' ? 'moving-marker' : ''}`,
                html: `
                    <div style="
                        background-color: ${markerColor}; 
                        width: 20px; 
                        height: 20px; 
                        border-radius: 50%; 
                        border: 3px solid white; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        animation: ${emergency.status === 'active' ? 'pulse 2s infinite' : 'none'};
                    "></div>
                `,
                iconSize: [20, 20]
            })
        }).addTo(this.map);

        marker.bindPopup(this.createEmergencyPopup(emergency));

        marker.on('click', () => {
            this.viewEmergencyDetails(emergency.id);
        });

        this.emergencyMarkers.set(emergency.id, marker);
    }

    createEmergencyPopup(emergency) {
        const lastUpdate = emergency.lastUpdate ? 
            new Date(emergency.lastUpdate).toLocaleTimeString() : 
            'Just now';
            
        return `
            <div class="emergency-popup" style="min-width: 250px;">
                <h4>${this.getEmergencyIcon(emergency.type)} ${emergency.type.toUpperCase()} EMERGENCY</h4>
                <div style="margin: 10px 0;">
                    <p><strong>👤 Tourist:</strong> ${emergency.tourist || 'Unknown'}</p>
                    <p><strong>📍 Location:</strong> ${emergency.location}</p>
                    <p><strong>🕒 Reported:</strong> ${new Date(emergency.timestamp || emergency.time).toLocaleString()}</p>
                    <p><strong>📡 Last Update:</strong> ${lastUpdate}</p>
                    <p><strong>🔴 Status:</strong> <span style="color: ${emergency.status === 'active' ? 'red' : 'green'};">${emergency.status.toUpperCase()}</span></p>
                </div>
                <div style="display: grid; gap: 5px; margin-top: 10px;">
                    <button onclick="authorityApp.viewEmergencyDetails(${emergency.id})" 
                            class="primary-btn small">View Details</button>
                    <button onclick="authorityApp.assignToNearestResponder(${emergency.id})" 
                            class="secondary-btn small">Assign Responder</button>
                    <button onclick="authorityApp.centerOnTourist(${emergency.id})" 
                            class="secondary-btn small">📍 Track Movement</button>
                </div>
            </div>
        `;
    }

    startTrackingEmergency(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (!emergency || emergency.status !== 'active') return;

        // Simulate movement for demo (in real app, this would come from GPS)
        const tracker = setInterval(() => {
            this.simulateTouristMovement(emergencyId);
        }, 5000);
        
        this.liveTracks.set(emergencyId, { ...this.liveTracks.get(emergencyId), tracker });
    }

    simulateTouristMovement(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (!emergency || emergency.status !== 'active') return;

        // Add small random movement
        const latChange = (Math.random() - 0.5) * 0.001;
        const lngChange = (Math.random() - 0.5) * 0.001;
        
        if (Array.isArray(emergency.coordinates)) {
            emergency.coordinates[0] += latChange;
            emergency.coordinates[1] += lngChange;
        }
        
        emergency.lastUpdate = new Date().toISOString();
        
        // Update the marker
        this.updateEmergencyMarker(emergency);
    }

    centerOnTourist(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (emergency && emergency.coordinates) {
            let coordinates;
            
            if (Array.isArray(emergency.coordinates)) {
                coordinates = emergency.coordinates;
            } else if (typeof emergency.coordinates === 'string') {
                coordinates = emergency.coordinates.split(',').map(Number);
            }
            
            if (coordinates) {
                this.map.setView(coordinates, 16, {
                    animate: true,
                    duration: 1
                });
                
                // Flash the marker to highlight
                const marker = this.emergencyMarkers.get(emergencyId);
                if (marker) {
                    this.flashMarker(marker, 5);
                }
                
                this.showNotification(`Now tracking ${emergency.tourist || 'tourist'} movement`);
            }
        }
    }

    flashMarker(marker, times) {
        let count = 0;
        const interval = setInterval(() => {
            marker.getElement().style.opacity = marker.getElement().style.opacity === '0.5' ? '1' : '0.5';
            count++;
            if (count >= times * 2) {
                clearInterval(interval);
                marker.getElement().style.opacity = '1';
            }
        }, 300);
    }

    // 3. RESPONDER MANAGEMENT
    loadResponders() {
        this.responders = [
            { id: 1, name: "Unit Alpha-01", status: "online", location: "Delhi", type: "police" },
            { id: 2, name: "Unit Bravo-02", status: "busy", location: "Mumbai", type: "medical" },
            { id: 3, name: "Unit Charlie-03", status: "online", location: "Bangalore", type: "security" },
            { id: 4, name: "Medical Team-04", status: "online", location: "Chennai", type: "medical" },
            { id: 5, name: "Rapid Response-05", status: "online", location: "Kolkata", type: "police" }
        ];

        this.updateResponderDisplay();
    }

    updateResponderDisplay() {
        const availableCount = this.responders.filter(r => r.status === 'online').length;
        document.getElementById('availableResponders').textContent = `${availableCount} available responders`;
        document.getElementById('currentResponseTime').textContent = this.calculateAverageResponseTime();

        const container = document.getElementById('responderList');
        container.innerHTML = this.responders.map(responder => `
            <div class="responder-item ${responder.status}">
                <div class="responder-info">
                    <span class="responder-name">${responder.name}</span>
                    <span class="responder-location">📍 ${responder.location}</span>
                    <span class="responder-type">${this.getResponderTypeIcon(responder.type)} ${responder.type}</span>
                    <span class="responder-status ${responder.status}">${responder.status === 'online' ? '🟢 Available' : '🔴 Busy'}</span>
                </div>
                <div class="responder-actions">
                    <button class="btn primary small" 
                            ${responder.status !== 'online' ? 'disabled' : ''}
                            onclick="authorityApp.assignResponderToEmergency(${responder.id})">
                        ${responder.status === 'online' ? 'Assign' : 'Busy'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    getResponderTypeIcon(type) {
        const icons = {
            police: '👮',
            medical: '🏥',
            security: '🛡️'
        };
        return icons[type] || '👤';
    }

    assignResponderToEmergency(responderId) {
        if (!this.selectedEmergency) {
            this.showNotification('Please select an emergency first', 'warning');
            return;
        }

        const responder = this.responders.find(r => r.id === responderId);
        if (!responder || responder.status !== 'online') {
            this.showNotification('Responder not available', 'error');
            return;
        }

        // Assign responder to emergency
        this.selectedEmergency.assignedTo = responder.name;
        this.selectedEmergency.status = 'assigned';
        responder.status = 'busy';

        // Update in broadcast system
        if (typeof emergencyBroadcast !== 'undefined') {
            emergencyBroadcast.updateEmergency(this.selectedEmergency.id, {
                assignedTo: responder.name,
                status: 'assigned'
            });
        }

        this.updateEmergencyDisplay();
        this.updateResponderDisplay();
        this.plotEmergenciesOnMap();
        
        this.showNotification(`🚑 ${responder.name} assigned to emergency - ETA: 5-7 minutes`);
    }

    assignToNearestResponder(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (!emergency) return;
        
        const availableResponders = this.responders.filter(r => r.status === 'online');
        if (availableResponders.length === 0) {
            this.showNotification('No available responders at the moment', 'error');
            return;
        }
        
        // Simple distance-based assignment (in real app, use proper geolocation)
        const assignedResponder = availableResponders[0];
        emergency.assignedTo = assignedResponder.name;
        emergency.status = 'assigned';
        
        // Update responder status
        assignedResponder.status = 'busy';
        
        // Update in broadcast system
        if (typeof emergencyBroadcast !== 'undefined') {
            emergencyBroadcast.updateEmergency(emergencyId, {
                assignedTo: assignedResponder.name,
                status: 'assigned'
            });
        }
        
        this.updateEmergencyDisplay();
        this.updateResponderDisplay();
        this.plotEmergenciesOnMap();
        
        this.showNotification(`🚑 ${assignedResponder.name} assigned - ETA: 5-7 minutes`);
    }

    // 4. ANALYTICS DASHBOARD
    initializeAnalytics() {
        this.initializeCharts();
        this.updateAnalytics();
    }

    initializeCharts() {
        // Emergency Types Chart
        const typeCtx = document.getElementById('typeChart').getContext('2d');
        this.charts.typeChart = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'Medical', 'Security', 'Support'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Response Times Chart
        const responseCtx = document.getElementById('responseChart').getContext('2d');
        this.charts.responseChart = new Chart(responseCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Response Time (seconds)',
                    data: [4.2, 3.8, 4.5, 3.9, 4.1, 4.3, 4.0],
                    borderColor: '#4ecdc4',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true
            }
        });

        // Activity Chart
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        this.charts.activityChart = new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'],
                datasets: [{
                    label: 'Emergencies',
                    data: [2, 5, 8, 12, 15, 7],
                    backgroundColor: '#ff6b6b'
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    updateAnalytics() {
        // Update charts with real data
        const typeCounts = this.calculateTypeCounts();
        this.charts.typeChart.data.datasets[0].data = typeCounts;
        this.charts.typeChart.update();

        // Update metrics
        document.getElementById('successRate').textContent = this.calculateSuccessRate();
        document.getElementById('avgResolution').textContent = this.calculateAvgResolution();
        document.getElementById('satisfaction').textContent = this.calculateSatisfaction();

        // Update stats
        this.updateStatistics();
    }

    calculateTypeCounts() {
        const counts = { critical: 0, medical: 0, security: 0, support: 0 };
        this.emergencies.forEach(emergency => {
            if (counts.hasOwnProperty(emergency.type)) {
                counts[emergency.type]++;
            }
        });
        return Object.values(counts);
    }

    calculateSuccessRate() {
        const resolved = this.emergencies.filter(e => e.status === 'resolved').length;
        const total = this.emergencies.length;
        return total > 0 ? Math.round((resolved / total) * 100) + '%' : '0%';
    }

    calculateAvgResolution() {
        // Mock data - in real app, calculate from actual resolution times
        return '12m';
    }

    calculateSatisfaction() {
        // Mock data - in real app, use actual feedback
        return '94%';
    }

    calculateAverageResponseTime() {
        // Mock data - in real app, calculate from actual response times
        return '4.2s';
    }

    updateStatistics() {
        const activeCount = this.emergencies.filter(e => e.status === 'active').length;
        const availableResponders = this.responders.filter(r => r.status === 'online').length;
        const resolvedToday = this.emergencies.filter(e => e.status === 'resolved').length;

        document.getElementById('activeEmergencies').textContent = activeCount;
        document.getElementById('respondersOnline').textContent = availableResponders;
        document.getElementById('resolvedToday').textContent = resolvedToday;

        // Update trends (mock data)
        document.getElementById('emergencyTrend').textContent = activeCount > 0 ? '+25% today' : 'No change';
        document.getElementById('responderTrend').textContent = availableResponders > 0 ? '100% available' : 'No responders';
        document.getElementById('responseTrend').textContent = 'Target: <5s';
        document.getElementById('resolutionTrend').textContent = '+5% efficiency';
    }

    // UI UPDATES
    updateEmergencyDisplay() {
        const container = document.getElementById('emergenciesContainer');
        const activeCount = this.emergencies.filter(e => e.status === 'active').length;

        // Update stats
        this.updateStatistics();

        if (this.emergencies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No active emergencies</p>
                    <small>All systems monitoring normally</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.emergencies.map(emergency => `
            <div class="emergency-item ${emergency.type} ${emergency.status === 'active' ? 'tracking-active' : ''}" 
                 onclick="authorityApp.viewEmergencyDetails(${emergency.id})">
                <div class="emergency-icon">${this.getEmergencyIcon(emergency.type)}</div>
                <div class="emergency-info">
                    <h4>${emergency.title || emergency.type + ' Emergency'} 
                        ${emergency.status === 'active' ? '<span class="live-badge">LIVE</span>' : ''}
                    </h4>
                    <p>${emergency.location}</p>
                    <small>📡 Last update: ${emergency.lastUpdate ? 
                        new Date(emergency.lastUpdate).toLocaleTimeString() : 'Just now'}</small>
                    ${emergency.assignedTo ? `<div class="assigned-to">👮 Assigned: ${emergency.assignedTo}</div>` : ''}
                </div>
                <div class="emergency-status ${emergency.status}">
                    ${emergency.status.toUpperCase()}
                </div>
            </div>
        `).join('');
    }

    getEmergencyIcon(type) {
        const icons = {
            critical: '🚨',
            medical: '🏥',
            security: '🛡️',
            support: '🔧'
        };
        return icons[type] || '⚠️';
    }

    getMarkerColor(type) {
        const colors = {
            critical: '#e74c3c',
            medical: '#3498db',
            security: '#f39c12',
            support: '#2ecc71'
        };
        return colors[type] || '#95a5a6';
    }

    // EVENT HANDLERS
    handleNewEmergency(emergency) {
        // Check if emergency already exists
        const existingIndex = this.emergencies.findIndex(e => e.id === emergency.id);
        
        if (existingIndex === -1) {
            this.emergencies.unshift(emergency);
            // Start live tracking for new emergency
            this.startTrackingEmergency(emergency.id);
        } else {
            this.emergencies[existingIndex] = emergency;
        }
        
        this.addEmergencyToMap(emergency);
        this.updateEmergencyDisplay();
        this.showEmergencyNotification(emergency);
    }

    handleLocationUpdate(emergency) {
        this.updateEmergencyMarker(emergency);
        this.updateEmergencyDisplay();
    }

    viewEmergencyDetails(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (!emergency) return;

        this.selectedEmergency = emergency;

        document.getElementById('modalTitle').textContent = emergency.title || `${emergency.type} Emergency`;
        document.getElementById('detailType').textContent = emergency.type.toUpperCase();
        document.getElementById('detailTourist').textContent = emergency.tourist || 'Unknown';
        document.getElementById('detailLocation').textContent = emergency.location;
        document.getElementById('detailCoordinates').textContent = Array.isArray(emergency.coordinates) ? 
            emergency.coordinates.join(', ') : emergency.coordinates;
        document.getElementById('detailTime').textContent = new Date(emergency.timestamp || emergency.time).toLocaleString();
        document.getElementById('detailStatus').textContent = emergency.status.toUpperCase();
        document.getElementById('detailAssigned').textContent = emergency.assignedTo || 'Not assigned';
        document.getElementById('detailLastUpdate').textContent = emergency.lastUpdate ? 
            new Date(emergency.lastUpdate).toLocaleString() : 'Never';

        document.getElementById('emergencyModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('emergencyModal').style.display = 'none';
        this.selectedEmergency = null;
    }

    assignResponder() {
        if (!this.selectedEmergency) return;
        this.assignToNearestResponder(this.selectedEmergency.id);
    }

    contactTourist() {
        if (!this.selectedEmergency) return;
        
        this.showNotification(`Contacting tourist: ${this.selectedEmergency.tourist || 'Unknown'}...`);
        // Simulate contact process
        setTimeout(() => {
            this.showNotification('Tourist contacted successfully');
        }, 2000);
    }

    resolveEmergency() {
        if (!this.selectedEmergency) return;
        
        const emergencyId = this.selectedEmergency.id;
        
        // Stop tracking
        if (this.liveTracks.has(emergencyId)) {
            const track = this.liveTracks.get(emergencyId);
            if (track.tracker) clearInterval(track.tracker);
            if (track.polyline) this.map.removeLayer(track.polyline);
            this.liveTracks.delete(emergencyId);
        }
        
        this.selectedEmergency.status = 'resolved';
        
        // Free up the assigned responder
        if (this.selectedEmergency.assignedTo) {
            const responder = this.responders.find(r => r.name === this.selectedEmergency.assignedTo);
            if (responder) {
                responder.status = 'online';
            }
        }
        
        this.updateEmergencyDisplay();
        this.updateResponderDisplay();
        this.updateAnalytics();
        this.closeModal();
        this.showNotification('Emergency marked as resolved - Tracking stopped');
    }

    refreshMap() {
        this.loadEmergencies();
        this.showNotification('Map data refreshed successfully');
    }

    toggleHeatmap() {
        this.heatmapEnabled = !this.heatmapEnabled;
        const btn = document.getElementById('heatmapBtn');
        
        if (this.heatmapEnabled) {
            this.emergencies.forEach(emergency => {
                const circle = L.circle(emergency.coordinates, {
                    color: this.getMarkerColor(emergency.type),
                    fillColor: this.getMarkerColor(emergency.type),
                    fillOpacity: 0.2,
                    radius: 5000 // 5km radius
                }).addTo(this.map);
                this.emergencyMarkers.set(`heatmap-${emergency.id}`, circle);
            });
            btn.textContent = '🔥 Heatmap ON';
            this.showNotification('Heatmap enabled - Showing emergency density');
        } else {
            this.emergencyMarkers.forEach((marker, key) => {
                if (key.startsWith('heatmap-')) {
                    this.map.removeLayer(marker);
                    this.emergencyMarkers.delete(key);
                }
            });
            btn.textContent = '🔥 Heatmap';
            this.showNotification('Heatmap disabled');
        }
    }

    centerOnActive() {
        const activeEmergencies = this.emergencies.filter(e => e.status === 'active');
        if (activeEmergencies.length > 0) {
            const markers = activeEmergencies.map(e => this.emergencyMarkers.get(e.id));
            const group = L.featureGroup(markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
            this.showNotification('Centered on active emergencies');
        } else {
            this.showNotification('No active emergencies to center on', 'warning');
        }
    }

    filterEmergencies() {
        const filter = document.getElementById('emergencyFilter').value;
        this.showNotification(`Filtered emergencies by: ${filter}`);
        // Filter logic would be implemented here
    }

    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            activeEmergencies: this.emergencies.filter(e => e.status === 'active').length,
            totalResponders: this.responders.length,
            availableResponders: this.responders.filter(r => r.status === 'online').length,
            successRate: this.calculateSuccessRate(),
            avgResponseTime: this.calculateAverageResponseTime()
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "emergency_report_" + new Date().toISOString().split('T')[0] + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        this.showNotification('Report exported successfully');
    }

    generateReport() {
        this.exportReport();
    }

    showEmergencyNotification(emergency) {
        if (Notification.permission === 'granted') {
            new Notification(`🚨 New ${emergency.type} Emergency`, {
                body: `Location: ${emergency.location}\nTourist: ${emergency.tourist || 'Unknown'}\nClick to view details`,
                icon: '/favicon.ico',
                tag: emergency.id
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        
        // Also show in-app notification
        this.showNotification(`🚨 New ${emergency.type} emergency from ${emergency.tourist || 'tourist'}`, 'emergency');
    }

    showNotification(message, type = 'success') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('emergencyModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.refreshMap();
            }
        });

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    startRealTimeUpdates() {
        // Load initial emergencies
        this.loadEmergencies();
        
        // Set up periodic refresh
        setInterval(() => {
            this.loadEmergencies();
        }, 30000); // Every 30 seconds

        console.log('Real-time emergency monitoring active');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authorityApp = new AuthorityApp();
});
// Add this to your authority-app.js or create new file
class AuthorityEmergencyReceiver {
    constructor() {
        this.emergencies = [];
        this.emergencyMarkers = new Map();
        this.isConnected = false;
        
        this.connectToEmergencySystem();
    }

    connectToEmergencySystem() {
        if (typeof emergencyBroadcaster === 'undefined') {
            console.error('❌ Emergency Broadcast system not found');
            // Retry connection after 2 seconds
            setTimeout(() => this.connectToEmergencySystem(), 2000);
            return;
        }

        // Register to receive emergency updates
        emergencyBroadcaster.addAuthorityListener((emergency, action) => {
            this.handleEmergencyUpdate(emergency, action);
        });

        this.isConnected = true;
        console.log('✅ Authority dashboard connected to emergency system');
        
        // Load existing emergencies
        this.loadExistingEmergencies();
    }

    loadExistingEmergencies() {
        if (typeof emergencyBroadcaster !== 'undefined') {
            const activeEmergencies = emergencyBroadcaster.getActiveEmergencies();
            activeEmergencies.forEach(emergency => {
                this.handleEmergencyUpdate(emergency, 'existing');
            });
            console.log(`📊 Loaded ${activeEmergencies.length} existing emergencies`);
        }
    }

    handleEmergencyUpdate(emergency, action) {
        console.log(`🔄 Emergency ${action}:`, emergency);

        const existingIndex = this.emergencies.findIndex(e => e.id === emergency.id);
        
        if (action === 'new') {
            // New emergency - add to beginning
            if (existingIndex === -1) {
                this.emergencies.unshift(emergency);
                this.addEmergencyToMap(emergency);
                this.showEmergencyNotification(emergency);
            }
        } 
        else if (action === 'update' || action === 'location_update') {
            // Update existing emergency
            if (existingIndex !== -1) {
                this.emergencies[existingIndex] = emergency;
                this.updateEmergencyMarker(emergency);
            } else {
                this.emergencies.unshift(emergency);
                this.addEmergencyToMap(emergency);
            }
        }
        else if (action === 'existing') {
            // Existing emergency on connection
            if (existingIndex === -1) {
                this.emergencies.push(emergency);
                this.addEmergencyToMap(emergency);
            }
        }

        this.updateEmergencyDisplay();
        this.updateDashboardStats();
    }

    addEmergencyToMap(emergency) {
        if (!window.map) {
            console.warn('Map not ready, emergency will be added when map loads');
            return;
        }

        let coordinates;
        if (Array.isArray(emergency.coordinates)) {
            coordinates = emergency.coordinates;
        } else if (typeof emergency.coordinates === 'string') {
            coordinates = emergency.coordinates.split(',').map(Number);
        } else {
            console.error('Invalid coordinates:', emergency.coordinates);
            return;
        }

        const markerColor = this.getEmergencyColor(emergency.type);
        const marker = L.marker(coordinates, {
            icon: L.divIcon({
                className: `emergency-marker ${emergency.type}`,
                html: `
                    <div style="
                        background-color: ${markerColor}; 
                        width: 24px; 
                        height: 24px; 
                        border-radius: 50%; 
                        border: 3px solid white;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        animation: pulse 1.5s infinite;
                    "></div>
                    <div style="
                        position: absolute;
                        top: -30px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0,0,0,0.8);
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        white-space: nowrap;
                        font-weight: bold;
                    ">${emergency.type.toUpperCase()}</div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(window.map);

        marker.bindPopup(this.createEmergencyPopup(emergency));
        
        // Store marker reference
        this.emergencyMarkers.set(emergency.id, marker);

        console.log(`📍 Added emergency marker: ${emergency.title}`);
    }

    updateEmergencyMarker(emergency) {
        const marker = this.emergencyMarkers.get(emergency.id);
        if (marker && emergency.coordinates) {
            let coordinates;
            if (Array.isArray(emergency.coordinates)) {
                coordinates = emergency.coordinates;
            } else if (typeof emergency.coordinates === 'string') {
                coordinates = emergency.coordinates.split(',').map(Number);
            }

            if (coordinates) {
                // Smooth animation to new position
                marker.setLatLng(coordinates, {
                    duration: 1000,
                    easeLinearity: 0.25
                });
                
                // Update popup content
                marker.setPopupContent(this.createEmergencyPopup(emergency));
                
                console.log(`🔄 Updated emergency position: ${emergency.title}`);
            }
        }
    }

    getEmergencyColor(type) {
        const colors = {
            critical: '#e74c3c',
            medical: '#3498db',
            security: '#f39c12',
            support: '#2ecc71'
        };
        return colors[type] || '#95a5a6';
    }

    createEmergencyPopup(emergency) {
        return `
            <div style="min-width: 280px; font-family: 'Inter', sans-serif;">
                <h3 style="margin: 0 0 10px 0; color: #e74c3c;">🚨 ${emergency.type.toUpperCase()}</h3>
                <div style="margin-bottom: 10px;">
                    <p style="margin: 5px 0;"><strong>👤 Tourist:</strong> ${emergency.tourist || 'Unknown'}</p>
                    <p style="margin: 5px 0;"><strong>📞 Phone:</strong> ${emergency.phone || 'Not provided'}</p>
                    <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${emergency.location}</p>
                    <p style="margin: 5px 0;"><strong>🕒 Reported:</strong> ${new Date(emergency.timestamp).toLocaleString()}</p>
                    <p style="margin: 5px 0;"><strong>📡 Last Update:</strong> ${emergency.lastUpdate ? new Date(emergency.lastUpdate).toLocaleTimeString() : 'Just now'}</p>
                    <p style="margin: 5px 0;"><strong>🛡️ Safety Score:</strong> ${emergency.safetyScore || 'N/A'}/100</p>
                </div>
                <div style="display: grid; gap: 5px; margin-top: 10px;">
                    <button onclick="authorityReceiver.viewEmergencyDetails('${emergency.id}')" 
                            style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                        🚨 View Details
                    </button>
                    <button onclick="authorityReceiver.assignResponder('${emergency.id}')" 
                            style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                        👮 Assign Responder
                    </button>
                    <button onclick="authorityReceiver.centerOnEmergency('${emergency.id}')" 
                            style="padding: 8px 12px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                        📍 Track Movement
                    </button>
                </div>
            </div>
        `;
    }

    updateEmergencyDisplay() {
        const container = document.getElementById('emergenciesContainer');
        if (!container) return;

        if (this.emergencies.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666;">
                    <p>No active emergencies</p>
                    <small>Monitoring for SOS alerts...</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.emergencies.map(emergency => `
            <div class="emergency-item" onclick="authorityReceiver.viewEmergencyDetails('${emergency.id}')"
                 style="background: ${emergency.status === 'active' ? '#ffebee' : '#e8f5e9'}; 
                        padding: 15px; 
                        margin-bottom: 10px; 
                        border-radius: 8px;
                        border-left: 4px solid ${this.getEmergencyColor(emergency.type)};
                        cursor: pointer;">
                <div style="display: flex; justify-content: between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 5px 0; color: #333;">
                            ${emergency.type.toUpperCase()} EMERGENCY
                            ${emergency.status === 'active' ? '<span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 8px;">LIVE</span>' : ''}
                        </h4>
                        <p style="margin: 0 0 5px 0; color: #666;">👤 ${emergency.tourist || 'Unknown Tourist'}</p>
                        <p style="margin: 0 0 5px 0; color: #666;">📍 ${emergency.location}</p>
                        <small style="color: #999;">🕒 ${new Date(emergency.timestamp).toLocaleString()}</small>
                    </div>
                    <div style="background: ${emergency.status === 'active' ? '#e74c3c' : '#4CAF50'}; 
                                color: white; 
                                padding: 4px 8px; 
                                border-radius: 12px; 
                                font-size: 10px;
                                font-weight: bold;">
                        ${emergency.status.toUpperCase()}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateDashboardStats() {
        const activeCount = this.emergencies.filter(e => e.status === 'active').length;
        const resolvedCount = this.emergencies.filter(e => e.status === 'resolved').length;
        
        // Update the stat boxes
        const activeElement = document.getElementById('activeEmergencies');
        const resolvedElement = document.getElementById('resolvedToday');
        
        if (activeElement) activeElement.textContent = activeCount;
        if (resolvedElement) resolvedElement.textContent = resolvedCount;
    }

    showEmergencyNotification(emergency) {
        console.log('🚨 NEW EMERGENCY ALERT:', emergency);
        
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification(`🚨 New ${emergency.type} Emergency`, {
                body: `Tourist: ${emergency.tourist}\nLocation: ${emergency.location}`,
                icon: '/favicon.ico'
            });
        }
        
        // Audio alert (optional)
        this.playAlertSound();
    }

    playAlertSound() {
        // Simple beep sound for alert
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
            console.log('Audio alert not supported');
        }
    }

    // Public methods
    viewEmergencyDetails(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (emergency) {
            alert(`🚨 Emergency Details:\n\nType: ${emergency.type}\nTourist: ${emergency.tourist}\nPhone: ${emergency.phone}\nLocation: ${emergency.location}\nTime: ${new Date(emergency.timestamp).toLocaleString()}\nSafety Score: ${emergency.safetyScore || 'N/A'}/100`);
        }
    }

    assignResponder(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (emergency) {
            alert(`👮 Assigning responder to: ${emergency.tourist}\n\nEmergency: ${emergency.type}\nLocation: ${emergency.location}\n\nResponder will be notified immediately.`);
        }
    }

    centerOnEmergency(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (emergency && window.map) {
            let coordinates;
            if (Array.isArray(emergency.coordinates)) {
                coordinates = emergency.coordinates;
            } else if (typeof emergency.coordinates === 'string') {
                coordinates = emergency.coordinates.split(',').map(Number);
            }

            if (coordinates) {
                window.map.setView(coordinates, 16, {
                    animate: true,
                    duration: 1
                });
                
                const marker = this.emergencyMarkers.get(emergencyId);
                if (marker) {
                    marker.openPopup();
                }
            }
        }
    }
}

// Initialize the authority emergency receiver
const authorityReceiver = new AuthorityEmergencyReceiver();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .emergency-marker {
        animation: pulse 1.5s infinite;
    }
    
    .emergency-item:hover {
        transform: translateX(5px);
        transition: transform 0.2s ease;
    }
`;
document.head.appendChild(style);

console.log('🏢 Authority Emergency Receiver Ready - Listening for tourist emergencies...');
