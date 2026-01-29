// Navigation Module for CropGuard AI
class NavigationModule {
    constructor() {
        this.navStructure = {
            main: [
                { icon: '🏠', label: 'Dashboard', path: '/dashboard.html', id: 'nav-dashboard' },
                { icon: '📸', label: 'Photo Analysis', path: '/photo-capture.html', id: 'nav-photo' },
                { icon: '🦠', label: 'Disease Detection', path: '/disease-detection.html', id: 'nav-disease' },
                { icon: '🐛', label: 'Pest Management', path: '/pest-management.html', id: 'nav-pest' },
                { icon: '💧', label: 'Irrigation Plan', path: '/irrigation.html', id: 'nav-irrigation' },
                { icon: '💰', label: 'Market Prices', path: '/market.html', id: 'nav-market' },
            ],
            support: [
                { icon: '📚', label: 'Help & Tutorials', path: '/help.html', id: 'nav-help' },
                { icon: '⚙️', label: 'Settings', path: '/settings.html', id: 'nav-settings' },
                { icon: '📊', label: 'Reports', path: '/reports.html', id: 'nav-reports' },
                { icon: '🔐', label: 'Profile', path: '/profile.html', id: 'nav-profile' },
            ]
        };

        this.init();
    }

    init() {
        this.createNavigationBar();
        this.setupMobileToggle();
        this.highlightCurrentPage();
    }

    createNavigationBar() {
        const nav = document.createElement('nav');
        nav.className = 'cropguard-nav';
        nav.innerHTML = `
            <div class="nav-container">
                <!-- Logo -->
                <div class="nav-logo">
                    <span class="logo-icon">🌾</span>
                    <span class="logo-text">CropGuard AI</span>
                </div>

                <!-- Mobile Toggle -->
                <button class="nav-mobile-toggle" id="navMobileToggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <!-- Main Navigation -->
                <div class="nav-menu" id="navMenu">
                    <div class="nav-section">
                        <div class="nav-section-title">Features</div>
                        <ul class="nav-list" id="mainNav"></ul>
                    </div>

                    <div class="nav-divider"></div>

                    <div class="nav-section">
                        <div class="nav-section-title">Support</div>
                        <ul class="nav-list" id="supportNav"></ul>
                    </div>

                    <div class="nav-divider"></div>

                    <!-- User Actions -->
                    <div class="nav-user-actions">
                        <button class="nav-btn-logout" id="logoutBtn">
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </div>

                <!-- User Info -->
                <div class="nav-user-info">
                    <div class="user-avatar">👨</div>
                    <div class="user-details">
                        <div class="user-name">Farmer Name</div>
                        <div class="user-status">Online</div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertBefore(nav, document.body.firstChild);
        this.populateNavigation();
        this.setupEventListeners();
    }

    populateNavigation() {
        const mainNav = document.getElementById('mainNav');
        const supportNav = document.getElementById('supportNav');

        this.navStructure.main.forEach(item => {
            const li = this.createNavItem(item);
            mainNav.appendChild(li);
        });

        this.navStructure.support.forEach(item => {
            const li = this.createNavItem(item);
            supportNav.appendChild(li);
        });
    }

    createNavItem(item) {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.id = item.id;
        
        const a = document.createElement('a');
        a.href = item.path;
        a.className = 'nav-link';
        a.innerHTML = `<span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span>`;
        
        li.appendChild(a);
        return li;
    }

    setupEventListeners() {
        const mobileToggle = document.getElementById('navMobileToggle');
        const navMenu = document.getElementById('navMenu');
        const logoutBtn = document.getElementById('logoutBtn');

        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });

        logoutBtn.addEventListener('click', () => {
            this.logout();
        });
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath || 
                currentPath.includes(link.getAttribute('href').split('/')[1])) {
                link.parentElement.classList.add('active');
            }
        });
    }

    setupMobileToggle() {
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                document.getElementById('navMenu').classList.remove('active');
                document.getElementById('navMobileToggle').classList.remove('active');
            }
        });
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
    }

    addNotificationBadge(navId, count) {
        const navItem = document.getElementById(navId);
        if (navItem) {
            let badge = navItem.querySelector('.badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge';
                navItem.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }
}

// Navigation Styles
const navStyles = `
.cropguard-nav {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0;
    position: sticky;
    top: 0;
    z-index: 999;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.nav-container {
    max-width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 70px;
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 600;
    flex-shrink: 0;
}

.logo-icon {
    font-size: 28px;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 40px;
    flex: 1;
    margin: 0 30px;
}

.nav-section {
    display: flex;
    align-items: center;
    gap: 15px;
}

.nav-section-title {
    font-size: 11px;
    text-transform: uppercase;
    opacity: 0.7;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.nav-list {
    display: flex;
    list-style: none;
    gap: 5px;
}

.nav-item {
    position: relative;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    border-radius: 6px;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: 14px;
}

.nav-link:hover,
.nav-link.active,
.nav-item.active .nav-link {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.nav-icon {
    font-size: 16px;
}

.nav-label {
    display: none;
}

.nav-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.2);
}

.nav-user-actions {
    display: flex;
    gap: 10px;
}

.nav-btn-logout {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.nav-btn-logout:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
}

.nav-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    flex-shrink: 0;
}

.user-avatar {
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    font-size: 13px;
}

.user-status {
    font-size: 11px;
    opacity: 0.8;
}

.badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #ff6b6b;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
}

/* Mobile Styles */
.nav-mobile-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
}

.nav-mobile-toggle span {
    width: 25px;
    height: 3px;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
}

@media (max-width: 768px) {
    .nav-container {
        height: 60px;
        padding: 0 15px;
    }

    .nav-mobile-toggle {
        display: flex;
        order: 3;
    }

    .nav-menu {
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        background: inherit;
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        margin: 0;
        display: none;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .nav-menu.active {
        display: flex;
    }

    .nav-logo {
        order: 1;
        flex: 1;
    }

    .nav-user-info {
        order: 2;
    }

    .nav-section {
        width: 100%;
        flex-direction: column;
        gap: 10px;
    }

    .nav-list {
        flex-direction: column;
        gap: 0;
        width: 100%;
    }

    .nav-link {
        width: 100%;
        padding: 12px 15px;
    }

    .nav-label {
        display: inline;
    }

    .nav-divider {
        width: 100%;
        height: 1px;
    }

    .nav-mobile-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(8px, 8px);
    }

    .nav-mobile-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .nav-mobile-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(8px, -8px);
    }
}
`;

// Add styles
const styleTag = document.createElement('style');
styleTag.textContent = navStyles;
document.head.appendChild(styleTag);

// Initialize navigation
const navigationModule = new NavigationModule();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationModule;
}
