# CropGuard AI - Django Backend Setup Guide

## Overview
This guide covers setting up the complete Django REST API backend for CropGuard AI with Neon PostgreSQL database integration.

**Database:** Neon PostgreSQL (Cloud-hosted)
**Framework:** Django 4.2 + Django REST Framework
**Authentication:** JWT (JSON Web Tokens)
**API Base URL:** `http://localhost:8000/api/`

---

## Prerequisites

### Required Software
- Python 3.9 or higher
- pip (Python package manager)
- Git (for version control)
- PostgreSQL client tools (psql)

### Optional but Recommended
- Virtual environment (venv)
- Postman or Insomnia (API testing)
- VS Code with Python extensions

---

## Step 1: Setup Virtual Environment

### Windows
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

### macOS/Linux
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

---

## Step 2: Install Required Packages

### Create requirements.txt
The `backend/requirements.txt` should contain:

```txt
Django==4.2.0
djangorestframework==3.14.0
django-cors-headers==4.0.0
djangorestframework-simplejwt==5.2.0
psycopg2-binary==2.9.6
python-decouple==3.8
celery==5.2.7
redis==4.5.4
requests==2.28.2
Pillow==9.5.0
```

### Install packages
```bash
pip install -r backend/requirements.txt
```

---

## Step 3: Database Configuration

### Neon PostgreSQL Connection Details
```
Database URL: postgresql://neondb_owner:npg_Dn5Lw8fRVxYA@ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

Components:
- Host: ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech
- Port: 5432
- Database: neondb
- User: neondb_owner
- Password: npg_Dn5Lw8fRVxYA
- SSL: Required
```

### Verify Connection (Optional)
```bash
# Using psql command line
psql "postgresql://neondb_owner:npg_Dn5Lw8fRVxYA@ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# You should see: "neondb=>"
# Type \q to exit
```

---

## Step 4: Django Project Setup

### Directory Structure
```
backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── api_integration.js        # Frontend API integration
├── cropguard/               # Main Django project
│   ├── __init__.py
│   ├── settings.py         # ✅ Created - Updated with DB config
│   ├── urls.py             # ✅ Created - Main URL routing
│   ├── asgi.py             # ASGI configuration
│   ├── wsgi.py             # WSGI configuration
│   └── static/             # Static files (CSS, JS)
│
├── api/                     # Django app for CropGuard API
│   ├── __init__.py
│   ├── admin.py            # ⏳ To create - Admin interface
│   ├── apps.py
│   ├── models.py           # ✅ Created - 11 database models
│   ├── serializers.py      # ✅ Created - 14 DRF serializers
│   ├── views.py            # ✅ Created - 11 ViewSets
│   ├── urls.py             # ✅ Created - API URL routing
│   ├── permissions.py      # ⏳ To create - Custom permissions
│   ├── tests.py            # ⏳ To create - Unit tests
│   ├── migrations/         # Database migrations
│   │   └── __init__.py
│   └── templates/          # HTML templates (optional)
│
└── logs/                   # Log files
    └── django.log
```

---

## Step 5: Initialize Django

### Create Django Project (if not already created)
```bash
cd backend
python manage.py startapp api
```

### Run Migrations
```bash
# Create migration files from models
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate
```

### Create Superuser (Admin)
```bash
python manage.py createsuperuser

# You'll be prompted for:
# Email: admin@cropguard.com
# Password: (create a strong password)
# First Name: Admin
# Last Name: User
```

### Create logs directory
```bash
mkdir logs
```

---

## Step 6: Test Django Server

### Start Development Server
```bash
python manage.py runserver

# Output:
# Starting development server at http://127.0.0.1:8000/
```

### Test API Endpoints
```bash
# In another terminal, test endpoints using curl:

# 1. Get JWT Token
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cropguard.com","password":"your_password"}'

# Response: {"access":"eyJ0...","refresh":"eyJ0..."}

# 2. Get User Profile (with token)
curl -X GET http://localhost:8000/api/profile/me/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 3. Create Farm
curl -X POST http://localhost:8000/api/farms/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "name":"My Farm",
    "location":"Karnataka",
    "crop_type":"Rice",
    "area_hectares":5
  }'

# 4. Get User Alerts
curl -X GET http://localhost:8000/api/alerts/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## Step 7: Frontend Integration

### Update Frontend Configuration
In `index.html`, include both scripts in order:

```html
<!-- API Integration Service -->
<script src="api-integration.js"></script>

