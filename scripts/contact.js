// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
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
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Save contact message to localStorage (for demo purposes)
                saveContactMessage(data);
                
                // Hide loading and show success message
                hideLoading();
                showMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
                
                // Reset form
                contactForm.reset();
                
                // Optional: redirect to thank you page
                // window.location.href = 'thank-you.html';
            }, 1500);
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

function saveContactMessage(data) {
    // Get existing messages
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    
    // Add new message
    const message = {
        id: Date.now().toString(),
        ...data,
        timestamp: new Date().toISOString(),
        status: 'new'
    };
    
    messages.push(message);
    
    // Save back to localStorage
    localStorage.setItem('contact_messages', JSON.stringify(messages));
    
    return message;
}

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