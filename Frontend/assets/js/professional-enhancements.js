/**
 * Professional UI Enhancements
 * Modern interactions and animations for Invoice RWA
 */

// Initialize professional UI on page load
document.addEventListener('DOMContentLoaded', function() {
    initProfessionalUI();
});

function initProfessionalUI() {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize tab switching animations
    initTabAnimations();
    
    // Initialize language switcher active state
    initLanguageSwitcher();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize card animations
    initCardAnimations();
    
    // Initialize table row animations
    initTableAnimations();
    
    // Initialize button effects
    initButtonEffects();
}

/**
 * Tab Switching with smooth animations
 */
function initTabAnimations() {
    const tabs = document.querySelectorAll('.pro-nav-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active to clicked tab
            this.classList.add('active');
            
            // Add animation to content
            const targetId = this.id.replace('Tab', 'Section');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.style.animation = 'fadeIn 0.5s ease-out';
            }
        });
    });
}

/**
 * Language Switcher Active State
 */
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Set initial active state based on current language
    const currentLang = localStorage.getItem('language') || 'vi';
    langButtons.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all
            langButtons.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            
            // Ripple effect
            createRipple(this);
        });
    });
}

/**
 * Create ripple effect on button click
 */
function createRipple(element) {
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(99, 102, 241, 0.5)';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    const rect = element.getBoundingClientRect();
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            width: 20px;
            height: 20px;
            opacity: 1;
        }
        100% {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.classList.add('tooltip-modern');
    });
}

/**
 * Card entrance animations
 */
function initCardAnimations() {
    const cards = document.querySelectorAll('.pro-card, .pro-card-elevated, .pro-stat-card, .modern-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.animation = `fadeIn 0.6s ease-out forwards`;
                    entry.target.style.opacity = '1';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

/**
 * Table row hover animations
 */
function initTableAnimations() {
    const tableRows = document.querySelectorAll('.invoice-table-row:not(.invoice-table-header)');
    
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

/**
 * Button click effects
 */
function initButtonEffects() {
    const buttons = document.querySelectorAll('.pro-btn, .action-btn, .btn-modern');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create click effect
            const effect = document.createElement('span');
            effect.className = 'button-click-effect';
            effect.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                width: 0;
                height: 0;
                left: ${e.clientX - this.getBoundingClientRect().left}px;
                top: ${e.clientY - this.getBoundingClientRect().top}px;
                transform: translate(-50%, -50%);
                animation: button-effect 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(effect);
            
            setTimeout(() => effect.remove(), 600);
        });
    });
    
    // Add animation to CSS
    const buttonStyle = document.createElement('style');
    buttonStyle.textContent = `
        @keyframes button-effect {
            to {
                width: 300px;
                height: 300px;
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(buttonStyle);
}

/**
 * Smooth stat number counting animation
 */
function animateStatNumber(element, targetValue, duration = 1000) {
    const start = parseInt(element.textContent) || 0;
    const increment = (targetValue - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 0.875rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Set colors based on type
    const colors = {
        success: { bg: '#ecfdf5', text: '#065f46', border: '#10b981' },
        error: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
        warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
        info: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }
    };
    
    const color = colors[type] || colors.info;
    toast.style.background = color.bg;
    toast.style.color = color.text;
    toast.style.borderLeft = `4px solid ${color.border}`;
    
    // Add icon
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span style="font-size: 1.25rem;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    // Add animations
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    if (!document.getElementById('toast-animations')) {
        toastStyle.id = 'toast-animations';
        document.head.appendChild(toastStyle);
    }
}

/**
 * Loading spinner overlay
 */
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(17, 24, 39, 0.7);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
    `;
    
    overlay.innerHTML = `
        <div class="pro-spinner"></div>
        <div style="color: white; font-size: 1.125rem; font-weight: 600;">${message}</div>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => overlay.remove(), 300);
    }
}

// Export functions for global use
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.animateStatNumber = animateStatNumber;
window.createRipple = createRipple;
