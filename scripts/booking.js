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
    setupPaymentMethods();
    setupFormSubmission();
    prefillLoggedInUser();

    const urlParams = new URLSearchParams(window.location.search);
    const preSelectedService = urlParams.get('service');
    if (preSelectedService) {
        selectService(preSelectedService);
    }
});

// Pre-fill step-3 fields only for logged-in clients (not admins booking on behalf of customers)
function prefillLoggedInUser() {
    if (!window.firebaseAuth) return;
    window.firebaseAuth.onAuthStateChanged(async (user) => {
        if (!user) return;
        const profile = await window.firebaseService?.getUserProfile(user.uid);
        if (profile?.role !== 'client') return;
        const fill = (id, val) => { const el = document.getElementById(id); if (el && !el.value) el.value = val || ''; };
        fill('email',     user.email);
        fill('firstName', profile?.firstName);
        fill('lastName',  profile?.lastName);
        fill('phone',     profile?.phone);
    });
}

function initializeBookingSystem() {
    // Set minimum date to today
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // 30 days from now
    
    const dateInput = document.getElementById('appointment-date');
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    // Add date change listener
    dateInput.addEventListener('change', async function() {
        bookingData.date = this.value;
        await loadAvailableTimeSlots(this.value);
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

async function loadAvailableTimeSlots(date) {
    const container = document.getElementById('time-slots');
    container.innerHTML = '<p class="no-slots">Checking availability…</p>';

    const slots = await window.firebaseBookingSystem.getAvailableTimeSlots(date);
    container.innerHTML = '';

    if (!slots.length) {
        container.innerHTML = '<p class="no-slots">No available times for this date. Please choose another.</p>';
        return;
    }

    slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot';
        btn.textContent = formatTime(slot);
        btn.dataset.time = slot;
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            bookingData.time = this.dataset.time;
            updateSummary();
        });
        container.appendChild(btn);
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
    // Update service with base price included
    if (bookingData.service) {
        document.getElementById('summary-service').textContent =
            `${bookingData.service.name} \u2014 $${bookingData.service.price}`;
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
    const addonsSection   = document.getElementById('summary-addons-section');
    addonsContainer.innerHTML = '';

    if (bookingData.addons.length > 0) {
        addonsSection.style.display = '';
        bookingData.addons.forEach(addon => {
            const addonDiv = document.createElement('div');
            addonDiv.className = 'summary-item';
            addonDiv.innerHTML = `
                <span class="summary-label">Enhancement:</span>
                <span class="summary-value">${addon.name} (+$${addon.price})</span>
            `;
            addonsContainer.appendChild(addonDiv);
        });
    } else {
        addonsSection.style.display = 'none';
    }

    // Update total
    updateTotal();
    document.getElementById('summary-total').textContent = `$${bookingData.total}`;
}

async function processBooking() {
    const submitButton = document.querySelector('button[type="submit"]');
    const hideLoading = showLoading(submitButton);

    const booking = {
        ...bookingData,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        userId: window.firebaseAuth?.currentUser?.uid || null
    };

    try {
        const savedBooking = await window.firebaseBookingSystem.saveBooking(booking);

        hideLoading();
        showMessage('Booking confirmed! You will receive a confirmation email shortly.', 'success');

        setTimeout(() => {
            showBookingConfirmation(savedBooking);
        }, 2000);
    } catch (error) {
        hideLoading();
        showMessage('There was an error processing your booking. Please try again.', 'error');
        console.error('Booking error:', error);
    }
}

function showBookingConfirmation(booking) {
    const modal = document.createElement('div');
    modal.className = 'booking-confirmation-modal';
    modal.innerHTML = `
        <div class="confirmation-content">
            <div class="confirmation-icon">
                <i class="fas fa-check"></i>
            </div>
            <h2>Booking Confirmed!</h2>
            <p class="confirmation-subtitle">Your appointment is all set. See you soon!</p>
            <div class="confirmation-details">
                <div class="confirmation-row">
                    <span class="conf-label">Confirmation #</span>
                    <span class="conf-value conf-id">${booking.id.slice(0, 12).toUpperCase()}</span>
                </div>
                <div class="confirmation-row">
                    <span class="conf-label">Service</span>
                    <span class="conf-value">${booking.service.name}</span>
                </div>
                <div class="confirmation-row">
                    <span class="conf-label">Date</span>
                    <span class="conf-value">${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div class="confirmation-row">
                    <span class="conf-label">Time</span>
                    <span class="conf-value">${formatTime(booking.time)}</span>
                </div>
                <div class="confirmation-row confirmation-total">
                    <span class="conf-label">Total</span>
                    <span class="conf-value">$${booking.total}</span>
                </div>
            </div>
            <div class="confirmation-actions">
                <button class="btn btn-primary" onclick="window.location.href='index.html'">Return Home</button>
                <button class="btn btn-secondary" onclick="window.location.href='client-portal.html'">
                    <i class="fas fa-calendar-alt"></i> My Appointments
                </button>
            </div>
            <button class="conf-print-link" onclick="window.print()">
                <i class="fas fa-print"></i> Print this confirmation
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    const style = document.createElement('style');
    style.textContent = `
        .booking-confirmation-modal {
            position: fixed;
            inset: 0;
            background: rgba(26, 14, 8, 0.72);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
            animation: confFadeIn 0.3s ease-out;
        }
        @keyframes confFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        .confirmation-content {
            background: #FDFAF6;
            padding: 2.5rem 2rem;
            border-radius: 20px;
            text-align: center;
            max-width: 480px;
            width: 100%;
            box-shadow: 0 32px 64px rgba(26, 14, 8, 0.28);
            animation: confSlideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes confSlideUp {
            from { transform: translateY(24px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
        }
        .confirmation-icon {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, #4CAF50, #43A047);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
            box-shadow: 0 8px 24px rgba(76, 175, 80, 0.35);
        }
        .confirmation-icon i {
            font-size: 2rem;
            color: white;
        }
        .confirmation-content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            color: #1A0E08;
            margin-bottom: 0.4rem;
            letter-spacing: -0.02em;
        }
        .confirmation-subtitle {
            color: #7A5F50;
            font-size: 0.95rem;
            margin-bottom: 2rem;
        }
        .confirmation-details {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 2rem;
            border: 1px solid #F0E6D8;
        }
        .confirmation-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.85rem 1.25rem;
            border-bottom: 1px solid #F0E6D8;
            text-align: left;
        }
        .confirmation-row:last-child { border-bottom: none; }
        .conf-label {
            color: #7A5F50;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .conf-value {
            color: #1A0E08;
            font-weight: 600;
            font-size: 0.9rem;
            text-align: right;
            max-width: 60%;
        }
        .conf-id {
            font-family: monospace;
            font-size: 0.8rem;
            color: #6B4226;
            letter-spacing: 0.05em;
        }
        .confirmation-total {
            background: #FAF3E8;
        }
        .confirmation-total .conf-label,
        .confirmation-total .conf-value {
            font-size: 1rem;
            font-weight: 700;
            color: #6B4226;
        }
        .confirmation-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 1.25rem;
        }
        .confirmation-actions .btn {
            flex: 1;
            min-width: 140px;
            justify-content: center;
        }
        .conf-print-link {
            background: none;
            border: none;
            color: #7A5F50;
            font-size: 0.85rem;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            text-decoration: underline;
            text-underline-offset: 3px;
            transition: color 0.2s;
        }
        .conf-print-link:hover { color: #6B4226; }
    `;
    document.head.appendChild(style);
}

// Helper function for email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}