// Booking system functionality
let currentStep = 1;
let bookingData = {
    service: null,
    addons: [],
    date: null,
    time: null,
    therapist: null,
    customer: {},
    paymentMethod: 'card',
    total: 0
};

document.addEventListener('DOMContentLoaded', function() {
    initializeBookingSystem();
    setupServiceSelection();
    setupDateSelection();
    setupPaymentMethods();
    setupFormSubmission();
    
    // Check for pre-selected service from URL
    const urlParams = new URLSearchParams(window.location.search);
    const preSelectedService = urlParams.get('service');
    if (preSelectedService) {
        selectService(preSelectedService);
    }
});

function initializeBookingSystem() {
    // Set minimum date to today
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // 30 days from now
    
    const dateInput = document.getElementById('appointment-date');
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    // Add date change listener
    dateInput.addEventListener('change', function() {
        bookingData.date = this.value;
        loadAvailableTimeSlots(this.value);
        updateSummary();
    });
}

function setupServiceSelection() {
    const serviceOptions = document.querySelectorAll('.service-option');
    serviceOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove previous selection
            serviceOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            this.classList.add('selected');
            
            // Store service data
            bookingData.service = {
                type: this.dataset.service,
                name: this.querySelector('h3').textContent,
                price: parseInt(this.dataset.price),
                duration: parseInt(this.dataset.duration)
            };
            
            updateTotal();
            updateSummary();
        });
    });
    
    // Setup addon selection
    const addonCheckboxes = document.querySelectorAll('input[name="addons"]');
    addonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                bookingData.addons.push({
                    type: this.value,
                    name: this.parentElement.querySelector('.addon-name').textContent,
                    price: parseInt(this.dataset.price)
                });
            } else {
                bookingData.addons = bookingData.addons.filter(addon => addon.type !== this.value);
            }
            updateTotal();
            updateSummary();
        });
    });
}

function setupDateSelection() {
    // Time slot selection will be handled by loadAvailableTimeSlots
}

function loadAvailableTimeSlots(date) {
    const timeSlotsContainer = document.getElementById('time-slots');
    const availableSlots = window.bookingSystem.getAvailableTimeSlots(date);
    
    timeSlotsContainer.innerHTML = '';
    
    if (availableSlots.length === 0) {
        timeSlotsContainer.innerHTML = '<p class="no-slots">No available time slots for this date. Please choose another date.</p>';
        return;
    }
    
    availableSlots.forEach(slot => {
        const timeButton = document.createElement('button');
        timeButton.type = 'button';
        timeButton.className = 'time-slot';
        timeButton.textContent = formatTime(slot);
        timeButton.dataset.time = slot;
        
        timeButton.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.time-slot').forEach(btn => btn.classList.remove('selected'));
            
            // Select this time
            this.classList.add('selected');
            bookingData.time = this.dataset.time;
            updateSummary();
        });
        
        timeSlotsContainer.appendChild(timeButton);
    });
}

function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

function setupPaymentMethods() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const cardForm = document.getElementById('card-payment-form');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            bookingData.paymentMethod = this.value;
            
            // Show/hide card form
            if (this.value === 'card') {
                cardForm.style.display = 'block';
            } else {
                cardForm.style.display = 'none';
            }
        });
    });
}

function setupFormSubmission() {
    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processBooking();
    });
}

function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    if (currentStep < 4) {
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        
        // Show next step
        currentStep++;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        
        // Update summary when reaching payment step
        if (currentStep === 4) {
            updateSummary();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        
        // Show previous step
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
    }
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (!bookingData.service) {
                showMessage('Please select a service', 'error');
                return false;
            }
            break;
        case 2:
            if (!bookingData.date) {
                showMessage('Please select a date', 'error');
                return false;
            }
            if (!bookingData.time) {
                showMessage('Please select a time', 'error');
                return false;
            }
            break;
        case 3:
            const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
            for (const field of requiredFields) {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    showMessage(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
                    input.focus();
                    return false;
                }
            }
            
            // Validate email
            const email = document.getElementById('email').value;
            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address', 'error');
                document.getElementById('email').focus();
                return false;
            }
            
            // Store customer data
            bookingData.customer = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                specialRequests: document.getElementById('specialRequests').value.trim(),
                firstTime: document.getElementById('firstTime').checked,
                emailUpdates: document.getElementById('emailUpdates').checked
            };
            
            // Store therapist preference
            const therapistSelect = document.getElementById('therapist');
            bookingData.therapist = therapistSelect.value;
            
            break;
        case 4:
            if (!document.getElementById('termsAccepted').checked) {
                showMessage('Please accept the terms and conditions', 'error');
                return false;
            }
            break;
    }
    return true;
}

