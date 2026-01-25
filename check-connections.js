/**
 * Frontend Connection Verification Script
 * Tests API connectivity and external services from browser console
 * 
 * Usage: Include this file in your HTML or run in browser console
 * or use: node check-connections.js
 */

class ConnectionChecker {
    constructor() {
        this.results = {
            database: {},
            google: {},
            api: {},
            services: {}
        };
    }

    /**
     * Test API Backend Connection
     */
    async testBackendConnection() {
        console.log("=" .repeat(80));
        console.log("API BACKEND CONNECTION TEST");
        console.log("=" .repeat(80));
        
        const backendUrl = 'http://localhost:8000/api';
        
        try {
            const response = await fetch(`${backendUrl}/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                console.log("✅ Backend Server: CONNECTED");
                console.log(`Status: HTTP ${response.status}`);
                this.results.api.backend = {
                    status: '✅ Connected',
                    url: backendUrl,
                    statusCode: response.status
                };
            } else {
                console.log(`⚠️ Backend Server: HTTP ${response.status}`);
                this.results.api.backend = {
                    status: '⚠️ Error',
                    statusCode: response.status
                };
            }
        } catch (error) {
            console.log("❌ Backend Server: NOT CONNECTED");
            console.log(`Error: ${error.message}`);
            this.results.api.backend = {
                status: '❌ Failed',
                error: error.message
            };
        }
    }

    /**
     * Test API Endpoints
     */
    async testAPIEndpoints() {
        console.log("\n" + "=" .repeat(80));
        console.log("API ENDPOINTS TEST");
        console.log("=" .repeat(80));
        
        const endpoints = [
            { url: 'http://localhost:8000/api/auth/token/', method: 'POST', name: 'Authentication Token' },
            { url: 'http://localhost:8000/api/users/', method: 'GET', name: 'User Profile' },
            { url: 'http://localhost:8000/api/farms/', method: 'GET', name: 'Farms List' },
            { url: 'http://localhost:8000/api/disease-detection/', method: 'GET', name: 'Disease Detection' },
            { url: 'http://localhost:8000/api/weather/', method: 'GET', name: 'Weather Data' },
            { url: 'http://localhost:8000/api/alerts/', method: 'GET', name: 'Alerts' },
        ];
        
        this.results.api.endpoints = {};
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, {
                    method: endpoint.method,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
                
                const status = response.ok ? '✅' : '⚠️';
                console.log(`${status} ${endpoint.name}: HTTP ${response.status}`);
                
                this.results.api.endpoints[endpoint.name] = {
                    status: status,
                    statusCode: response.status
                };
            } catch (error) {
                console.log(`❌ ${endpoint.name}: ${error.message}`);
                this.results.api.endpoints[endpoint.name] = {
                    status: '❌',
                    error: error.message
                };
            }
        }
    }

    /**
     * Test Google Services Reachability
     */
    async testGoogleServices() {
        console.log("\n" + "=" .repeat(80));
        console.log("GOOGLE SERVICES CONNECTIVITY TEST");
        console.log("=" .repeat(80));
        
        const googleServices = [
            { url: 'https://maps.google.com', name: 'Google Maps' },
            { url: 'https://cloud.google.com', name: 'Google Cloud' },
            { url: 'https://firebase.google.com', name: 'Firebase' },
            { url: 'https://accounts.google.com', name: 'Google OAuth' },
            { url: 'https://www.googleapis.com', name: 'Google APIs' },
        ];
        
        this.results.google.services = {};
        
        for (const service of googleServices) {
            try {
                // Using no-cors mode for external services
                const response = await fetch(service.url, {
                    method: 'HEAD',
                    mode: 'no-cors'
                });
                
                console.log(`✅ ${service.name}: REACHABLE`);
                this.results.google.services[service.name] = {
                    status: '✅ Reachable'
                };
            } catch (error) {
                console.log(`❌ ${service.name}: UNREACHABLE - ${error.message}`);
                this.results.google.services[service.name] = {
                    status: '❌ Unreachable',
                    error: error.message
                };
            }
        }
    }

    /**
     * Test External APIs
     */
    async testExternalAPIs() {
        console.log("\n" + "=" .repeat(80));
        console.log("EXTERNAL SERVICES TEST");
        console.log("=" .repeat(80));
        
        const services = [
            { url: 'https://api.openweathermap.org/data/2.5/weather', name: 'OpenWeatherMap API' },
            { url: 'https://api.weatherapi.com/v1/current.json', name: 'WeatherAPI' },
            { url: 'https://nominatim.openstreetmap.org/reverse', name: 'OpenStreetMap' },
            { url: 'https://ipapi.co/json/', name: 'IP Geolocation' },
        ];
        
        this.results.services.external = {};
        
        for (const service of services) {
            try {
                const response = await fetch(service.url, {
                    method: 'GET',
                    mode: 'cors'
                });
                
                const status = response.ok ? '✅ Accessible' : `⚠️ ${response.status}`;
                console.log(`${status} - ${service.name}`);
                
                this.results.services.external[service.name] = {
                    status: status,
                    statusCode: response.status
                };
            } catch (error) {
                console.log(`❌ ${service.name}: ${error.message}`);
                this.results.services.external[service.name] = {
                    status: '❌ Error',
                    error: error.message
                };
            }
        }
    }

    /**
     * Test LocalStorage and Session
     */
    testLocalStorage() {
        console.log("\n" + "=" .repeat(80));
        console.log("LOCAL STORAGE & SESSION TEST");
        console.log("=" .repeat(80));
        
        // Check LocalStorage
        try {
            const testKey = 'connection_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            const value = localStorage.getItem(testKey);
            
            if (value === 'test') {
                console.log("✅ LocalStorage: WORKING");
                localStorage.removeItem(testKey);
                this.results.services.localStorage = '✅ Working';
            } else {
                console.log("❌ LocalStorage: FAILED");
                this.results.services.localStorage = '❌ Failed';
            }
        } catch (error) {
            console.log(`❌ LocalStorage: ${error.message}`);
            this.results.services.localStorage = '❌ Error';
        }
        
        // Check SessionStorage
        try {
            const testKey = 'session_test_' + Date.now();
            sessionStorage.setItem(testKey, 'test');
            const value = sessionStorage.getItem(testKey);
            
            if (value === 'test') {
                console.log("✅ SessionStorage: WORKING");
                sessionStorage.removeItem(testKey);
                this.results.services.sessionStorage = '✅ Working';
            } else {
                console.log("❌ SessionStorage: FAILED");
                this.results.services.sessionStorage = '❌ Failed';
            }
        } catch (error) {
            console.log(`❌ SessionStorage: ${error.message}`);
            this.results.services.sessionStorage = '❌ Error';
        }
    }

    /**
     * Test Authentication Status
     */
    testAuthenticationStatus() {
        console.log("\n" + "=" .repeat(80));
        console.log("AUTHENTICATION STATUS");
        console.log("=" .repeat(80));
        
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userEmail = localStorage.getItem('user_email');
        
        if (accessToken) {
            console.log("✅ Access Token: PRESENT");
            console.log(`Token Length: ${accessToken.length} characters`);
            this.results.services.accessToken = '✅ Present';
        } else {
            console.log("⚠️ Access Token: NOT FOUND (User not logged in)");
            this.results.services.accessToken = '⚠️ Not Found';
        }
        
        if (refreshToken) {
            console.log("✅ Refresh Token: PRESENT");
            this.results.services.refreshToken = '✅ Present';
        } else {
            console.log("⚠️ Refresh Token: NOT FOUND");
            this.results.services.refreshToken = '⚠️ Not Found';
        }
        
        if (userEmail) {
            console.log(`✅ User Email: ${userEmail}`);
            this.results.services.userEmail = userEmail;
        } else {
            console.log("⚠️ User Email: NOT STORED");
        }
    }

    /**
     * Generate Summary Report
     */
    generateSummary() {
        console.log("\n" + "=" .repeat(80));
        console.log("SUMMARY REPORT");
        console.log("=" .repeat(80));
        
        console.log("\n📊 CONNECTION STATUS OVERVIEW:");
        console.log(`Backend API: ${this.results.api.backend?.status || 'Unknown'}`);
        console.log(`Local Storage: ${this.results.services.localStorage || 'Unknown'}`);
        console.log(`Authentication: ${this.results.services.accessToken || 'Not logged in'}`);
        
        console.log("\n📋 FULL RESULTS OBJECT:");
        console.log(JSON.stringify(this.results, null, 2));
        
        console.log("\n" + "=" .repeat(80));
        console.log("✅ CONNECTION VERIFICATION COMPLETE");
        console.log("=" .repeat(80));
    }

    /**
     * Run All Tests
     */
    async runAll() {
        console.clear();
        console.log("🔍 Starting Connection Verification...\n");
        
        await this.testBackendConnection();
        await this.testAPIEndpoints();
        await this.testGoogleServices();
        await this.testExternalAPIs();
        this.testLocalStorage();
        this.testAuthenticationStatus();
        this.generateSummary();
        
        return this.results;
    }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    window.connectionChecker = new ConnectionChecker();
    console.log("ConnectionChecker available as: window.connectionChecker");
    console.log("Run: connectionChecker.runAll() to test all connections");
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConnectionChecker;
}
