// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                preferredService: formData.get('preferredService'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') === 'on'
            };
            
            // Validate form
            const errors = validateContactForm(data);
            if (errors.length > 0) {
                showMessage(errors.join(', '), 'error');
                return;
            }
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const hideLoading = showLoading(submitButton);

            try {
                await window.firebaseService.saveContactMessage(data);
                hideLoading();
                showMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
                contactForm.reset();
            } catch (error) {
                console.error('Error sending message:', error);
                hideLoading();
                showMessage('Failed to send message. Please try again.', 'error');
            }
        });
    }
});

function validateContactForm(data) {
    const errors = [];
    
    if (!data.firstName || data.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters');
    }
    
    if (!data.lastName || data.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    if (!data.subject) {
        errors.push('Please select a subject');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters');
    }
    
    return errors;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return /^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone) && cleanPhone.length >= 10;
}

function saveContactMessage() {} // kept for compatibility — data now saved via Firebase

// FAQ toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        
        if (question && answer) {
            // Initially hide answers
            answer.style.maxHeight = '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'max-height 0.3s ease';
            
            // Add click event
            question.style.cursor = 'pointer';
            question.addEventListener('click', function() {
                const isOpen = answer.style.maxHeight !== '0px';
                
                if (isOpen) {
                    answer.style.maxHeight = '0';
                    question.style.color = '';
                } else {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    question.style.color = 'var(--primary-color)';
                }
            });
            
            // Add hover effect
            question.addEventListener('mouseenter', function() {
                if (answer.style.maxHeight === '0px') {
                    question.style.color = 'var(--primary-color)';
                }
            });
            
            question.addEventListener('mouseleave', function() {
                if (answer.style.maxHeight === '0px') {
                    question.style.color = '';
                }
            });
        }
    });
});