function selectService(serviceType) {
    const serviceOption = document.querySelector(`[data-service="${serviceType}"]`);
    if (serviceOption) {
        serviceOption.click();
    }
}

function updateTotal() {
    let total = 0;
    
    // Add service price
    if (bookingData.service) {
        total += bookingData.service.price;
    }
    
    // Add addon prices
    bookingData.addons.forEach(addon => {
        total += addon.price;
    });
    
    bookingData.total = total;
}

function updateSummary() {
    // Update service
    if (bookingData.service) {
        document.getElementById('summary-service').textContent = bookingData.service.name;
        document.getElementById('summary-duration').textContent = `${bookingData.service.duration} minutes`;
    }
    
    // Update date
    if (bookingData.date) {
        const date = new Date(bookingData.date);
        document.getElementById('summary-date').textContent = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Update time
    if (bookingData.time) {
        document.getElementById('summary-time').textContent = formatTime(bookingData.time);
    }
    
    // Update therapist
    const therapistSelect = document.getElementById('therapist');
    if (therapistSelect && therapistSelect.value) {
        document.getElementById('summary-therapist').textContent = therapistSelect.selectedOptions[0].textContent;
    }
    
    // Update addons
    const addonsContainer = document.getElementById('summary-addons');
    addonsContainer.innerHTML = '';
    bookingData.addons.forEach(addon => {
        const addonDiv = document.createElement('div');
        addonDiv.className = 'summary-item';
        addonDiv.innerHTML = `
            <span class="summary-label">${addon.name}:</span>
            <span class="summary-value">+$${addon.price}</span>
        `;
        addonsContainer.appendChild(addonDiv);
    });
    
    // Update total
    updateTotal();
    document.getElementById('summary-total').textContent = `$${bookingData.total}`;
}

function processBooking() {
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const hideLoading = showLoading(submitButton);
    
    // Simulate booking processing
    setTimeout(() => {
        try {
            // Create booking object
            const booking = {
                ...bookingData,
                id: Date.now().toString(),
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };
            
            // Save booking
            const savedBooking = window.bookingSystem.saveBooking(booking);
            
            // Hide loading
            hideLoading();
            
            // Show success message
            showMessage('Booking confirmed! You will receive a confirmation email shortly.', 'success');
            
            // Redirect to confirmation page (or show confirmation modal)
            setTimeout(() => {
                showBookingConfirmation(savedBooking);
            }, 2000);
            
        } catch (error) {
            hideLoading();
            showMessage('There was an error processing your booking. Please try again.', 'error');
            console.error('Booking error:', error);
        }
    }, 2000);
}

function showBookingConfirmation(booking) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'booking-confirmation-modal';
    modal.innerHTML = `
        <div class="confirmation-content">
            <div class="confirmation-header">
                <i class="fas fa-check-circle"></i>
                <h2>Booking Confirmed!</h2>
            </div>
            <div class="confirmation-details">
                <p><strong>Confirmation Number:</strong> ${booking.id}</p>
                <p><strong>Service:</strong> ${booking.service.name}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${formatTime(booking.time)}</p>
                <p><strong>Total:</strong> $${booking.total}</p>
            </div>
            <div class="confirmation-actions">
                <button class="btn btn-primary" onclick="window.location.href='index.html'">Return Home</button>
                <button class="btn btn-secondary" onclick="window.print()">Print Confirmation</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles for modal
    const style = document.createElement('style');
    style.textContent = `
        .booking-confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .confirmation-content {
            background: white;
            padding: 3rem;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
            margin: 0 20px;
        }
        
        .confirmation-header i {
            font-size: 4rem;
            color: #4CAF50;
            margin-bottom: 1rem;
        }
        
        .confirmation-header h2 {
            color: var(--text-dark);
            margin-bottom: 2rem;
        }
        
        .confirmation-details {
            text-align: left;
            margin-bottom: 2rem;
        }
        
        .confirmation-details p {
            margin-bottom: 0.5rem;
            color: var(--text-light);
        }
        
        .confirmation-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
}

// Helper function for email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}