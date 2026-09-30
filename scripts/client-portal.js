// Client Portal functionality
class ClientPortal {
    constructor() {
        this.currentUser = null;
        this.bookings = [];
        this.init();
    }

    init() {
        window.firebaseService.onAuthStateChanged(async (user, profile) => {
            if (!user || profile?.role !== 'client') {
                await window.firebaseService.signOut().catch(() => {});
                window.location.href = 'login.html';
                return;
            }
            this.currentUser = { uid: user.uid, email: user.email, ...profile };
            this.loadUserData();
            this.bindEvents();
            await this.loadDashboardData();
        });
    }

    checkAuthentication() {
        // Auth is now handled by onAuthStateChanged in init()
    }

    loadUserData() {
        const name = `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim()
            || this.currentUser.email;
        document.getElementById('userName').textContent = name;
        document.getElementById('userEmail').textContent = this.currentUser.email;

        // Pre-fill profile form with real data
        const fields = { firstName: 'firstName', lastName: 'lastName',
                         profileEmail: 'email', phone: 'phone', preferences: 'preferences' };
        Object.entries(fields).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) el.value = this.currentUser[key] || '';
        });
    }

    bindEvents() {
        // Portal navigation
        const navButtons = document.querySelectorAll('.portal-nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.showTab(tab);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                UserSession.logout();
            });
        }

        // Appointment filters
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterAppointments(filter);
                
                // Update active filter
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
    }

    showTab(tabName) {
        // Hide all content
        const contents = document.querySelectorAll('.portal-content');
        contents.forEach(content => {
            content.style.display = 'none';
        });

        // Show selected content
        const selectedContent = document.getElementById(tabName);
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }

        // Update navigation
        const navButtons = document.querySelectorAll('.portal-nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Load data for specific tabs
        if (tabName === 'appointments') {
            this.loadAppointments();
        }
    }

    async loadDashboardData() {
        try {
            this.bookings = window.firebaseService
                ? await window.firebaseService.getBookings(this.currentUser.uid)
                : [];
        } catch (err) {
            console.error('Failed to load bookings:', err);
            this.bookings = [];
        }

        document.getElementById('totalAppointments').textContent = this.bookings.length;

        const now = new Date();
        const upcoming = this.bookings
            .filter(b => new Date(b.date) > now && b.status !== 'cancelled')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        document.getElementById('upcomingAppointments').textContent = upcoming.length;

        // Next scheduled appointment
        const nextEl = document.getElementById('nextAppointment');
        if (nextEl) {
            nextEl.textContent = upcoming.length > 0
                ? new Date(upcoming[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '\u2014';
        }

        // Most-booked service derived from real data
        const counts = {};
        this.bookings.forEach(b => {
            const name = b.service?.name || (typeof b.service === 'string' ? b.service : null);
            if (name) counts[name] = (counts[name] || 0) + 1;
        });
        const fav = Object.keys(counts).length > 0
            ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
            : '\u2014';
        document.getElementById('favoriteService').textContent = fav;

        this.loadRecentActivity();
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        const recentBookings = [...this.bookings]
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5);

        if (recentBookings.length === 0) {
            activityContainer.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-calendar-plus"></i></div>
                    <div class="activity-content">
                        <p>No bookings yet</p>
                        <span>Book your first appointment to get started!</span>
                    </div>
                </div>
            `;
            return;
        }

