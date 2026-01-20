/* ============================================
   CROPGUARD AI - JAVASCRIPT ENGINE
   Civora Nexus Pvt. Ltd. - CivoraX Program
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    farmer: {
        name: '',
        cropType: '',
        plantingDate: ''
    },
    location: {
        latitude: null,
        longitude: null,
        areaName: '',
        confirmed: false
    },
    image: {
        source: '', // 'upload' or 'url'
        data: null,
        file: null,
        url: ''
    },
    analysis: {
        disease: '',
        severity: '',
        confidence: '',
        possibleCause: '',
        affectedRegion: null
    }
};

// ============================================
// DISEASE DATABASE (Context-Aware AI Simulation)
// ============================================
const diseaseDatabase = {
    wheat: {
        diseases: [
            { name: 'Powdery Mildew', severity: 'low', cause: 'Fungal infection in dry conditions', chemical: 'Sulfur dust', organic: 'Neem oil spray', preventive: 'Improve air circulation' },
            { name: 'Leaf Rust', severity: 'high', cause: 'Puccinia triticina fungus', chemical: 'Propiconazole', organic: 'Bacillus subtilis', preventive: 'Plant resistant varieties' },
            { name: 'Septoria Nodorum', severity: 'medium', cause: 'Fungal disease in humid weather', chemical: 'Tebuconazole', organic: 'Trichoderma', preventive: 'Reduce plant density' }
        ]
    },
    rice: {
        diseases: [
            { name: 'Blast Disease', severity: 'high', cause: 'Magnaporthe oryzae fungus', chemical: 'Tricyclazole', organic: 'Pseudomonas fluorescens', preventive: 'Use blast-resistant seeds' },
            { name: 'Brown Spot', severity: 'medium', cause: 'Cochliobolus miyabeanus', chemical: 'Mancozeb', organic: 'Seed treatment with organic fungicide', preventive: 'Field sanitation' },
            { name: 'Sheath Blight', severity: 'medium', cause: 'Rhizoctonia solani', chemical: 'Validamycin A', organic: 'Bacillus subtilis', preventive: 'Avoid excess nitrogen' }
        ]
    },
    corn: {
        diseases: [
            { name: 'Southern Corn Leaf Blight', severity: 'high', cause: 'Cochliobolus heterostrophus', chemical: 'Azoxystrobin', organic: 'Copper fungicide', preventive: 'Crop rotation' },
            { name: 'Gray Leaf Spot', severity: 'medium', cause: 'Cercospora zeae-maydis', chemical: 'Propiconazole', organic: 'Neem oil', preventive: 'Plant resistant hybrids' },
            { name: 'Common Rust', severity: 'low', cause: 'Puccinia sorghi', chemical: 'Sulfur', organic: 'Organic sulfur dust', preventive: 'Monitor field regularly' }
        ]
    },
    cotton: {
        diseases: [
            { name: 'Leaf Curl Virus', severity: 'high', cause: 'Whitefly vector transmission', chemical: 'Acephate + Imidacloprid', organic: 'Spinosad + insecticidal soap', preventive: 'Eliminate volunteer plants' },
            { name: 'Fusarium Wilt', severity: 'high', cause: 'Fusarium vasinfectum', chemical: 'Carbendazim', organic: 'Trichoderma viride', preventive: 'Plant resistant varieties' },
            { name: 'Alternaria Leaf Spot', severity: 'medium', cause: 'Alternaria alternata', chemical: 'Mancozeb', organic: 'Bacillus', preventive: 'Improve drainage' }
        ]
    },
    potato: {
        diseases: [
            { name: 'Late Blight', severity: 'high', cause: 'Phytophthora infestans', chemical: 'Metalaxyl + Chlorothalonil', organic: 'Bacillus subtilis', preventive: 'Use certified seeds' },
            { name: 'Early Blight', severity: 'medium', cause: 'Alternaria solani', chemical: 'Mancozeb', organic: 'Copper sulfate', preventive: 'Remove infected leaves' },
            { name: 'Scab', severity: 'low', cause: 'Streptomyces scabies', chemical: 'Thiram', organic: 'Sulfur dust', preventive: 'Adjust soil pH' }
        ]
    },
    tomato: {
        diseases: [
            { name: 'Early Blight', severity: 'medium', cause: 'Alternaria solani', chemical: 'Chlorothalonil', organic: 'Bacillus subtilis', preventive: 'Remove lower leaves' },
            { name: 'Late Blight', severity: 'high', cause: 'Phytophthora infestans', chemical: 'Metalaxyl', organic: 'Pseudomonas', preventive: 'Improve air circulation' },
            { name: 'Septoria Leaf Spot', severity: 'medium', cause: 'Septoria lycopersici', chemical: 'Mancozeb', organic: 'Neem oil', preventive: 'Sanitize tools' }
        ]
    },
    sugarcane: {
        diseases: [
            { name: 'Red Rot', severity: 'high', cause: 'Colletotrichum falcatum', chemical: 'Thiram', organic: 'Bacillus', preventive: 'Use healthy seeds' },
            { name: 'Smut Disease', severity: 'medium', cause: 'Ustilago scitaminea', chemical: 'Carboxin', organic: 'Seed treatment', preventive: 'Hot water treatment' },
            { name: 'Eyespot', severity: 'low', cause: 'Drechslera sacchari', chemical: 'Carbendazim', organic: 'Copper fungicide', preventive: 'Field sanitation' }
        ]
    }
};

// Location database for area names
const locationDatabase = {
    'north': { areas: ['Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir'] },
    'east': { areas: ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal', 'Assam'] },
    'west': { areas: ['Gujarat', 'Maharashtra', 'Rajasthan', 'Goa', 'Kerala'] },
    'south': { areas: ['Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh'] },
    'central': { areas: ['Madhya Pradesh', 'Chhattisgarh', 'Uttar Pradesh'] }
};

// ============================================
// DOM ELEMENT REFERENCES
// ============================================
const elements = {
    // Farm details
    farmerName: document.getElementById('farmerName'),
    cropType: document.getElementById('cropType'),
    plantingDate: document.getElementById('plantingDate'),

    // Location
    mapCanvas: document.getElementById('mapCanvas'),
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut'),
    resetMap: document.getElementById('resetMap'),
    latValue: document.getElementById('latValue'),
    lonValue: document.getElementById('lonValue'),
    areaName: document.getElementById('areaName'),
    confirmLocation: document.getElementById('confirmLocation'),

    // Image input
    uploadArea: document.getElementById('uploadArea'),
    imageUpload: document.getElementById('imageUpload'),
    imageUrl: document.getElementById('imageUrl'),
    fetchImage: document.getElementById('fetchImage'),
    previewImage: document.getElementById('previewImage'),
    noImagePlaceholder: document.getElementById('noImagePlaceholder'),
    toggleButtons: document.querySelectorAll('.toggle-btn'),

    // Analysis
    analyzeBtn: document.getElementById('analyzeBtn'),
    visualizationContainer: document.getElementById('visualizationContainer'),
    detectionCanvas: document.getElementById('detectionCanvas'),

    // Report & Results
    aiReportSection: document.getElementById('aiReportSection'),
    diseaseDetected: document.getElementById('diseaseDetected'),
    severityLevel: document.getElementById('severityLevel'),
    confidence: document.getElementById('confidence'),
    possibleCause: document.getElementById('possibleCause'),

    // Recommendations
    recommendationsSection: document.getElementById('recommendationsSection'),
    chemicalTreatment: document.getElementById('chemicalTreatment'),
    organicAlternatives: document.getElementById('organicAlternatives'),
    preventivePractices: document.getElementById('preventivePractices'),

    // Alerts
    alertsSection: document.getElementById('alertsSection'),
    alertsContainer: document.getElementById('alertsContainer')
};

// ============================================
// MAP MODULE - GOOGLE EARTH-LIKE INTERACTION
// ============================================
class MapModule {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.selectedPoint = null;
        this.gridSize = 50;
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.draw();
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleMapClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleZoom(e), { passive: false });

        elements.zoomIn.addEventListener('click', () => {
            this.zoom *= 1.2;
            this.draw();
        });

        elements.zoomOut.addEventListener('click', () => {
            this.zoom /= 1.2;
            this.zoom = Math.max(0.5, this.zoom);
            this.draw();
        });

        elements.resetMap.addEventListener('click', () => {
            this.zoom = 1;
            this.panX = 0;
            this.panY = 0;
            this.selectedPoint = null;
            this.updateLocationDisplay(null, null);
            this.draw();
        });

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.draw();
        });
    }

    handleMapClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.zoom;
        const y = (e.clientY - rect.top - this.panY) / this.zoom;

        // Convert pixel coordinates to approximate latitude/longitude
        const lat = 20 + (y / this.canvas.height) * 20;
        const lon = 70 + (x / this.canvas.width) * 20;

        this.selectedPoint = { x, y, lat: lat.toFixed(4), lon: lon.toFixed(4) };
        this.updateLocationDisplay(lat.toFixed(4), lon.toFixed(4));
        this.draw();
    }

    handleZoom(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= delta;
        this.zoom = Math.max(0.5, Math.min(5, this.zoom));
        this.draw();
    }

    updateLocationDisplay(lat, lon) {
        if (lat && lon) {
            state.location.latitude = lat;
            state.location.longitude = lon;
            state.location.areaName = this.getAreaName(lat, lon);

            elements.latValue.textContent = lat;
            elements.lonValue.textContent = lon;
            elements.areaName.textContent = state.location.areaName;
            elements.confirmLocation.disabled = false;
        } else {
            state.location.latitude = null;
            state.location.longitude = null;
            state.location.areaName = '';

            elements.latValue.textContent = '-- Click on map --';
            elements.lonValue.textContent = '-- Click on map --';
            elements.areaName.textContent = '-- Not selected --';
            elements.confirmLocation.disabled = true;
        }
    }

    getAreaName(lat, lon) {
        // Simulate area name based on coordinates
        const region = lat < 25 ? 'south' : lat < 30 ? 'central' : lat < 35 ? 'north' : 'east';
        const areas = locationDatabase[region].areas;
        return areas[Math.floor(Math.random() * areas.length)] + ', India';
    }

    draw() {
        this.ctx.fillStyle = '#e8f4f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw grid
        this.drawGrid();

        // Draw map regions (simplified landmass)
        this.drawLandmass();

        // Draw selected point
        if (this.selectedPoint) {
            this.drawSelectedPoint();
        }

        // Restore context
        this.ctx.restore();

        // Draw zoom level indicator
        this.drawZoomLevel();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(27, 154, 170, 0.1)';
        this.ctx.lineWidth = 1 / this.zoom;

        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    drawLandmass() {
        // Draw simplified India landmass
        this.ctx.fillStyle = 'rgba(27, 154, 170, 0.15)';
        this.ctx.strokeStyle = '#16808D';
        this.ctx.lineWidth = 2 / this.zoom;

        // Northern region
        this.ctx.fillRect(50, 30, 200, 100);
        this.ctx.strokeRect(50, 30, 200, 100);

        // Central region
        this.ctx.fillRect(80, 130, 150, 80);
        this.ctx.strokeRect(80, 130, 150, 80);

        // Eastern region
        this.ctx.fillRect(200, 100, 80, 120);
        this.ctx.strokeRect(200, 100, 80, 120);

        // Western region
        this.ctx.fillRect(20, 140, 60, 100);
        this.ctx.strokeRect(20, 140, 60, 100);

        // Southern region
        this.ctx.fillRect(100, 210, 120, 90);
        this.ctx.strokeRect(100, 210, 120, 90);

        // Add region labels
        this.ctx.fillStyle = '#142C52';
        this.ctx.font = (12 / this.zoom) + 'px Arial';
        this.ctx.fillText('North', 80, 70);
        this.ctx.fillText('East', 220, 150);
        this.ctx.fillText('West', 30, 180);
        this.ctx.fillText('Central', 110, 160);
        this.ctx.fillText('South', 130, 260);
    }

    drawSelectedPoint() {
        if (!this.selectedPoint) return;

        // Draw marker
        this.ctx.fillStyle = '#EF4444';
        this.ctx.beginPath();
        this.ctx.arc(this.selectedPoint.x, this.selectedPoint.y, 8 / this.zoom, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw outer ring
        this.ctx.strokeStyle = '#142C52';
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.beginPath();
        this.ctx.arc(this.selectedPoint.x, this.selectedPoint.y, 12 / this.zoom, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw pulsing effect
        const pulse = Math.sin(Date.now() / 300) * 4;
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        this.ctx.lineWidth = 1 / this.zoom;
        this.ctx.beginPath();
        this.ctx.arc(this.selectedPoint.x, this.selectedPoint.y, 16 / this.zoom + pulse, 0, Math.PI * 2);
        this.ctx.stroke();

        // Redraw for animation
        requestAnimationFrame(() => this.draw());
    }

    drawZoomLevel() {
        this.ctx.fillStyle = '#142C52';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Zoom: ${this.zoom.toFixed(1)}x`, 10, 20);
    }
}

// ============================================
// IMAGE HANDLING MODULE
// ============================================
function setupImageHandling() {
    // Toggle between upload and URL modes
    elements.toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.toggleButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const mode = e.target.dataset.mode;
            document.querySelectorAll('.image-mode').forEach(m => m.classList.remove('active'));
            document.getElementById(`${mode}-mode`).classList.add('active');
        });
    });

    // Upload mode
    elements.uploadArea.addEventListener('click', () => elements.imageUpload.click());
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.style.opacity = '0.8';
    });
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.style.opacity = '1';
    });
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.style.opacity = '1';
        handleImageFile(e.dataTransfer.files[0]);
    });

    elements.imageUpload.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
    });

    // URL mode
    elements.fetchImage.addEventListener('click', () => {
        const url = elements.imageUrl.value.trim();
        if (!url) {
            alert('Please enter a valid image URL');
            return;
        }

        fetchImageFromUrl(url);
    });

    // Allow Enter key to fetch image
    elements.imageUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.fetchImage.click();
        }
    });
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.image.source = 'upload';
            state.image.file = file;
            state.image.data = img;
            displayImagePreview(img.src);
            elements.analyzeBtn.disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function fetchImageFromUrl(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        state.image.source = 'url';
        state.image.url = url;
        state.image.data = img;
        displayImagePreview(url);
        elements.analyzeBtn.disabled = false;
    };
    img.onerror = () => {
        alert('Failed to load image. Please check the URL and ensure CORS is enabled.');
    };
    img.src = url;
}

function displayImagePreview(src) {
    elements.previewImage.src = src;
    elements.previewImage.classList.remove('hidden');
    elements.noImagePlaceholder.classList.add('hidden');
}

// ============================================
// AI ANALYSIS ENGINE (SIMULATION)
// ============================================
function analyzeImage() {
    if (!state.image.data || !state.farmer.cropType || !state.location.confirmed) {
        alert('Please upload/fetch image, select crop type, and confirm location first');
        return;
    }

    // Show loading state
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.textContent = 'Analyzing...';

    // Simulate AI processing delay
    setTimeout(() => {
        performAIAnalysis();
        displayDetectionVisualization();
        displayAnalysisReport();
        displayRecommendations();
        displayAlerts();

        elements.analyzeBtn.textContent = 'Analyze with AI';
        elements.analyzeBtn.disabled = false;
    }, 1500);
}

function performAIAnalysis() {
    const cropDiseases = diseaseDatabase[state.farmer.cropType] || diseaseDatabase.wheat;
    const selectedDisease = cropDiseases.diseases[Math.floor(Math.random() * cropDiseases.diseases.length)];

    // Simulate detection based on image characteristics
    const severity = selectedDisease.severity;
    const confidenceValues = { low: '65%', medium: '78%', high: '92%' };

    state.analysis = {
        disease: selectedDisease.name,
        severity: severity.charAt(0).toUpperCase() + severity.slice(1),
        confidence: confidenceValues[severity],
        possibleCause: selectedDisease.cause,
        chemicalTreatment: selectedDisease.chemical,
        organicAlternatives: selectedDisease.organic,
        preventivePractices: selectedDisease.preventive,
        affectedRegion: generateAffectedRegion()
    };
}

function generateAffectedRegion() {
    // Simulate affected region detection
    return {
        x: 0.3 + Math.random() * 0.4,
        y: 0.2 + Math.random() * 0.5,
        width: 0.3 + Math.random() * 0.3,
        height: 0.3 + Math.random() * 0.3
    };
}

function displayDetectionVisualization() {
    elements.visualizationContainer.classList.remove('hidden');

    const canvas = elements.detectionCanvas;
    const ctx = canvas.getContext('2d');
    const img = state.image.data;

    // Draw original image
    canvas.width = img.width;
    canvas.height = img.height;

    // Scale canvas for display
    const maxWidth = elements.visualizationContainer.offsetWidth - 30;
    const scale = maxWidth / img.width;
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';

    ctx.drawImage(img, 0, 0);

    // Draw affected region with color overlay
    const region = state.analysis.affectedRegion;
    const x = region.x * img.width;
    const y = region.y * img.height;
    const w = region.width * img.width;
    const h = region.height * img.height;

    // Draw severity-based color overlay
    const severityColors = {
        'High': 'rgba(239, 68, 68, 0.4)',
        'Medium': 'rgba(255, 140, 0, 0.4)',
        'Low': 'rgba(34, 197, 94, 0.4)'
    };

    ctx.fillStyle = severityColors[state.analysis.severity];
    ctx.fillRect(x, y, w, h);

    // Draw border
    const borderColor = {
        'High': '#EF4444',
        'Medium': '#FF8C00',
        'Low': '#22C55E'
    };

    ctx.strokeStyle = borderColor[state.analysis.severity];
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Add label
    ctx.fillStyle = borderColor[state.analysis.severity];
    ctx.font = 'bold 16px Arial';
    ctx.fillText('AI Detected Area', x + 10, y - 10);

    // Highlight corners
    const cornerSize = 12;
    ctx.fillStyle = borderColor[state.analysis.severity];
    ctx.fillRect(x, y, cornerSize, cornerSize);
    ctx.fillRect(x + w - cornerSize, y, cornerSize, cornerSize);
    ctx.fillRect(x, y + h - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(x + w - cornerSize, y + h - cornerSize, cornerSize, cornerSize);
}

function displayAnalysisReport() {
    elements.aiReportSection.classList.remove('hidden');

    elements.diseaseDetected.textContent = state.analysis.disease;
    elements.severityLevel.textContent = state.analysis.severity;
    elements.confidence.textContent = state.analysis.confidence;
    elements.possibleCause.textContent = state.analysis.possibleCause;
}

function displayRecommendations() {
    elements.recommendationsSection.classList.remove('hidden');

    elements.chemicalTreatment.textContent = state.analysis.chemicalTreatment || 'Not recommended';
    elements.organicAlternatives.textContent = state.analysis.organicAlternatives || 'Apply organic neem spray';
    elements.preventivePractices.textContent = state.analysis.preventivePractices || 'Maintain field hygiene';
}

function displayAlerts() {
    elements.alertsSection.classList.remove('hidden');
    elements.alertsContainer.innerHTML = '';

    // Generate alerts based on severity
    const alerts = generateAlerts(state.analysis.severity, state.location.areaName, state.farmer.cropType);

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${alert.level.toLowerCase()}`;
        alertDiv.innerHTML = `
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div>${alert.message}</div>
            </div>
        `;
        elements.alertsContainer.appendChild(alertDiv);
    });
}

function generateAlerts(severity, location, cropType) {
    const alerts = [];

    if (severity === 'High') {
        alerts.push({
            level: 'High',
            icon: '🔴',
            title: 'Critical - Immediate Action Required',
            message: `${state.analysis.disease} detected at critical level in your ${cropType} field at ${location}. Immediate intervention is required. Apply recommended chemical treatment immediately.`
        });
    } else if (severity === 'Medium') {
        alerts.push({
            level: 'Medium',
            icon: '🟠',
            title: 'Warning - Monitor Closely',
            message: `${state.analysis.disease} detected at medium level in your field. Monitor crop health daily and consider applying preventive treatments within 2-3 days.`
        });
    } else {
        alerts.push({
            level: 'Low',
            icon: '🟢',
            title: 'Information - Preventive Care',
            message: `${state.analysis.disease} detected at low level. Continue regular field monitoring and implement preventive practices to maintain crop health.`
        });
    }

    // Weather-based alert
    const weatherAlert = {
        level: 'Medium',
        icon: '⛅',
        title: 'Weather Condition Alert',
        message: 'Humid conditions forecasted for next 3 days. Increase field ventilation and reduce irrigation to prevent fungal spread.'
    };
    alerts.push(weatherAlert);

    // Location-specific alert
    const locationAlert = {
        level: 'Low',
        icon: '📍',
        title: 'Regional Disease Report',
        message: `${state.analysis.disease} outbreak reported in nearby areas of ${location}. Ensure proper isolation and farm hygiene practices.`
    };
    alerts.push(locationAlert);

    return alerts;
}

// ============================================
// INITIALIZATION & EVENT LISTENERS
// ============================================
function init() {
    // Initialize map
    const mapModule = new MapModule(elements.mapCanvas);

    // Confirm location button
    elements.confirmLocation.addEventListener('click', () => {
        if (state.location.latitude && state.location.longitude) {
            state.location.confirmed = true;
            elements.confirmLocation.textContent = '✓ Location Confirmed';
            elements.confirmLocation.disabled = true;

            // Update analyze button state
            updateAnalyzeButtonState();
        }
    });

    // Farm form inputs
    elements.farmerName.addEventListener('change', (e) => {
        state.farmer.name = e.target.value;
    });

    elements.cropType.addEventListener('change', (e) => {
        state.farmer.cropType = e.target.value;
        updateAnalyzeButtonState();
    });

    elements.plantingDate.addEventListener('change', (e) => {
        state.farmer.plantingDate = e.target.value;
    });

    // Analyze button
    elements.analyzeBtn.addEventListener('click', analyzeImage);

    // Setup image handling
    setupImageHandling();

    // Initial button state
    updateAnalyzeButtonState();
}

function updateAnalyzeButtonState() {
    const canAnalyze = state.image.data && state.farmer.cropType && state.location.confirmed;
    elements.analyzeBtn.disabled = !canAnalyze;
}

// ============================================
// START APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', init);

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Log for debugging
function log(message, data = null) {
    console.log(`[CropGuard AI] ${message}`, data);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Export analysis report
function exportReport() {
    const report = `
    CropGuard AI - Disease Detection Report
    Generated: ${new Date().toLocaleString()}
    
    Farmer Information:
    - Name: ${state.farmer.name || 'Not provided'}
    - Crop Type: ${state.farmer.cropType || 'Not selected'}
    - Planting Date: ${state.farmer.plantingDate || 'Not provided'}
    
    Location:
    - Latitude: ${state.location.latitude || 'Not selected'}
    - Longitude: ${state.location.longitude || 'Not selected'}
    - Area: ${state.location.areaName || 'Not selected'}
    
    Analysis Results:
    - Disease: ${state.analysis.disease || 'No analysis performed'}
    - Severity: ${state.analysis.severity || 'N/A'}
    - Confidence: ${state.analysis.confidence || 'N/A'}
    - Possible Cause: ${state.analysis.possibleCause || 'N/A'}
    
    Recommendations:
    - Chemical Treatment: ${state.analysis.chemicalTreatment || 'N/A'}
    - Organic Alternatives: ${state.analysis.organicAlternatives || 'N/A'}
    - Preventive Practices: ${state.analysis.preventivePractices || 'N/A'}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cropguard-report.txt';
    a.click();
    URL.revokeObjectURL(url);
}
