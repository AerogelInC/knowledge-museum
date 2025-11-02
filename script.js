// Smooth scroll animation with Apple-like effects
class ScrollAnimator {
    constructor() {
        this.subjectCards = document.querySelectorAll('.subject-card');
        this.sections = document.querySelectorAll('.section-title, .section-text');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupParallax();
        this.checkInitialState();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        // Observe subject cards
        this.subjectCards.forEach(card => {
            observer.observe(card);
        });

        // Observe section elements
        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupScrollAnimations() {
        let ticking = false;

        const updateScrollAnimations = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            this.subjectCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const cardTop = rect.top;
                const cardCenter = cardTop + rect.height / 2;
                const viewportCenter = windowHeight / 2;

                // Calculate distance from viewport center
                const distance = Math.abs(cardCenter - viewportCenter);
                const maxDistance = windowHeight;

                // Normalize distance (0 to 1)
                const normalizedDistance = Math.min(distance / maxDistance, 1);

                // Calculate scale based on distance (closer = larger)
                const scale = 1 - normalizedDistance * 0.1;
                const opacity = Math.max(0.3, 1 - normalizedDistance * 0.7);

                // Apply transform based on scroll position
                if (cardTop < windowHeight && cardTop > -rect.height) {
                    const translateY = (cardCenter - viewportCenter) * 0.3;
                    
                    card.style.transform = `translateY(${translateY}px) scale(${scale})`;
                    card.style.opacity = opacity;

                    // Add parallax effect to images
                    const imageContainer = card.querySelector('.subject-image-container');
                    if (imageContainer) {
                        const parallaxOffset = (cardCenter - viewportCenter) * 0.2;
                        imageContainer.style.transform = `translateY(${parallaxOffset}px) scale(${scale})`;
                    }
                }
            });

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateScrollAnimations();
    }

    setupParallax() {
        let lastScrollY = 0;
        let ticking = false;

        const updateParallax = () => {
            const scrollY = window.scrollY;
            const hero = document.querySelector('.hero');
            
            if (hero) {
                const heroHeight = hero.offsetHeight;
                const scrollProgress = Math.min(scrollY / heroHeight, 1);
                
                // Fade out hero as we scroll
                hero.style.opacity = 1 - scrollProgress * 0.5;
                
                // Parallax effect for hero content
                const heroContent = hero.querySelector('.hero-content');
                if (heroContent) {
                    const translateY = scrollY * 0.5;
                    heroContent.style.transform = `translateY(${translateY}px)`;
                }
            }

            // Navbar background opacity
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (scrollY > 50) {
                    navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                } else {
                    navbar.style.background = 'rgba(0, 0, 0, 0.8)';
                }
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    checkInitialState() {
        // Check if elements are already in viewport on load
        const checkVisibility = () => {
            this.subjectCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    card.classList.add('active');
                }
            });

            this.sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    section.classList.add('active');
                }
            });
        };

        // Check on load
        checkVisibility();

        // Check after a short delay to ensure styles are applied
        setTimeout(checkVisibility, 100);
    }
}

// Smooth scroll for navigation links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mouse movement parallax effect
function setupMouseParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xPercent = (clientX / innerWidth - 0.5) * 2;
        const yPercent = (clientY / innerHeight - 0.5) * 2;
        
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translate(${xPercent * 20}px, ${yPercent * 20}px)`;
        }
    });

    hero.addEventListener('mouseleave', () => {
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = 'translate(0, 0)';
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimator();
    setupSmoothScroll();
    setupMouseParallax();
    
    // Add loaded class to body for any additional animations
    document.body.classList.add('loaded');
});

// Handle resize events
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Recalculate animations on resize
        const event = new Event('scroll');
        window.dispatchEvent(event);
    }, 250);
});

// Performance optimization: Reduce animations on low-end devices
if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        document.documentElement.style.setProperty('--transition', 'none');
    }
}