        activityContainer.innerHTML = recentBookings.map(booking => `
            <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="activity-content">
                    <p>${booking.service?.name || booking.service || 'Appointment'}</p>
                    <span>${this.formatDate(booking.date)}${booking.time ? ' at ' + booking.time : ''}</span>
                </div>
                <div class="activity-status status-${booking.status}">${booking.status}</div>
            </div>
        `).join('');
    }

    loadAppointments() {
        const appointmentsList = document.getElementById('appointmentsList');
        
        if (this.bookings.length === 0) {
            appointmentsList.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No appointments yet</h3>
                    <p>Book your first appointment to get started on your wellness journey!</p>
                    <a href="booking.html" class="btn btn-primary">Book Now</a>
                </div>
            `;
            return;
        }

        this.renderAppointments('all');
    }

    renderAppointments(filter) {
        const appointmentsList = document.getElementById('appointmentsList');
        const now = new Date();
        let filteredBookings = [...this.bookings];

        if (filter !== 'all') {
            filteredBookings = filteredBookings.filter(booking => {
                const isPast = new Date(booking.date) < now;
                if (filter === 'upcoming')  return !isPast && booking.status !== 'cancelled';
                if (filter === 'completed') return isPast  && booking.status !== 'cancelled';
                if (filter === 'cancelled') return booking.status === 'cancelled';
                return true;
            });
        }

        if (filteredBookings.length === 0) {
            appointmentsList.innerHTML = `
                <div class="no-appointments">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No appointments found</h3>
                    <p>Try a different filter or <a href="booking.html">book a new appointment</a>.</p>
                </div>
            `;
            return;
        }

        appointmentsList.innerHTML = filteredBookings.map(booking => {
            const isPast = new Date(booking.date) < now;

            // Single computed status — avoids contradictory double-badge
            const displayStatus = booking.status === 'cancelled' ? 'cancelled'
                : isPast ? 'completed'
                : booking.status || 'confirmed';

            const serviceName = booking.service?.name
                || (typeof booking.service === 'string' ? booking.service : null)
                || 'Appointment';
            const duration = booking.service?.duration || booking.duration || 60;
            const total    = booking.total != null ? booking.total : (booking.service?.price ?? 0);
            const actions  = !isPast && booking.status !== 'cancelled'
                ? this.getAppointmentActions(booking)
                : '';

            return `
                <div class="appointment-card">
                    <div class="appointment-info">
                        <h4>${serviceName}</h4>
                        <p><i class="fas fa-calendar-alt"></i> ${this.formatDate(booking.date)} at ${this.formatTime(booking.time)}</p>
                        <p><i class="fas fa-hourglass-half"></i> ${duration} minutes</p>
                        <p><i class="fas fa-tag"></i> $${total}</p>
                    </div>
                    <div class="appointment-status">
                        <span class="status-badge status-${displayStatus}">${displayStatus}</span>
                    </div>
                    ${actions ? `<div class="appointment-actions">${actions}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    getAppointmentActions(booking) {
        const hoursDiff = (new Date(booking.date) - new Date()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
            return `
                <button class="btn-small btn-secondary" onclick="clientPortal.rescheduleAppointment('${booking.id}')">Reschedule</button>
                <button class="btn-small btn-danger"     onclick="clientPortal.cancelAppointment('${booking.id}')">Cancel</button>
            `;
        }
        return '<span class="action-disabled">Within 24-hour window</span>';
    }

    formatTime(time24) {
        if (!time24) return '';
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    filterAppointments(filter) {
        this.renderAppointments(filter);
    }

    rescheduleAppointment(bookingId) {
        // In a real app, this would open a reschedule modal
        if (confirm('Would you like to reschedule this appointment? You will be redirected to the booking page.')) {
            // Store the booking ID to reschedule
            sessionStorage.setItem('rescheduleBookingId', bookingId);
            window.location.href = 'booking.html?reschedule=true';
        }
    }

    async cancelAppointment(bookingId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            if (window.firebaseService) {
                await window.firebaseService.updateBookingStatus(bookingId, 'cancelled');
            }
            await this.loadDashboardData();
            this.loadAppointments();
            this.showMessage('Appointment cancelled successfully', 'success');
        } catch (err) {
            console.error('Failed to cancel appointment:', err);
            this.showMessage('Could not cancel appointment. Please try again.', 'error');
        }
    }

    async updateProfile() {
        const profileData = {
            firstName:   document.getElementById('firstName')?.value.trim(),
            lastName:    document.getElementById('lastName')?.value.trim(),
            phone:       document.getElementById('phone')?.value.trim(),
            preferences: document.getElementById('preferences')?.value.trim(),
        };

        try {
            await window.firebaseService.updateUserProfile(this.currentUser.uid, profileData);
            Object.assign(this.currentUser, profileData);
            this.loadUserData();
            this.showMessage('Profile updated successfully!', 'success');
        } catch (err) {
            console.error('Failed to update profile:', err);
            this.showMessage('Failed to save changes. Please try again.', 'error');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showMessage(message, type) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Global function for tab switching
function showTab(tabName) {
    if (window.clientPortal) {
        window.clientPortal.showTab(tabName);
    }
}

// Initialize client portal
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.contains(document.querySelector('.client-portal'))) {
        window.clientPortal = new ClientPortal();
    }
});