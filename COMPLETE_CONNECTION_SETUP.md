# CropGuard AI - Complete Setup and Connection Guide

## Overview

This guide will help you set up and connect all three components of CropGuard AI:
1. **Django REST API Backend** (Port 8000)
2. **Flask ML Service** (Port 5000)
3. **Frontend (Static HTML/JS)** (Can be served from any port)

## System Requirements

- Python 3.9+
- Node.js 14+ (optional, for frontend development)
- pip package manager
- Git (for version control)

## Prerequisites Setup

### Step 1: Clone/Prepare the Project

```bash
# Navigate to the project directory
cd "AID103-PURNACHANDRARAOPARCHURI"

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Install Python Dependencies

```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Verify installation
pip list | grep -i django
pip list | grep -i flask
```

## Component Setup

### Component 1: Django REST API Backend (Port 8000)

#### Database Setup

**Option A: SQLite (Default/Local Development)**
```bash
cd backend

# Run migrations (creates db.sqlite3)
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
# Follow prompts to create admin account
# Example: username: admin, password: admin123

# Verify database is created
ls -la db.sqlite3
```

**Option B: PostgreSQL (Recommended for Production)**

1. Install PostgreSQL:
   ```bash
   # Windows: Download from https://www.postgresql.org/download/windows/
   # macOS: brew install postgresql
   # Linux: sudo apt-get install postgresql
   ```

2. Create database:
   ```bash
   # Windows (in pgAdmin or psql)
   CREATE DATABASE cropguard_db;
   CREATE USER cropguard_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE cropguard_db TO cropguard_user;
   ```

3. Update `.env` or `settings.py`:
   ```python
   DATABASE_URL=postgresql://cropguard_user:your_secure_password@localhost:5432/cropguard_db
   ```

#### Start Django Server

```bash
cd backend

# Run server
python manage.py runserver 0.0.0.0:8000

# Expected output:
# Starting development server at http://0.0.0.0:8000/
# Quit the server with CONTROL-C.
```

#### Verify Django API

```bash
# In another terminal, test endpoints
curl http://127.0.0.1:8000/api/farms/

# Visit admin interface
# http://127.0.0.1:8000/admin/
# Login with superuser credentials
```

### Component 2: Flask ML Service (Port 5000)

#### Verify Model File

```bash
cd backend

# Check if model exists
ls -la cropguard_model.h5

# If missing, you'll need to train or download the model
```

#### Start Flask Server

```bash
cd backend

# Option 1: Direct Python execution
python app.py

# Option 2: Using Flask CLI
set FLASK_APP=app.py
set FLASK_ENV=development
flask run --host=0.0.0.0 --port=5000

# Expected output:
# * Running on http://0.0.0.0:5000
# WARNING: This is a development server. Do not use it in production.
```

#### Verify Flask API

```bash
# In another terminal, test health endpoint
curl http://127.0.0.1:5000/health

# Expected response:
# {"status": "healthy", "service": "CropGuard AI ML Service", "model_loaded": true}
```

### Component 3: Frontend Setup

The frontend is served as static HTML files. No build step required!

#### Option A: Serve with Python

```bash
# Navigate to frontend directory
cd frontend

# Start simple HTTP server
python -m http.server 8001

# Access at http://localhost:8001
```

#### Option B: Serve with Node.js

```bash
# Install http-server globally
npm install -g http-server

# Navigate to frontend directory
cd frontend

# Start server
http-server -p 8001

# Access at http://localhost:8001
```

#### Option C: Direct File Access (Not Recommended)
- Simply double-click `index.html` to open in browser
- Note: Some features may not work due to CORS restrictions

## Connection Verification

### 1. Verify All Services Are Running

**Terminal 1 - Django:**
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Flask:**
```bash
cd backend
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
python -m http.server 8001
```

### 2. Test API Endpoints

```bash
# Test Django API
curl http://127.0.0.1:8000/api/ -H "Content-Type: application/json"

# Test Flask Health
curl http://127.0.0.1:5000/health

# Test Frontend Load
curl http://127.0.0.1:8001/index.html
```

### 3. Test Frontend-Backend Communication

Open browser console and run:

```javascript
// Load the API config script first
// (Make sure api-config.js is loaded in your HTML)

// Test API client
api.get('/farms/').then(data => {
    console.log('Farms:', data);
}).catch(err => {
    console.error('Error:', err);
});

// Test ML API
fetch('http://127.0.0.1:5000/health')
    .then(r => r.json())
    .then(data => console.log('ML Service:', data))
    .catch(err => console.error('ML Error:', err));
