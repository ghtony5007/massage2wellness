// Firebase Database Service
// This replaces localStorage with Firestore

class FirebaseService {
  constructor() {
    this.db = window.firebaseDb; // From firebase-config.js
    this.collections = {
      bookings: 'bookings',
      messages: 'contact_messages',
      users: 'users',
      services: 'services'
    };
  }

  // Bookings
  async saveBooking(bookingData) {
    try {
      const docRef = await this.db.collection(this.collections.bookings).add({
        ...bookingData,
        createdAt: new Date(),
        status: 'pending'
      });
      
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  }

  async getBookings(userId = null) {
    try {
      let query = this.db.collection(this.collections.bookings);
      
      // If userId provided, filter by user
      if (userId) {
        query = query.where('customer.email', '==', userId);
      }
      
      // Order by date
      query = query.orderBy('createdAt', 'desc');
      
      const querySnapshot = await query.get();
      const bookings = [];
      
      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      
      return bookings;
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      await this.db.collection(this.collections.bookings).doc(bookingId).update({
        status,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId) {
    try {
      await this.db.collection(this.collections.bookings).doc(bookingId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  // Contact Messages
  async saveContactMessage(messageData) {
    try {
      const docRef = await this.db.collection(this.collections.messages).add({
        ...messageData,
        timestamp: new Date(),
        status: 'new'
      });
      
      return { id: docRef.id, ...messageData };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getContactMessages() {
    try {
      const querySnapshot = await this.db.collection(this.collections.messages)
        .orderBy('timestamp', 'desc')
        .get();
      
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async updateMessageStatus(messageId, status) {
    try {
      await this.db.collection(this.collections.messages).doc(messageId).update({ status });
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  // Utility method to get available time slots
  async getAvailableTimeSlots(date) {
    try {
      // Get all bookings for the specific date
      const querySnapshot = await this.db.collection(this.collections.bookings)
        .where('date', '==', date)
        .where('status', '!=', 'cancelled')
        .get();
      
      const bookedTimes = [];
      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        bookedTimes.push(booking.time);
      });
      
      // Generate all possible time slots (9 AM to 8 PM)
      const allSlots = [];
      for (let hour = 9; hour <= 20; hour++) {
        allSlots.push(`${hour}:00`);
        if (hour < 20) {
          allSlots.push(`${hour}:30`);
        }
      }
      
      // Filter out booked times
      return allSlots.filter(slot => !bookedTimes.includes(slot));
      
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  // Real-time listeners (for admin dashboard)
  onBookingsChange(callback) {
    return this.db.collection(this.collections.bookings)
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const bookings = [];
        querySnapshot.forEach((doc) => {
          bookings.push({ id: doc.id, ...doc.data() });
        });
        callback(bookings);
      });
  }

  onMessagesChange(callback) {
    return this.db.collection(this.collections.messages)
      .orderBy('timestamp', 'desc')
      .onSnapshot((querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
      });
  }
}

// Create singleton instance
window.firebaseService = new FirebaseService();