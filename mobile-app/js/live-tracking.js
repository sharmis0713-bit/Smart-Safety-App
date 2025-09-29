// live-tracking.js - Add this as a new file
class LiveTracking {
    constructor() {
        this.touristMarkers = new Map();
        this.liveTracks = new Map();
        this.socket = null;
        this.map = null;
        
        this.init();
    }

    init() {
        console.log('🚀 Live Tracking System Initializing...');
        
        // Wait for map to be ready
        this.waitForMap();
        
        // Start WebSocket connection for live updates
        this.startWebSocketConnection();
        
        // Start demo data if no real connection
        this.startDemoTracking();
    }

    waitForMap() {
        const checkMap = () => {
            // Look for Leaflet map instance
            const mapContainer = document.getElementById('authorityMap');
            if (mapContainer && mapContainer._leaflet_map) {
                this.map = mapContainer._leaflet_map;
                console.log('🗺️ Map found, setting up live tracking...');
                this.setupLiveTracking();
                return;
            }
            
            // Alternative: check for Leaflet global
            if (window.map || window.authorityMap) {
                this.map = window.map || window.authorityMap;
                console.log('🗺️ Map found via global, setting up live tracking...');
                this.setupLiveTracking();
                return;
            }
            
            setTimeout(checkMap, 1000);
        };
        
        checkMap();
    }

    setupLiveTracking() {
        console.log('📍 Setting up live tourist tracking...');
        
        // Add tracking controls to map
        this.addTrackingControls();
        
        // Listen for emergency broadcasts
        this.setupEmergencyListeners();
    }

