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

    // Initialize authority dashboard
    init() {
        this.checkAuthentication();
        this.initMap();
        this.loadDemoData();
        this.setupEventListeners();
        this.startLiveUpdates();
        
        console.log('Authority dashboard initialized');
    },

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

    // Load demo emergency data
    loadDemoData() {
        // Demo emergencies
        this.state.emergencies = [
            {
                id: 1,
                type: 'critical',
                name: 'Critical Emergency',
                location: { lat: 11.166737, lng: 76.966926 },
                address: 'Central City Area',
                timestamp: new Date().toLocaleString(),
                status: 'pending',
                touristInfo: 'John D. (US Tourist)',
                description: 'Immediate assistance required'
            },
            {
                id: 2,
                type: 'medical',
                name: 'Medical Assistance',
                location: { lat: 11.168888, lng: 76.968888 },
                address: 'North District',
                timestamp: new Date(Date.now() - 15 * 60000).toLocaleString(),
                status: 'assigned',
                touristInfo: 'Sarah M. (UK Tourist)',
                description: 'Medical emergency - ambulance required',
                responder: 'Unit Alpha-01'
            }
        ];

        // Demo responders
        this.state.responders = [
            { id: 1, name: 'Unit Alpha-01', status: 'available', location: { lat: 11.165000, lng: 76.965000 } },
            { id: 2, name: 'Unit Bravo-02', status: 'busy', location: { lat: 11.167000, lng: 76.967000 } },
            { id: 3, name: 'Unit Charlie-03', status: 'available', location: { lat: 11.169000, lng: 76.969000 } }
        ];

        this.updateDashboard();
        this.plotEmergenciesOnMap();
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

    // Start live updates simulation
    startLiveUpdates() {
        // Simulate live emergency updates
        setInterval(() => {
            this.simulateLiveData();
        }, 30000); // Update every 30 seconds
    },

    // Simulate live data updates
    simulateLiveData() {
        // This would be replaced with real API calls
        console.log('Checking for new emergencies...');
    }
};

// Initialize the authority dashboard
document.addEventListener('DOMContentLoaded', () => {
    authorityApp.init();
});
