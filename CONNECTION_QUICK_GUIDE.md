# 🔗 Quick Connection Check Guide

## Database Connection

### ✅ Status: CONNECTED

**Database Location:**
```
C:\Users\purna\OneDrive\Desktop\AID103-PURNACHANDRARAOPARCHURI\backend\db.sqlite3
```

**Current Records:**
- User Profiles: 5 records
- Farms: 0 records (ready for data)
- Disease Detection: 0 records (ready for analysis)
- Weather Data: 0 records (ready for weather integration)

### How to Verify Database Connection

**Option 1: Using Python**
```bash
cd backend
python manage.py dbshell
# Then run: SELECT COUNT(*) FROM users_userprofile;
```

**Option 2: Using Our Script**
```bash
python check_connections.py
```

**Option 3: In Django Shell**
```bash
python manage.py shell
from api.models import UserProfile
print(UserProfile.objects.all())  # Should show 5 records
```

---

## Google Services Connection

### 📊 Status Summary

| Service | Status | Action |
|---------|--------|--------|
| Google Maps | ✅ Reachable | Get API key from Google Cloud |
| Firebase | ✅ Reachable | Create Firebase project |
| Google Cloud | ✅ Reachable | Set up service account |
| Google OAuth | ✅ Reachable | Configure OAuth credentials |

### How to Set Up Google Services

#### 1. Google Maps API

```bash
# Step 1: Go to Google Cloud Console
https://console.cloud.google.com

# Step 2: Create new project "CropGuard AI"

# Step 3: Enable Maps API
# - Maps Static API
# - Maps Embed API
# - Geocoding API

# Step 4: Create API key
# - Restrictions: HTTP referrers
# - Add your domain/localhost

# Step 5: Add to Django settings.py
GOOGLE_MAPS_API_KEY = 'your-api-key-here'
```

#### 2. Firebase Setup

```bash
# Step 1: Go to Firebase Console
https://console.firebase.google.com

# Step 2: Create project "CropGuard AI"

# Step 3: Add web app

# Step 4: Get configuration
# Copy the config object

# Step 5: Add to frontend JavaScript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  ...
};
firebase.initializeApp(firebaseConfig);
```

#### 3. Google OAuth Setup

```bash
# Step 1: Go to Google Cloud Console
https://console.cloud.google.com

# Step 2: Go to OAuth consent screen

# Step 3: Create OAuth 2.0 Client ID
# Type: Web application
# Authorized JavaScript origins:
#   - http://localhost:8000
#   - http://localhost:3000
# Authorized redirect URIs:
#   - http://localhost:8000/callback
#   - http://localhost:3000/callback

# Step 4: Add to Django settings
GOOGLE_OAUTH_CLIENT_ID = 'your-client-id'
GOOGLE_OAUTH_CLIENT_SECRET = 'your-client-secret'
```

---

## Django Backend Server

### 🖥️ Starting the Server

```bash
# Navigate to project root
cd AID103-PURNACHANDRARAOPARCHURI

# Navigate to backend
cd backend

# Activate virtual environment (Windows)
venv\Scripts\activate

# Start server
python manage.py runserver

# Server running at: http://localhost:8000
# API available at: http://localhost:8000/api/
```

### ✅ Server Health Check

```bash
# Check if server is running
curl http://localhost:8000/api/

# Should return API info

# Check specific endpoints
curl http://localhost:8000/api/auth/token/ -X OPTIONS
```

### API Endpoints Available

```
✓ POST   /api/auth/register/
✓ POST   /api/auth/token/
✓ GET    /api/users/
✓ GET    /api/farms/
✓ GET    /api/disease-detection/
✓ GET    /api/weather/
✓ GET    /api/alerts/
✓ GET    /api/market-prices/
✓ GET    /api/recommendations/
✓ GET    /api/analytics/
```

---

## Frontend Connection

### 🌐 Testing from Browser

**Open browser console (F12) and run:**