    addTrackingControls() {
        // Create tracking control panel
        const trackingControl = L.control({ position: 'topright' });
        
        trackingControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'tracking-controls');
            div.innerHTML = `
                <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                    <h4 style="margin: 0 0 10px 0; color: #1a2a6c;">👥 Live Tracking</h4>
                    <div style="font-size: 12px;">
                        <div>🟢 Tourists: <span id="activeTourists">0</span></div>
                        <div>📡 Status: <span id="trackingStatus">Active</span></div>
                    </div>
                    <button onclick="liveTracking.toggleTracking()" 
                            style="margin-top: 8px; padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                        🔄 Refresh
                    </button>
                </div>
            `;
            return div;
        };
        
        trackingControl.addTo(this.map);
    }

    startWebSocketConnection() {
        // Simulate WebSocket connection for live updates
        console.log('📡 Starting live tracking connection...');
        
        // In real app, this would connect to your WebSocket server
        // For demo, we'll use interval updates
    }

    startDemoTracking() {
        console.log('🎮 Starting demo tourist tracking...');
        
        // Add demo tourists
        this.addDemoTourists();
        
        // Start position updates
        this.startPositionUpdates();
    }

    addDemoTourists() {
        const demoLocations = [
            { id: 'tourist-001', name: 'Sarah M.', lat: 19.0760, lng: 72.8777, type: 'exploring' },
            { id: 'tourist-002', name: 'John D.', lat: 28.6139, lng: 77.2090, type: 'shopping' },
            { id: 'tourist-003', name: 'Maria K.', lat: 12.9716, lng: 77.5946, type: 'dining' },
            { id: 'tourist-004', name: 'Alex R.', lat: 13.0827, lng: 80.2707, type: 'sightseeing' }
        ];

        demoLocations.forEach(tourist => {
            this.addTouristMarker(tourist);
        });

        this.updateTouristCount();
    }

    addTouristMarker(tourist) {
        if (!this.map) return;

        // Create custom tourist icon
        const touristIcon = L.divIcon({
            className: 'tourist-marker',
            html: `
                <div style="
                    background: #4CAF50; 
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                "></div>
                <div style="
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    white-space: nowrap;
                ">${tourist.name}</div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([tourist.lat, tourist.lng], { 
            icon: touristIcon,
            zIndexOffset: 1000 
        }).addTo(this.map);

        marker.bindPopup(`
            <div style="min-width: 200px;">
                <h4 style="margin: 0 0 8px 0;">👤 ${tourist.name}</h4>
                <p><strong>Status:</strong> ${tourist.type}</p>
                <p><strong>Location:</strong> ${this.getLocationName(tourist.lat, tourist.lng)}</p>
                <p><strong>Last Update:</strong> <span id="update-${tourist.id}">Just now</span></p>
                <div style="margin-top: 8px;">
                    <button onclick="liveTracking.centerOnTourist('${tourist.id}')" 
                            style="padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin-right: 5px;">
                        📍 Track
                    </button>
                    <button onclick="liveTracking.viewTouristDetails('${tourist.id}')" 
                            style="padding: 5px 10px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                        👁️ View
                    </button>
                </div>
            </div>
        `);

        // Store tourist data
        this.touristMarkers.set(tourist.id, {
            marker: marker,
            data: tourist,
            path: [[tourist.lat, tourist.lng]]
        });

        // Create movement trail
        this.createMovementTrail(tourist.id);
    }

    createMovementTrail(touristId) {
        const tourist = this.touristMarkers.get(touristId);
        if (!tourist) return;

        const polyline = L.polyline(tourist.path, {
            color: '#4CAF50',
            weight: 3,
            opacity: 0.6,
            smoothFactor: 1,
            dashArray: '5, 10'
        }).addTo(this.map);

        this.liveTracks.set(touristId, polyline);
    }

    startPositionUpdates() {
        // Update tourist positions every 5 seconds
        setInterval(() => {
            this.updateTouristPositions();
        }, 5000);

        console.log('🔄 Live position updates started (5s interval)');
    }

    updateTouristPositions() {
        this.touristMarkers.forEach((tourist, touristId) => {
            // Simulate movement
            this.simulateTouristMovement(touristId);
        });

        this.updateTouristCount();
    }

    simulateTouristMovement(touristId) {
        const tourist = this.touristMarkers.get(touristId);
        if (!tourist) return;

        // Add small random movement
        const latChange = (Math.random() - 0.5) * 0.01;
        const lngChange = (Math.random() - 0.5) * 0.01;
        
        const newLat = tourist.data.lat + latChange;
        const newLng = tourist.data.lng + lngChange;

        // Update position
        tourist.data.lat = newLat;
        tourist.data.lng = newLng;
        tourist.path.push([newLat, newLng]);

        // Keep only last 20 positions for trail
        if (tourist.path.length > 20) {
            tourist.path.shift();
        }

        // Smoothly move marker
        tourist.marker.setLatLng([newLat, newLng], {
            duration: 2000,
            easeLinearity: 0.25
        });

        // Update trail
        const trail = this.liveTracks.get(touristId);
        if (trail) {
            trail.setLatLngs(tourist.path);
        }

        // Update popup timestamp
        const updateElement = document.getElementById(`update-${touristId}`);
        if (updateElement) {
            updateElement.textContent = new Date().toLocaleTimeString();
        }
    }

    getLocationName(lat, lng) {
        // Simple location approximation
        const locations = {
            '19.0760,72.8777': 'Mumbai, Maharashtra',
            '28.6139,77.2090': 'New Delhi, Delhi',
            '12.9716,77.5946': 'Bangalore, Karnataka',
            '13.0827,80.2707': 'Chennai, Tamil Nadu',
            '22.5726,88.3639': 'Kolkata, West Bengal'
        };
        
        const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        return locations[key] || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }

    updateTouristCount() {
        const countElement = document.getElementById('activeTourists');
        if (countElement) {
            countElement.textContent = this.touristMarkers.size;
        }
    }

    // Public methods
    centerOnTourist(touristId) {
        const tourist = this.touristMarkers.get(touristId);
        if (tourist && this.map) {
            this.map.setView([tourist.data.lat, tourist.data.lng], 15, {
                animate: true,
                duration: 1
            });
            
            // Flash the marker
            this.flashMarker(tourist.marker);
            
            console.log(`📍 Centered on tourist: ${tourist.data.name}`);
        }
    }

    viewTouristDetails(touristId) {
        const tourist = this.touristMarkers.get(touristId);
        if (tourist) {
            alert(`👤 Tourist Details:\n\nName: ${tourist.data.name}\nStatus: ${tourist.data.type}\nLocation: ${this.getLocationName(tourist.data.lat, tourist.data.lng)}\nPath Points: ${tourist.path.length}\nLast Update: ${new Date().toLocaleTimeString()}`);
        }
    }

    toggleTracking() {
        const statusElement = document.getElementById('trackingStatus');
        if (statusElement) {
            const isActive = statusElement.textContent === 'Active';
            statusElement.textContent = isActive ? 'Paused' : 'Active';
            statusElement.style.color = isActive ? '#FF9800' : '#4CAF50';
        }
        
        this.updateTouristPositions();
        console.log('🔄 Manual tracking refresh');
    }

    flashMarker(marker) {
        let count = 0;
        const element = marker.getElement();
        const interval = setInterval(() => {
            element.style.transform = element.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)';
            count++;
            if (count >= 6) {
                clearInterval(interval);
                element.style.transform = 'scale(1)';
            }
        }, 300);
    }

    setupEmergencyListeners() {
        // Listen for new emergencies from tourist app
        if (typeof emergencyBroadcaster !== 'undefined') {
            emergencyBroadcaster.addEmergencyListener((emergency, action) => {
                if (action === 'new') {
                    this.handleNewEmergency(emergency);
                }
            });
        }
    }

    handleNewEmergency(emergency) {
        console.log('🚨 New emergency received:', emergency);
        
        // Add emergency marker with tourist tracking
        if (emergency.coordinates && emergency.touristId) {
            this.addEmergencyTourist(emergency);
        }
    }

    addEmergencyTourist(emergency) {
        const coords = Array.isArray(emergency.coordinates) ? 
            emergency.coordinates : 
            emergency.coordinates.split(',').map(Number);
            
        const touristData = {
            id: emergency.touristId || `emergency-${Date.now()}`,
            name: emergency.tourist || 'Emergency Tourist',
            lat: coords[0],
            lng: coords[1],
            type: 'emergency'
        };
        
        this.addTouristMarker(touristData);
        this.updateTouristCount();
        
        console.log(`🚨 Added emergency tourist: ${touristData.name}`);
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .tourist-marker {
        animation: pulse 2s infinite;
    }
    
    .tracking-controls {
        font-family: 'Inter', sans-serif;
    }
`;
document.head.appendChild(style);

// Initialize live tracking
const liveTracking = new LiveTracking();
