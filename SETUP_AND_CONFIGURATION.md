# CropGuard AI - Complete System Setup & Connection Guide

**Last Updated:** January 30, 2026  
**Status:** ✓ All connections properly configured

---

## 🚀 Quick Start (5 Minutes)

### For Windows Users:
```bash
# 1. Open Command Prompt in project root
# 2. Run startup script
START-ALL-SERVICES.bat

# 3. Wait 10 seconds for all services to start
# 4. Open browser and go to: http://127.0.0.1:8001
```

### For macOS/Linux Users:
```bash
# 1. Open Terminal in project root
# 2. Make script executable
chmod +x start-all-services.sh

# 3. Run startup script
./start-all-services.sh

# 4. Open browser and go to: http://127.0.0.1:8001
```

---

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Port 8001)                  │
│              HTML/CSS/JavaScript (Static)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  • index.html (Disease Detection)               │   │
│  │  • api-config.js (API Client)                   │   │
│  │  • connection-verifier.js (Testing Tool)        │   │
│  │  • script.js (ML Integration)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
              ↓ HTTP Requests               ↓
    ┌─────────────────────┐      ┌──────────────────┐
    │ Django REST API     │      │  Flask ML API    │
    │  (Port 8000)        │      │  (Port 5000)     │
    │                     │      │                  │
    │ • Authentication    │      │ • Disease        │
    │ • Farm Management   │      │   Detection      │
    │ • Data Storage      │      │ • GradCAM        │
    │ • Alerts            │      │   Visualization  │
    │ • Analytics         │      │                  │
    └─────────────────────┘      └──────────────────┘
              ↓                           ↓
    ┌─────────────────────────────────────────┐
    │   Database (SQLite or PostgreSQL)       │
    │   • User Profiles                       │
    │   • Farms & Crops                       │
    │   • Detection Results                   │
    │   • Weather Data                        │
    │   • Alerts & Recommendations            │
    └─────────────────────────────────────────┘
```

---

## 🔧 Installation & Setup

### Prerequisites

- **Python:** 3.9 or higher
  ```bash
  python --version
  ```
- **pip:** Package manager (comes with Python)
  ```bash
  pip --version
  ```
- **Git** (optional): For version control
  ```bash
  git --version
  ```

### Step 1: Install Python Packages

```bash
cd backend

# Install all dependencies
pip install -r requirements.txt

# Verify critical packages
pip list | grep -E "django|tensorflow|flask"
```

### Step 2: Initialize Database

```bash
cd backend

# Run migrations (creates db.sqlite3)
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Follow prompts:
# Username: admin
# Email: admin@example.com  
# Password: [secure password]

# Verify database
ls -la db.sqlite3
```

### Step 3: Verify ML Model

```bash
cd backend

# Check if model exists
ls -la cropguard_model.h5

# File should be:
# - Size: > 1 MB
# - Readable
# Note: If missing, you'll need to train or download the model
```

---

## 🎯 Running the Application

### Method 1: Automated Startup (Recommended)

**Windows:**
```bash
START-ALL-SERVICES.bat
```

**macOS/Linux:**
```bash
./start-all-services.sh
```

### Method 2: Manual Startup (3 Terminal Windows)

**Terminal 1 - Django API:**
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Flask ML Service:**
```bash
cd backend
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
python -m http.server 8001
```

### Method 3: Check Individual Services

After services are running, verify they're working:

```bash
# Test Django API
curl http://127.0.0.1:8000/api/farms/

# Test Flask ML API  
curl http://127.0.0.1:5000/health

# Test Frontend
curl http://127.0.0.1:8001/index.html
```

---

## 🌐 Accessing the Application

Once all services are running, open your browser:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://127.0.0.1:8001 | Disease Detection UI |
| **Django Admin** | http://127.0.0.1:8000/admin | Database Management |
| **API Docs** | http://127.0.0.1:8000/api | API Endpoints |

---

## ✅ Connection Verification

### Option 1: Browser Console Test

1. Open Frontend: http://127.0.0.1:8001
2. Press `F12` to open Developer Tools
3. Go to Console tab
4. Type: `verifier.runAll()`
5. View results in console

### Option 2: Test Individual Components

```javascript
// In browser console:

// Test API Configuration
console.log(API_CONFIG);

// Test Django Connection
api.get('/farms/').then(data => {
    console.log('Django API working:', data);
}).catch(err => {
    console.error('Django API error:', err);
});

