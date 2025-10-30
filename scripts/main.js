// Main JavaScript for Massage2Wellness website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger bars
            hamburger.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(250, 249, 247, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(250, 249, 247, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .about-text, .hero-text');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });

    // Form validation helper functions
    window.validateForm = function(formData) {
        const errors = [];
        
        if (!formData.name || formData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (!formData.email || !isValidEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!formData.phone || !isValidPhone(formData.phone)) {
            errors.push('Please enter a valid phone number');
        }
        
        return errors;
    };

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }

    // Loading state helper
    window.showLoading = function(button) {
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        
        return function() {
            button.textContent = originalText;
            button.disabled = false;
        };
    };

    // Success/Error message helper
    window.showMessage = function(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    };

    // Add CSS for message animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Booking system utilities
class BookingSystem {
    constructor() {
        this.bookings = JSON.parse(localStorage.getItem('massage_bookings')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('current_user')) || null;
    }

    saveBooking(booking) {
        booking.id = Date.now().toString();
        booking.created_at = new Date().toISOString();
        booking.status = 'pending';
        
        this.bookings.push(booking);
        localStorage.setItem('massage_bookings', JSON.stringify(this.bookings));
        
        return booking;
    }

    getBookings() {
        return this.bookings;
    }

    getBookingById(id) {
        return this.bookings.find(booking => booking.id === id);
    }

    updateBookingStatus(id, status) {
        const booking = this.getBookingById(id);
        if (booking) {
            booking.status = status;
            booking.updated_at = new Date().toISOString();
            localStorage.setItem('massage_bookings', JSON.stringify(this.bookings));
            return booking;
        }
        return null;
    }

    deleteBooking(id) {
        this.bookings = this.bookings.filter(booking => booking.id !== id);
        localStorage.setItem('massage_bookings', JSON.stringify(this.bookings));
    }

    getAvailableTimeSlots(date) {
        // Business hours: 9 AM to 8 PM
        const timeSlots = [];
        for (let hour = 9; hour <= 20; hour++) {
            timeSlots.push(`${hour}:00`);
            if (hour < 20) {
                timeSlots.push(`${hour}:30`);
            }
        }

        // Filter out booked slots
        const bookedSlots = this.bookings
            .filter(booking => booking.date === date && booking.status !== 'cancelled')
            .map(booking => booking.time);

        return timeSlots.filter(slot => !bookedSlots.includes(slot));
    }
}

// Initialize booking system
window.bookingSystem = new BookingSystem();