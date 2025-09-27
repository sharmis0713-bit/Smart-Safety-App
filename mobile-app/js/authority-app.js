// authority-app.js
class AuthorityApp {
    constructor() {
        this.map = null;
        this.emergencies = [];
        this.responders = [];
        this.heatmapEnabled = false;
        this.emergencyMarkers = new Map(); // Use Map for better performance
        this.selectedEmergency = null;
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initializeMap();
        this.loadResponders();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        
        console.log('Authority Dashboard - Live SOS Feed Active');
    }

    checkAuthentication() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        
        if (currentUser.type !== 'authority') {
            window.location.href = 'index.html';
            return;
        }
        
        document.getElementById('authorityName').textContent = currentUser.user?.name || 'Response Unit';
    }

    initializeMap() {
        // Use default location or current user's location
        const defaultLocation = { lat: 11.166737, lng: 76.966926 };
        
        this.map = L.map('authorityMap').setView([defaultLocation.lat, defaultLocation.lng], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        console.log('OpenStreetMap initialized successfully');
    }

    loadEmergencies() {
        // Get real emergencies from shared system if available
        if (typeof emergencyBroadcaster !== 'undefined') {
            this.emergencies = emergencyBroadcaster.getActiveEmergencies() || [];
            
            // Listen for new emergencies in real-time
            emergencyBroadcaster.addEmergencyListener((emergency, action) => {
                if (action === 'new') {
                    this.handleNewEmergency(emergency);
                } else if (action === 'update') {
                    this.updateEmergencyMarker(emergency);
                }
            });
        } else {
            // Fallback to sample data
            this.emergencies = [
                {
                    id: 1,
                    type: "critical",
                    title: "Critical Emergency",
                    location: "Downtown District",
                    coordinates: [11.166737, 76.966926],
                    timestamp: new Date().toISOString(),
                    time: new Date().toLocaleTimeString(),
                    status: "active",
                    tourist: "John Doe",
                    phone: "+1234567890",
                    touristId: "T001"
                },
                {
                    id: 2,
                    type: "medical",
                    title: "Medical Assistance Needed",
                    location: "Central Park Area",
                    coordinates: [11.176737, 76.976926],
                    timestamp: new Date().toISOString(),
                    time: new Date().toLocaleTimeString(),
                    status: "active",
                    tourist: "Jane Smith",
                    phone: "+1234567891",
                    touristId: "T002"
                }
            ];
        }

        this.updateEmergencyDisplay();
        this.plotEmergenciesOnMap();
    }

    loadResponders() {
        this.responders = [
            { id: 1, name: "Unit Alpha-01", status: "online", location: "Station A" },
            { id: 2, name: "Unit Bravo-02", status: "busy", location: "On Emergency" },
            { id: 3, name: "Unit Charlie-03", status: "online", location: "Station B" },
            { id: 4, name: "Medical Team-04", status: "online", location: "Central Hospital" }
        ];

        this.updateResponderDisplay();
    }

    plotEmergenciesOnMap() {
        // Clear existing markers
        this.emergencyMarkers.forEach(marker => this.map.removeLayer(marker));
        this.emergencyMarkers.clear();

        this.emergencies.forEach(emergency => {
            this.addEmergencyToMap(emergency);
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
                className: `emergency-marker ${emergency.type}`,
                html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20]
            })
        }).addTo(this.map);

        marker.bindPopup(this.createEmergencyPopup(emergency));

        marker.on('click', () => {
            this.viewEmergencyDetails(emergency.id);
        });

        this.emergencyMarkers.set(emergency.id, marker);
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
            
            marker.setLatLng(coordinates);
            marker.setPopupContent(this.createEmergencyPopup(emergency));
            
            // Update the emergency in our array
            const index = this.emergencies.findIndex(e => e.id === emergency.id);
            if (index !== -1) {
                this.emergencies[index] = { ...this.emergencies[index], ...emergency };
                this.updateEmergencyDisplay();
            }
        }
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

    createEmergencyPopup(emergency) {
        return `
            <div class="emergency-popup">
                <h4>${this.getEmergencyIcon(emergency.type)} ${emergency.type.toUpperCase()} EMERGENCY</h4>
                <p><strong>Tourist:</strong> ${emergency.tourist || 'Unknown'}</p>
                <p><strong>Location:</strong> ${emergency.location}</p>
                <p><strong>Time:</strong> ${new Date(emergency.timestamp || emergency.time).toLocaleString()}</p>
                <p><strong>Status:</strong> <span style="color: ${emergency.status === 'active' ? 'red' : 'green'};">${emergency.status}</span></p>
                <div style="margin-top: 10px;">
                    <button onclick="authorityApp.viewEmergencyDetails(${emergency.id})" 
                            class="primary-btn small" style="margin: 2px;">View Details</button>
                    <button onclick="authorityApp.assignToNearestResponder(${emergency.id})" 
                            class="secondary-btn small" style="margin: 2px;">Assign Responder</button>
                </div>
            </div>
        `;
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

    updateEmergencyDisplay() {
        const container = document.getElementById('emergenciesContainer');
        const activeCount = this.emergencies.filter(e => e.status === 'active').length;

        // Update stats
        document.getElementById('activeEmergencies').textContent = activeCount;
        document.getElementById('respondersOnline').textContent = this.responders.length;
        document.getElementById('avgResponseTime').textContent = '4.2s';
        document.getElementById('resolvedToday').textContent = this.emergencies.filter(e => e.status === 'resolved').length;

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
            <div class="emergency-item ${emergency.type}" onclick="authorityApp.viewEmergencyDetails(${emergency.id})">
                <div class="emergency-icon">${this.getEmergencyIcon(emergency.type)}</div>
                <div class="emergency-info">
                    <h4>${emergency.title || emergency.type + ' Emergency'}</h4>
                    <p>${emergency.location}</p>
                    <small>Reported: ${new Date(emergency.timestamp || emergency.time).toLocaleTimeString()}</small>
                </div>
                <div class="emergency-status ${emergency.status}">
                    ${emergency.status.toUpperCase()}
                </div>
            </div>
        `).join('');
    }

    updateResponderDisplay() {
        const availableCount = this.responders.filter(r => r.status === 'online').length;
        document.getElementById('availableResponders').textContent = `${availableCount} available`;

        const container = document.getElementById('responderList');
        container.innerHTML = this.responders.map(responder => `
            <div class="responder-item ${responder.status}">
                <div class="responder-info">
                    <span class="responder-name">${responder.name}</span>
                    <span class="responder-status">${responder.status === 'online' ? 'Available' : 'Busy'}</span>
                </div>
                <div class="responder-actions">
                    <button class="primary-btn small" ${responder.status !== 'online' ? 'disabled' : ''}
                            onclick="authorityApp.assignResponderToEmergency(${responder.id})">
                        ${responder.status === 'online' ? 'Assign' : 'Busy'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Handle new emergency from tourist
    handleNewEmergency(emergency) {
        // Check if emergency already exists
        const existingIndex = this.emergencies.findIndex(e => e.id === emergency.id);
        
        if (existingIndex === -1) {
            this.emergencies.unshift(emergency);
        } else {
            this.emergencies[existingIndex] = emergency;
        }
        
        this.addEmergencyToMap(emergency);
        this.updateEmergencyDisplay();
        this.showEmergencyNotification(emergency);
    }

    viewEmergencyDetails(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (!emergency) return;

        this.selectedEmergency = emergency;

        document.getElementById('modalTitle').textContent = emergency.title || `${emergency.type} Emergency`;
        document.getElementById('detailType').textContent = emergency.type.toUpperCase();
        document.getElementById('detailLocation').textContent = emergency.location;
        document.getElementById('detailTime').textContent = new Date(emergency.timestamp || emergency.time).toLocaleString();
        document.getElementById('detailStatus').textContent = emergency.status.toUpperCase();

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

    assignToNearestResponder(emergencyId) {
        const emergency = this.emergencies.find(e => e.id === emergencyId);
        if (!emergency) return;
        
        const availableResponders = this.responders.filter(r => r.status === 'online');
        if (availableResponders.length === 0) {
            this.showNotification('No available responders at the moment', 'error');
            return;
        }
        
        // Assign first available responder
        const assignedResponder = availableResponders[0];
        emergency.assignedTo = assignedResponder.name;
        emergency.status = 'assigned';
        
        // Update responder status
        assignedResponder.status = 'busy';
        
        // Update in shared system if available
        if (typeof emergencyBroadcaster !== 'undefined') {
            emergencyBroadcaster.updateEmergency(emergencyId, {
                assignedTo: assignedResponder.name,
                status: 'assigned'
            });
        }
        
        this.updateEmergencyDisplay();
        this.updateResponderDisplay();
        this.plotEmergenciesOnMap();
        
        this.showNotification(`🚑 ${assignedResponder.name} assigned - ETA: 5-7 minutes`);
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
        this.closeModal();
        this.showNotification('Emergency marked as resolved');
    }

    refreshMap() {
        this.loadEmergencies();
        this.showNotification('Map data refreshed successfully');
    }

    toggleHeatmap() {
        this.heatmapEnabled = !this.heatmapEnabled;
        
        if (this.heatmapEnabled) {
            this.emergencies.forEach(emergency => {
                const circle = L.circle(emergency.coordinates, {
                    color: this.getMarkerColor(emergency.type),
                    fillColor: this.getMarkerColor(emergency.type),
                    fillOpacity: 0.2,
                    radius: 300
                }).addTo(this.map);
                this.emergencyMarkers.set(`heatmap-${emergency.id}`, circle);
            });
            this.showNotification('Heatmap enabled');
        } else {
            this.emergencyMarkers.forEach((marker, key) => {
                if (key.startsWith('heatmap-')) {
                    this.map.removeLayer(marker);
                    this.emergencyMarkers.delete(key);
                }
            });
            this.showNotification('Heatmap disabled');
        }
    }

    filterEmergencies() {
        const filter = document.getElementById('emergencyFilter').value;
        this.showNotification(`Filtered emergencies by: ${filter}`);
        // Implement actual filtering logic here
    }

    exportReport() {
        this.showNotification('Export feature coming soon');
    }

    showEmergencyNotification(emergency) {
        if (Notification.permission === 'granted') {
            new Notification(`🚨 New ${emergency.type} Emergency`, {
                body: `Location: ${emergency.location}\nClick to view details`,
                icon: '/favicon.ico'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    showNotification(message, type = 'success') {
        // Simple notification - you can enhance this with a proper UI
        console.log(`${type.toUpperCase()}: ${message}`);
        // For now using alert, but you can implement a toast notification
        alert(message);
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
        });
    }

    startRealTimeUpdates() {
        // Load initial emergencies
        this.loadEmergencies();
        
        // Set up periodic refresh (every 30 seconds)
        setInterval(() => {
            this.loadEmergencies();
        }, 30000);

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        console.log('Real-time emergency monitoring active');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authorityApp = new AuthorityApp();
});