// Test Flask ML Connection
fetch('http://127.0.0.1:5000/health')
    .then(r => r.json())
    .then(data => console.log('Flask API working:', data))
    .catch(err => console.error('Flask API error:', err));
```

### Expected Results

**✓ All Systems Operational** - You should see:
- Django API responsive
- Flask ML API healthy
- Database connection active
- CORS properly configured
- Local storage working

---

## 🗄️ Database Configuration

### Current Configuration

**Default:** SQLite (no setup needed)
- File: `backend/db.sqlite3`
- Best for: Local development & testing

### Switching to PostgreSQL (Production)

**Step 1: Install PostgreSQL**
- Windows: https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

**Step 2: Create Database**
```bash
# Windows (use pgAdmin) or Linux/macOS:
createdb cropguard_db
createuser cropguard_user
# Set password and privileges
```

**Step 3: Update Configuration**

Create `.env` file:
```
DATABASE_URL=postgresql://cropguard_user:password@localhost:5432/cropguard_db
```

Or update `backend/cropguard_backend/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'cropguard_db',
        'USER': 'cropguard_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

**Step 4: Run Migrations**
```bash
cd backend
python manage.py migrate
```

---

## 🔑 API Usage Examples

### Authentication

```javascript
// Register new user
const registerResponse = await api.register(
    'farmer_name',
    'farmer@example.com',
    'secure_password'
);

// Login
const loginResponse = await api.login(
    'farmer@example.com',
    'secure_password'
);

// Access token is automatically stored and used
```

### Farm Management

```javascript
// Get all farms
const farms = await api.get(API_CONFIG.FARMS.LIST);

// Create new farm
const newFarm = await api.post(API_CONFIG.FARMS.CREATE, {
    farm_name: 'My Farm',
    latitude: 28.5355,
    longitude: 77.3910,
    area_in_acres: 5.5,
    crop_type: 'wheat',
    planting_date: '2024-01-15',
    region: 'north',
    soil_type: 'loamy',
    irrigation_type: 'drip'
});

// Get specific farm
const farm = await api.get(API_CONFIG.FARMS.DETAIL(farmId));

// Update farm
const updated = await api.patch(
    API_CONFIG.FARMS.UPDATE(farmId),
    { farm_name: 'Updated Name' }
);
```

### Disease Detection

```javascript
// Upload and detect disease
const file = document.getElementById('imageInput').files[0];
const result = await mlApi.predictDisease(file);

// Result contains:
console.log({
    disease: result.disease,              // "Leaf_Blight"
    confidence: result.confidence,        // 0.95
    severity_level: result.severity_level, // "High"
    treatment: result.treatment,          // Treatment recommendation
    prevention: result.prevention,        // Prevention tips
    marked_image: result.marked_image     // Base64 encoded image
});
```

---

## 🐛 Troubleshooting

### Django Server Won't Start

```bash
# Clear migrations cache
cd backend
rm -rf api/__pycache__
rm -rf cropguard_backend/__pycache__

# Reset database
rm db.sqlite3

# Run migrations fresh
python manage.py migrate

# Start server
python manage.py runserver 0.0.0.0:8000
```

### Flask Model Loading Error

```bash
# Check if model file exists and is accessible
ls -la backend/cropguard_model.h5

# Check file permissions (macOS/Linux)
chmod 644 backend/cropguard_model.h5

# Verify Python can load it
python
from tensorflow.keras.models import load_model
model = load_model('backend/cropguard_model.h5')
print("Model loaded successfully!")
```

### CORS Errors

```javascript
// Browser console error: "Access to XMLHttpRequest blocked by CORS"

// Check if services are running on correct ports
// Update API_CONFIG in api-config.js if ports changed

// Verify Django CORS settings include your frontend origin
// Edit backend/cropguard_backend/settings.py CORS_ALLOWED_ORIGINS
```

### Database Connection Error

```bash
# SQLite version
cd backend
python manage.py dbshell

# PostgreSQL version
psql -U cropguard_user -d cropguard_db -c "SELECT 1"

# MySQL version
mysql -u cropguard_user -p cropguard_db -e "SELECT 1"
```

### Port Already in Use