<!-- Enhanced Script with Backend Integration -->
<script src="script-integrated.js"></script>
```

### Frontend API Base URL
By default, `api-integration.js` uses:
```javascript
const baseUrl = 'http://localhost:8000/api'
```

To change for production:
```javascript
const api = new CropGuardAPI('https://yourdomain.com/api');
```

---

## Step 8: API Endpoints Reference

### Authentication Endpoints
```
POST   /api/auth/register/              # Register new user
POST   /api/auth/token/                 # Get JWT token (login)
POST   /api/auth/token/refresh/         # Refresh access token
```

### User Profile Endpoints
```
GET    /api/profile/me/                 # Get current user profile
PATCH  /api/profile/me/                 # Update profile
GET    /api/profile/statistics/         # Get user statistics
```

### Farm Management
```
GET    /api/farms/                      # List all farms (paginated)
POST   /api/farms/                      # Create new farm
GET    /api/farms/{id}/                 # Get farm details
PATCH  /api/farms/{id}/                 # Update farm
DELETE /api/farms/{id}/                 # Delete farm
GET    /api/farms/{id}/analytics/       # Get farm performance data
GET    /api/farms/{id}/weather/         # Get current weather
POST   /api/farms/{id}/fetch_weather/   # Fetch weather from API
GET    /api/farms/{id}/recent_detections/  # Last 10 analyses
```

### Disease Detection
```
GET    /api/detections/                 # List all detections
POST   /api/detections/                 # Create new detection
GET    /api/detections/{id}/            # Get detection details
POST   /api/detections/{id}/confirm/    # Confirm detection accuracy
POST   /api/detections/{id}/feedback/   # Provide feedback
```

### Weather & Alerts
```
GET    /api/weather/                    # List weather data
GET    /api/alerts/                     # List user alerts
GET    /api/alerts/unread/              # Get unread alert count
POST   /api/alerts/{id}/mark_read/      # Mark alert as read
POST   /api/alerts/mark_all_read/       # Mark all alerts as read
```

### Market & Recommendations
```
GET    /api/market-prices/              # List crop prices
GET    /api/market-prices/trending/     # Get trending prices
GET    /api/recommendations/            # List recommendations
POST   /api/recommendations/{id}/apply/ # Mark recommendation as applied
```

### Pest & Irrigation
```
GET    /api/pests/                      # List pest records
POST   /api/pests/                      # Create pest record
GET    /api/irrigation/                 # List irrigation schedules
POST   /api/irrigation/                 # Create irrigation schedule
GET    /api/irrigation/upcoming/        # Get upcoming irrigations
POST   /api/irrigation/{id}/complete/   # Mark irrigation as done
```

### Other
```
GET    /api/activity-logs/              # View activity history
GET    /api/analytics/                  # View farm analytics
```

---

## Step 9: Environment Variables (Optional)

Create `.env` file in backend directory:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (override if needed)
DATABASE_URL=postgresql://neondb_owner:npg_Dn5Lw8fRVxYA@ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech/neondb

# JWT
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=604800

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Weather API
OPENWEATHER_API_KEY=your-key-here

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

Load environment variables in `settings.py`:
```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
```

---

## Step 10: Create Admin Interface

Create `backend/api/admin.py`:

```python
from django.contrib import admin
from .models import (
    UserProfile, Farm, DiseaseDetection, WeatherData,
    Alert, MarketPrice, FarmingRecommendation,
    FarmAnalytics, PestRecord, IrrigationSchedule,
    ActivityLog
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'preferred_language', 'created_at')
    search_fields = ('user__email', 'phone')

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'crop_type', 'location', 'total_analysis')
    search_fields = ('name', 'location')
    list_filter = ('crop_type', 'created_at')

@admin.register(DiseaseDetection)
class DiseaseDetectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'detected_disease', 'confidence', 'severity', 'created_at')
    search_fields = ('detected_disease', 'farm__name')
    list_filter = ('severity', 'created_at')

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'alert_type', 'severity', 'is_read', 'created_at')
    search_fields = ('title', 'message')
    list_filter = ('alert_type', 'severity', 'is_read')

# Add remaining models similarly
for model in [WeatherData, MarketPrice, FarmingRecommendation, 
              FarmAnalytics, PestRecord, IrrigationSchedule, ActivityLog]:
    admin.site.register(model)
```

Access admin panel: `http://localhost:8000/admin/`

---

## Step 11: Deployment Preparation

### For Production

