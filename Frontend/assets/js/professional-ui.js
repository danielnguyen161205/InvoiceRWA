/**
 * Professional UI Enhancement Script for Invoice RWA
 * Adds smooth animations, transitions, and interactive effects
 */

(function() {
    'use strict';

    // Initialize all professional enhancements on DOM load
    document.addEventListener('DOMContentLoaded', function() {
        initLanguageSwitcher();
        initScrollEffects();
        initTableEnhancements();
        initCardHoverEffects();
        initTooltips();
        initSmoothScrolling();
        initFormEnhancements();
        initLoadingStates();
    });

    /**
     * Language Switcher Enhancement
     */
    function initLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                langButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Add ripple effect
                createRipple(this, event);
            });
        });
    }

    /**
     * Scroll Effects - Reveal elements on scroll
     */
    function initScrollEffects() {
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

        // Observe cards and sections
        const elements = document.querySelectorAll('.pro-card, .pro-card-elevated, section');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Scroll to top button
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Table Row Hover Enhancement
     */
    function initTableEnhancements() {
        const tables = document.querySelectorAll('.pro-table, table');
        
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                row.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(4px)';
                });
                
                row.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateX(0)';
                });
            });
        });
    }

    /**
     * Card Hover Effects
     */
    function initCardHoverEffects() {
        const cards = document.querySelectorAll('.pro-card, .pro-card-elevated');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.style.setProperty('--mouse-x', x + 'px');
                this.style.setProperty('--mouse-y', y + 'px');
            });
        });
    }

    /**
     * Tooltip Enhancement
     */
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.classList.add('pro-tooltip');
        });
    }

    /**
     * Smooth Scrolling for Anchor Links
     */
    function initSmoothScrolling() {
        const anchors = document.querySelectorAll('a[href^="#"]');
        
        anchors.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href !== '#!') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    /**
     * Form Input Enhancements
     */
    function initFormEnhancements() {
        const inputs = document.querySelectorAll('input:not([type="file"]), textarea, select');
        
        inputs.forEach(input => {
            // Add floating label effect
            if (!input.classList.contains('pro-input')) {
                input.addEventListener('focus', function() {
                    this.parentElement?.classList.add('focused');
                });
                
                input.addEventListener('blur', function() {
                    if (!this.value) {
                        this.parentElement?.classList.remove('focused');
                    }
                });
            }

            // Add validation styling
            input.addEventListener('invalid', function() {
                this.classList.add('pro-input-error');
            });

            input.addEventListener('input', function() {
                if (this.validity.valid) {
                    this.classList.remove('pro-input-error');
                    if (this.value) {
                        this.classList.add('pro-input-success');
                    }
                }
            });
        });
    }

    /**
     * Loading State Management
     */
    function initLoadingStates() {
        // Monitor all buttons for loading states
        const buttons = document.querySelectorAll('.pro-btn, button[type="submit"]');
        
        buttons.forEach(button => {
            const originalClick = button.onclick;
            
            button.addEventListener('click', function(e) {
                if (this.form && this.type === 'submit') {
                    addLoadingState(this);
                }
            });
        });
    }

    /**
     * Helper Functions
     */
    
    // Create ripple effect
    function createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Add styles
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    // Add loading state to button
    function addLoadingState(button) {
        if (button.classList.contains('loading')) return;
        
        button.classList.add('loading');
        button.disabled = true;
        
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        
        button.innerHTML = `
            <svg class="animate-spin h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
    }

    // Remove loading state from button
    window.removeLoadingState = function(button) {
        if (!button.classList.contains('loading')) return;
        
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
        
        button.classList.remove('loading');
        button.disabled = false;
    };

    // Add keyframe animation for ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .loading {
            position: relative;
            pointer-events: none;
        }
        
        .focused {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);

    // Export helper functions to global scope
    window.ProfessionalUI = {
        createRipple,
        addLoadingState,
        removeLoadingState: window.removeLoadingState
    };

    // Initialize notification animations
    function animateNotifications() {
        const notifications = document.querySelectorAll('.notification-item');
        notifications.forEach((notif, index) => {
            notif.style.animationDelay = (index * 0.1) + 's';
            notif.style.animation = 'slideInRight 0.3s ease-out forwards';
        });
    }

    // Listen for new notifications
    const notificationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                animateNotifications();
            }
        });
    });

    const notificationList = document.getElementById('notificationList');
    if (notificationList) {
        notificationObserver.observe(notificationList, { childList: true });
    }

    // Add slide in animation
    const slideStyle = document.createElement('style');
    slideStyle.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(slideStyle);

})();
