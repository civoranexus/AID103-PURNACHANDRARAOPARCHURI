/**
 * CropGuard AI - Enhanced JavaScript with Backend API Integration
 * Civora Nexus Pvt. Ltd. - CivoraX Program
 * 
 * This version integrates with Django REST API for:
 * - User authentication and profile management
 * - Farm creation and management
 * - Disease detection analysis and storage
 * - Weather data and alerts
 * - Market prices and recommendations
 * - Activity logging
 */

// ============================================
// STATE MANAGEMENT WITH LOCAL STORAGE
// ============================================
const state = {
    // User data
    user: {
        id: null,
        name: '',
        email: '',
        phone: '',
        isAuthenticated: false,
        farms: []
    },

    // Current farm being analyzed
    currentFarm: {
        id: null,
        name: '',
        location: '',
        cropType: '',
        area: '',
        farmerId: null
    },

    // Location data
    location: {
        latitude: null,
        longitude: null,
        areaName: '',
        confirmed: false,
        accuracy: null
    },

    // Image data
    image: {
        source: '', // 'upload', 'url', or 'camera'
        data: null,
        file: null,
        url: '',
        preview: null
    },

    // Analysis results
    analysis: {
        disease: '',
        severity: '',
        confidence: '',
        recommendation: '',
        affectedRegion: null,
        weatherRisk: null,
        detectionId: null
    },

    // UI state
    ui: {
        currentStep: 'welcome', // welcome, farm-details, image, analysis, results
        loading: false,
        alertCount: 0,
        theme: localStorage.getItem('theme') || 'light'
    }
};

