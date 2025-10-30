// Component Loader - Load reusable components (nav, footer)
class ComponentLoader {
    constructor() {
        this.loadComponents();
    }

    async loadComponents() {
        await Promise.all([
            this.loadNavigation(),
            this.loadFooter()
        ]);
        
        // Initialize navigation functionality after loading
        this.initNavigation();
        this.setActiveNavigation();
    }

    async loadNavigation() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder) {
            try {
                const response = await fetch('components/nav.html');
                const navHTML = await response.text();
                navPlaceholder.innerHTML = navHTML;
            } catch (error) {
                console.error('Error loading navigation:', error);
                // Fallback in case components don't load
                navPlaceholder.innerHTML = this.getFallbackNav();
            }
        }
    }

    async loadFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            try {
                const response = await fetch('components/footer.html');
                const footerHTML = await response.text();
                footerPlaceholder.innerHTML = footerHTML;
            } catch (error) {
                console.error('Error loading footer:', error);
                // Fallback in case components don't load
                footerPlaceholder.innerHTML = this.getFallbackFooter();
            }
        }
    }

    initNavigation() {
        // Mobile menu toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    setActiveNavigation() {
        // Get current page from URL
        const currentPage = this.getCurrentPage();
        
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link
        const currentNavLink = document.querySelector(`[data-page="${currentPage}"]`);
        if (currentNavLink) {
            currentNavLink.classList.add('active');
        }

        // Special case for home page (index.html)
        if (currentPage === 'index' || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
            const homeLink = document.querySelector('[data-page="home"]');
            if (homeLink) {
                homeLink.classList.add('active');
                // Update href for home link on index page
                homeLink.href = '#home';
            }
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (!filename || filename === 'index.html') {
            return 'home';
        }
        
        // Remove .html extension to get page name
        return filename.replace('.html', '');
    }

    getFallbackNav() {
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <i class="fas fa-spa"></i>
                        <span>Massage2Wellness</span>
                    </div>
                    <div class="nav-menu" id="nav-menu">
                        <a href="index.html" class="nav-link">Home</a>
                        <a href="services.html" class="nav-link">Services</a>
                        <a href="about.html" class="nav-link">About</a>
                        <a href="contact.html" class="nav-link">Contact</a>
                        <a href="booking.html" class="nav-link book-now-btn">Book Now</a>
                        <a href="login.html" class="nav-link login-btn">
                            <i class="fas fa-user"></i> Login
                        </a>
                    </div>
                    <div class="hamburger" id="hamburger">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
        `;
    }

    getFallbackFooter() {
        return `
            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <div class="footer-logo">
                            <i class="fas fa-spa"></i>
                            <span>Massage2Wellness</span>
                        </div>
                        <p>Your journey to wellness and relaxation starts here.</p>
                        <div class="social-links">
                            <a href="#"><i class="fab fa-facebook"></i></a>
                            <a href="#"><i class="fab fa-instagram"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                        </div>
                    </div>
                    <div class="footer-section">
                        <h3>Hours</h3>
                        <p>Monday - Friday: 9 AM - 8 PM</p>
                        <p>Saturday: 10 AM - 6 PM</p>
                        <p>Sunday: Closed</p>
                    </div>
                    <div class="footer-section">
                        <h3>Connect</h3>
                        <p>Discord</p>
                        <p>Instagram</p>
                        <p>Twitter</p>
                        <p>Facebook</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy;2025 Massage2Wellness. All rights reserved</p>
                    <div class="footer-links">
                        <a href="#">Privacy & Policy</a>
                        <a href="#">Terms & Condition</a>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize component loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ComponentLoader();
});

// Export for use in other files
window.ComponentLoader = ComponentLoader;