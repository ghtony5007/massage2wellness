// Client Portal functionality
class ClientPortal {
    constructor() {
        this.currentUser = null;
        this.bookings = [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUserData();
        this.bindEvents();
        this.loadDashboardData();
    }

    checkAuthentication() {
        const session = UserSession.getCurrentUser();
        if (!session || session.role !== 'client') {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = session;
    }

    loadUserData() {
        // Load user information
        document.getElementById('userName').textContent = 'John Doe';
        document.getElementById('userEmail').textContent = this.currentUser.email;
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

    loadDashboardData() {
        // Load bookings from localStorage
        const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        // Filter bookings for current user (in real app, this would be server-side)
        this.bookings = allBookings.filter(booking => 
            booking.email === this.currentUser.email
        );

        // Update dashboard stats
        document.getElementById('totalAppointments').textContent = this.bookings.length;
        
        const upcomingBookings = this.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate > new Date() && booking.status !== 'cancelled';
        });
        document.getElementById('upcomingAppointments').textContent = upcomingBookings.length;

        // Load recent activity
        this.loadRecentActivity();
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        const recentBookings = this.bookings
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentBookings.length === 0) {
            activityContainer.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <p>No recent activity</p>
                        <span>Start by booking your first appointment!</span>
                    </div>
                </div>
            `;
            return;
        }

        activityContainer.innerHTML = recentBookings.map(booking => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="activity-content">
                    <p>Booked ${booking.service}</p>
                    <span>${this.formatDate(booking.date)} at ${booking.time}</span>
                </div>
                <div class="activity-status status-${booking.status}">
                    ${booking.status}
                </div>
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
        let filteredBookings = this.bookings;

        // Apply filter
        if (filter !== 'all') {
            filteredBookings = this.bookings.filter(booking => {
                if (filter === 'upcoming') {
                    return new Date(booking.date) > new Date() && booking.status !== 'cancelled';
                } else if (filter === 'completed') {
                    return booking.status === 'completed';
                } else if (filter === 'cancelled') {
                    return booking.status === 'cancelled';
                }
                return true;
            });
        }

        appointmentsList.innerHTML = filteredBookings.map(booking => `
            <div class="appointment-card">
                <div class="appointment-info">
                    <h4>${booking.service}</h4>
                    <p class="appointment-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(booking.date)} at ${booking.time}
                    </p>
                    <p class="appointment-duration">
                        <i class="fas fa-clock"></i>
                        ${booking.duration || '60'} minutes
                    </p>
                    <p class="appointment-price">
                        <i class="fas fa-dollar-sign"></i>
                        $${booking.price || '90'}
                    </p>
                </div>
                <div class="appointment-status">
                    <span class="status-badge status-${booking.status}">
                        ${booking.status}
                    </span>
                </div>
                <div class="appointment-actions">
                    ${this.getAppointmentActions(booking)}
                </div>
            </div>
        `).join('');
    }

    getAppointmentActions(booking) {
        const bookingDate = new Date(booking.date);
        const now = new Date();
        const timeDiff = bookingDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (booking.status === 'cancelled') {
            return '<span class="action-disabled">Cancelled</span>';
        }

        if (bookingDate < now) {
            return '<span class="action-disabled">Completed</span>';
        }

        // Can reschedule if more than 24 hours away
        if (hoursDiff > 24) {
            return `
                <button class="btn-small btn-secondary" onclick="clientPortal.rescheduleAppointment('${booking.id}')">
                    Reschedule
                </button>
                <button class="btn-small btn-danger" onclick="clientPortal.cancelAppointment('${booking.id}')">
                    Cancel
                </button>
            `;
        } else {
            return '<span class="action-disabled">Too close to modify</span>';
        }
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

    cancelAppointment(bookingId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            // Update booking status
            const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
            
            if (bookingIndex !== -1) {
                allBookings[bookingIndex].status = 'cancelled';
                localStorage.setItem('bookings', JSON.stringify(allBookings));
                
                // Refresh data
                this.loadDashboardData();
                this.loadAppointments();
                
                this.showMessage('Appointment cancelled successfully', 'success');
            }
        }
    }

    updateProfile() {
        const formData = new FormData(document.getElementById('profileForm'));
        const profileData = Object.fromEntries(formData);
        
        // In a real app, this would send data to server
        console.log('Profile updated:', profileData);
        
        this.showMessage('Profile updated successfully!', 'success');
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