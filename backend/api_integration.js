/* ============================================
   CROPGUARD AI - BACKEND INTEGRATION MODULE
   Connects frontend to Django API
   ============================================ */

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',
    ENDPOINTS: {
        HEALTH: '/health/',
        FARMERS: '/farmers/',
        FARMS: '/farms/',
        ANALYZE: '/analyze/',
        ANALYSES: '/analyses/',
        LOCATIONS: '/locations/'
    },
    TIMEOUT: 30000
};

/**
 * API Service Class
 * Handles all backend communication
 */
class CropGuardAPIService {
    constructor(baseURL = API_CONFIG.BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check backend health
     */
    async checkHealth() {
        try {
            return await this.request(API_CONFIG.ENDPOINTS.HEALTH);
        } catch (error) {
            console.warn('Backend health check failed:', error);
            return null;
        }
    }

    /**
     * Create a new farmer
     */
    async createFarmer(farmerData) {
        return await this.request(API_CONFIG.ENDPOINTS.FARMERS, {
            method: 'POST',
            body: JSON.stringify(farmerData)
        });
    }

    /**
     * Get farmer details
     */
    async getFarmer(farmerId) {
        return await this.request(`${API_CONFIG.ENDPOINTS.FARMERS}${farmerId}/`);
    }

    /**
     * Get all farmers
     */
    async getAllFarmers() {
        return await this.request(API_CONFIG.ENDPOINTS.FARMERS);
    }

    /**
     * Create a new farm
     */
    async createFarm(farmData) {
        return await this.request(API_CONFIG.ENDPOINTS.FARMS, {
            method: 'POST',
            body: JSON.stringify(farmData)
        });
    }

    /**
     * Get farm details
     */
    async getFarm(farmId) {
        return await this.request(`${API_CONFIG.ENDPOINTS.FARMS}${farmId}/`);
    }

    /**
     * Get farm health summary
     */
    async getFarmHealthSummary(farmId) {
        return await this.request(`${API_CONFIG.ENDPOINTS.FARMS}${farmId}/health_summary/`);
    }

    /**
     * Get all farms
     */
    async getAllFarms() {
        return await this.request(API_CONFIG.ENDPOINTS.FARMS);
    }

    /**
     * Analyze crop image with backend AI
     */
    async analyzeImage(formData) {
        try {
            const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.ANALYZE}`;
            
            // Don't set Content-Type header for FormData
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Image analysis failed:', error);
            throw error;
        }
    }

    /**
     * Get location names by region
     */
    async getLocationsByRegion(region) {
        return await this.request(`${API_CONFIG.ENDPOINTS.LOCATIONS}${region}/`);
    }

    /**
     * Get all analyses
     */
    async getAllAnalyses() {
        return await this.request(API_CONFIG.ENDPOINTS.ANALYSES);
    }

    /**
     * Get analyses by severity
     */
    async getAnalysesBySeverity(severity) {
        return await this.request(`${API_CONFIG.ENDPOINTS.ANALYSES}by_severity/?severity=${severity}`);
    }

    /**
     * Get analyses statistics
     */
    async getAnalysesStatistics() {
        return await this.request(`${API_CONFIG.ENDPOINTS.ANALYSES}statistics/`);
    }
}

// Initialize API service (global instance)
const apiService = new CropGuardAPIService();

/**
 * Integration with Frontend Analyze Function
 */
async function analyzeImageWithBackend() {
    if (!state.image.data || !state.farmer.cropType || !state.location.confirmed) {
        alert('Please upload/fetch image, select crop type, and confirm location first');
        return;
    }

    // Show loading state
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.textContent = 'Analyzing...';

    try {
        // Create FormData for API
        const formData = new FormData();
        formData.append('farm_id', state.location.farmId || 'default-farm');
        formData.append('crop_type', state.farmer.cropType);
        formData.append('location', state.location.areaName);

        // Add image (either file or URL)
        if (state.image.file) {
            formData.append('image', state.image.file);
        } else if (state.image.url) {
            formData.append('image_url', state.image.url);
        }

        // Call backend API
        const analysisResult = await apiService.analyzeImage(formData);

        // Map API response to state
        state.analysis = {
            disease: analysisResult.disease,
            severity: analysisResult.severity.charAt(0).toUpperCase() + analysisResult.severity.slice(1),
            confidence: analysisResult.confidence + '%',
            possibleCause: analysisResult.cause,
            chemicalTreatment: analysisResult.treatment.chemical,
            organicAlternatives: analysisResult.treatment.organic,
            preventivePractices: analysisResult.treatment.preventive,
            affectedRegion: analysisResult.affected_region
        };

        // Display results
        displayDetectionVisualization();
        displayAnalysisReport();
        displayRecommendations();
        
        // Display backend-generated alerts
        displayBackendAlerts(analysisResult.alerts);

        elements.analyzeBtn.textContent = 'Analyze with AI';
        elements.analyzeBtn.disabled = false;

    } catch (error) {
        alert(`Analysis failed: ${error.message}`);
        elements.analyzeBtn.textContent = 'Analyze with AI';
        elements.analyzeBtn.disabled = false;
    }
}

/**
 * Display alerts from backend
 */
function displayBackendAlerts(alerts) {
    elements.alertsSection.classList.remove('hidden');
    elements.alertsContainer.innerHTML = '';

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${alert.type.toLowerCase()}`;
        alertDiv.innerHTML = `
            <div class="alert-icon">${getAlertIcon(alert.type)}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div>${alert.message}</div>
            </div>
        `;
        elements.alertsContainer.appendChild(alertDiv);
    });
}

