# CropGuard AI - Django Backend Setup Guide

## 📦 Backend Structure

```
backend/
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── cropguard/                 # Main Django project
│   ├── __init__.py
│   ├── settings.py            # Django settings
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI application
│   └── asgi.py                # ASGI application (async)
└── api/                       # Django REST API app
    ├── __init__.py
    ├── models.py              # Database models
    ├── views.py               # API views and endpoints
    ├── serializers.py         # DRF serializers
    ├── admin.py               # Django admin config
    ├── apps.py                # App configuration
    ├── analysis_engine.py     # AI analysis logic
    └── migrations/            # Database migrations
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Or on macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Environment Setup

Create `.env` file in backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost,*
USE_POSTGRES=False
```

### 3. Database Setup

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser
# Follow prompts to create admin account
```

### 4. Load Sample Data (Optional)

```bash
python manage.py shell
```

Then in Python shell:

```python
from api.models import Farmer, Farm, DiseaseProfile
from datetime import date

# Create a sample farmer
farmer = Farmer.objects.create(
    name="Rajesh Kumar",
    email="rajesh@example.com",
    phone="+91-9876543210",
    district="Hoshiarpur",
    state="Punjab"
)

# Create a sample farm
farm = Farm.objects.create(
    farmer=farmer,
    crop_type="wheat",
    area_name="Village Nakodar, Hoshiarpur",
    latitude=31.5384,
    longitude=75.7873,
    planting_date=date(2025, 10, 15),
    farm_size_acres=5.0
)

print("Sample data created successfully!")
exit()
```

### 5. Run Development Server

```bash
python manage.py runserver
```

Server will be available at: `http://127.0.0.1:8000/`

### 6. Access Admin Panel

Navigate to: `http://127.0.0.1:8000/admin/`

Log in with your superuser credentials.

## 📡 API Endpoints

### Health Check
- **GET** `/api/health/`
  - Returns: Service status and health info

### Farmers
- **GET** `/api/farmers/` - List all farmers
- **POST** `/api/farmers/` - Create new farmer
- **GET** `/api/farmers/{id}/` - Get farmer details
- **PUT** `/api/farmers/{id}/` - Update farmer
- **DELETE** `/api/farmers/{id}/` - Delete farmer
- **GET** `/api/farmers/{id}/farms/` - Get farmer's farms
- **GET** `/api/farmers/{id}/analyses/` - Get farmer's analyses

### Farms
- **GET** `/api/farms/` - List all farms
- **POST** `/api/farms/` - Create new farm
- **GET** `/api/farms/{id}/` - Get farm details
- **PUT** `/api/farms/{id}/` - Update farm
- **DELETE** `/api/farms/{id}/` - Delete farm
- **GET** `/api/farms/{id}/images/` - Get farm images
- **GET** `/api/farms/{id}/recent_analysis/` - Get latest analysis
- **GET** `/api/farms/{id}/health_summary/` - Get farm health summary

### Disease Analysis
- **GET** `/api/analyses/` - List all analyses
- **GET** `/api/analyses/{id}/` - Get analysis details
- **GET** `/api/analyses/by_severity/?severity=high` - Filter by severity
- **GET** `/api/analyses/by_crop/?crop_type=wheat` - Filter by crop
- **GET** `/api/analyses/statistics/` - Get statistics

### Image Analysis (Main Endpoint)
- **POST** `/api/analyze/` - Analyze crop image

**Request Format:**
```json
{
  "farm_id": "uuid-of-farm",
  "crop_type": "wheat",
  "location": "Village Name, District, State",
  "image": <binary-file-data>,
  "image_url": "https://example.com/image.jpg"  // alternative to image
}
```

