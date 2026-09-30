// Booking operations with localStorage fallback for offline resilience

class FirebaseBookingSystem {
    constructor() {
        this.service = window.firebaseService;
    }

    async saveBooking(booking) {
        try {
            return await this.service.saveBooking(booking);
        } catch {
            return this._localFallback(booking);
        }
    }

    async getAvailableTimeSlots(date) {
        try {
            return await this.service.getAvailableTimeSlots(date);
        } catch {
            return this._generateSlots();
        }
    }

    _generateSlots() {
        const slots = [];
        for (let h = 9; h <= 20; h++) {
            slots.push(`${h}:00`);
            if (h < 20) slots.push(`${h}:30`);
        }
        return slots;
    }

    _localFallback(booking) {
        const bookings = JSON.parse(localStorage.getItem('massage_bookings') || '[]');
        booking.id = Date.now().toString();
        booking.createdAt = new Date().toISOString();
        bookings.push(booking);
        localStorage.setItem('massage_bookings', JSON.stringify(bookings));
        return booking;
    }
}

window.firebaseBookingSystem = new FirebaseBookingSystem();