/**
 * Get alert icon based on type
 */
function getAlertIcon(type) {
    const icons = {
        'critical': '🔴',
        'warning': '🟠',
        'info': '🟢'
    };
    return icons[type] || '⚠️';
}

/**
 * Create or get farm
 */
async function createOrGetFarm() {
    try {
        const farmData = {
            farmer: state.farmerId || null,
            crop_type: state.farmer.cropType,
            area_name: state.location.areaName,
            latitude: parseFloat(state.location.latitude),
            longitude: parseFloat(state.location.longitude),
            planting_date: state.farmer.plantingDate,
            farm_size_acres: 5.0  // Default value
        };

        const farm = await apiService.createFarm(farmData);
        state.location.farmId = farm.id;
        return farm;
    } catch (error) {
        console.error('Farm creation failed:', error);
        // Use local storage as fallback
        state.location.farmId = 'local-' + Date.now();
        return null;
    }
}

/**
 * Check backend availability on page load
 */
async function checkBackendAvailability() {
    const health = await apiService.checkHealth();
    if (health) {
        console.log('✓ Backend is available:', health);
        document.querySelector('.header').insertAdjacentHTML('beforeend', 
            '<span style="color: #22C55E; margin-left: 1rem;">✓ Backend Connected</span>'
        );
    } else {
        console.warn('⚠ Backend is not available. Running in offline mode.');
        document.querySelector('.header').insertAdjacentHTML('beforeend', 
            '<span style="color: #FF8C00; margin-left: 1rem;">⚠ Offline Mode</span>'
        );
    }
}

/**
 * Enhanced initialization with backend integration
 */
function initBackendIntegration() {
    // Check backend health
    checkBackendAvailability();

    // Replace local analyze function with backend version
    const originalAnalyzeBtn = elements.analyzeBtn;
    if (originalAnalyzeBtn) {
        originalAnalyzeBtn.addEventListener('click', analyzeImageWithBackend);
    }

    // Handle farm confirmation with backend
    const confirmLocationBtn = document.getElementById('confirmLocation');
    if (confirmLocationBtn) {
        confirmLocationBtn.addEventListener('click', async () => {
            if (state.location.latitude && state.location.longitude) {
                state.location.confirmed = true;
                confirmLocationBtn.textContent = '✓ Location Confirmed';
                confirmLocationBtn.disabled = true;

                // Try to create farm in backend
                await createOrGetFarm();
                updateAnalyzeButtonState();
            }
        });
    }
}

// Initialize backend integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Run original init first
    if (typeof init === 'function') {
        init();
    }
    // Then add backend integration
    setTimeout(initBackendIntegration, 100);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CropGuardAPIService, apiService };
}
