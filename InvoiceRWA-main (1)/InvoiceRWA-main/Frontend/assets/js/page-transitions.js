/**
 * ================================================================
 * INVOICE RWA - PAGE TRANSITION EFFECTS
 * Smooth transitions between pages and route changes
 * ================================================================
 */

class PageTransitions {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 600,
      type: options.type || 'fade', // fade, slide, scale, rotate
      preventScrollReset: options.preventScrollReset || false,
      onBeforeTransition: options.onBeforeTransition || null,
      onAfterTransition: options.onAfterTransition || null,
      ...options
    };

    this.isTransitioning = false;
    this.init();
  }

  init() {
    // Intercept all internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      
      if (link && this.isInternalLink(link) && !this.isTransitioning) {
        e.preventDefault();
        this.navigateTo(link.href);
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (!this.isTransitioning) {
        this.loadPage(window.location.href, false);
      }
    });

    // Initial page load animation
    this.animatePageIn();
  }

  isInternalLink(link) {
    // Check if link is internal and not opening in new tab
    return (
      link.hostname === window.location.hostname &&
      !link.target &&
      !link.hasAttribute('data-no-transition') &&
      link.getAttribute('href') !== '#' &&
      !link.getAttribute('href')?.startsWith('#')
    );
  }

  async navigateTo(url) {
    if (this.isTransitioning) return;

    this.isTransitioning = true;

    // Callback before transition
    if (this.options.onBeforeTransition) {
      this.options.onBeforeTransition();
    }

    // Animate out current page
    await this.animatePageOut();

    // Load new page
    await this.loadPage(url, true);

    this.isTransitioning = false;
  }

  async loadPage(url, pushState = true) {
    try {
      // Fetch new page
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Update page content
      this.updatePage(doc);
      
      // Update URL
      if (pushState) {
        window.history.pushState({}, '', url);
      }
      
      // Scroll to top (unless prevented)
      if (!this.options.preventScrollReset) {
        window.scrollTo(0, 0);
      }
      
      // Animate in new page
      await this.animatePageIn();
      
      // Callback after transition
      if (this.options.onAfterTransition) {
        this.options.onAfterTransition();
      }
      
      // Reinitialize scripts if needed
      this.reinitializeScripts();
      
    } catch (error) {
      console.error('Page transition error:', error);
      window.location.href = url; // Fallback to normal navigation
    }
  }

  updatePage(newDoc) {
    // Update title
    document.title = newDoc.title;

    // Update meta tags
    const newMetaTags = newDoc.querySelectorAll('meta');
    newMetaTags.forEach(newMeta => {
      const name = newMeta.getAttribute('name') || newMeta.getAttribute('property');
      if (name) {
        const existingMeta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (existingMeta) {
          existingMeta.setAttribute('content', newMeta.getAttribute('content'));
        }
      }
    });

    // Update body content
    const newContent = newDoc.querySelector('body');
    if (newContent) {
      // Preserve certain elements if needed (like navigation)
      document.body.innerHTML = newContent.innerHTML;
      
      // Copy body classes
      document.body.className = newContent.className;
    }
  }

  animatePageOut() {
    return new Promise((resolve) => {
      const overlay = this.createOverlay();
      document.body.appendChild(overlay);

      const content = document.querySelector('main, .main-content, body > *');
      
      switch (this.options.type) {
        case 'fade':
          overlay.style.animation = `fadeIn ${this.options.duration}ms ease-out forwards`;
          if (content) content.style.animation = `fadeOut ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'slide-left':
          if (content) content.style.animation = `slideOutLeft ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'slide-right':
          if (content) content.style.animation = `slideOutRight ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'slide-up':
          if (content) content.style.animation = `slideOutUp ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'scale':
          overlay.style.animation = `fadeIn ${this.options.duration}ms ease-out forwards`;
          if (content) content.style.animation = `scaleOut ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'rotate':
          overlay.style.animation = `fadeIn ${this.options.duration}ms ease-out forwards`;
          if (content) content.style.animation = `rotateOut ${this.options.duration}ms ease-out forwards`;
          break;
      }

      setTimeout(() => {
        resolve();
      }, this.options.duration);
    });
  }

  animatePageIn() {
    return new Promise((resolve) => {
      const overlay = document.querySelector('.page-transition-overlay');
      const content = document.querySelector('main, .main-content, body > *');

      switch (this.options.type) {
        case 'fade':
          if (overlay) overlay.style.animation = `fadeOut ${this.options.duration}ms ease-out forwards`;
          if (content) content.style.animation = `fadeIn ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'slide-left':
          if (content) content.style.animation = `slideInRight ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'slide-right':
          if (content) content.style.animation = `slideInLeft ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'slide-up':
          if (content) content.style.animation = `slideInUp ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'scale':
          if (overlay) overlay.style.animation = `fadeOut ${this.options.duration}ms ease-out forwards`;
          if (content) content.style.animation = `scaleIn ${this.options.duration}ms ease-out forwards`;
          break;
          
        case 'rotate':
          if (overlay) overlay.style.animation = `fadeOut ${this.options.duration}ms ease-out forwards`;
          if (content) content.style.animation = `rotateIn ${this.options.duration}ms ease-out forwards`;
          break;
      }

      setTimeout(() => {
        if (overlay) overlay.remove();
        resolve();
      }, this.options.duration);
    });
  }

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: 9999;
      opacity: 0;
    `;
    return overlay;
  }

  reinitializeScripts() {
    // Reinitialize scroll animations
    if (window.scrollAnimations) {
      window.scrollAnimations.refresh();
    }

    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('pageTransitionComplete'));
  }

  destroy() {
    this.isTransitioning = false;
  }
}

/**
 * Loading Screen Manager
 */
class LoadingScreen {
  constructor(options = {}) {
    this.options = {
      type: options.type || 'spinner', // spinner, dots, bar, custom
      text: options.text || 'Loading...',
      color: options.color || '#ed4337',
      backgroundColor: options.backgroundColor || 'rgba(255, 255, 255, 0.95)',
      ...options
    };

    this.element = null;
  }

  show() {
    if (this.element) return;

    this.element = document.createElement('div');
    this.element.className = 'loading-screen';
    this.element.innerHTML = this.getTemplate();
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.options.backgroundColor};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    document.body.appendChild(this.element);
  }

  hide() {
    if (!this.element) return;

    this.element.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (this.element) {
        this.element.remove();
        this.element = null;
      }
    }, 300);
  }

  getTemplate() {
    switch (this.options.type) {
      case 'spinner':
        return `
          <div class="spinner" style="
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-top-color: ${this.options.color};
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 0.8s linear infinite;
          "></div>
          <p style="margin-top: 20px; color: #333; font-size: 16px;">${this.options.text}</p>
        `;
        
      case 'dots':
        return `
          <div class="dots-loading" style="display: flex; gap: 10px;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${this.options.color}; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${this.options.color}; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${this.options.color}; animation: bounce 1.4s infinite ease-in-out both;"></span>
          </div>
          <p style="margin-top: 20px; color: #333; font-size: 16px;">${this.options.text}</p>
        `;
        
      case 'bar':
        return `
          <div style="width: 200px; height: 4px; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: ${this.options.color}; animation: progressBar 1.5s ease-in-out infinite;"></div>
          </div>
          <p style="margin-top: 20px; color: #333; font-size: 16px;">${this.options.text}</p>
        `;
        
      default:
        return this.options.customTemplate || '';
    }
  }
}

