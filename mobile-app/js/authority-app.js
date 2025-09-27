// Authority Dashboard Application
const authorityApp = {
    // Application state
    state: {
        map: null,
        emergencies: [],
        responders: [],
        selectedEmergency: null,
        heatmapEnabled: false
    },

    init() {
    this.checkAuthentication();
    this.initMap();
    this.loadEmergencies();  // ← NEW METHOD
    this.setupEventListeners();
    this.startRealTimeUpdates();  // ← RENAME THIS
}
    // Check if user is authenticated as authority
    checkAuthentication() {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        
        if (currentUser.type !== 'authority') {
            window.location.href = 'index.html';
            return;
        }
        
        // Update UI with authority info
        document.getElementById('authorityName').textContent = currentUser.user.name || 'Response Unit';
    },

    // Initialize the map
    initMap() {
        const defaultLocation = { lat: 11.166737, lng: 76.966926 };
        
        this.state.map = L.map('authorityMap').setView([defaultLocation.lat, defaultLocation.lng], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.state.map);
    },
// NEW - Real-time emergency loading
loadEmergencies() {
    // Get real emergencies from shared system
    this.state.emergencies = emergencyBroadcaster.getActiveEmergencies();
    this.updateDashboard();
    this.plotEmergenciesOnMap();
    
    // Listen for new emergencies in real-time
    emergencyBroadcaster.addEmergencyListener((emergency, action) => {
        if (action === 'new') {
            this.handleNewEmergency(emergency);
        } else if (action === 'update') {
            this.updateEmergencyMarker(emergency);
        }
    });
},

// Handle new emergency from tourist
handleNewEmergency(emergency) {
    this.state.emergencies.unshift(emergency);
    this.addEmergencyToMap(emergency);
    this.updateEmergencyList();
    this.updateDashboard();
    
    // Show notification
    this.showEmergencyNotification(emergency);
},

// Add emergency to map with real coordinates
addEmergencyToMap(emergency) {
    const [lat, lng] = emergency.coordinates.split(',').map(Number);
    
    const marker = L.marker([lat, lng], {
        icon: this.createEmergencyIcon(emergency.type)
    }).addTo(this.state.map);
    
    marker.bindPopup(this.createEmergencyPopup(emergency));
    this.state.emergencyMarkers = this.state.emergencyMarkers || {};
    this.state.emergencyMarkers[emergency.id] = marker;
},

// Update emergency marker when tourist moves
updateEmergencyMarker(emergency) {
    const marker = this.state.emergencyMarkers[emergency.id];
    if (marker) {
        const [lat, lng] = emergency.coordinates.split(',').map(Number);
        marker.setLatLng([lat, lng]);
        marker.setPopupContent(this.createEmergencyPopup(emergency));
    }
},
   
    // Plot emergencies on the map
    plotEmergenciesOnMap() {
        // Clear existing markers
        this.state.map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.state.map.removeLayer(layer);
            }
        });

        // Add emergency markers
        this.state.emergencies.forEach(emergency => {
            const markerColor = this.getEmergencyColor(emergency.type);
            const marker = L.marker([emergency.location.lat, emergency.location.lng])
                .addTo(this.state.map)
                .bindPopup(`
                    <strong>${emergency.name}</strong><br>
                    ${emergency.touristInfo}<br>
                    Status: ${emergency.status}<br>
                    <button onclick="authorityApp.viewEmergencyDetails(${emergency.id})">View Details</button>
                `);
            
            // Add custom icon based on emergency type
            marker.setIcon(this.createEmergencyIcon(emergency.type));
        });
    },

    // Create custom icon for emergencies
    createEmergencyIcon(type) {
        const color = this.getEmergencyColor(type);
        return L.divIcon({
            className: 'emergency-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    },

    // Get color for emergency type
    getEmergencyColor(type) {
        const colors = {
            'critical': '#dc3545',
            'medical': '#28a745', 
            'security': '#ff9500',
            'support': '#2196F3'
        };
        return colors[type] || '#666';
    },

    // Update dashboard statistics
    updateDashboard() {
        const activeEmergencies = this.state.emergencies.filter(e => e.status !== 'resolved').length;
        const availableResponders = this.state.responders.filter(r => r.status === 'available').length;
        
        document.getElementById('activeEmergencies').textContent = activeEmergencies;
        document.getElementById('respondersOnline').textContent = this.state.responders.length;
        document.getElementById('availableResponders').textContent = `${availableResponders} available`;
        
        // Update emergency list
        this.updateEmergencyList();
    },

    // Update emergency list display
    updateEmergencyList() {
        const container = document.getElementById('emergenciesContainer');
        const emergencies = this.state.emergencies;
        
        if (emergencies.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No active emergencies</p><small>All systems monitoring normally</small></div>';
            return;
        }
        
        container.innerHTML = emergencies.map(emergency => `
            <div class="emergency-item ${emergency.type}" onclick="authorityApp.viewEmergencyDetails(${emergency.id})">
                <div class="emergency-header">
                    <span class="emergency-type">${emergency.name}</span>
                    <span class="emergency-time">${emergency.timestamp}</span>
                </div>
                <div class="emergency-location">${emergency.address}</div>
                <div class="emergency-info">
                    <span class="emergency-status status-${emergency.status}">${emergency.status.toUpperCase()}</span>
                    ${emergency.responder ? `<span class="emergency-responder">• ${emergency.responder}</span>` : ''}
                </div>
            </div>
        `).join('');
    },

    // View emergency details
    viewEmergencyDetails(emergencyId) {
        const emergency = this.state.emergencies.find(e => e.id === emergencyId);
        if (!emergency) return;
        
        this.state.selectedEmergency = emergency;
        
        document.getElementById('detailType').textContent = emergency.name;
        document.getElementById('detailLocation').textContent = emergency.address;
        document.getElementById('detailTime').textContent = emergency.timestamp;
        document.getElementById('detailStatus').textContent = emergency.status.toUpperCase();
        
        this.showModal('Emergency Details');
    },

    // Filter emergencies
    filterEmergencies() {
        const filter = document.getElementById('emergencyFilter').value;
        // Implementation for filtering would go here
        console.log('Filtering by:', filter);
    },

    // Refresh map data
    refreshMap() {
        this.plotEmergenciesOnMap();
        this.showNotification('Map data refreshed');
    },

    // Toggle heatmap
    toggleHeatmap() {
        this.state.heatmapEnabled = !this.state.heatmapEnabled;
        this.showNotification(this.state.heatmapEnabled ? 'Heatmap enabled' : 'Heatmap disabled');
    },

    // Assign responder to emergency
    assignResponder() {
        if (!this.state.selectedEmergency) return;
        
        const availableResponders = this.state.responders.filter(r => r.status === 'available');
        if (availableResponders.length > 0) {
            this.state.selectedEmergency.status = 'assigned';
            this.state.selectedEmergency.responder = availableResponders[0].name;
            this.updateDashboard();
            this.showNotification(`Responder ${availableResponders[0].name} assigned`);
        } else {
            this.showNotification('No available responders', 'error');
        }
    },

    // Contact tourist
    contactTourist() {
        this.showNotification('Contacting tourist...');
        // Simulate contact process
        setTimeout(() => {
            this.showNotification('Tourist contacted successfully');
        }, 2000);
    },

    // Resolve emergency
    resolveEmergency() {
        if (!this.state.selectedEmergency) return;
        
        this.state.selectedEmergency.status = 'resolved';
        this.updateDashboard();
        this.closeModal();
        this.showNotification('Emergency marked as resolved');
    },

    // Export report
    exportReport() {
        this.showNotification('Exporting emergency report...');
        // Simulate export process
        setTimeout(() => {
            this.showNotification('Report exported successfully');
        }, 1500);
    },

    // Show modal
    showModal(title) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('emergencyModal').style.display = 'block';
    },

    // Close modal
    closeModal() {
        document.getElementById('emergencyModal').style.display = 'none';
        this.state.selectedEmergency = null;
    },

    // Show notification
    showNotification(message, type = 'success') {
        // Simple notification implementation
        console.log(`${type.toUpperCase()}: ${message}`);
        // Could be enhanced with a proper notification system
    },

    // Setup event listeners
    setupEventListeners() {
        // Close modal when clicking outside
        document.getElementById('emergencyModal').addEventListener('click', (e) => {
            if (e.target.id === 'emergencyModal') this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    },

    startRealTimeUpdates() {
    // Real-time updates come from emergencyBroadcaster listeners
    // No need for simulation interval
    console.log('Real-time emergency monitoring active');
    
    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
    // Simulate live data updates
    simulateLiveData() {
        // This would be replaced with real API calls
        console.log('Checking for new emergencies...');
    }
};
// Add these methods to your existing authorityApp object:

// Create detailed popup for real emergencies
createEmergencyPopup(emergency) {
    return `
        <div class="emergency-popup">
            <h4>🚨 ${emergency.type.toUpperCase()} EMERGENCY</h4>
            <p><strong>Tourist ID:</strong> ${emergency.touristId}</p>
            <p><strong>Location:</strong> ${emergency.location}</p>
            <p><strong>Time:</strong> ${new Date(emergency.timestamp).toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: red;">${emergency.status}</span></p>
            <button onclick="authorityApp.viewEmergencyDetails(${emergency.id})" 
                    class="primary-btn small">View Details</button>
            <button onclick="authorityApp.assignToNearestResponder(${emergency.id})" 
                    class="secondary-btn small">Assign Responder</button>
        </div>
    `;
},

// Show browser notification for new emergencies
showEmergencyNotification(emergency) {
    if (Notification.permission === 'granted') {
        new Notification(`🚨 New ${emergency.type} Emergency`, {
            body: `Location: ${emergency.location}\nClick to view details`
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
},

// Assign nearest available responder
assignToNearestResponder(emergencyId) {
    const emergency = this.state.emergencies.find(e => e.id === emergencyId);
    if (!emergency) return;
    
    const availableResponders = this.getAvailableResponders();
    if (availableResponders.length === 0) {
        this.showNotification('No available responders at the moment');
        return;
    }
    
    // Assign first available responder (in real app, calculate nearest)
    const assignedResponder = availableResponders[0];
    emergency.assignedResponder = assignedResponder.name;
    emergency.status = 'ASSIGNED';
    
    // Update in shared system so tourist can see
    emergencyBroadcaster.updateEmergency(emergencyId, {
        assignedResponder: assignedResponder.name,
        status: 'ASSIGNED'
    });
    
    this.updateEmergencyList();
    this.showNotification(`🚑 ${assignedResponder.name} assigned - ETA: 5-7 minutes`);
},

// Get available responders (replace with real data)
getAvailableResponders() {
    return [
        { name: 'Unit Alpha-01', location: 'Near City Center', available: true },
        { name: 'Unit Bravo-02', location: 'East District', available: true },
        { name: 'Medical Team-04', location: 'Central Hospital', available: true }
    ].filter(r => r.available);
}
// Initialize the authority dashboard
document.addEventListener('DOMContentLoaded', () => {
    authorityApp.init();
});
state: {
    map: null,
    emergencies: [],
    responders: [],
    selectedEmergency: null,
    heatmapEnabled: false,
    emergencyMarkers: {}  // ← ADD THIS
},