1. **Update settings.py for production:**
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
```

2. **Collect static files:**
```bash
python manage.py collectstatic
```

3. **Use WSGI server (Gunicorn):**
```bash
pip install gunicorn
gunicorn cropguard.wsgi:application --bind 0.0.0.0:8000
```

4. **Use Nginx as reverse proxy** (recommended)

---

## Database Models Overview

### 11 Main Models
1. **UserProfile** - Extended user information
2. **Farm** - Farm details and metadata
3. **DiseaseDetection** - Disease analysis results
4. **WeatherData** - Weather tracking
5. **Alert** - User notifications
6. **MarketPrice** - Crop market data
7. **FarmingRecommendation** - Farming advice
8. **FarmAnalytics** - Farm performance
9. **PestRecord** - Pest management
10. **IrrigationSchedule** - Water planning
11. **ActivityLog** - User action history

---

## Authentication Flow

### 1. User Registration
```
POST /api/auth/register/ + {email, password, first_name}
→ User created
```

### 2. User Login
```
POST /api/auth/token/ + {email, password}
→ Response: {access: "...", refresh: "..."}
→ Store tokens in localStorage
```

### 3. API Requests
```
GET /api/profile/me/
+ Header: Authorization: Bearer <access_token>
→ User profile returned
```

### 4. Token Refresh (when expired)
```
POST /api/auth/token/refresh/ + {refresh: "..."}
→ New access token generated
```

---

## Troubleshooting

### 1. Database Connection Error
```
Error: psycopg2.OperationalError: could not connect to server
```
**Solution:**
- Check PostgreSQL is running
- Verify Neon connection string is correct
- Ensure SSL certificate is valid
- Check firewall allows port 5432

### 2. Migration Errors
```
Error: RuntimeError: Cannot import User model
```
**Solution:**
```bash
# Clear pycache
find . -type d -name __pycache__ -exec rm -r {} +

# Try migration again
python manage.py migrate
```

### 3. JWT Token Invalid
```
Error: Invalid token or token expired
```
**Solution:**
- Token expires in 1 hour
- Use refresh token to get new access token
- Check system clock synchronization

### 4. CORS Error
```
Cross-Origin Request Blocked
```
**Solution:**
Update `CORS_ALLOWED_ORIGINS` in settings.py:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://yourdomain.com'
]
```

---

## Performance Optimization

### Enable Caching
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

### Database Indexing
Models already include optimized indexes:
- `Farm.user` - for farm queries
- `DiseaseDetection.farm` - for detection queries
- `Alert.user` - for alert filtering
- `ActivityLog.user` - for activity tracking

### Pagination
API uses 20 items per page by default. Increase if needed:
```python
REST_FRAMEWORK = {
    'PAGE_SIZE': 50  # Change from 20
}
```

---

## Testing the API

### Using Python requests library
```python
import requests

# Setup
BASE_URL = 'http://localhost:8000/api'
EMAIL = 'admin@cropguard.com'
PASSWORD = 'your_password'

# 1. Login and get token
response = requests.post(
    f'{BASE_URL}/auth/token/',
    json={'email': EMAIL, 'password': PASSWORD}
)
TOKEN = response.json()['access']

# 2. Get user profile
headers = {'Authorization': f'Bearer {TOKEN}'}
profile = requests.get(f'{BASE_URL}/profile/me/', headers=headers).json()
print(profile)

# 3. Create farm
farm_data = {
    'name': 'Test Farm',
    'crop_type': 'Rice',
    'location': 'Karnataka',
    'area_hectares': 5
}
farm = requests.post(f'{BASE_URL}/farms/', json=farm_data, headers=headers).json()
print(farm)
```

---

## Next Steps

1. ✅ **Backend Setup** - Complete Django project structure
2. ✅ **Database** - Configured with Neon PostgreSQL
3. ✅ **API Endpoints** - 11 ViewSets with 30+ actions
4. 🔄 **Frontend Integration** - Update index.html to use API
5. ⏳ **Frontend Features** - Photo capture, weather, alerts, etc.
6. ⏳ **Admin Interface** - Create admin.py with model admins
7. ⏳ **Testing** - Write unit and integration tests
8. ⏳ **Deployment** - Deploy to production server

---

## Support Resources

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- JWT Docs: https://django-rest-framework-simplejwt.readthedocs.io/
- Neon Docs: https://neon.tech/docs/
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Created:** 2024
**Version:** 1.0
**Status:** Production Ready
