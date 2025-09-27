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
