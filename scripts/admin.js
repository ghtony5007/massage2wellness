// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupTabNavigation();
    loadDashboardData();
    setupEventListeners();
});

function initializeAdmin() {
    // Check if user is authenticated via login session
    if (!window.UserSession || !window.UserSession.isAdmin()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set up date filters with default values
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const startDateInput = document.getElementById('filterStartDate');
    const endDateInput = document.getElementById('filterEndDate');
    
    if (startDateInput) startDateInput.value = today.toISOString().split('T')[0];
    if (endDateInput) endDateInput.value = nextWeek.toISOString().split('T')[0];
}

function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.dataset.tab;
            showTab(tabName);
        });
    });
}

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to corresponding nav link
    const targetNavLink = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetNavLink) {
        targetNavLink.classList.add('active');
    }
    
    // Load data for the selected tab
    switch (tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'bookings':
            loadBookingsData();
            break;
        case 'customers':
            loadCustomersData();
            break;
        case 'messages':
            loadMessagesData();
            break;
    }
}

async function loadDashboardData() {
    let bookings = [], messages = [];
    try {
        [bookings, messages] = await Promise.all([
            window.firebaseService.getBookings(),
            window.firebaseService.getContactMessages()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
    
    // Calculate stats
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const todayBookings = bookings.filter(booking => 
        booking.date === today.toISOString().split('T')[0]
    ).length;
    
    const weekBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startOfWeek && bookingDate <= today;
    }).length;
    
    const weekRevenue = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startOfWeek && bookingDate <= today && booking.status !== 'cancelled';
    }).reduce((total, booking) => total + (booking.total || 0), 0);
    
    const uniqueCustomers = new Set(bookings.map(booking => booking.customer?.email)).size;
    
    // Update dashboard stats
    document.getElementById('todayBookings').textContent = todayBookings;
    document.getElementById('weekBookings').textContent = weekBookings;
    document.getElementById('weekRevenue').textContent = `$${weekRevenue}`;
    document.getElementById('totalCustomers').textContent = uniqueCustomers;
    
    // Load recent activity
    loadRecentActivity(bookings, messages);
}

function loadRecentActivity(bookings, messages) {
    const activityContainer = document.getElementById('recentActivity');
    const activities = [];
    
    // Add recent bookings
    bookings.slice(-5).forEach(booking => {
        activities.push({
            type: 'booking',
            message: `New booking: ${booking.customer?.firstName} ${booking.customer?.lastName} - ${booking.service?.name}`,
            time: new Date(booking.createdAt || booking.created_at),
            icon: 'fas fa-calendar-plus'
        });
    });
    
    // Add recent messages
    messages.slice(-3).forEach(message => {
        activities.push({
            type: 'message',
            message: `New message from ${message.firstName} ${message.lastName}`,
            time: new Date(message.timestamp),
            icon: 'fas fa-envelope'
        });
    });
    
    // Sort by time (most recent first)
    activities.sort((a, b) => b.time - a.time);
    
    // Display activities
    activityContainer.innerHTML = activities.slice(0, 8).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${formatRelativeTime(activity.time)}</span>
            </div>
        </div>
    `).join('');
}

async function loadBookingsData() {
    let bookings = [];
    try {
        bookings = await window.firebaseService.getBookings();
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
    const tableBody = document.getElementById('bookingsTable');
    
    tableBody.innerHTML = bookings.map(booking => `
        <tr class="booking-row" data-booking-id="${booking.id}">
            <td>#${booking.id}</td>
            <td>${booking.customer?.firstName} ${booking.customer?.lastName}</td>
            <td>${booking.service?.name}</td>
            <td>${formatDateTime(booking.date, booking.time)}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>$${booking.total}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewBooking('${booking.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editBooking('${booking.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="cancelBooking('${booking.id}')" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadCustomersData() {
    let bookings = [];
    try {
        bookings = await window.firebaseService.getBookings();
    } catch (error) {
        console.error('Error loading customers:', error);
    }
    const customersMap = new Map();
    
    // Aggregate customer data
    bookings.forEach(booking => {
        const email = booking.customer?.email;
        if (email) {
            if (!customersMap.has(email)) {
                customersMap.set(email, {
                    ...booking.customer,
                    bookings: [],
                    totalBookings: 0,
                    lastVisit: null
                });
            }
            const customer = customersMap.get(email);
            customer.bookings.push(booking);
            customer.totalBookings++;
            const bookingDate = new Date(booking.date);
            if (!customer.lastVisit || bookingDate > customer.lastVisit) {
                customer.lastVisit = bookingDate;
            }
        }
    });
    
    const customers = Array.from(customersMap.values());
    const tableBody = document.getElementById('customersTable');
    
    tableBody.innerHTML = customers.map(customer => `
        <tr class="customer-row">
            <td>${customer.firstName} ${customer.lastName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.totalBookings}</td>
            <td>${customer.lastVisit ? customer.lastVisit.toLocaleDateString() : 'Never'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewCustomer('${customer.email}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editCustomer('${customer.email}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="createBookingForCustomer('${customer.email}')" title="Book Appointment">
                        <i class="fas fa-calendar-plus"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadMessagesData() {
    let messages = [];
    try {
        messages = await window.firebaseService.getContactMessages();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
    const container = document.getElementById('messagesContainer');
    
    container.innerHTML = messages.map(message => `
        <div class="message-card ${message.status === 'new' ? 'unread' : ''}" data-message-id="${message.id}">
            <div class="message-header">
                <div class="message-sender">
                    <h4>${message.firstName} ${message.lastName}</h4>
                    <span class="message-email">${message.email}</span>
                </div>
                <div class="message-meta">
                    <span class="message-date">${formatDateTime(message.timestamp)}</span>
                    <span class="status-badge status-${message.status}">${message.status}</span>
                </div>
            </div>
            <div class="message-subject">
                <strong>Subject:</strong> ${message.subject}
                ${message.preferredService ? `| Service: ${message.preferredService}` : ''}
            </div>
            <div class="message-content">
                <p>${message.message}</p>
            </div>
            <div class="message-actions">
                <button class="btn btn-secondary" onclick="markAsRead('${message.id}')">
                    <i class="fas fa-check"></i> Mark Read
                </button>
                <button class="btn btn-primary" onclick="replyToMessage('${message.id}')">
                    <i class="fas fa-reply"></i> Reply
                </button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Search functionality
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', debounce(searchCustomers, 300));
    }
    
    // Filter event listeners
    const filterInputs = document.querySelectorAll('#filterStartDate, #filterEndDate, #filterStatus, #filterService');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
}

// Utility Functions
function formatDateTime(date, time) {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString();
    
    if (time) {
        const [hours, minutes] = time.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${formattedDate} ${hour12}:${minutes} ${ampm}`;
    }
    
    return formattedDate;
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Action Functions
function refreshData() {
    const activeTab = document.querySelector('.admin-tab.active');
    if (activeTab) {
        showTab(activeTab.id);
    }
    showMessage('Data refreshed successfully', 'success');
}

async function viewBooking(bookingId) {
    const snapshot = await window.firebaseService.db.collection('bookings').doc(bookingId).get();
    const booking = snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
    if (booking) {
        const modalBody = document.getElementById('bookingModalBody');
        modalBody.innerHTML = `
            <div class="booking-details">
                <div class="detail-section">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${booking.customer.firstName} ${booking.customer.lastName}</p>
                    <p><strong>Email:</strong> ${booking.customer.email}</p>
                    <p><strong>Phone:</strong> ${booking.customer.phone}</p>
                    ${booking.customer.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.customer.specialRequests}</p>` : ''}
                </div>
                <div class="detail-section">
                    <h3>Appointment Details</h3>
                    <p><strong>Service:</strong> ${booking.service.name}</p>
                    <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Duration:</strong> ${booking.service.duration} minutes</p>
                    ${booking.therapist ? `<p><strong>Therapist:</strong> ${booking.therapist}</p>` : ''}
                </div>
                <div class="detail-section">
                    <h3>Billing Information</h3>
                    <p><strong>Service Price:</strong> $${booking.service.price}</p>
                    ${booking.addons.length > 0 ? booking.addons.map(addon => 
                        `<p><strong>${addon.name}:</strong> +$${addon.price}</p>`
                    ).join('') : ''}
                    <p><strong>Total:</strong> $${booking.total}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${booking.status}">${booking.status}</span></p>
                </div>
            </div>
        `;
        document.getElementById('modalTitle').textContent = `Booking #${booking.id}`;
        document.getElementById('bookingModal').style.display = 'block';
    }
}

function editBooking(bookingId) {
    // Implementation for editing booking
    showMessage('Edit booking functionality coming soon', 'info');
}

async function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            await window.firebaseService.updateBookingStatus(bookingId, 'cancelled');
            loadBookingsData();
            showMessage('Booking cancelled successfully', 'success');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showMessage('Failed to cancel booking', 'error');
        }
    }
}