```

## Common Issues and Solutions

### Issue 1: CORS Errors

**Symptom:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**
1. Ensure Django CORS_ALLOWED_ORIGINS includes your frontend origin
2. Check `backend/cropguard_backend/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:8001',
       'http://127.0.0.1:8001',
       ...
   ]
   ```
3. Ensure Flask has CORS enabled (already added in updated app.py)

### Issue 2: Model Not Loading

**Symptom:** "Error: Model not loaded" from Flask

**Solution:**
1. Verify model file exists: `backend/cropguard_model.h5`
2. Check file size: Should be > 1MB
3. Train/download model if missing:
   ```bash
   # You'll need the model training script or pre-trained weights
   ```

### Issue 3: Database Connection Error

**Symptom:** "django.db.utils.OperationalError: unable to open database file"

**Solution:**
```bash
cd backend
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Issue 4: Port Already in Use

**Symptom:** "Address already in use"

**Solution:**
```bash
# Windows: Find and kill process using port
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Issue 5: Module Not Found Errors

**Solution:**
```bash
# Verify all dependencies are installed
pip install -r backend/requirements.txt --upgrade

# Check for conflicting versions
pip list | grep -i tensorflow
pip list | grep -i django
```

## Database Connection Methods

### Method 1: SQLite (Included, Default)
- **File:** `backend/db.sqlite3`
- **Best for:** Local development
- **No setup needed:** Just run migrations

### Method 2: PostgreSQL (Recommended)
- **Setup:**
  ```bash
  # Install PostgreSQL server
  # Create database: CREATE DATABASE cropguard_db;
  # Set in .env or settings.py: 
  # DATABASE_URL=postgresql://user:pass@localhost:5432/cropguard_db
  ```
- **Best for:** Production deployment

### Method 3: MySQL
- **Setup:**
  ```bash
  # Install MySQL server
  # Create database: CREATE DATABASE cropguard_db;
  # Set in settings.py:
  # DATABASE_URL=mysql://user:pass@localhost:3306/cropguard_db
  ```

## API Usage Examples

### Frontend to Django API

```javascript
// In your HTML, include:
<script src="frontend/api-config.js"></script>

// Then use:
// Login
await api.login('user@example.com', 'password');

// Get farms
const farms = await api.get(api.API_CONFIG.FARMS.LIST);

// Create farm
const newFarm = await api.post(api.API_CONFIG.FARMS.CREATE, {
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
```

### Frontend to Flask ML API

```javascript
// Upload image for disease detection
const file = document.getElementById('imageInput').files[0];
const result = await mlApi.predictDisease(file);

// Result will contain:
// {
//   disease: "Leaf_Blight",
//   confidence: 0.95,
//   severity_level: "High",
//   severity_percent: 75.5,
//   treatment: "Apply fungicide...",
//   prevention: "Avoid overhead irrigation...",
//   marked_image: "base64_encoded_image"
// }
```

## Troubleshooting Checklist

- [ ] Python 3.9+ installed: `python --version`
- [ ] All dependencies installed: `pip list | wc -l`
- [ ] Django migrations run: `python manage.py migrate`
- [ ] Superuser created: `python manage.py createsuperuser`
- [ ] Model file exists: `ls backend/cropguard_model.h5`
- [ ] Django server running: `http://127.0.0.1:8000`
- [ ] Flask server running: `http://127.0.0.1:5000`
- [ ] Frontend accessible: `http://localhost:8001`
- [ ] CORS configured in Django settings
- [ ] Flask CORS enabled in app.py
- [ ] API endpoints match frontend calls
- [ ] Browser console shows no errors

## Next Steps

1. **Create test user account**
   ```bash
   python backend/manage.py createsuperuser
   ```

2. **Upload test data**
   - Use Django admin at `http://127.0.0.1:8000/admin`
   - Or use API endpoints from frontend

3. **Test disease detection**
   - Navigate to photo capture/analysis page
   - Upload a crop disease image
   - Verify predictions

4. **Configure production database** (when ready)
   - Set up PostgreSQL database
   - Update DATABASE_URL environment variable
   - Deploy with Gunicorn/WSGI server

## Additional Resources

- Django Documentation: https://docs.djangoproject.com/
- Flask Documentation: https://flask.palletsprojects.com/
- REST Framework: https://www.django-rest-framework.org/
- TensorFlow: https://www.tensorflow.org/

---

**Last Updated:** January 30, 2026
**Status:** All connections properly configured ✓
