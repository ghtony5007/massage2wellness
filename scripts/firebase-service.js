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
        createdAt: new Date()
        // status is set by the caller (e.g. 'confirmed'); do not override here
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

      if (userId) {
        // Single where clause — no composite index required; sort in JS
        const snapshot = await query.where('userId', '==', userId).get();
        const bookings = [];
        snapshot.forEach(doc => bookings.push({ id: doc.id, ...doc.data() }));
        return bookings.sort((a, b) => {
          const dA = a.createdAt ? new Date(a.createdAt) : 0;
          const dB = b.createdAt ? new Date(b.createdAt) : 0;
          return dB - dA;
        });
      }

      // Admin path: all bookings ordered server-side
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      const bookings = [];
      snapshot.forEach(doc => bookings.push({ id: doc.id, ...doc.data() }));
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

  // ── Authentication ──────────────────────────────────────────────────────────

  async signIn(email, password) {
    const credential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
    const profile = await this.getUserProfile(credential.user.uid);
    return { user: credential.user, profile };
  }

  async signOut() {
    await window.firebaseAuth.signOut();
    window._cachedUserProfile = null;
  }

  async registerUser(email, password, profileData) {
    const credential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
    const uid = credential.user.uid;
    const profile = { ...profileData, email, role: 'client', createdAt: new Date() };
    await this.db.collection(this.collections.users).doc(uid).set(profile);
    window._cachedUserProfile = profile;
    return { user: credential.user, profile };
  }

  async getUserProfile(uid) {
    const doc = await this.db.collection(this.collections.users).doc(uid).get();
    return doc.exists ? { uid, ...doc.data() } : null;
  }

  async updateUserProfile(uid, data) {
    await this.db.collection(this.collections.users).doc(uid).update({
      ...data,
      updatedAt: new Date()
    });
  }

  // Calls callback(user, profile) whenever auth state changes.
  onAuthStateChanged(callback) {
    return window.firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await this.getUserProfile(user.uid);
        window._cachedUserProfile = profile;
        callback(user, profile);
      } else {
        window._cachedUserProfile = null;
        callback(null, null);
      }
    });
  }
}

// Create singleton instance
window.firebaseService = new FirebaseService();