// Authentication System
const authSystem = {
    // Demo user database
    users: {
        tourist: [
            { email: 'tourist@demo.com', password: 'password123', name: 'Demo Tourist' }
        ],
        authority: [
            { id: 'AUTH-001', password: 'auth123', code: '7890', name: 'Emergency Response Unit 01' }
        ]
    },

    // Initialize authentication system
    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    },

    // Setup event listeners
    setupEventListeners() {
        // Login type switching
        document.getElementById('touristTypeBtn').addEventListener('click', () => this.switchLoginType('tourist'));
        document.getElementById('authorityTypeBtn').addEventListener('click', () => this.switchLoginType('authority'));

        // Form submissions
        document.getElementById('touristForm').addEventListener('submit', (e) => this.handleTouristLogin(e));
        document.getElementById('authorityForm').addEventListener('submit', (e) => this.handleAuthorityLogin(e));

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('.login-form.active form');
                if (activeForm) {
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    },

    // Switch between tourist and authority login
    switchLoginType(type) {
        // Update buttons
        document.getElementById('touristTypeBtn').classList.toggle('active', type === 'tourist');
        document.getElementById('authorityTypeBtn').classList.toggle('active', type === 'authority');

        // Update forms
        document.getElementById('touristLogin').classList.toggle('active', type === 'tourist');
        document.getElementById('authorityLogin').classList.toggle('active', type === 'authority');
    },

    // Handle tourist login
    handleTouristLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('touristEmail').value;
        const password = document.getElementById('touristPassword').value;

        const user = this.users.tourist.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.loginSuccess('tourist', user);
        } else {
            this.showError('Invalid email or password');
        }
    },

    // Handle authority login
    handleAuthorityLogin(e) {
        e.preventDefault();
        
        const id = document.getElementById('authorityID').value;
        const password = document.getElementById('authorityPassword').value;
        const code = document.getElementById('authorityCode').value;

        const user = this.users.authority.find(u => 
            u.id === id && u.password === password && u.code === code
        );
        
        if (user) {
            this.loginSuccess('authority', user);
        } else {
            this.showError('Invalid credentials or security code');
        }
    },

    // Successful login handler
    loginSuccess(type, user) {
        // Store session data
        sessionStorage.setItem('currentUser', JSON.stringify({
            type: type,
            user: user,
            loginTime: new Date().toISOString()
        }));

        // Redirect to appropriate dashboard
        if (type === 'tourist') {
            window.location.href = 'tourist-dashboard.html';
        } else {
            window.location.href = 'authority-dashboard.html';
        }
    },

    // Show error message
    showError(message) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid #f5c6cb;
        `;
        errorDiv.textContent = message;

        // Insert error message
        const activeForm = document.querySelector('.login-form.active');
        const header = activeForm.querySelector('.form-header');
        header.parentNode.insertBefore(errorDiv, header.nextSibling);

        // Auto-remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    // Check for existing session
    checkExistingSession() {
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            // Optional: Auto-redirect if session exists
            // this.loginSuccess(userData.type, userData.user);
        }
    },

    // Logout function (to be called from dashboards)
    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};

// Initialize auth system when page loads
document.addEventListener('DOMContentLoaded', () => {
    authSystem.init();
});
