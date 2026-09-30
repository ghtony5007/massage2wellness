// Contact form and FAQ functionality

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFAQToggle();
});

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = {
            firstName:        formData.get('firstName'),
            lastName:         formData.get('lastName'),
            email:            formData.get('email'),
            phone:            formData.get('phone'),
            subject:          formData.get('subject'),
            preferredService: formData.get('preferredService'),
            message:          formData.get('message'),
            newsletter:       formData.get('newsletter') === 'on'
        };

        const errors = validateContactForm(data);
        if (errors.length) {
            showMessage(errors.join(', '), 'error');
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const hideLoading = showLoading(submitButton);

        try {
            await window.firebaseService.saveContactMessage(data);
            hideLoading();
            showMessage("Thank you for your message! We'll get back to you within 24 hours.", 'success');
            contactForm.reset();
        } catch (error) {
            console.error('Error sending message:', error);
            hideLoading();
            showMessage('Failed to send message. Please try again.', 'error');
        }
    });
}

function validateContactForm(data) {
    const errors = [];
    if (!data.firstName || data.firstName.trim().length < 2)  errors.push('First name must be at least 2 characters');
    if (!data.lastName  || data.lastName.trim().length  < 2)  errors.push('Last name must be at least 2 characters');
    if (!data.email     || !isValidEmail(data.email))          errors.push('Please enter a valid email address');
    if (data.phone      && !isValidPhone(data.phone))          errors.push('Please enter a valid phone number');
    if (!data.subject)                                         errors.push('Please select a subject');
    if (!data.message   || data.message.trim().length < 10)    errors.push('Message must be at least 10 characters');
    return errors;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    return /^[\+]?[1-9][\d]{0,15}$/.test(clean) && clean.length >= 10;
}

function initFAQToggle() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('h3');
        const answer   = item.querySelector('p');
        if (!question || !answer) return;

        answer.style.cssText = 'max-height:0; overflow:hidden; transition:max-height 0.3s ease';
        question.style.cursor = 'pointer';

        question.addEventListener('click', () => {
            const isOpen = answer.style.maxHeight !== '0px';
            answer.style.maxHeight = isOpen ? '0' : answer.scrollHeight + 'px';
            question.style.color   = isOpen ? '' : 'var(--primary-color)';
            question.classList.toggle('faq-open', !isOpen);
        });
    });
}