/**
 * Route Change Detector (for SPAs)
 */
class RouteChangeDetector {
  constructor(callback) {
    this.callback = callback;
    this.currentUrl = window.location.href;
    
    this.init();
  }

  init() {
    // Watch for URL changes
    const observer = new MutationObserver(() => {
      if (this.currentUrl !== window.location.href) {
        this.currentUrl = window.location.href;
        this.callback(this.currentUrl);
      }
    });

    observer.observe(document, {
      subtree: true,
      childList: true
    });

    // Also watch for popstate
    window.addEventListener('popstate', () => {
      this.currentUrl = window.location.href;
      this.callback(this.currentUrl);
    });
  }
}

/**
 * Page Preloader (shows on first page load)
 */
class PagePreloader {
  constructor(options = {}) {
    this.options = {
      minDuration: options.minDuration || 500,
      logo: options.logo || null,
      ...options
    };

    this.create();
  }

  create() {
    const preloader = document.createElement('div');
    preloader.id = 'page-preloader';
    preloader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #ed4337, #ff6b6b);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    `;

    if (this.options.logo) {
      preloader.innerHTML = `
        <img src="${this.options.logo}" alt="Logo" style="
          max-width: 150px;
          margin-bottom: 30px;
          animation: pulse 1.5s ease-in-out infinite;
        ">
      `;
    }

    preloader.innerHTML += `
      <div style="
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        overflow: hidden;
      ">
        <div style="
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 10px;
          animation: progressBar 1.5s ease-in-out infinite;
        "></div>
      </div>
    `;

    document.body.appendChild(preloader);

    // Remove preloader after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => preloader.remove(), 500);
      }, this.options.minDuration);
    });
  }
}

/**
 * Add necessary CSS animations
 */
const addTransitionStyles = () => {
  if (document.getElementById('page-transition-styles')) return;

  const style = document.createElement('style');
  style.id = 'page-transition-styles';
  style.textContent = `
    @keyframes slideOutLeft {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-100%); opacity: 0; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes progressBar {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles
addTransitionStyles();

/**
 * Initialize Page Transitions on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Uncomment to enable page transitions globally
  // window.pageTransitions = new PageTransitions({
  //   type: 'fade',
  //   duration: 600
  // });

  // Show preloader on first load
  // new PagePreloader({ minDuration: 1000 });
});

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PageTransitions,
    LoadingScreen,
    RouteChangeDetector,
    PagePreloader
  };
}

/**
 * Usage Examples:
 * 
 * 1. Enable Page Transitions:
 *    window.pageTransitions = new PageTransitions({
 *      type: 'fade',
 *      duration: 600,
 *      onAfterTransition: () => console.log('Page loaded!')
 *    });
 * 
 * 2. Show Loading Screen:
 *    const loader = new LoadingScreen({ type: 'spinner', text: 'Loading...' });
 *    loader.show();
 *    // ... do async work ...
 *    loader.hide();
 * 
 * 3. Disable transition for specific link:
 *    <a href="/page" data-no-transition>No Transition</a>
 * 
 * 4. Custom preloader:
 *    new PagePreloader({
 *      logo: '/path/to/logo.png',
 *      minDuration: 1000
 *    });
 */