```bash
# Windows - Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

---

## 📁 Project Structure

```
AID103-PURNACHANDRARAOPARCHURI/
├── backend/
│   ├── api/                          # Django app
│   │   ├── models.py                 # Database models
│   │   ├── views.py                  # API views
│   │   ├── serializers.py            # Data serializers
│   │   ├── urls.py                   # API routes
│   │   └── permissions.py            # Custom permissions
│   ├── cropguard_backend/            # Django config
│   │   ├── settings.py               # Settings ✓ UPDATED
│   │   ├── urls.py                   # Main URLs
│   │   └── wsgi.py                   # WSGI config
│   ├── app.py                        # Flask ML app ✓ UPDATED
│   ├── cropguard_model.h5            # ML model
│   ├── db.sqlite3                    # SQLite database
│   ├── manage.py                     # Django CLI
│   └── requirements.txt              # Dependencies ✓ UPDATED
│
├── frontend/
│   ├── index.html                    # Main page
│   ├── api-config.js                 # ✓ NEW - API configuration
│   ├── connection-verifier.js        # ✓ NEW - Testing tool
│   ├── script.js                     # ✓ UPDATED - ML integration
│   ├── navigation.js                 # Navigation component
│   ├── theme-toggle.js               # Theme switcher
│   └── other HTML files              # Feature pages
│
├── COMPLETE_CONNECTION_SETUP.md      # ✓ NEW - Comprehensive setup guide
├── DATABASE_SETUP_GUIDE.md           # ✓ NEW - Database configuration
├── .env.example                      # ✓ NEW - Environment variables template
├── START-ALL-SERVICES.bat            # ✓ NEW - Windows startup script
└── start-all-services.sh             # ✓ NEW - Unix startup script
```

---

## 📊 Testing Checklist

After setup, verify:

- [ ] All services running (Django, Flask, Frontend)
- [ ] Database migrations completed
- [ ] Superuser account created
- [ ] Frontend loads without errors
- [ ] Can view console verification results
- [ ] Disease detection works with test image
- [ ] API endpoints accessible
- [ ] Admin panel accessible
- [ ] No CORS errors in console
- [ ] Token refresh working

---

## 🚀 Next Steps

1. **Create test farm data**
   ```bash
   python manage.py shell
   from api.models import Farm
   from django.contrib.auth.models import User
   
   user = User.objects.first()
   Farm.objects.create(
       user=user,
       farm_name='Test Farm',
       latitude=28.5355,
       longitude=77.3910,
       area_in_acres=5.5,
       region='north',
       crop_type='wheat',
       planting_date='2024-01-15',
       soil_type='loamy',
       irrigation_type='drip'
   )
   exit()
   ```

2. **Test disease detection**
   - Go to http://127.0.0.1:8001
   - Upload a crop disease image
   - Verify predictions and heatmap

3. **Set up production database** (when ready)
   - Switch to PostgreSQL
   - Configure SSL connections
   - Set up automated backups

4. **Deploy to cloud** (when ready)
   - Azure App Service / Container Apps
   - AWS EC2 / Lambda
   - Heroku / Railway

---

## 📞 Support Resources

- **Django Docs:** https://docs.djangoproject.com/
- **Flask Docs:** https://flask.palletsprojects.com/
- **REST Framework:** https://www.django-rest-framework.org/
- **TensorFlow:** https://www.tensorflow.org/

---

## ✨ What's Been Fixed/Added

✓ **Frontend-Backend Connection**
- Created centralized `api-config.js` with APIClient class
- Updated `script.js` to use proper API client
- Added automatic token refresh handling
- Proper error messages for API failures

✓ **Backend Configuration**
- Enhanced CORS settings to support all frontends
- Added Flask CORS support
- Improved error handling in ML endpoints
- Support for PostgreSQL/MySQL via DATABASE_URL

✓ **Database Support**
- SQLite (default - no setup needed)
- PostgreSQL (production-ready)
- MySQL (alternative option)
- Environment variable configuration

✓ **Testing & Verification**
- Created `connection-verifier.js` for automated testing
- Browser console verification tools
- Health check endpoints
- Comprehensive error messages

✓ **Documentation**
- Complete setup guide
- Database configuration guide
- Troubleshooting section
- API usage examples

---

**Ready to start?** Run `START-ALL-SERVICES.bat` on Windows or `./start-all-services.sh` on macOS/Linux!

For detailed database setup with your specific URL, see [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)

---

**Status:** ✓ All systems properly connected and tested  
**Last Verified:** January 30, 2026
