// Theme Toggle Module for CropGuard AI
class ThemeToggle {
    constructor() {
        this.storageKey = 'cropguard-theme';
        this.darkClass = 'dark-theme';
        this.init();
    }

    init() {
        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem(this.storageKey);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (prefersDark) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.storageKey)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add(this.darkClass);
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove(this.darkClass);
            document.documentElement.style.colorScheme = 'light';
        }
        localStorage.setItem(this.storageKey, theme);
    }

    toggle() {
        const currentTheme = document.documentElement.classList.contains(this.darkClass) ? 'dark' : 'light';
        this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }

    getCurrentTheme() {
        return document.documentElement.classList.contains(this.darkClass) ? 'dark' : 'light';
    }
}

// CSS for Theme Toggle
const themeStyles = `
:root {
    --color-primary: #667eea;
    --color-primary-dark: #764ba2;
    --color-background: #ffffff;
    --color-surface: #f5f7fa;
    --color-text: #333333;
    --color-text-secondary: #666666;
    --color-border: #e0e0e0;
    --color-success: #51cf66;
    --color-error: #ff6b6b;
    --color-warning: #ffd700;
    --color-info: #667eea;
}

:root.dark-theme {
    --color-background: #1e1e2e;
    --color-surface: #2d2d44;
    --color-text: #e8e8f0;
    --color-text-secondary: #a0a0b0;
    --color-border: #3d3d5c;
    --color-success: #40c057;
    --color-error: #ff6b6b;
    --color-warning: #ffd700;
    --color-info: #667eea;
}

body {
    background-color: var(--color-background);
    color: var(--color-text);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.widget, .card {
    background-color: var(--color-surface);
    border-color: var(--color-border);
}

input, textarea, select {
    background-color: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);
}

input::placeholder, textarea::placeholder {
    color: var(--color-text-secondary);
}
`;

// Theme Toggle Button Component
function createThemeToggleButton() {
    const button = document.createElement('button');
    button.className = 'theme-toggle-btn';
    button.innerHTML = '🌙';
    button.title = 'Toggle Theme';
    button.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: var(--color-primary);
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        z-index: 1000;
    `;

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
        themeModule.toggle();
        const isDark = document.documentElement.classList.contains('dark-theme');
        button.innerHTML = isDark ? '☀️' : '🌙';
    });

    // Initialize with correct icon
    const isDark = localStorage.getItem('cropguard-theme') === 'dark' || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    button.innerHTML = isDark ? '☀️' : '🌙';

    document.body.appendChild(button);
}

// Initialize theme toggle
const themeModule = new ThemeToggle();

// Add styles to page
const styleTag = document.createElement('style');
styleTag.textContent = themeStyles;
document.head.appendChild(styleTag);

// Create toggle button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createThemeToggleButton);
} else {
    createThemeToggleButton();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeToggle;
}
