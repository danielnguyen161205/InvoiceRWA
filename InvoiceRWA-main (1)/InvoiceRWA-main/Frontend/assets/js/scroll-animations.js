/**
 * ================================================================
 * INVOICE RWA - SCROLL ANIMATIONS LIBRARY
 * Professional scroll-triggered animations using Intersection Observer
 * ================================================================
 */

class ScrollAnimations {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px 0px -100px 0px',
      animateOnce: options.animateOnce !== false,
      ...options
    };
    
    this.observer = null;
    this.init();
  }

  init() {
    // Create Intersection Observer
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );

    // Observe all elements with scroll-reveal classes
    this.observeElements();

    // Re-observe on DOM changes (for dynamically added content)
    if (typeof MutationObserver !== 'undefined') {
      const mutationObserver = new MutationObserver(() => {
        this.observeElements();
      });
      
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  observeElements() {
    const elements = document.querySelectorAll(
      '[class*="scroll-reveal"], [data-scroll-animation]'
    );
    
    elements.forEach(element => {
      if (!element.hasAttribute('data-observed')) {
        element.setAttribute('data-observed', 'true');
        this.observer.observe(element);
      }
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.animateElement(entry.target);
        
        // Unobserve if animateOnce is true
        if (this.options.animateOnce) {
          this.observer.unobserve(entry.target);
        }
      } else if (!this.options.animateOnce) {
        // Remove revealed class if element is out of view and animateOnce is false
        entry.target.classList.remove('revealed');
      }
    });
  }

  animateElement(element) {
    // Add revealed class
    element.classList.add('revealed');

    // Trigger custom animation if specified
    const customAnimation = element.getAttribute('data-scroll-animation');
    if (customAnimation) {
      element.style.animation = customAnimation;
    }

    // Dispatch custom event
    element.dispatchEvent(new CustomEvent('scrollReveal', {
      detail: { element }
    }));
  }

  // Manually trigger animation
  reveal(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => this.animateElement(element));
  }

  // Refresh observer
  refresh() {
    this.observer.disconnect();
    this.observeElements();
  }

  // Destroy observer
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Stagger Animation Helper
 * Animates children with delays
 */
class StaggerAnimation {
  constructor(parentSelector, options = {}) {
    this.parent = document.querySelector(parentSelector);
    this.options = {
      delay: options.delay || 100, // ms between each child
      animation: options.animation || 'fadeInUp',
      ...options
    };

    if (this.parent) {
      this.animate();
    }
  }

  animate() {
    const children = this.parent.children;
    Array.from(children).forEach((child, index) => {
      child.style.opacity = '0';
      child.style.animationDelay = `${index * this.options.delay}ms`;
      child.classList.add(`animate-${this.options.animation}`);
      
      // Trigger animation
      setTimeout(() => {
        child.style.opacity = '1';
      }, 50);
    });
  }
}

/**
 * Parallax Scrolling Effect
 */
class ParallaxScroll {
  constructor(selector, options = {}) {
    this.elements = document.querySelectorAll(selector);
    this.options = {
      speed: options.speed || 0.5, // 0 to 1
      direction: options.direction || 'up', // up, down, left, right
      ...options
    };

    this.init();
  }

  init() {
    if (this.elements.length === 0) return;

    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    this.handleScroll(); // Initial position
  }

  handleScroll() {
    const scrollY = window.pageYOffset;

    this.elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const distance = scrollY - elementTop;
      const movement = distance * this.options.speed;

      let transform = '';
      switch (this.options.direction) {
        case 'up':
          transform = `translateY(${-movement}px)`;
          break;
        case 'down':
          transform = `translateY(${movement}px)`;
          break;
        case 'left':
          transform = `translateX(${-movement}px)`;
          break;
        case 'right':
          transform = `translateX(${movement}px)`;
          break;
      }

      element.style.transform = transform;
    });
  }
}

/**
 * Scroll Progress Bar
 */
class ScrollProgress {
  constructor(options = {}) {
    this.options = {
      container: options.container || 'body',
      color: options.color || 'linear-gradient(90deg, #ed4337, #ff6b6b)',
      height: options.height || '4px',
      position: options.position || 'top', // top or bottom
      ...options
    };

    this.createProgressBar();
    this.init();
  }

  createProgressBar() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress-bar';
    this.progressBar.style.cssText = `
      position: fixed;
      ${this.options.position}: 0;
      left: 0;
      width: 0%;
      height: ${this.options.height};
      background: ${this.options.color};
      transition: width 0.1s linear;
      z-index: 9999;
    `;
    document.body.appendChild(this.progressBar);
  }

  init() {
    window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
    this.updateProgress(); // Initial state
  }

  updateProgress() {
    const container = document.querySelector(this.options.container);
    const scrollTop = window.pageYOffset;
    const docHeight = container.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    this.progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
  }

  destroy() {
    if (this.progressBar) {
      this.progressBar.remove();
    }
  }
}

