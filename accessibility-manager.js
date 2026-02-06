/**
 * CropGuard AI - Accessibility Manager (WCAG 2.1 AA Compliance)
 * Manages accessibility features including screen reader support, keyboard navigation, and high contrast mode
 * Version: 1.0
 */

class AccessibilityManager {
  /**
   * Initialize Accessibility Manager
   */
  constructor() {
    this.config = {
      enableKeyboardNav: true,
      enableHighContrast: localStorage.getItem('a11y-high-contrast') === 'true',
      enableTextSizing: localStorage.getItem('a11y-text-size') || 'normal', // small, normal, large, xlarge
      enableReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      enableScreenReaderMode: localStorage.getItem('a11y-screen-reader') === 'true',
      focusOutlineStyle: 'outline',
      enableSkipLinks: true,
      enableLandmarks: true
    };

    this.listeners = [];
    this.initializeA11y();
  }

  /**
   * Initialize accessibility features
   */
  initializeA11y() {
    this.addSkipLinks();
    this.setupKeyboardNavigation();
    this.setupLandmarks();
    this.updateContrast();
    this.updateTextSize();
    this.announcePageLoad();
    this.setupAriaAttributes();
    this.setupFocusManagement();
    this.respectPrefersReducedMotion();

    // Listen for system preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.config.enableReducedMotion = e.matches;
      this.respectPrefersReducedMotion();
    });
  }

  /**
   * Add skip navigation links for keyboard users
   */
  addSkipLinks() {
    if (!this.config.enableSkipLinks) return;

    const skipLinksHTML = `
      <nav class="skip-links" aria-label="Skip navigation links">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <a href="#navigation" class="skip-link">Skip to navigation</a>
        <a href="#footer" class="skip-link">Skip to footer</a>
      </nav>
    `;

    if (!document.querySelector('.skip-links')) {
      const nav = document.createElement('nav');
      nav.innerHTML = skipLinksHTML;
      document.body.insertBefore(nav, document.body.firstChild);

      this.addStyleSheet(`
        .skip-links {
          position: absolute;
          top: -9999px;
          left: -9999px;
          z-index: 999;
        }
        .skip-link {
          position: absolute;
          left: -9999px;
          z-index: 999;
        }
        .skip-link:focus {
          position: static;
          background: #667eea;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          display: inline-block;
          border-radius: 3px;
          font-weight: bold;
        }
      `);
    }
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    if (!this.config.enableKeyboardNav) return;

    // Add visible focus indicators
    this.addStyleSheet(`
      *:focus {
        outline: 3px solid #667eea !important;
        outline-offset: 2px !important;
      }
      *:focus:not(:focus-visible) {
        outline: none;
      }
      *:focus-visible {
        outline: 3px solid #667eea !important;
        outline-offset: 2px !important;
      }
      button:focus, 
      a:focus, 
      input:focus, 
      select:focus, 
      textarea:focus {
        outline: 3px solid #667eea !important;
        outline-offset: 2px !important;
        background-color: rgba(102, 126, 234, 0.1) !important;
      }
    `);

    // Add keyboard event listeners
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

    // Add role attributes to interactive elements
    this.ensureInteractiveRoles();
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboardNavigation(e) {
    // Alt + H for help
    if (e.altKey && e.key === 'h') {
      this.showKeyboardHelp();
    }

    // Alt + C for high contrast toggle
    if (e.altKey && e.key === 'c') {
      this.toggleHighContrast();
    }

    // Alt + S for font size menu
    if (e.altKey && e.key === 's') {
      this.showFontSizeMenu();
    }

    // Alt + R for reset all
    if (e.altKey && e.key === 'r') {
      this.resetAccessibilitySettings();
    }

    // Tab key enhancement
    if (e.key === 'Tab') {
      this.handleTabNavigation(e);
    }

    // Escape key
    if (e.key === 'Escape') {
      this.closeAccessibilityPanels();
    }
  }

  /**
   * Handle Tab navigation to skip non-interactive elements
   */
  handleTabNavigation(e) {
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (interactiveElements.length === 0) return;

    const currentElement = document.activeElement;
    const currentIndex = Array.from(interactiveElements).indexOf(currentElement);

    if (e.shiftKey) {
      // Shift + Tab: previous element
      if (currentIndex <= 0) {
        e.preventDefault();
        interactiveElements[interactiveElements.length - 1].focus();
      }
    } else {
      // Tab: next element
      if (currentIndex >= interactiveElements.length - 1) {
        e.preventDefault();
        interactiveElements[0].focus();
      }
    }
  }

  /**
   * Setup semantic landmarks
   */
  setupLandmarks() {
    if (!this.config.enableLandmarks) return;

    // Ensure landmark elements exist
    const landmarks = {
      'header': 'banner',
      'main': 'main',
      'nav': 'navigation',
      'footer': 'contentinfo',
      'aside': 'complementary'
    };

    Object.entries(landmarks).forEach(([element, role]) => {
      document.querySelectorAll(element).forEach((el) => {
        if (!el.hasAttribute('role')) {
          el.setAttribute('role', role);
        }
      });
    });
  }

  /**
   * Setup ARIA attributes
   */
  setupAriaAttributes() {
    // Add missing ARIA attributes to interactive elements
    document.querySelectorAll('button').forEach((btn) => {
      if (!btn.hasAttribute('aria-label') && btn.textContent.trim() === '') {
        btn.setAttribute('aria-label', 'Button');
      }
      if (!btn.hasAttribute('role')) {
        btn.setAttribute('role', 'button');
      }
    });

    document.querySelectorAll('a').forEach((link) => {
      if (!link.hasAttribute('aria-label') && link.textContent.trim() === '') {
        link.setAttribute('aria-label', 'Link');
      }
    });

    document.querySelectorAll('input').forEach((input) => {
      if (input.type === 'text' && !input.hasAttribute('aria-label')) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-label', label.textContent);
        }
      }
    });

    // Add ARIA labels to icons
    document.querySelectorAll('[class*="icon"], svg').forEach((icon) => {
      if (!icon.hasAttribute('aria-hidden') && !icon.hasAttribute('aria-label')) {
        icon.setAttribute('aria-hidden', 'true');
      }
    });

    // Add aria-current to active navigation items
    document.querySelectorAll('nav a').forEach((link) => {
      if (link.classList.contains('active')) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Focus trap in modals
    document.addEventListener('keydown', (e) => {
      const modal = document.querySelector('[role="dialog"]:not([hidden])');
      if (!modal) return;

      if (e.key === 'Tab') {
        this.trapFocusInModal(modal, e);
      }
    });
  }

  /**
   * Trap focus within modal
   */
  trapFocusInModal(modal, e) {
    const focusableElements = modal.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Update high contrast mode
   */
  updateContrast() {
    if (this.config.enableHighContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
      this.addStyleSheet(`
        [data-high-contrast="true"] {
          --color-primary: #000;
          --color-bg: #fff;
          --color-text: #000;
        }
        [data-high-contrast="true"] body {
          background: white;
          color: black;
        }
        [data-high-contrast="true"] button,
        [data-high-contrast="true"] a {
          border: 3px solid black;
          background: white;
          color: black;
          font-weight: bold;
        }
        [data-high-contrast="true"] .card,
        [data-high-contrast="true"] .section {
          border: 2px solid black;
          background: white;
        }
      `);
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  }

  /**
   * Update text sizing
   */
  updateTextSize() {
    const sizes = {
      small: 0.875,
      normal: 1,
      large: 1.25,
      xlarge: 1.5
    };

    const multiplier = sizes[this.config.enableTextSizing] || 1;
    document.documentElement.style.fontSize = (16 * multiplier) + 'px';
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast() {
    this.config.enableHighContrast = !this.config.enableHighContrast;
    localStorage.setItem('a11y-high-contrast', this.config.enableHighContrast);
    this.updateContrast();
    this.announce('High contrast ' + (this.config.enableHighContrast ? 'enabled' : 'disabled'));
  }

  /**
   * Show font size menu
   */
  showFontSizeMenu() {
    const sizes = ['small', 'normal', 'large', 'xlarge'];
    this.announce('Font size menu. Use arrow keys to select size. Press Enter to confirm.');
    // Implementation would show a visual menu and handle selection
  }

  /**
   * Respect prefers-reduced-motion
   */
  respectPrefersReducedMotion() {
    if (this.config.enableReducedMotion) {
      this.addStyleSheet(`
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `);
    }
  }

  /**
   * Ensure interactive elements have proper roles
   */
  ensureInteractiveRoles() {
    document.querySelectorAll('[onclick]').forEach((el) => {
      if (!el.hasAttribute('role')) {
        el.setAttribute('role', 'button');
      }
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });
  }

  /**
   * Add stylesheet to document
   */
  addStyleSheet(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Announce message to screen readers
   */
  announce(message) {
    const ariaLive = document.getElementById('aria-live-region') || this.createAriaLiveRegion();
    ariaLive.textContent = message;

    setTimeout(() => {
      ariaLive.textContent = '';
    }, 3000);
  }

  /**
   * Create ARIA live region for announcements
   */
  createAriaLiveRegion() {
    const region = document.createElement('div');
    region.id = 'aria-live-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('class', 'sr-only');
    this.addStyleSheet(`
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
      }
    `);
    document.body.appendChild(region);
    return region;
  }

  /**
   * Announce page load
   */
  announcePageLoad() {
    const title = document.title;
    this.announce(`Page loaded: ${title}`);
  }

  /**
   * Show keyboard shortcuts help
   */
  showKeyboardHelp() {
    const helpText = `
      Keyboard Shortcuts:
      Alt + H: Show this help
      Alt + C: Toggle high contrast
      Alt + S: Font size menu
      Alt + R: Reset accessibility settings
      Tab: Navigate forward
      Shift + Tab: Navigate backward
      Escape: Close dialogs
    `;
    this.announce(helpText);
    alert(helpText);
  }

  /**
   * Reset all accessibility settings
   */
  resetAccessibilitySettings() {
    this.config.enableHighContrast = false;
    this.config.enableTextSizing = 'normal';
    this.config.enableScreenReaderMode = false;

    localStorage.removeItem('a11y-high-contrast');
    localStorage.removeItem('a11y-text-size');
    localStorage.removeItem('a11y-screen-reader');

    this.updateContrast();
    this.updateTextSize();
    this.announce('Accessibility settings reset to defaults');
  }

  /**
   * Close all accessibility panels
   */
  closeAccessibilityPanels() {
    document.querySelectorAll('[role="dialog"]').forEach(dialog => {
      dialog.setAttribute('hidden', '');
    });
  }

  /**
   * Set text size
   */
  setTextSize(size) {
    if (['small', 'normal', 'large', 'xlarge'].includes(size)) {
      this.config.enableTextSizing = size;
      localStorage.setItem('a11y-text-size', size);
      this.updateTextSize();
      this.announce(`Font size set to ${size}`);
    }
  }

  /**
   * Enable screen reader mode (verbose announcements)
   */
  enableScreenReaderMode(enable = true) {
    this.config.enableScreenReaderMode = enable;
    localStorage.setItem('a11y-screen-reader', enable);
    this.announce(enable ? 'Screen reader mode enabled' : 'Screen reader mode disabled');
  }

  /**
   * Test color contrast ratio (WCAG compliance)
   */
  testColorContrast(rgb1, rgb2) {
    const getLuminance = (rgb) => {
      const [r, g, b] = rgb.match(/\d+/g).map(x => {
        x = x / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(rgb1);
    const l2 = getLuminance(rgb2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: ratio.toFixed(2),
      AA: ratio >= 4.5, // Level AA
      AAA: ratio >= 7, // Level AAA
      largeTextAA: ratio >= 3, // Large text AA
      largeTextAAA: ratio >= 4.5 // Large text AAA
    };
  }

  /**
   * Validate page accessibility
   */
  validateAccessibility() {
    const issues = [];

    // Check for alt text on images
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('alt')) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });

    // Check for form labels
    document.querySelectorAll('input, textarea, select').forEach(input => {
      if (!document.querySelector(`label[for="${input.id}"]`) && !input.getAttribute('aria-label')) {
        issues.push(`Form control missing label: ${input.id || input.name}`);
      }
    });

    // Check for heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(h => {
      const level = parseInt(h.tagName[1]);
      if (level > lastLevel + 1) {
        issues.push(`Heading hierarchy skip: from H${lastLevel} to H${level}`);
      }
      lastLevel = level;
    });

    // Check for landmarks
    const hasMain = document.querySelector('main');
    if (!hasMain) {
      issues.push('Missing <main> landmark');
    }

    return {
      isValid: issues.length === 0,
      issues: issues,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get accessibility report
   */
  getAccessibilityReport() {
    return {
      settings: this.config,
      validation: this.validateAccessibility(),
      wcagLevel: 'AA',
      lastChecked: new Date().toISOString()
    };
  }
}

// Initialize accessibility on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.a11y = new AccessibilityManager();
  });
} else {
  window.a11y = new AccessibilityManager();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityManager;
}