```javascript
// Test API connection
fetch('http://localhost:8000/api/')
  .then(r => r.json())
  .then(d => console.log('✅ Connected:', d))
  .catch(e => console.log('❌ Error:', e))

// Test authentication
fetch('http://localhost:8000/api/auth/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'pass' })
})
  .then(r => r.json())
  .then(d => console.log('Response:', d))
  .catch(e => console.log('Error:', e))
```

### Using Our Frontend Checker Script

```javascript
// In browser console, include the script:
// <script src="check-connections.js"></script>

// Then run:
window.connectionChecker.runAll()

// Full results stored in:
// window.connectionChecker.results
```

---

## Connection Verification Checklist

### Daily Checks

- [ ] Database responding (`python manage.py dbshell`)
- [ ] Backend server running (http://localhost:8000)
- [ ] API endpoints accessible (test /api/ endpoint)
- [ ] User profiles loadable
- [ ] Frontend can reach backend

### Weekly Checks

- [ ] Database backups completed
- [ ] Google API quota usage normal
- [ ] No error logs in Django
- [ ] CORS headers properly set
- [ ] JWT tokens working

### Monthly Checks

- [ ] Database optimization
- [ ] Google API costs review
- [ ] Security audit
- [ ] Performance monitoring
- [ ] Dependency updates

---

## Troubleshooting

### Backend Server Won't Start

```bash
# Check Python version
python --version  # Should be 3.8+

# Check dependencies
pip list | grep -i django

# Reinstall requirements
pip install -r requirements.txt --upgrade

# Check port 8000 not in use
netstat -ano | findstr :8000

# If port in use, kill process or use different port
python manage.py runserver 8001
```

### Cannot Connect to Database

```bash
# Check database file exists
ls backend/db.sqlite3

# Check migrations applied
python manage.py migrate

# Check database permissions
# Windows - Run as administrator if needed

# Recreate database if corrupted
rm backend/db.sqlite3
python manage.py migrate
```

### Google API Errors

```bash
# Check if API key is set
grep -r "GOOGLE_MAPS_API_KEY" backend/

# Verify API is enabled in Google Cloud Console
# Menu > APIs & Services > Enabled APIs

# Check API quota
# Menu > APIs & Services > Quotas
```

### CORS Errors in Frontend

```bash
# Check CORS configuration in settings.py
grep -A 5 "CORS_ALLOWED_ORIGINS" backend/cropguard_backend/settings.py

# Ensure localhost is in the list
# Add to CORS_ALLOWED_ORIGINS if missing:
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
]
```

---

## Quick Commands Reference

```bash
# Database operations
python manage.py migrate              # Apply migrations
python manage.py makemigrations       # Create migrations
python manage.py dbshell              # Access database shell
python manage.py shell                # Python shell with Django

# Server operations
python manage.py runserver            # Start dev server
python manage.py runserver 0.0.0.0    # Listen on all interfaces
python manage.py runserver 8001       # Use custom port

# Testing
python manage.py test                 # Run tests
python manage.py test api.tests       # Run specific tests

# Admin
python manage.py createsuperuser      # Create admin user
python manage.py changepassword user  # Change password

# Utilities
python manage.py collectstatic        # Collect static files
python manage.py dumpdata > backup.json  # Backup data
python manage.py loaddata backup.json    # Restore data
```

---

## Environment Variables Needed

Create `.env` file in backend directory:

```env
# Database
DATABASE_NAME=db.sqlite3

# API Keys
GOOGLE_MAPS_API_KEY=your-api-key
OPENWEATHERMAP_API_KEY=your-api-key
WEATHERAPI_API_KEY=your-api-key

# Firebase
FIREBASE_API_KEY=your-key
FIREBASE_AUTH_DOMAIN=your-domain
FIREBASE_PROJECT_ID=your-project

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-secret

# Email (for production)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Django Security
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## Resources

- **Django Documentation:** https://docs.djangoproject.com
- **Django REST Framework:** https://www.django-rest-framework.org
- **Google Cloud Console:** https://console.cloud.google.com
- **Firebase Console:** https://console.firebase.google.com
- **SQLite Documentation:** https://www.sqlite.org/docs.html

---

**Last Updated:** January 25, 2026  
**Status:** ✅ Ready for Production Setup