**Response Format:**
```json
{
  "analysis_id": "uuid",
  "image_id": "uuid",
  "disease": "Powdery Mildew",
  "severity": "low",
  "confidence": 72.5,
  "cause": "Fungal infection in dry conditions",
  "treatment": {
    "chemical": "Sulfur dust application",
    "organic": "Neem oil spray every 7 days",
    "preventive": "Improve air circulation, reduce humidity",
    "recovery_days": 7
  },
  "affected_region": {
    "x": 0.35,
    "y": 0.42,
    "width": 0.28,
    "height": 0.25
  },
  "alerts": [
    {
      "type": "info",
      "title": "🟢 Powdery Mildew Detection",
      "message": "..."
    }
  ],
  "timestamp": "2026-01-20T10:30:45.123456Z"
}
```

### Location Names
- **GET** `/api/locations/{region}/`
  - Regions: `north`, `south`, `east`, `west`, `central`
  - Returns: List of states/locations in that region

## 🗄️ Database Models

### Farmer
- `id` (UUID)
- `name` (CharField)
- `email` (EmailField, unique)
- `phone` (CharField)
- `address` (TextField)
- `district` (CharField)
- `state` (CharField)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Farm
- `id` (UUID)
- `farmer_id` (ForeignKey to Farmer)
- `crop_type` (CharField: wheat, rice, corn, cotton, potato, tomato, sugarcane)
- `area_name` (CharField)
- `latitude` (DecimalField)
- `longitude` (DecimalField)
- `planting_date` (DateField)
- `expected_harvest_date` (DateField)
- `farm_size_acres` (FloatField)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### CropImage
- `id` (UUID)
- `farm_id` (ForeignKey to Farm)
- `image` (ImageField)
- `image_url` (URLField)
- `uploaded_at` (DateTime)
- `file_size` (IntegerField)

### DiseaseAnalysis
- `id` (UUID)
- `crop_image_id` (OneToOneField to CropImage)
- `farm_id` (ForeignKey to Farm)
- `disease_detected` (CharField)
- `severity` (CharField: low, medium, high)
- `confidence_score` (FloatField 0-100)
- `possible_cause` (TextField)
- `affected_region_x, y, width, height` (FloatField)
- `analyzed_at` (DateTime)

### Treatment
- `id` (UUID)
- `analysis_id` (OneToOneField to DiseaseAnalysis)
- `chemical_treatment` (TextField)
- `organic_alternatives` (TextField)
- `preventive_practices` (TextField)
- `estimated_recovery_days` (IntegerField)
- `created_at` (DateTime)

### Alert
- `id` (UUID)
- `farm_id` (ForeignKey to Farm)
- `alert_type` (CharField: critical, warning, info)
- `title` (CharField)
- `message` (TextField)
- `is_read` (BooleanField)
- `created_at` (DateTime)

## 🔒 Security Notes

1. **CORS Configuration**: Update `CORS_ALLOWED_ORIGINS` in `settings.py` for production
2. **Secret Key**: Use environment variables for SECRET_KEY in production
3. **Debug Mode**: Set `DEBUG=False` in production
4. **Allowed Hosts**: Configure proper domain names
5. **HTTPS**: Enable HTTPS in production

## 🔄 Frontend Integration

Update `script.js` in frontend to connect to backend:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create farm
async function createFarm(farmerData) {
  const response = await fetch(`${API_BASE_URL}/farms/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(farmerData)
  });
  return response.json();
}

// Analyze image
async function analyzeImage(formData) {
  const response = await fetch(`${API_BASE_URL}/analyze/`, {
    method: 'POST',
    body: formData
  });
  return response.json();
}
```

## 📊 Production Deployment

### Using Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Run application
gunicorn cropguard.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Using PostgreSQL (Production)

1. Install PostgreSQL
2. Create database and user
3. Update `.env`:
   ```env
   USE_POSTGRES=True
   DB_NAME=cropguard_db
   DB_USER=cropguard_user
   DB_PASSWORD=secure_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
4. Run migrations

### Using Docker

Create `Dockerfile`:

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

## 🐛 Troubleshooting

### Migration Issues
```bash
# Reset migrations (development only!)
python manage.py migrate api zero
python manage.py migrate
```

### Static Files
```bash
python manage.py collectstatic --noinput
```

### Check Dependencies
```bash
pip list
pip check
```

## 📝 License

© 2026 Civora Nexus Pvt. Ltd. All rights reserved.
