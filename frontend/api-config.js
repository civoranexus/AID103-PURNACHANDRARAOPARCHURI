/**
 * Frontend API Configuration
 * Centralized API endpoint management for all frontend applications
 */

const API_CONFIG = {
    // Django REST API Base URL
    DJANGO_API: 'http://127.0.0.1:8000/api',
    
    // Flask ML Model API Base URL
    FLASK_API: 'http://127.0.0.1:5000',
    
    // Authentication Endpoints
    AUTH: {
        REGISTER: '/auth/register/',
        LOGIN: '/auth/token/',
        REFRESH: '/auth/token/refresh/',
        LOGOUT: '/auth/logout/',
        PROFILE: '/profile/',
    },
    
    // Farm Management
    FARMS: {
        LIST: '/farms/',
        DETAIL: (id) => `/farms/${id}/`,
        CREATE: '/farms/',
        UPDATE: (id) => `/farms/${id}/`,
        DELETE: (id) => `/farms/${id}/`,
    },
    
    // Disease Detection
    DISEASE: {
        LIST: '/detections/',
        DETAIL: (id) => `/detections/${id}/`,
        CREATE: '/detections/',
        UPLOAD: '/photos/upload/',
        PREDICT: '/disease-detection/',
    },
    
    // Weather Data
    WEATHER: {
        LIST: '/weather/',
        DETAIL: (id) => `/weather/${id}/`,
        CREATE: '/weather/',
    },
    
    // Alerts
    ALERTS: {
        LIST: '/alerts/',
        DETAIL: (id) => `/alerts/${id}/`,
        CREATE: '/alerts/',
        MARK_READ: (id) => `/alerts/${id}/mark_as_read/`,
    },
    
    // Market Prices
    MARKET: {
        LIST: '/market-prices/',
        DETAIL: (id) => `/market-prices/${id}/`,
    },
    
    // Recommendations
    RECOMMENDATIONS: {
        LIST: '/recommendations/',
        DETAIL: (id) => `/recommendations/${id}/`,
    },
    
    // Pest Records
    PESTS: {
        LIST: '/pests/',
        DETAIL: (id) => `/pests/${id}/`,
        CREATE: '/pests/',
    },
    
    // Irrigation Schedule
    IRRIGATION: {
        LIST: '/irrigation/',
        DETAIL: (id) => `/irrigation/${id}/`,
        CREATE: '/irrigation/',
    },
    
    // ML Model Endpoints (Flask)
    ML: {
        PREDICT: '/predict',
        GRADCAM: '/gradcam',
    }
};

/**
 * API Helper Class for making requests
 */
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.DJANGO_API;
        this.token = this.getToken();
        this.refreshToken = this.getRefreshToken();
    }
    
    /**
     * Get stored authentication token
     */
    getToken() {
        return localStorage.getItem('access_token');
    }
    
    /**
     * Get stored refresh token
     */
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }
    
    /**
     * Set authentication tokens
     */
    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        this.token = accessToken;
        this.refreshToken = refreshToken;
    }
    
    /**
     * Clear authentication tokens
     */
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        this.token = null;
        this.refreshToken = null;
    }
    
    /**
     * Get headers with authentication
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    /**
     * Make GET request
     */
    async get(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(options.auth !== false),
                ...options
            });
            
            if (response.status === 401 && this.refreshToken) {
                // Try to refresh token
                await this.refreshAccessToken();
                return this.get(endpoint, options); // Retry
            }
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * Make POST request
     */
    async post(endpoint, data = {}, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(options.auth !== false),
                body: JSON.stringify(data),
                ...options
            });
            
            if (response.status === 401 && this.refreshToken) {
                await this.refreshAccessToken();
                return this.post(endpoint, data, options); // Retry
            }
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error posting to ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * Make PUT request
     */
    async put(endpoint, data = {}, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(options.auth !== false),
                body: JSON.stringify(data),
                ...options
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error updating ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * Make PATCH request
     */
    async patch(endpoint, data = {}, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(options.auth !== false),
                body: JSON.stringify(data),
                ...options
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error patching ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * Make DELETE request
     */
    async delete(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(options.auth !== false),
                ...options
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error deleting ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * Upload file to endpoint
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const formData = new FormData();
        formData.append('image', file);
        
        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error uploading to ${url}:`, error);
            throw error;
        }
    }
    
    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.AUTH.REFRESH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: this.refreshToken })
            });
            
            const data = await response.json();
            if (response.ok && data.access) {
                this.setTokens(data.access, this.refreshToken);
                return true;
            } else {
                this.clearTokens();
                window.location.href = '/auth.html'; // Redirect to login
                return false;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.clearTokens();
            window.location.href = '/auth.html';
            return false;
        }
    }
    
    /**
     * Handle API response
     */
    async handleResponse(response) {
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            const error = new Error(data.detail || `HTTP Error ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        
        return data;
    }
    
    /**
     * Register user
     */
    async register(username, email, password, firstName = '', lastName = '') {
        return this.post(API_CONFIG.AUTH.REGISTER, {
            username,
            email,
            password,
            first_name: firstName,
            last_name: lastName
        }, { auth: false });
    }
    
    /**
     * Login user
     */
    async login(email, password) {
        const response = await this.post(API_CONFIG.AUTH.LOGIN, {
            email,
            password
        }, { auth: false });
        
        if (response.access && response.refresh) {
            this.setTokens(response.access, response.refresh);
        }
        
        return response;
    }
    
    /**
     * Logout user
     */
    logout() {
        this.clearTokens();
    }
    
    /**
     * Get current user profile
     */
    async getProfile() {
        return this.get(API_CONFIG.AUTH.PROFILE);
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }
}

/**
 * ML API Client for Flask endpoints
 */
class MLAPIClient {
    constructor() {
        this.baseURL = API_CONFIG.FLASK_API;
    }
    
    /**
     * Predict disease from image
     */
    async predictDisease(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.ML.PREDICT}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`ML API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error predicting disease:', error);
            throw error;
        }
    }
    
    /**
     * Get GradCAM visualization
     */
    async getGradCAM(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
            const response = await fetch(`${this.baseURL}${API_CONFIG.ML.GRADCAM}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`ML API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting GradCAM:', error);
            throw error;
        }
    }
}

// Export instances for use in other files
const api = new APIClient();
const mlApi = new MLAPIClient();

// Make available globally
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.api = api;
    window.mlApi = mlApi;
    window.APIClient = APIClient;
    window.MLAPIClient = MLAPIClient;
}
