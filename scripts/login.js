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
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => this.selectRole(card.dataset.role));
        });

        document.getElementById('backBtn')
            ?.addEventListener('click', () => this.showRoleSelection());

        document.getElementById('registerBackBtn')
            ?.addEventListener('click', () => this.showLoginForm(this.currentRole));

        document.getElementById('backToLoginLink')
            ?.addEventListener('click', (e) => { e.preventDefault(); this.showLoginForm(this.currentRole); });

        document.getElementById('createAccountLink')
            ?.addEventListener('click', (e) => { e.preventDefault(); this.showRegisterForm(); });

        document.getElementById('forgotPasswordLink')
            ?.addEventListener('click', (e) => { e.preventDefault(); this.handleForgotPassword(); });

        document.getElementById('authForm')
            ?.addEventListener('submit', (e) => { e.preventDefault(); this.handleLogin(); });

        document.getElementById('registrationForm')
            ?.addEventListener('submit', (e) => { e.preventDefault(); this.handleRegistration(); });
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
        document.getElementById('registerForm').style.display = 'none';

        const isClient = role === 'client';
        document.getElementById('formTitle').textContent = isClient ? 'Client Login' : 'Admin Login';
        document.getElementById('clientFields').style.display = isClient ? 'block' : 'none';
        document.getElementById('adminFields').style.display  = isClient ? 'none'  : 'block';
        const createSection = document.getElementById('createAccountSection');
        if (createSection) createSection.style.display = isClient ? 'block' : 'none';
    }

    showRegisterForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }

    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('#authForm button[type="submit"]');
        const hideLoading = showLoading(submitBtn);

        try {
            const { profile } = await window.firebaseService.signIn(email, password);
            const role = profile?.role || 'client';

            if (role !== this.currentRole) {
                await window.firebaseService.signOut();
                hideLoading();
                this.showMessage(
                    this.currentRole === 'admin'
                        ? 'This account does not have admin access.'
                        : 'Please use the Admin login for this account.',
                    'error'
                );
                return;
            }

            hideLoading();
            this.showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = role === 'admin' ? 'admin.html' : 'client-portal.html';
            }, 1200);
        } catch (error) {
            hideLoading();
            this.showMessage(this.getAuthErrorMessage(error.code), 'error');
        }
    }

    async handleRegistration() {
        const firstName = document.getElementById('reg-firstName').value.trim();
        const lastName  = document.getElementById('reg-lastName').value.trim();
        const email     = document.getElementById('reg-email').value.trim();
        const password  = document.getElementById('reg-password').value;
        const confirm   = document.getElementById('reg-confirmPassword').value;
        const phone     = document.getElementById('reg-phone').value.trim();

        if (password !== confirm) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters.', 'error');
            return;
        }

        const submitBtn = document.querySelector('#registrationForm button[type="submit"]');
        const hideLoading = showLoading(submitBtn);

        try {
            await window.firebaseService.registerUser(email, password, { firstName, lastName, phone });
            hideLoading();
            this.showMessage('Account created! Redirecting to your portal…', 'success');
            setTimeout(() => { window.location.href = 'client-portal.html'; }, 1500);
        } catch (error) {
            hideLoading();
            this.showMessage(this.getAuthErrorMessage(error.code), 'error');
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('email').value.trim();
        if (!email) {
            this.showMessage('Enter your email address first, then click Forgot Password.', 'error');
            return;
        }
        try {
            await window.firebaseAuth.sendPasswordResetEmail(email);
            this.showMessage('Password reset email sent — check your inbox.', 'success');
        } catch (error) {
            this.showMessage(this.getAuthErrorMessage(error.code), 'error');
        }
    }

    getAuthErrorMessage(code) {
        const map = {
            'auth/user-not-found':        'No account found with this email address.',
            'auth/wrong-password':        'Incorrect password. Please try again.',
            'auth/invalid-credential':    'Invalid email or password.',
            'auth/invalid-email':         'Please enter a valid email address.',
            'auth/email-already-in-use':  'An account with this email already exists.',
            'auth/weak-password':         'Password must be at least 6 characters.',
            'auth/too-many-requests':     'Too many failed attempts. Please try again later.',
            'auth/network-request-failed':'Network error. Please check your connection.',
        };
        return map[code] || 'An error occurred. Please try again.';
    }

    showMessage(message, type) {
        document.querySelector('.login-message')?.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `login-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        const isRegisterVisible = document.getElementById('registerForm')?.style.display !== 'none';
        const anchor = isRegisterVisible
            ? document.getElementById('registrationForm')
            : document.getElementById('authForm');
        if (anchor) anchor.parentNode.insertBefore(messageDiv, anchor);

        setTimeout(() => messageDiv.remove(), 4000);
    }

    checkExistingSession() {
        window.firebaseAuth.onAuthStateChanged(async (user) => {
            if (!user) return;
            const profile = await window.firebaseService.getUserProfile(user.uid);
            if (!profile) return;
            window.location.href = profile.role === 'admin' ? 'admin.html' : 'client-portal.html';
        });
    }
}

// UserSession — thin wrapper around Firebase Auth + cached profile
class UserSession {
    static getCurrentUser() {
        return window.firebaseAuth?.currentUser || null;
    }

    static isLoggedIn() {
        return !!window.firebaseAuth?.currentUser;
    }

    static isAdmin() {
        return window._cachedUserProfile?.role === 'admin';
    }

    static isClient() {
        return window._cachedUserProfile?.role === 'client';
    }

    static async logout() {
        await window.firebaseService?.signOut();
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