# CropGuard AI - Complete Setup & Deployment Guide

## 📋 Project Structure

```
AID103-PURNACHANDRARAOPARCHURI/
├── index.html                    # Frontend (main)
├── style.css                     # Frontend styles
├── script.js                     # Frontend logic
├── README.md                     # Frontend docs
│
└── backend/                      # Django backend
    ├── manage.py
    ├── requirements.txt
    ├── .env.example
    ├── README.md                 # Backend setup guide
    ├── api_integration.js        # Frontend-Backend bridge
    ├── db.sqlite3               # SQLite database
    ├── cropguard/               # Django project
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   ├── asgi.py
    │   └── __init__.py
    └── api/                     # Django REST API app
        ├── models.py
        ├── views.py
        ├── serializers.py
        ├── admin.py
        ├── analysis_engine.py
        ├── apps.py
        ├── migrations/
        └── __init__.py
```

## 🚀 QUICK START (Windows)

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Setup Database

```bash
python manage.py migrate
```

### Step 5: Create Admin User

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

### Step 6: Run Django Server

```bash
python manage.py runserver
```

✅ Backend is now running at: `http://127.0.0.1:8000`

### Step 7: Open Frontend

1. Open `index.html` in your browser (from the root folder)
2. Or use Python's built-in server:
   ```bash
   # In root directory (in another terminal)
   python -m http.server 8001
   ```
   Then visit: `http://127.0.0.1:8001`

## 📡 API ENDPOINTS (Quick Reference)

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Health Check | `/api/health/` | GET |
| List Farmers | `/api/farmers/` | GET |
| Create Farmer | `/api/farmers/` | POST |
| Create Farm | `/api/farms/` | POST |
| Analyze Image | `/api/analyze/` | POST |
| Get Analyses | `/api/analyses/` | GET |
| Statistics | `/api/analyses/statistics/` | GET |

## 🔌 Frontend-Backend Integration

### Using the API Service in Frontend:

```javascript
// Already integrated in api_integration.js

// Analyze image with backend
const response = await apiService.analyzeImage(formData);

// Get farm details
const farm = await apiService.getFarm(farmId);

// Check health
const health = await apiService.checkHealth();
```

### HTML Integration:

In your `index.html`, add before closing `</body>` tag:

```html
<script src="script.js"></script>
<script src="backend/api_integration.js"></script>
```

## 📊 Admin Dashboard

Access Django Admin:
1. Navigate to: `http://127.0.0.1:8000/admin/`
2. Login with superuser credentials
3. Manage:
   - Farmers
   - Farms
   - Crop Images
   - Disease Analyses
   - Treatments
   - Alerts
   - Disease Profiles

## 🗄️ Database Operations

### View Data (Django Shell):

```bash
python manage.py shell
```

```python
from api.models import Farmer, Farm, DiseaseAnalysis

# List all farmers
farmers = Farmer.objects.all()
for farmer in farmers:
    print(f"{farmer.name} - {farmer.district}")

# List analyses with high severity
high_risk = DiseaseAnalysis.objects.filter(severity='high')
for analysis in high_risk:
    print(f"{analysis.disease_detected} - {analysis.confidence_score}%")

exit()
```

### Reset Database (Fresh Start):

```bash
# Delete database
del db.sqlite3

# Or on macOS/Linux:
rm db.sqlite3

# Create fresh database
python manage.py migrate

# Create new superuser
python manage.py createsuperuser
```

## 🔐 Environment Configuration

Create `.env` file in `backend/` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
USE_POSTGRES=False
```

## 📱 Frontend Usage

### Step 1: Enter Farm Details
- Farmer Name
- Crop Type (dropdown)
- Planting Date

### Step 2: Select Farm Location
- Click on the interactive map
- Zoom in/out as needed
- Coordinates auto-populate
- Click "Confirm Farm Location"

### Step 3: Upload/Fetch Crop Image
- Option A: Drag-drop or click to upload
- Option B: Paste image URL

### Step 4: Analyze with AI
- Click "Analyze with AI" button
- Backend processes and returns:
  - Disease detected
  - Severity level
  - AI confidence score
  - Treatment recommendations
  - Generated alerts

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port
python manage.py runserver 8080
```

### Database Migration Error
```bash
python manage.py makemigrations
python manage.py migrate --fake-initial
```

### CORS Issues
Edit `backend/cropguard/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8001',
    'http://127.0.0.1:8001',
]
```

### Module Not Found
```bash
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Permission Denied on manage.py
```bash
# Make executable (macOS/Linux)
chmod +x manage.py
```

## 🚀 PRODUCTION DEPLOYMENT

### Using Gunicorn + Nginx

```bash
# Install gunicorn
pip install gunicorn

# Run production server
gunicorn cropguard.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Using Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["gunicorn", "cropguard.wsgi:application", "--bind", "0.0.0.0:8000"]
```

Build and run:
```bash
docker build -t cropguard .
docker run -p 8000:8000 cropguard
```

### Using PostgreSQL

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE cropguard_db;
   CREATE USER cropguard_user WITH PASSWORD 'secure_password';
   ALTER ROLE cropguard_user SET client_encoding TO 'utf8';
   GRANT ALL PRIVILEGES ON DATABASE cropguard_db TO cropguard_user;
   ```

3. Update `.env`:
   ```env
   USE_POSTGRES=True
   DB_NAME=cropguard_db
   DB_USER=cropguard_user
   DB_PASSWORD=secure_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

## 📈 Testing the System

### Test API Endpoints

Using cURL or Postman:

```bash
# Health check
curl http://127.0.0.1:8000/api/health/

# Create farmer
curl -X POST http://127.0.0.1:8000/api/farmers/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Rajesh Kumar","email":"rajesh@example.com","phone":"+91-9876543210","district":"Hoshiarpur","state":"Punjab"}'

# Analyze image (with file)
curl -X POST http://127.0.0.1:8000/api/analyze/ \
  -F "image=@/path/to/image.jpg" \
  -F "farm_id=your-farm-uuid" \
  -F "crop_type=wheat" \
  -F "location=Nakodar, Hoshiarpur"
```

## 📚 Key Features Implemented

✅ **Frontend**
- Responsive design (mobile-first)
- Interactive Google Earth-like map
- Image upload & URL fetch
- Real-time preview
- Detection visualization
- Context-aware alerts

✅ **Backend**
- Django REST API
- 7 crop types × 3 diseases = 21 disease profiles
- Severity-based recommendations
- Location-based alerts
- Image analysis engine
- Admin dashboard
- CORS-enabled for frontend

✅ **Integration**
- Seamless frontend-backend communication
- Error handling & fallbacks
- Offline mode support
- Real-time analysis results

## 📞 Support & Resources

- Django Docs: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- Python Requests: https://docs.python-requests.org/
- SQLite Tutorial: https://www.sqlite.org/

## 📝 License

© 2026 Civora Nexus Pvt. Ltd. All rights reserved.

---

**Ready to deploy!** Follow the Quick Start guide above to get your CropGuard AI system running in minutes. 🚀
