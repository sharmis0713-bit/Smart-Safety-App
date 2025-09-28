// Clean Authentication System
const authSystem = {
    // Demo users
    users: {
        tourist: [
            { email: 'tourist@demo.com', password: 'password123', name: 'Demo Tourist' }
        ],
        authority: [
            { id: 'AUTH-001', password: 'auth123', code: '7890', name: 'Emergency Response Unit' }
        ]
    },

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        // User type switching
        document.querySelectorAll('.user-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.switchUserType(type);
            });
        });

        // Form submissions
        document.getElementById('touristLoginForm').addEventListener('submit', (e) => this.handleLogin(e, 'tourist'));
        document.getElementById('authorityLoginForm').addEventListener('submit', (e) => this.handleLogin(e, 'authority'));

        // Google login
        document.querySelector('.login-btn.google')?.addEventListener('click', () => {
            this.showMessage('Google authentication would be implemented here', 'info');
        });
    },

    switchUserType(type) {
        // Update buttons
        document.querySelectorAll('.user-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Update forms
        document.getElementById('touristLoginForm').classList.toggle('active', type === 'tourist');
        document.getElementById('authorityLoginForm').classList.toggle('active', type === 'authority');
    },

    handleLogin(e, type) {
        e.preventDefault();
        
        let credentials, user;
        
        if (type === 'tourist') {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            credentials = { email, password };
            user = this.users.tourist.find(u => u.email === email && u.password === password);
        } else {
            const id = document.getElementById('authorityId').value;
            const password = document.getElementById('authPassword').value;
            const code = document.getElementById('securityCode').value;
            credentials = { id, password, code };
            user = this.users.authority.find(u => u.id === id && u.password === password && u.code === code);
        }

        if (user) {
            this.showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => this.loginSuccess(type, user), 1000);
        } else {
            this.showMessage('Invalid credentials. Please try again.', 'error');
        }
    },

    loginSuccess(type, user) {
        sessionStorage.setItem('currentUser', JSON.stringify({
            type: type,
            user: user,
            loginTime: new Date().toISOString()
        }));

        window.location.href = type === 'tourist' ? 'tourist-dashboard.html' : 'authority-dashboard.html';
    },

    showMessage(message, type) {
        // Remove existing messages
        const existingMsg = document.querySelector('.message');
        if (existingMsg) existingMsg.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;

        if (type === 'error') {
            messageDiv.style.background = '#fef2f2';
            messageDiv.style.color = '#dc2626';
            messageDiv.style.border = '1px solid #fecaca';
        } else if (type === 'success') {
            messageDiv.style.background = '#f0fdf4';
            messageDiv.style.color = '#16a34a';
            messageDiv.style.border = '1px solid #bbf7d0';
        } else {
            messageDiv.style.background = '#eff6ff';
            messageDiv.style.color = '#2563eb';
            messageDiv.style.border = '1px solid #bfdbfe';
        }

        const activeForm = document.querySelector('.login-form.active');
        activeForm.insertBefore(messageDiv, activeForm.firstChild);

        setTimeout(() => messageDiv.remove(), 4000);
    },

    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    authSystem.init();
});
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.setupUserTypeToggle();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const signupLink = document.getElementById('signupLink');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignupModal();
            });
        }
    }

    setupUserTypeToggle() {
        const touristRadio = document.getElementById('touristType');
        const authorityRadio = document.getElementById('authorityType');
        const touristIdGroup = document.getElementById('touristIdGroup');
        const authorityIdGroup = document.getElementById('authorityIdGroup');

        if (touristRadio && authorityRadio) {
            touristRadio.addEventListener('change', () => {
                touristIdGroup.classList.remove('hidden');
                authorityIdGroup.classList.add('hidden');
            });

            authorityRadio.addEventListener('change', () => {
                authorityIdGroup.classList.remove('hidden');
                touristIdGroup.classList.add('hidden');
            });
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userType = formData.get('userType');
        const userId = userType === 'tourist' ? formData.get('touristId') : formData.get('authorityId');
        const password = formData.get('password');
        const securityCode = formData.get('securityCode');
        const rememberDevice = formData.get('rememberDevice') === 'on';
        const emergencyDashboard = formData.get('emergencyDashboard') === 'on';

        // Validate security code
        if (!this.validateSecurityCode(securityCode)) {
            this.showError('Invalid security code. Please use demo code: 1234');
            return;
        }

        // Authenticate user
        if (this.authenticateUser(userType, userId, password, securityCode)) {
            this.currentUser = {
                type: userType,
                id: userId,
                name: this.getUserName(userType, userId),
                timestamp: new Date().toISOString(),
                rememberDevice: rememberDevice,
                emergencyDashboard: emergencyDashboard
            };
            
            this.isAuthenticated = true;
            this.saveSession();
            this.redirectToDashboard();
        } else {
            this.showError('Invalid credentials. Please check your ID, password, and security code.');
        }
    }

    authenticateUser(userType, userId, password, securityCode) {
        // Demo authentication logic - In real app, this would call your backend
        const demoCredentials = {
            authority: [
                { id: 'AUTH-001', password: 'demo123', securityCode: '1234', name: 'Central Command' },
                { id: 'AUTH-002', password: 'demo123', securityCode: '1234', name: 'Rapid Response Unit' }
            ],
            tourist: [
                { id: 'TOUR-001', password: 'demo123', securityCode: '1234', name: 'John Traveler' },
                { id: 'TOUR-002', password: 'demo123', securityCode: '1234', name: 'Sarah Explorer' }
            ]
        };

        const credentials = demoCredentials[userType];
        const user = credentials.find(u => 
            u.id === userId && 
            u.password === password && 
            u.securityCode === securityCode
        );

        return !!user;
    }

    validateSecurityCode(code) {
        // Demo validation - accept 1234 or any 4-digit code for demo
        return code === '1234' || (/^\d{4}$/.test(code));
    }

    getUserName(userType, userId) {
        const names = {
            authority: {
                'AUTH-001': 'Central Command Unit',
                'AUTH-002': 'Rapid Response Team'
            },
            tourist: {
                'TOUR-001': 'John Traveler',
                'TOUR-002': 'Sarah Explorer'
            }
        };
        return names[userType]?.[userId] || userId;
    }

    saveSession() {
        if (this.currentUser.rememberDevice) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('isAuthenticated', 'true');
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            sessionStorage.setItem('isAuthenticated', 'true');
        }
    }

    checkExistingSession() {
        // Check both localStorage and sessionStorage
        let savedUser = localStorage.getItem('currentUser');
        let isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (!savedUser) {
            savedUser = sessionStorage.getItem('currentUser');
            isAuthenticated = sessionStorage.getItem('isAuthenticated');
        }
        
        if (savedUser && isAuthenticated === 'true') {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.redirectToDashboard();
        }
    }

    redirectToDashboard() {
        const dashboardMap = {
            tourist: 'tourist-dashboard.html',
            authority: 'authority-dashboard.html'
        };
        
        // Add a small delay to show successful login
        setTimeout(() => {
            window.location.href = dashboardMap[this.currentUser.type];
        }, 500);
    }

    showError(message) {
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <span class="error-icon">⚠️</span>
            <span class="error-text">${message}</span>
        `;

        // Insert before the login button
        const loginForm = document.getElementById('loginForm');
        const loginBtn = loginForm.querySelector('.login-btn');
        loginForm.insertBefore(errorElement, loginBtn);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorElement.parentElement) {
                errorElement.remove();
            }
        }, 5000);
    }

    showSignupModal() {
        alert('Sign up feature coming soon! For now, please use the demo credentials provided.');
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear both storage types
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('isAuthenticated');
        
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Make it globally available for logout functionality
window.authManager = authManager;
