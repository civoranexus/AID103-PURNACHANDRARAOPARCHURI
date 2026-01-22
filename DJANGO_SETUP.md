# Django Backend Configuration - CropGuard AI

## Database Connection (Neon PostgreSQL)

### settings.py Configuration

```python
# Database Configuration for Neon PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'neondb',
        'USER': 'neondb_owner',
        'PASSWORD': 'npg_Dn5Lw8fRVxYA',
        'HOST': 'ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech',
        'PORT': '5432',
        'ATOMIC_REQUESTS': True,
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'sslmode': 'require',
            'connect_timeout': 10,
        }
    }
}

# Connection String (Alternative):
# postgresql://neondb_owner:npg_Dn5Lw8fRVxYA@ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# OR use environment variable
import os
# DATABASES['default']['PASSWORD'] = os.environ.get('DB_PASSWORD')
```

### Required Django Packages

```bash
pip install django
pip install djangorestframework
pip install django-cors-headers
pip install psycopg2-binary
pip install python-decouple
pip install pillow
pip install requests
pip install django-filter
pip install django-extensions
```

### Setup Commands

```bash
# Create Django project
django-admin startproject cropguard_backend

# Create apps
python manage.py startapp api
python manage.py startapp users
python manage.py startapp farms
python manage.py startapp analysis
python manage.py startapp notifications

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

---

## Project Structure

```
cropguard_backend/
├── cropguard_backend/
│   ├── settings.py          (Database config)
│   ├── urls.py              (Main URLs)
│   ├── wsgi.py
│   └── asgi.py
├── api/                     (API endpoints)
│   ├── models.py            (All models)
│   ├── views.py             (API views)
│   ├── serializers.py       (DRF serializers)
│   ├── urls.py              (API routes)
│   └── permissions.py
├── users/
│   ├── models.py            (User model)
│   ├── views.py
│   └── serializers.py
├── farms/
│   ├── models.py            (Farm model)
│   ├── views.py
│   └── serializers.py
├── analysis/
│   ├── models.py            (Analysis model)
│   ├── views.py
│   └── serializers.py
├── notifications/
│   ├── models.py
│   ├── views.py
│   └── tasks.py
├── manage.py
└── requirements.txt
```

---

## Database Tables to Create

### 1. User Profile
```sql
CREATE TABLE users_userprofile (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    phone VARCHAR(20),
    state VARCHAR(50),
    district VARCHAR(50),
    village VARCHAR(50),
    language_preference VARCHAR(20) DEFAULT 'en',
    notification_preference BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Farms
```sql
CREATE TABLE farms_farm (
    id SERIAL PRIMARY KEY,
    user_id INT,
    farm_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area_in_acres DECIMAL(10, 2),
    crop_type VARCHAR(100),
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Analysis/Detection
```sql
CREATE TABLE analysis_detection (
    id SERIAL PRIMARY KEY,
    farm_id INT,
    image_url VARCHAR(500),
    detected_disease VARCHAR(255),
    severity VARCHAR(20),
    confidence DECIMAL(5, 2),
    recommendations TEXT,
    chemical_treatment TEXT,
    organic_treatment TEXT,
    preventive_measures TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Weather Data
```sql
CREATE TABLE analysis_weather (
    id SERIAL PRIMARY KEY,
    farm_id INT,
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    rainfall DECIMAL(10, 2),
    wind_speed DECIMAL(5, 2),
    condition VARCHAR(100),
    alert_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Alerts
```sql
CREATE TABLE notifications_alert (
    id SERIAL PRIMARY KEY,
    user_id INT,
    farm_id INT,
    alert_type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    severity VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Market Prices
```sql
CREATE TABLE analysis_marketprice (
    id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100),
    price DECIMAL(10, 2),
    region VARCHAR(100),
    market_name VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Next Steps

1. **Create Django models.py** with all these tables
2. **Create API endpoints** (REST Framework views)
3. **Integrate frontend** with backend APIs
4. **Implement authentication** (JWT tokens)
5. **Add all 24 features** with backend support
6. **Create complete documentation**

Ready to proceed? I'll now create:
- ✅ Complete Django models.py
- ✅ API views and serializers
- ✅ URL routing
- ✅ Frontend integration code
- ✅ All 24 features implemented

Shall I continue? 🚀
