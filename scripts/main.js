// Shared utilities and page-level animations for Massage2Wellness

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initNavbarScroll();
    initScrollAnimations();
    initToastStyles();
});

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        });
    });
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrolled = window.scrollY > 50;
            navbar.style.backgroundColor = scrolled
                ? 'rgba(253, 250, 246, 0.98)'
                : 'rgba(253, 250, 246, 0.9)';
            navbar.style.boxShadow = scrolled
                ? '0 2px 20px rgba(107, 66, 38, 0.1)'
                : 'none';
            ticking = false;
        });
    });
}

function initScrollAnimations() {
    const elements = document.querySelectorAll('.service-card, .about-text, .hero-text');
    if (!elements.length) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(el);
    });
}

function initToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(110%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0);    opacity: 1; }
            to   { transform: translateX(110%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ── Global helpers used across pages ─────────────────────────────────────

// Returns a restore function; preserves innerHTML so icon buttons keep their icons
window.showLoading = function(button) {
    const original = button.innerHTML;
    button.innerHTML = 'Loading…';
    button.disabled = true;
    return () => { button.innerHTML = original; button.disabled = false; };
};

window.showMessage = function(message, type = 'success') {
    const colors = { success: '#4CAF50', error: '#f44336', info: '#2196F3' };
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = `
        position:fixed; top:20px; right:20px; z-index:9999;
        padding:1rem 1.5rem; border-radius:8px;
        color:#fff; font-weight:500; font-family:inherit;
        background:${colors[type] ?? colors.error};
        animation:slideIn 0.3s ease-out;
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => el.remove(), 300);
    }, 3200);
};