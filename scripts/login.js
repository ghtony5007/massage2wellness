// Login functionality
class LoginSystem {
    constructor() {
        this.currentRole = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
    }

    bindEvents() {
        // Role selection
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(card => {
            card.addEventListener('click', () => {
                const role = card.dataset.role;
                this.selectRole(role);
            });
        });

        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showRoleSelection();
            });
        }

        // Form submission
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    selectRole(role) {
        this.currentRole = role;
        this.showLoginForm(role);
    }

    showRoleSelection() {
        document.getElementById('roleSelection').style.display = 'grid';
        document.getElementById('loginForm').style.display = 'none';
        this.currentRole = null;
    }

    showLoginForm(role) {
        document.getElementById('roleSelection').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';

        // Update form title and fields
        const formTitle = document.getElementById('formTitle');
        const clientFields = document.getElementById('clientFields');
        const adminFields = document.getElementById('adminFields');

        if (role === 'client') {
            formTitle.textContent = 'Client Login';
            clientFields.style.display = 'block';
            adminFields.style.display = 'none';
        } else {
            formTitle.textContent = 'Admin Login';
            clientFields.style.display = 'none';
            adminFields.style.display = 'block';
        }
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Demo authentication
        if (this.currentRole === 'client') {
            if (email === 'client@demo.com' && password === 'client123') {
                this.loginSuccess('client');
            } else {
                this.loginError('Invalid client credentials');
            }
        } else if (this.currentRole === 'admin') {
            if (email === 'admin@massage2wellness.com' && password === 'admin123') {
                this.loginSuccess('admin');
            } else {
                this.loginError('Invalid admin credentials');
            }
        }
    }

    loginSuccess(role) {
        // Store session
        const session = {
            role: role,
            email: document.getElementById('email').value,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('userSession', JSON.stringify(session));

        // Show success message
        this.showMessage('Login successful! Redirecting...', 'success');

        // Redirect based on role
        setTimeout(() => {
            if (role === 'client') {
                window.location.href = 'client-portal.html';
            } else {
                window.location.href = 'admin.html';
            }
        }, 1500);
    }

    loginError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.login-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `login-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Insert before form
        const form = document.getElementById('authForm');
        form.parentNode.insertBefore(messageDiv, form);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    checkExistingSession() {
        const session = localStorage.getItem('userSession');
        if (session) {
            const sessionData = JSON.parse(session);
            // Could redirect to appropriate dashboard if session exists
            console.log('Existing session found:', sessionData);
        }
    }

    logout() {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

// User session management
class UserSession {
    static getCurrentUser() {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    }

    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    static isClient() {
        const user = this.getCurrentUser();
        return user && user.role === 'client';
    }

    static logout() {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.contains(document.querySelector('.login-section'))) {
        new LoginSystem();
    }
});

// Export for use in other files
window.UserSession = UserSession;