// Firebase-enabled BookingSystem to replace localStorage

// Updated Booking system utilities with Firebase
class FirebaseBookingSystem {
    constructor() {
        this.currentUser = null;
        this.firebaseService = window.firebaseService; // From firebase-service.js
    }

    async saveBooking(booking) {
        try {
            return await this.firebaseService.saveBooking(booking);
        } catch (error) {
            console.error('Failed to save booking:', error);
            // Fallback to localStorage for offline functionality
            return this.saveToLocalStorage(booking);
        }
    }

    async getBookings(userId = null) {
        try {
            return await this.firebaseService.getBookings(userId);
        } catch (error) {
            console.error('Failed to get bookings:', error);
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('massage_bookings')) || [];
        }
    }

    async getBookingById(id) {
        try {
            const doc = await this.firebaseService.db.collection('bookings').doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Failed to get booking:', error);
            return null;
        }
    }

    async updateBookingStatus(id, status) {
        try {
            return await this.firebaseService.updateBookingStatus(id, status);
        } catch (error) {
            console.error('Failed to update booking:', error);
            return false;
        }
    }

    async deleteBooking(id) {
        try {
            return await this.firebaseService.deleteBooking(id);
        } catch (error) {
            console.error('Failed to delete booking:', error);
            return false;
        }
    }

    async getAvailableTimeSlots(date) {
        try {
            return await this.firebaseService.getAvailableTimeSlots(date);
        } catch (error) {
            console.error('Failed to get time slots:', error);
            // Fallback to basic time slots
            return this.generateBasicTimeSlots();
        }
    }

    generateBasicTimeSlots() {
        const timeSlots = [];
        for (let hour = 9; hour <= 20; hour++) {
            timeSlots.push(`${hour}:00`);
            if (hour < 20) {
                timeSlots.push(`${hour}:30`);
            }
        }
        return timeSlots;
    }

    // Fallback localStorage methods
    saveToLocalStorage(booking) {
        const bookings = JSON.parse(localStorage.getItem('massage_bookings')) || [];
        booking.id = Date.now().toString();
        booking.created_at = new Date().toISOString();
        booking.status = 'pending';
        bookings.push(booking);
        localStorage.setItem('massage_bookings', JSON.stringify(bookings));
        return booking;
    }
}

// Export for global use
window.firebaseBookingSystem = new FirebaseBookingSystem();