/**
 * CropGuard AI - Connection Verification Tool
 * Run this in browser console or as part of frontend initialization
 * Opens browser console to see results
 */

class ConnectionVerifier {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                passed: 0,
                failed: 0,
                total: 0
            }
        };
    }
    
    /**
     * Log test result
     */
    logTest(name, status, message = '') {
        const result = {
            name,
            status,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.results.tests.push(result);
        this.results.summary.total++;
        
        if (status === 'passed') {
            this.results.summary.passed++;
            console.log(`✓ ${name}: ${message}`);
        } else if (status === 'failed') {
            this.results.summary.failed++;
            console.error(`✗ ${name}: ${message}`);
        } else {
            console.warn(`⚠ ${name}: ${message}`);
        }
    }
    
    /**
     * Test API configuration is loaded
     */
    testAPIConfig() {
        try {
            if (typeof API_CONFIG === 'undefined') {
                this.logTest('API Config', 'failed', 'API_CONFIG not loaded - include api-config.js');
                return false;
            }
            
            if (!API_CONFIG.DJANGO_API) {
                this.logTest('API Config', 'failed', 'DJANGO_API endpoint not configured');
                return false;
            }
            
            if (!API_CONFIG.FLASK_API) {
                this.logTest('API Config', 'failed', 'FLASK_API endpoint not configured');
                return false;
            }
            
            this.logTest('API Config', 'passed', `Django: ${API_CONFIG.DJANGO_API}, Flask: ${API_CONFIG.FLASK_API}`);
            return true;
        } catch (error) {
            this.logTest('API Config', 'failed', error.message);
            return false;
        }
    }
    
    /**
     * Test Django API connectivity
     */
    async testDjangoAPI() {
        try {
            const response = await fetch(`${API_CONFIG.DJANGO_API}/farms/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.status === 401) {
                // Unauthorized is OK - means API is running but we need auth
                this.logTest('Django API', 'passed', 'API running (requires authentication)');
                return true;
            }
            
            if (response.ok || response.status === 404) {
                this.logTest('Django API', 'passed', `API responding (Status: ${response.status})`);
                return true;
            }
            
            this.logTest('Django API', 'failed', `Status: ${response.status}`);
            return false;
        } catch (error) {
            this.logTest('Django API', 'failed', `${error.message} - Ensure Django server is running on ${API_CONFIG.DJANGO_API}`);
            return false;
        }
    }
    
    /**
     * Test Flask ML API connectivity
     */
    async testFlaskAPI() {
        try {
            const response = await fetch(`${API_CONFIG.FLASK_API}/health`, {
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.logTest('Flask ML API', 'passed', `API running - Model loaded: ${data.model_loaded}`);
                return true;
            }
            
            this.logTest('Flask ML API', 'failed', `Status: ${response.status}`);
            return false;
        } catch (error) {
            this.logTest('Flask ML API', 'failed', `${error.message} - Ensure Flask server is running on ${API_CONFIG.FLASK_API}`);
            return false;
        }
    }
    
    /**
     * Test CORS configuration
     */
    async testCORSSupport() {
        try {
            // Test if Django responds to OPTIONS request
            const response = await fetch(`${API_CONFIG.DJANGO_API}/farms/`, {
                method: 'OPTIONS',
                headers: {
                    'Origin': window.location.origin
                }
            });
            
            if (response.ok || response.status === 401) {
                this.logTest('CORS Support', 'passed', 'Django CORS configured correctly');
                return true;
            }
            
            this.logTest('CORS Support', 'warning', `CORS may not be fully configured (Status: ${response.status})`);
            return true; // Warning, not failure
        } catch (error) {
            this.logTest('CORS Support', 'warning', error.message);
            return true; // Warning, not failure
        }
    }
    
    /**
     * Test local storage
     */
    testLocalStorage() {
        try {
            localStorage.setItem('test', 'value');
            const value = localStorage.getItem('test');
            localStorage.removeItem('test');
            
            if (value === 'value') {
                this.logTest('Local Storage', 'passed', 'Working correctly');
                return true;
            }
            
            this.logTest('Local Storage', 'failed', 'Unable to store/retrieve data');
            return false;
        } catch (error) {
            this.logTest('Local Storage', 'failed', error.message);
            return false;
        }
    }
    
    /**
     * Test database (check for tables)
     */
    async testDatabase() {
        try {
            // Try to fetch farms data to verify database
            const response = await fetch(`${API_CONFIG.DJANGO_API}/farms/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 401) {
                this.logTest('Database', 'passed', 'Database connection working (requires authentication)');
                return true;
            }
            
            if (response.ok) {
                const data = await response.json();
                this.logTest('Database', 'passed', `Database accessible - ${data.count || 0} farms found`);
                return true;
            }
            
            this.logTest('Database', 'failed', `Database query failed (Status: ${response.status})`);
            return false;
        } catch (error) {
            this.logTest('Database', 'failed', error.message);
            return false;
        }
    }
    
    /**
     * Run all tests
     */
    async runAll() {
        console.clear();
        console.log('\n' + '='.repeat(50));
        console.log('CropGuard AI - Connection Verification');
        console.log('='.repeat(50) + '\n');
        
        // Sequential tests
        this.testAPIConfig();
        this.testLocalStorage();
        
        // Async tests
        await this.testDjangoAPI();
        await this.testFlaskAPI();
        await this.testCORSSupport();
        await this.testDatabase();
        
        // Print summary
        this.printSummary();
        
        return this.results;
    }
    
    /**
     * Print test summary
     */
    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('Test Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`✓ Passed: ${this.results.summary.passed}`);
        console.log(`✗ Failed: ${this.results.summary.failed}`);
        console.log(`Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50) + '\n');
        
        // Print detailed results
        console.log('Detailed Results:');
        this.results.tests.forEach(test => {
            const icon = test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '⚠';
            console.log(`${icon} ${test.name}: ${test.message}`);
        });
        
        console.log('\n' + '='.repeat(50));
        if (this.results.summary.failed === 0) {
            console.log('✓ All systems operational!');
        } else {
            console.log(`✗ ${this.results.summary.failed} issue(s) detected. See above for details.`);
        }
        console.log('='.repeat(50) + '\n');
    }
    
    /**
     * Get results as JSON
     */
    getResults() {
        return this.results;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ConnectionVerifier = ConnectionVerifier;
    window.verifier = null; // Will be set when initialized
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Type "verifier.runAll()" in console to run connection tests');
    });
} else {
    console.log('Type "verifier.runAll()" in console to run connection tests');
}
