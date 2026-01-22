/**
 * CropGuard AI - API Integration Service
 * Handles all communication with Django REST API backend
 * 
 * API Base URL: http://localhost:8000/api/
 * JWT Authentication required for most endpoints
 */

class CropGuardAPI {
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
        this.isAuthenticated = !!this.accessToken;
    }

    /**
     * Get authorization headers with JWT token
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (includeAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return headers;
    }

    /**
     * Make API request with error handling
     */
    async request(endpoint, method = 'GET', body = null, includeAuth = true) {
        try {
            const options = {
                method,
                headers: this.getHeaders(includeAuth),
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);

            // Handle 401 Unauthorized - token expired
            if (response.status === 401 && includeAuth) {
                await this.refreshAccessToken();
                return this.request(endpoint, method, body, includeAuth);
            }

            // Handle other errors
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || error.message || `HTTP ${response.status}`);
            }

            // Empty response (204 No Content)
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // ==================== AUTHENTICATION ====================

    /**
     * Register new user account
     */
    async register(userData) {
        return this.request('/auth/register/', 'POST', userData, false);
    }

    /**
     * Login with email and password
     */
    async login(email, password) {
        const response = await this.request('/auth/token/', 'POST', {
            email,
            password
        }, false);

        if (response.access && response.refresh) {
            this.accessToken = response.access;
            this.refreshToken = response.refresh;
            this.isAuthenticated = true;

            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
        }

        return response;
    }

    /**
     * Logout user
     */
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken() {
        try {
            const response = await this.request('/auth/token/refresh/', 'POST', {
                refresh: this.refreshToken
            }, false);

            this.accessToken = response.access;
            localStorage.setItem('access_token', response.access);
            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            throw error;
        }
    }

    // ==================== USER PROFILE ====================

    /**
     * Get current user profile
     */
    async getUserProfile() {
        return this.request('/profile/me/');
    }

    /**
     * Update current user profile
     */
    async updateUserProfile(profileData) {
        return this.request('/profile/me/', 'PATCH', profileData);
    }

    /**
     * Get user statistics (farms, analyses, etc.)
     */
    async getUserStatistics() {
        return this.request('/profile/statistics/');
    }

    // ==================== FARMS ====================

    /**
     * Get all user farms with pagination
     */
    async getFarms(page = 1, pageSize = 20) {
        return this.request(`/farms/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single farm details
     */
    async getFarm(farmId) {
        return this.request(`/farms/${farmId}/`);
    }

    /**
     * Create new farm
     */
    async createFarm(farmData) {
        return this.request('/farms/', 'POST', farmData);
    }

    /**
     * Update farm details
     */
    async updateFarm(farmId, farmData) {
        return this.request(`/farms/${farmId}/`, 'PATCH', farmData);
    }

    /**
     * Delete farm
     */
    async deleteFarm(farmId) {
        return this.request(`/farms/${farmId}/`, 'DELETE');
    }

    /**
     * Get farm analytics (performance metrics)
     */
    async getFarmAnalytics(farmId) {
        return this.request(`/farms/${farmId}/analytics/`);
    }

    /**
     * Get farm weather data
     */
    async getFarmWeather(farmId) {
        return this.request(`/farms/${farmId}/weather/`);
    }

    /**
     * Fetch and update weather data from OpenWeatherMap
     */
    async fetchWeatherData(farmId) {
        return this.request(`/farms/${farmId}/fetch_weather/`, 'POST');
    }

    /**
     * Get recent disease detections for farm
     */
    async getRecentDetections(farmId) {
        return this.request(`/farms/${farmId}/recent_detections/`);
    }

    // ==================== DISEASE DETECTION ====================

    /**
     * Get all disease detections with pagination
     */
    async getDetections(page = 1, pageSize = 20) {
        return this.request(`/detections/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single detection details
     */
    async getDetection(detectionId) {
        return this.request(`/detections/${detectionId}/`);
    }

    /**
     * Create new disease detection (analysis)
     */
    async createDetection(detectionData) {
        return this.request('/detections/', 'POST', detectionData);
    }

    /**
     * Confirm disease detection accuracy
     */
    async confirmDetection(detectionId, isCorrect) {
        return this.request(`/detections/${detectionId}/confirm/`, 'POST', {
            is_correct: isCorrect
        });
    }

    /**
     * Provide feedback on detection
     */
    async provideFeedback(detectionId, feedbackData) {
        return this.request(`/detections/${detectionId}/feedback/`, 'POST', feedbackData);
    }

    // ==================== WEATHER ====================

    /**
     * Get weather data with pagination
     */
    async getWeatherData(page = 1, pageSize = 20) {
        return this.request(`/weather/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single weather record
     */
    async getWeather(weatherId) {
        return this.request(`/weather/${weatherId}/`);
    }

    // ==================== ALERTS ====================

    /**
     * Get user alerts with pagination
     */
    async getAlerts(page = 1, pageSize = 20) {
        return this.request(`/alerts/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single alert
     */
    async getAlert(alertId) {
        return this.request(`/alerts/${alertId}/`);
    }

    /**
     * Get unread alerts count
     */
    async getUnreadAlerts() {
        return this.request('/alerts/unread/');
    }

    /**
     * Mark single alert as read
     */
    async markAlertAsRead(alertId) {
        return this.request(`/alerts/${alertId}/mark_read/`, 'POST');
    }

    /**
     * Mark all alerts as read
     */
    async markAllAlertsAsRead() {
        return this.request('/alerts/mark_all_read/', 'POST');
    }

    // ==================== MARKET PRICES ====================

    /**
     * Get market prices with pagination
     */
    async getMarketPrices(page = 1, pageSize = 20) {
        return this.request(`/market-prices/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single market price record
     */
    async getMarketPrice(priceId) {
        return this.request(`/market-prices/${priceId}/`);
    }

    /**
     * Get trending market prices
     */
    async getTrendingPrices() {
        return this.request('/market-prices/trending/');
    }

    // ==================== FARMING RECOMMENDATIONS ====================

    /**
     * Get farming recommendations with pagination
     */
    async getRecommendations(page = 1, pageSize = 20) {
        return this.request(`/recommendations/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single recommendation
     */
    async getRecommendation(recId) {
        return this.request(`/recommendations/${recId}/`);
    }

    /**
     * Mark recommendation as applied
     */
    async applyRecommendation(recId) {
        return this.request(`/recommendations/${recId}/apply/`, 'POST');
    }

    // ==================== FARM ANALYTICS ====================

    /**
     * Get farm analytics data
     */
    async getAnalytics(page = 1, pageSize = 20) {
        return this.request(`/analytics/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single farm analytics
     */
    async getAnalytic(analyticsId) {
        return this.request(`/analytics/${analyticsId}/`);
    }

    // ==================== PEST MANAGEMENT ====================

    /**
     * Get pest records with pagination
     */
    async getPestRecords(page = 1, pageSize = 20) {
        return this.request(`/pests/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single pest record
     */
    async getPestRecord(pestId) {
        return this.request(`/pests/${pestId}/`);
    }

    /**
     * Create new pest record
     */
    async createPestRecord(pestData) {
        return this.request('/pests/', 'POST', pestData);
    }

    /**
     * Update pest record
     */
    async updatePestRecord(pestId, pestData) {
        return this.request(`/pests/${pestId}/`, 'PATCH', pestData);
    }

    /**
     * Delete pest record
     */
    async deletePestRecord(pestId) {
        return this.request(`/pests/${pestId}/`, 'DELETE');
    }

    // ==================== IRRIGATION ====================

    /**
     * Get irrigation schedules with pagination
     */
    async getIrrigationSchedules(page = 1, pageSize = 20) {
        return this.request(`/irrigation/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single irrigation schedule
     */
    async getIrrigationSchedule(irrigationId) {
        return this.request(`/irrigation/${irrigationId}/`);
    }

    /**
     * Create new irrigation schedule
     */
    async createIrrigationSchedule(scheduleData) {
        return this.request('/irrigation/', 'POST', scheduleData);
    }

    /**
     * Update irrigation schedule
     */
    async updateIrrigationSchedule(irrigationId, scheduleData) {
        return this.request(`/irrigation/${irrigationId}/`, 'PATCH', scheduleData);
    }

    /**
     * Get upcoming irrigation schedules
     */
    async getUpcomingIrrigations() {
        return this.request('/irrigation/upcoming/');
    }

    /**
     * Mark irrigation as completed
     */
    async completeIrrigation(irrigationId) {
        return this.request(`/irrigation/${irrigationId}/complete/`, 'POST');
    }

    // ==================== ACTIVITY LOGS ====================

    /**
     * Get activity logs with pagination
     */
    async getActivityLogs(page = 1, pageSize = 20) {
        return this.request(`/activity-logs/?page=${page}&page_size=${pageSize}`);
    }

    /**
     * Get single activity log
     */
    async getActivityLog(logId) {
        return this.request(`/activity-logs/${logId}/`);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Upload image file and create detection
     */
    async uploadImageForAnalysis(file, farmId, notes = '') {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('farm', farmId);
        formData.append('notes', notes);

        return fetch(`${this.baseUrl}/detections/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: formData
        }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        }).catch(error => {
            console.error('Upload error:', error);
            throw error;
        });
    }

    /**
     * Search farms by name or crop type
     */
    async searchFarms(query) {
        return this.request(`/farms/?search=${encodeURIComponent(query)}`);
    }

    /**
     * Filter detections by disease type
     */
    async filterDetections(disease) {
        return this.request(`/detections/?detected_disease=${encodeURIComponent(disease)}`);
    }

    /**
     * Get crops available for a region
     */
    async getAvailableCrops(region) {
        return this.request(`/farms/?region=${encodeURIComponent(region)}`);
    }
}

// Create global API instance
const cropGuardAPI = new CropGuardAPI();

/**
 * Export for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CropGuardAPI;
}
