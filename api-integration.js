/**
 * CropGuard AI - API Integration Service
 * Handles all communication with Django REST API backend
 */

class CropGuardAPI {
    constructor(baseUrl = window.API_BASE_URL || 'http://localhost:8001/api') {
        this.baseUrl = baseUrl;
        this.accessToken = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
        this.isRefreshing = false;
    }

    /**
     * Get authorization headers
     */
    getHeaders(includeAuth = true, isMultipart = false) {
        const headers = {};
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
        if (includeAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        return headers;
    }

    /**
     * Generic API request handler
     */
    async request(endpoint, method = 'GET', body = null, includeAuth = true, isMultipart = false) {
        try {
            const options = {
                method,
                headers: this.getHeaders(includeAuth, isMultipart)
            };

            if (body) {
                options.body = isMultipart ? body : JSON.stringify(body);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);

            // Handle token expiry
            if (response.status === 401 && includeAuth && !this.isRefreshing) {
                this.isRefreshing = true;
                await this.refreshAccessToken();
                this.isRefreshing = false;
                return this.request(endpoint, method, body, includeAuth, isMultipart);
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || error.message || `HTTP ${response.status}`);
            }

            if (response.status === 204) return null;
            return await response.json();

        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            throw error;
        }
    }

    // ================= AUTH =================

    async register(userData) {
        return this.request('/auth/register/', 'POST', userData, false);
    }

    async login(email, password) {
        const response = await this.request('/auth/token/', 'POST', { email, password }, false);

        if (response.access && response.refresh) {
            this.accessToken = response.access;
            this.refreshToken = response.refresh;
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
        }
        return response;
    }

    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.clear();
    }

    async refreshAccessToken() {
        try {
            const response = await this.request(
                '/auth/token/refresh/',
                'POST',
                { refresh: this.refreshToken },
                false
            );
            this.accessToken = response.access;
            localStorage.setItem('access_token', response.access);
            return response;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    // ================= PROFILE =================

    async getUserProfile() {
        return this.request('/profile/me/');
    }

    async updateUserProfile(data) {
        return this.request('/profile/me/', 'PATCH', data);
    }

    async getUserStatistics() {
        return this.request('/profile/statistics/');
    }

    // ================= FARMS =================

    async getFarms(page = 1, size = 20) {
        return this.request(`/farms/?page=${page}&page_size=${size}`);
    }

    async createFarm(data) {
        return this.request('/farms/', 'POST', data);
    }

    async updateFarm(id, data) {
        return this.request(`/farms/${id}/`, 'PATCH', data);
    }

    async deleteFarm(id) {
        return this.request(`/farms/${id}/`, 'DELETE');
    }

    // ================= DETECTIONS =================

    async getDetections(page = 1, size = 20) {
        return this.request(`/detections/?page=${page}&page_size=${size}`);
    }

    async getDetection(id) {
        return this.request(`/detections/${id}/`);
    }

    async confirmDetection(id, isCorrect) {
        return this.request(`/detections/${id}/confirm/`, 'POST', { is_correct: isCorrect });
    }

    async provideFeedback(id, feedback) {
        return this.request(`/detections/${id}/feedback/`, 'POST', feedback);
    }

    /**
     * Upload image for AI disease detection
     */
    async uploadImageForAnalysis(file, farmId, notes = '') {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('farm', farmId);
        formData.append('notes', notes);

        return this.request(
            '/detections/',
            'POST',
            formData,
            true,
            true
        );
    }

    // ================= ALERTS =================

    async getAlerts(page = 1, size = 20) {
        return this.request(`/alerts/?page=${page}&page_size=${size}`);
    }

    async markAlertAsRead(id) {
        return this.request(`/alerts/${id}/mark_read/`, 'POST');
    }

    async markAllAlertsAsRead() {
        return this.request('/alerts/mark_all_read/', 'POST');
    }

    // ================= MARKET =================

    async getMarketPrices(page = 1, size = 20) {
        return this.request(`/market-prices/?page=${page}&page_size=${size}`);
    }

    async getTrendingPrices() {
        return this.request('/market-prices/trending/');
    }

    // ================= SEARCH =================

    async searchFarms(query) {
        return this.request(`/farms/?search=${encodeURIComponent(query)}`);
    }

    async filterDetections(disease) {
        return this.request(`/detections/?detected_disease=${encodeURIComponent(disease)}`);
    }
}

// Global instance
const cropGuardAPI = new CropGuardAPI();