function viewCustomer(email) {
    showMessage('Customer details view coming soon', 'info');
}

function editCustomer(email) {
    showMessage('Edit customer functionality coming soon', 'info');
}

function createBookingForCustomer(email) {
    showMessage('Quick booking functionality coming soon', 'info');
}

async function markAsRead(messageId) {
    try {
        await window.firebaseService.db.collection('contact_messages').doc(messageId).update({ status: 'read' });
        loadMessagesData();
        showMessage('Message marked as read', 'success');
    } catch (error) {
        console.error('Error marking message as read:', error);
        showMessage('Failed to update message', 'error');
    }
}

function replyToMessage(messageId) {
    showMessage('Reply functionality coming soon', 'info');
}

function applyFilters() {
    // Implementation for filtering bookings
    loadBookingsData();
}

function clearFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterService').value = '';
    loadBookingsData();
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const rows = document.querySelectorAll('.customer-row');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

async function exportBookings() {
    try {
        const bookings = await window.firebaseService.getBookings();
        const csvContent = generateCSV(bookings);
        downloadCSV(csvContent, 'bookings.csv');
        showMessage('Bookings exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting bookings:', error);
        showMessage('Failed to export bookings', 'error');
    }
}

function exportCustomers() {
    showMessage('Customer export functionality coming soon', 'info');
}

function generateReport() {
    showMessage('Report generation functionality coming soon', 'info');
}

function generateCSV(data) {
    const headers = ['ID', 'Customer Name', 'Email', 'Service', 'Date', 'Time', 'Status', 'Total'];
    const rows = data.map(booking => [
        booking.id,
        `${booking.customer.firstName} ${booking.customer.lastName}`,
        booking.customer.email,
        booking.service.name,
        booking.date,
        booking.time,
        booking.status,
        booking.total
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Settings functions
async function exportAllData() {
    let bookings = [], messages = [];
    try {
        [bookings, messages] = await Promise.all([
            window.firebaseService.getBookings(),
            window.firebaseService.getContactMessages()
        ]);
    } catch (error) {
        console.error('Error fetching data for export:', error);
    }
    const data = { bookings, messages };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'massage2wellness_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('All data exported successfully', 'success');
}

function clearOldData() {
    if (confirm('Are you sure you want to clear old data? This action cannot be undone.')) {
        showMessage('Clear old data functionality coming soon', 'info');
    }
}

function generateBackup() {
    exportAllData();
    showMessage('Backup created and downloaded', 'success');
}

// Modal functionality
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};