/**
 * Smooth Scroll to Element
 */
class SmoothScroll {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 800,
      offset: options.offset || 0,
      easing: options.easing || 'easeInOutCubic',
      ...options
    };

    this.easingFunctions = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };

    this.init();
  }

  init() {
    // Add click handlers to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          this.scrollTo(target);
        }
      });
    });
  }

  scrollTo(target, customOptions = {}) {
    const options = { ...this.options, ...customOptions };
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition - options.offset;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / options.duration, 1);
      const ease = this.easingFunctions[options.easing](progress);
      
      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < options.duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }
}

/**
 * Counter Animation (Number Count Up)
 */
class CounterAnimation {
  constructor(selector, options = {}) {
    this.elements = document.querySelectorAll(selector);
    this.options = {
      duration: options.duration || 2000,
      delay: options.delay || 0,
      separator: options.separator || ',',
      decimal: options.decimal || '.',
      ...options
    };

    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
          entry.target.setAttribute('data-counted', 'true');
          setTimeout(() => {
            this.animateCounter(entry.target);
          }, this.options.delay);
        }
      });
    });

    this.elements.forEach(element => observer.observe(element));
  }

  animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-count') || element.textContent.replace(/,/g, ''));
    const decimals = (element.getAttribute('data-decimals') || 0);
    const duration = parseInt(element.getAttribute('data-duration') || this.options.duration);
    
    let current = 0;
    const increment = target / (duration / 16); // 60fps
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      current = target * this.easeOutCubic(progress);
      
      element.textContent = this.formatNumber(current, decimals);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = this.formatNumber(target, decimals);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  formatNumber(number, decimals) {
    return number.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}

/**
 * Typing Animation Effect
 */
class TypingAnimation {
  constructor(selector, options = {}) {
    this.element = document.querySelector(selector);
    this.options = {
      text: options.text || this.element?.textContent || '',
      speed: options.speed || 100,
      delay: options.delay || 0,
      cursor: options.cursor !== false,
      loop: options.loop || false,
      ...options
    };

    if (this.element) {
      this.init();
    }
  }

  init() {
    this.element.textContent = '';
    if (this.options.cursor) {
      this.element.classList.add('typing-cursor');
    }

    setTimeout(() => {
      this.type(0);
    }, this.options.delay);
  }

  type(index) {
    if (index < this.options.text.length) {
      this.element.textContent += this.options.text.charAt(index);
      setTimeout(() => this.type(index + 1), this.options.speed);
    } else if (this.options.loop) {
      setTimeout(() => {
        this.element.textContent = '';
        this.type(0);
      }, 2000);
    }
  }
}

/**
 * Initialize All Animations on Page Load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Scroll Animations
  window.scrollAnimations = new ScrollAnimations({
    threshold: 0.1,
    animateOnce: true
  });

  // Initialize Scroll Progress Bar
  if (document.querySelector('[data-scroll-progress]')) {
    window.scrollProgress = new ScrollProgress();
  }

  // Initialize Smooth Scroll
  window.smoothScroll = new SmoothScroll({
    duration: 800,
    offset: 80
  });

  // Initialize Counters
  if (document.querySelectorAll('[data-count]').length > 0) {
    window.counterAnimation = new CounterAnimation('[data-count]');
  }

  // Add custom styling for typing cursor
  const style = document.createElement('style');
  style.textContent = `
    .typing-cursor::after {
      content: '|';
      animation: blink 1s step-end infinite;
      margin-left: 2px;
    }
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ScrollAnimations,
    StaggerAnimation,
    ParallaxScroll,
    ScrollProgress,
    SmoothScroll,
    CounterAnimation,
    TypingAnimation
  };
}

/**
 * Usage Examples:
 * 
 * 1. Basic Scroll Reveal:
 *    <div class="scroll-reveal-up">Content</div>
 * 
 * 2. Custom Animation:
 *    <div data-scroll-animation="fadeIn 1s ease-out">Content</div>
 * 
 * 3. Stagger Children:
 *    new StaggerAnimation('.card-container', { delay: 100, animation: 'fadeInUp' });
 * 
 * 4. Parallax Effect:
 *    new ParallaxScroll('.parallax-image', { speed: 0.5, direction: 'up' });
 * 
 * 5. Counter Animation:
 *    <span data-count="12500" data-decimals="0">0</span>
 * 
 * 6. Typing Effect:
 *    new TypingAnimation('#hero-title', { 
 *      text: 'Welcome to Invoice RWA', 
 *      speed: 100 
 *    });
 */
