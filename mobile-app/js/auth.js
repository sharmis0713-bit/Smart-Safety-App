// Professional Authentication System
const authSystem = {
    // Demo user database
    users: {
        tourist: [
            { 
                email: 'tourist@demo.com', 
                password: 'password123', 
                name: 'Demo Tourist',
                phone: '+1 (555) 123-4567'
            }
        ],
        authority: [
            { 
                id: 'AUTH-001', 
                password: 'auth123', 
                code: '7890', 
                name: 'Emergency Response Unit 01',
                department: 'Central Emergency Services'
            }
        ]
    },

    // Initialize authentication system
    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        this.animateLoginForm();
    },

    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.tab;
                this.switchLoginType(type);
            });
        });

        // Form submissions
        document.getElementById('touristLoginForm').addEventListener('submit', (e) => this.handleTouristLogin(e));
        document.getElementById('authorityLoginForm').addEventListener('submit', (e) => this.handleAuthorityLogin(e));

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('.login-form.active form');
                if (activeForm) {
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }
        });

        // Input animations
        this.setupInputAnimations();
    },

    // Switch between tourist and authority login
    switchLoginType(type) {
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === type);
        });

        // Update forms
        document.getElementById('touristForm').classList.toggle('active', type === 'tourist');
        document.getElementById('authorityForm').classList.toggle('active', type === 'authority');

        // Add animation
        this.animateFormSwitch();
    },

    // Handle tourist login
    handleTouristLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('touristEmail').value;
        const password = document.getElementById('touristPassword').value;

        this.showLoading('Authenticating...');

        // Simulate API call delay
        setTimeout(() => {
            const user = this.users.tourist.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.loginSuccess('tourist', user);
            } else {
                this.hideLoading();
                this.showError('Invalid email or password. Please try again.');
            }
        }, 1000);
    },

    // Handle authority login
    handleAuthorityLogin(e) {
        e.preventDefault();
        
        const id = document.getElementById('authorityID').value;
        const password = document.getElementById('authorityPassword').value;
        const code = document.getElementById('authorityCode').value;

        this.showLoading('Verifying credentials...');

        // Simulate secure authentication delay
        setTimeout(() => {
            const user = this.users.authority.find(u => 
                u.id === id && u.password === password && u.code === code
            );
            
            if (user) {
                this.loginSuccess('authority', user);
            } else {
                this.hideLoading();
                this.showError('Invalid credentials or security code. Access denied.');
            }
        }, 1500);
    },

    // Successful login handler
    loginSuccess(type, user) {
        // Store session data
        sessionStorage.setItem('currentUser', JSON.stringify({
            type: type,
            user: user,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
        }));

        this.showSuccess(`Welcome back, ${user.name || 'User'}!`);

        // Redirect to appropriate dashboard after brief delay
        setTimeout(() => {
            if (type === 'tourist') {
                window.location.href = 'tourist-dashboard.html';
            } else {
                window.location.href = 'authority-dashboard.html';
            }
        }, 1000);
    },

    // Show loading state
    showLoading(message) {
        this.hideLoading(); // Clear any existing loaders
        
        const submitBtn = document.querySelector('.login-form.active .login-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <div class="spinner"></div>
            ${message}
        `;
        submitBtn.disabled = true;
        
        submitBtn._originalText = originalText;
    },

    // Hide loading state
    hideLoading() {
        const submitBtn = document.querySelector('.login-form.active .login-btn');
        if (submitBtn && submitBtn._originalText) {
            submitBtn.innerHTML = submitBtn._originalText;
            submitBtn.disabled = false;
        }
    },

    // Show error message
    showError(message) {
        this.hideError(); // Clear existing errors

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-icon">❌</div>
            <div class="error-text">${message}</div>
        `;

        const activeForm = document.querySelector('.login-form.active');
        activeForm.insertBefore(errorDiv, activeForm.querySelector('form'));

        // Auto-remove error after 5 seconds
        setTimeout(() => this.hideError(), 5000);
    },

    // Hide error message
    hideError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    },

    // Show success message
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-icon">✅</div>
            <div class="success-text">${message}</div>
        `;

        const activeForm = document.querySelector('.login-form.active');
        activeForm.insertBefore(successDiv, activeForm.querySelector('form'));

        setTimeout(() => successDiv.remove(), 3000);
    },

    // Generate session ID
    generateSessionId() {
        return 'SESSION_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    },

    // Setup input animations
    setupInputAnimations() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    },

    // Animate form switch
    animateFormSwitch() {
        const activeForm = document.querySelector('.login-form.active');
        activeForm.style.animation = 'none';
        setTimeout(() => {
            activeForm.style.animation = 'slideIn 0.5s ease';
        }, 10);
    },

    // Animate login form on load
    animateLoginForm() {
        const loginCard = document.querySelector('.login-card');
        loginCard.style.transform = 'translateY(30px)';
        loginCard.style.opacity = '0';
        
        setTimeout(() => {
            loginCard.style.transition = 'all 0.6s ease';
            loginCard.style.transform = 'translateY(0)';
            loginCard.style.opacity = '1';
        }, 100);
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

    // Logout function
    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};

// Add CSS for spinner and messages
const style = document.createElement('style');
style.textContent = `
    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-message, .success-message {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        animation: slideDown 0.3s ease;
    }
    
    .error-message {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .success-message {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .input-with-icon.focused .input-icon {
        color: var(--accent-blue);
        transform: scale(1.1);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialize auth system when page loads
document.addEventListener('DOMContentLoaded', () => {
    authSystem.init();
});