// ============================================
// DOM ELEMENTS CACHING
// ============================================
const elements = {
    // Main containers
    container: document.getElementById('container'),
    content: document.getElementById('content'),
    sidebar: document.getElementById('sidebar'),
    navbar: document.getElementById('navbar'),

    // Navigation buttons
    uploadBtn: document.getElementById('uploadBtn'),
    urlBtn: document.getElementById('urlBtn'),
    cameraBtn: document.getElementById('cameraBtn'),
    locationBtn: document.getElementById('locationBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    reportBtn: document.getElementById('reportBtn'),
    resetBtn: document.getElementById('resetBtn'),

    // Input fields
    farmerName: document.getElementById('farmerName'),
    cropType: document.getElementById('cropType'),
    plantingDate: document.getElementById('plantingDate'),
    imageInput: document.getElementById('imageInput'),
    imageUrl: document.getElementById('imageUrl'),
    accuracy: document.getElementById('accuracy'),
    farmerPhone: document.getElementById('farmerPhone'),
    farmerEmail: document.getElementById('farmerEmail'),
    farmName: document.getElementById('farmName'),
    farmArea: document.getElementById('farmArea'),

    // Display areas
    imagePreview: document.getElementById('imagePreview'),
    analysisResults: document.getElementById('analysisResults'),
    alertContainer: document.getElementById('alertContainer'),

    // Auth elements
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    authContainer: document.getElementById('authContainer'),
    userProfile: document.getElementById('userProfile'),

    // Canvas for map
    mapCanvas: document.getElementById('mapCanvas')
};

// ============================================
// API INTEGRATION METHODS
// ============================================

/**
 * Initialize authentication - check if user is logged in
 */
async function initializeAuth() {
    try {
        if (cropGuardAPI.isAuthenticated) {
            const profile = await cropGuardAPI.getUserProfile();
            state.user = {
                id: profile.id,
                name: profile.user.first_name || profile.user.email,
                email: profile.user.email,
                phone: profile.phone || '',
                isAuthenticated: true,
                farms: []
            };

            // Hide auth forms, show app
            if (elements.authContainer) {
                elements.authContainer.style.display = 'none';
            }
            if (elements.container) {
                elements.container.style.display = 'block';
            }

            // Load user's farms
            await loadUserFarms();
            showAlert(`Welcome, ${state.user.name}!`, 'success');
            return true;
        } else {
            // Show login/register forms
            showAuthForms();
            return false;
        }
    } catch (error) {
        console.error('Auth initialization failed:', error);
        showAuthForms();
        return false;
    }
}

/**
 * Handle user login
 */
async function handleLogin(email, password) {
    try {
        state.ui.loading = true;
        const response = await cropGuardAPI.login(email, password);

        if (response.access) {
            await initializeAuth();
            state.ui.loading = false;
            return true;
        }
    } catch (error) {
        showAlert(`Login failed: ${error.message}`, 'error');
        state.ui.loading = false;
        return false;
    }
}

/**
 * Handle user registration
 */
async function handleRegister(email, password, firstName, lastName) {
    try {
        state.ui.loading = true;
        const response = await cropGuardAPI.register({
            email,
            password,
            first_name: firstName,
            last_name: lastName
        });

        showAlert('Registration successful! Please log in.', 'success');
        state.ui.loading = false;
        return true;
    } catch (error) {
        showAlert(`Registration failed: ${error.message}`, 'error');
        state.ui.loading = false;
        return false;
    }
}

/**
 * Load user's farms from backend
 */
async function loadUserFarms() {
    try {
        const response = await cropGuardAPI.getFarms(1, 100);
        state.user.farms = response.results || [];
        updateFarmSelector();
    } catch (error) {
        console.error('Failed to load farms:', error);
        showAlert('Could not load your farms', 'warning');
    }
}

/**
 * Create new farm in database
 */
async function createFarm(farmData) {
    try {
        state.ui.loading = true;
        const newFarm = await cropGuardAPI.createFarm({
            name: farmData.name,
            location: farmData.location,
            crop_type: farmData.cropType,
            area_hectares: parseFloat(farmData.area) || 0,
            soil_type: farmData.soilType || 'unknown',
            irrigation_type: farmData.irrigationType || 'unknown',
            latitude: state.location.latitude,
            longitude: state.location.longitude
        });

        state.currentFarm = {
            id: newFarm.id,
            name: newFarm.name,
            location: newFarm.location,
            cropType: newFarm.crop_type,
            area: newFarm.area_hectares
        };

        state.user.farms.push(newFarm);
        updateFarmSelector();

        showAlert(`Farm "${newFarm.name}" created successfully!`, 'success');
        state.ui.loading = false;
        return true;
    } catch (error) {
        showAlert(`Farm creation failed: ${error.message}`, 'error');
        state.ui.loading = false;
        return false;
    }
}

/**
 * Submit disease detection to backend for analysis
 */
async function submitDetection() {
    try {
        state.ui.loading = true;

        // Prepare detection data
        const detectionData = {
            farm: state.currentFarm.id,
            image_url: state.image.url || '',
            notes: `Crop: ${state.currentFarm.cropType}, Area: ${state.location.areaName}`,
            detected_disease: state.analysis.disease,
            confidence: parseFloat(state.analysis.confidence) || 0,
            severity: state.analysis.severity,
            affected_area_percentage: 25, // Default, can be enhanced
            recommended_treatment: state.analysis.recommendation
        };

        // If image file exists, upload it
        if (state.image.file) {
            const detection = await cropGuardAPI.uploadImageForAnalysis(
                state.image.file,
                state.currentFarm.id,
                detectionData.notes
            );
            state.analysis.detectionId = detection.id;
        } else {
            const detection = await cropGuardAPI.createDetection(detectionData);
            state.analysis.detectionId = detection.id;
        }

        // Fetch weather data for farm
        try {
            const weather = await cropGuardAPI.fetchWeatherData(state.currentFarm.id);
            state.analysis.weatherRisk = weather.disease_risk_level;
        } catch (e) {
            console.warn('Weather fetch not critical:', e);
        }

        // Fetch recommendations
        try {
            const recommendations = await cropGuardAPI.getRecommendations();
            if (recommendations.results && recommendations.results.length > 0) {
                state.analysis.recommendation = recommendations.results[0].recommendation_text;
            }
        } catch (e) {
            console.warn('Could not fetch recommendations:', e);
        }

        showAlert('Analysis saved to your farm data!', 'success');
        state.ui.loading = false;
        return true;
    } catch (error) {
        showAlert(`Analysis submission failed: ${error.message}`, 'error');
        state.ui.loading = false;
        return false;
    }
}

/**
 * Fetch alerts for current user
 */
async function loadAlerts() {
    try {
        const response = await cropGuardAPI.getUnreadAlerts();
        state.ui.alertCount = response.count || 0;
        updateAlertBadge();

        if (state.ui.alertCount > 0) {
            const alerts = await cropGuardAPI.getAlerts(1, 5);
            displayAlerts(alerts.results);
        }
    } catch (error) {
        console.error('Failed to load alerts:', error);
    }
}

/**
 * Fetch weather data for farm
 */
async function loadWeatherData() {
    try {
        if (!state.currentFarm.id) return;

        const weather = await cropGuardAPI.getFarmWeather(state.currentFarm.id);
        
        // Display weather info
        const weatherInfo = `
            Temperature: ${weather.temperature}°C
            Humidity: ${weather.humidity}%
            Rainfall: ${weather.rainfall}mm
            Disease Risk: ${weather.disease_risk_level}
        `;

        showAlert(weatherInfo, 'info');
    } catch (error) {
        console.error('Weather fetch failed:', error);
    }
}

/**
 * Fetch market prices for crop
 */
async function loadMarketPrices() {
    try {
        const prices = await cropGuardAPI.getTrendingPrices();
        displayMarketPrices(prices);
    } catch (error) {
        console.error('Failed to load market prices:', error);
    }
}

// ============================================
// ORIGINAL METHODS (ENHANCED)
// ============================================

/**
 * Fetch user's current location using Geolocation API
 */
async function fetchUserLocation() {
    if (!navigator.geolocation) {
        showAlert('Geolocation not supported in your browser', 'error');
        return;
    }

    state.ui.loading = true;
    showAlert('📍 Fetching your location...', 'info');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            state.location = {
                latitude,
                longitude,
                accuracy,
                confirmed: false,
                areaName: ''
            };

            // Update UI
            if (elements.accuracy) {
                elements.accuracy.textContent = `Accuracy: ±${Math.round(accuracy)}m`;
            }

            determineAreaFromCoordinates(latitude, longitude);
            state.ui.loading = false;
            showAlert(`✓ Location fetched! (${accuracy.toFixed(0)}m accuracy)`, 'success');
        },
        (error) => {
            state.ui.loading = false;
            const errorMsg = error.code === 1 ? 'Permission denied' : error.message;
            showAlert(`Location error: ${errorMsg}`, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

/**
 * Map GPS coordinates to Indian agricultural zones
 */
function determineAreaFromCoordinates(latitude, longitude) {
    const regions = {
        northern: { name: 'Northern Plains', lat: [28, 35], lon: [73, 89] },
        southern: { name: 'Deccan & Southern', lat: [10, 22], lon: [73, 85] },
        eastern: { name: 'Eastern Plains', lat: [22, 27], lon: [84, 95] },
        western: { name: 'Western Region', lat: [18, 28], lon: [68, 78] },
        northeastern: { name: 'North Eastern', lat: [24, 30], lon: [88, 98] }
    };

    for (const [key, region] of Object.entries(regions)) {
        if (
            latitude >= region.lat[0] && latitude <= region.lat[1] &&
            longitude >= region.lon[0] && longitude <= region.lon[1]
        ) {
            state.location.areaName = region.name;
            showAlert(`📍 Location: ${region.name}`, 'success');
            return region.name;
        }
    }

    state.location.areaName = 'All India';
    return 'All India';
}

/**
 * Display alert notifications with animations
 */
function showAlert(message, type = 'info') {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };

    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================

/**
 * Handle image file upload
 */
function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'error');
        return;
    }

    state.image.file = file;
    state.image.source = 'upload';

    const reader = new FileReader();
    reader.onload = (e) => {
        state.image.data = e.target.result;
        if (elements.imagePreview) {
            elements.imagePreview.src = e.target.result;
            elements.imagePreview.style.display = 'block';
        }
        showAlert('Image uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
}

/**
 * Handle image URL input
 */
function handleImageUrl(url) {
    if (!url) {
        showAlert('Please enter an image URL', 'error');
        return;
    }

    state.image.url = url;
    state.image.source = 'url';

    if (elements.imagePreview) {
        elements.imagePreview.src = url;
        elements.imagePreview.style.display = 'block';
    }
    showAlert('Image URL loaded successfully', 'success');
}

/**
 * Capture image from camera
 */
async function captureFromCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        // Create video element and display
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        showAlert('Camera opened. Click "Capture" to take photo.', 'info');

        // Store stream for capture
        state.image.cameraStream = stream;
        state.image.source = 'camera';
    } catch (error) {
        showAlert(`Camera error: ${error.message}`, 'error');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Update farm selector dropdown
 */
function updateFarmSelector() {
    // Implementation depends on UI framework being used
    console.log('Available farms:', state.user.farms);
}

/**
 * Update alert badge count
 */
function updateAlertBadge() {
    const badge = document.querySelector('[data-alert-badge]');
    if (badge) {
        badge.textContent = state.ui.alertCount;
        badge.style.display = state.ui.alertCount > 0 ? 'block' : 'none';
    }
}

/**
 * Display alerts in UI
 */
function displayAlerts(alerts) {
    if (!elements.alertContainer) return;

    elements.alertContainer.innerHTML = '';
    alerts.forEach(alert => {
        const alertEl = document.createElement('div');
        alertEl.className = 'alert-item';
        alertEl.innerHTML = `
            <h4>${alert.title}</h4>
            <p>${alert.message}</p>
            <small>${new Date(alert.created_at).toLocaleDateString()}</small>
        `;
        elements.alertContainer.appendChild(alertEl);
    });
}

/**
 * Display market prices
 */
function displayMarketPrices(prices) {
    console.log('Market prices:', prices);
    // Implementation for displaying market prices in UI
}

/**
 * Show auth forms (login/register)
 */
function showAuthForms() {
    if (elements.authContainer) {
        elements.authContainer.style.display = 'block';
    }
    if (elements.container) {
        elements.container.style.display = 'none';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize authentication
    const isAuthenticated = await initializeAuth();

    if (isAuthenticated) {
        // Load data for authenticated user
        loadAlerts();
        loadWeatherData();
        loadMarketPrices();

        // Set up periodic refresh
        setInterval(loadAlerts, 5 * 60 * 1000); // Every 5 minutes
    }

    // Button event listeners
    if (elements.locationBtn) {
        elements.locationBtn.addEventListener('click', fetchUserLocation);
    }

    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', () => {
            elements.imageInput?.click();
        });
    }

    if (elements.imageInput) {
        elements.imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
            }
        });
    }

    if (elements.analyzeBtn) {
        elements.analyzeBtn.addEventListener('click', submitDetection);
    }

    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', () => {
            state.image = { source: '', data: null, file: null, url: '' };
            state.analysis = { disease: '', severity: '', confidence: '', recommendation: '' };
            showAlert('Form reset', 'info');
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            showAlert('Press ESC again to confirm logout', 'warning');
        }
    });
});

// ============================================
// EXPORT FOR MODULES
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        state,
        handleLogin,
        handleRegister,
        createFarm,
        submitDetection,
        loadAlerts,
        loadWeatherData,
        loadMarketPrices
    };
}
