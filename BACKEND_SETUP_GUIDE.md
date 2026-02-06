====================================================================
CROPGUARD AI – DJANGO BACKEND SETUP GUIDE
====================================================================

Version            : 1.1 (Expanded & Verified)
Project             : CropGuard AI
Organization        : Civora Nexus Pvt. Ltd.
Framework           : Django 4.2 + Django REST Framework
Database             : Neon PostgreSQL (Cloud-hosted)
Authentication       : JWT (JSON Web Tokens)
API Base URL         : http://localhost:8001/api/
Document Purpose     : Backend Setup, Validation, and Integration Guide
Status               : STABLE – READY FOR FRONTEND & AI INTEGRATION

====================================================================
1. OVERVIEW
====================================================================

This document provides a complete, end-to-end guide for setting up the
CropGuard AI Django backend. It covers environment preparation, package
installation, database configuration, authentication setup, API
validation, frontend integration, and deployment readiness.

The backend is designed to:
- Support secure authentication using JWT
- Store structured agricultural data
- Expose REST APIs for frontend consumption
- Integrate AI/ML modules in later phases
- Follow internship-grade and industry-grade standards

====================================================================
2. PREREQUISITES
====================================================================

2.1 Required Software

- Python 3.9 or higher
- pip (Python package manager)
- Git (version control)
- PostgreSQL client tools (psql)

2.2 Optional but Recommended Tools

- Virtual Environment (venv)
- Postman / Insomnia for API testing
- VS Code with Python & Django extensions
- pgAdmin (optional GUI for PostgreSQL)

====================================================================
3. VIRTUAL ENVIRONMENT SETUP
====================================================================

3.1 Windows

python -m venv venv
venv\Scripts\activate

3.2 macOS / Linux

python3 -m venv venv
source venv/bin/activate

Purpose:
- Isolates dependencies
- Prevents system-level conflicts
- Ensures reproducible environments

====================================================================
4. DEPENDENCY INSTALLATION
====================================================================

4.1 requirements.txt

The backend/requirements.txt file must contain:

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

4.2 Install Packages

pip install -r backend/requirements.txt

This installs:
- Core Django framework
- REST API support
- JWT authentication
- PostgreSQL driver
- Environment variable loader
- Async task support
- Image processing utilities

====================================================================
5. DATABASE CONFIGURATION (NEON POSTGRESQL)
====================================================================

5.1 Neon PostgreSQL Connection

Database URL:
postgresql://neondb_owner:npg_Dn5Lw8fRVxYA@ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

5.2 Connection Components

Host       : ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech
Port       : 5432
Database   : neondb
User       : neondb_owner
SSL        : Required

5.3 Connection Verification

psql "postgresql://neondb_owner:*****@ep-small-meadow-ahsu0s8a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

Expected Output:
neondb=>

====================================================================
6. DJANGO PROJECT STRUCTURE
====================================================================

backend/
├── manage.py
├── requirements.txt
├── api_integration.js
├── cropguard/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── static/
│
├── api/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── admin.py
│   ├── permissions.py
│   ├── tests.py
│   └── migrations/
│
└── logs/
    └── django.log

Each folder has a clear responsibility and follows Django best practices.

====================================================================
7. DJANGO INITIALIZATION
====================================================================

7.1 Create App (If not already created)

cd backend
python manage.py startapp api

7.2 Migrations

python manage.py makemigrations
python manage.py migrate

Purpose:
- Creates database schema
- Syncs Django models with PostgreSQL

7.3 Create Superuser

python manage.py createsuperuser

Used for:
- Admin panel access
- Debugging database records
- Managing users manually

====================================================================
8. RUNNING THE SERVER
====================================================================

python manage.py runserver 8001

Server URL:
http://127.0.0.1:8001/

====================================================================
9. AUTHENTICATION SYSTEM
====================================================================

9.1 JWT Authentication

JWT is used for:
- Stateless authentication
- Secure API access
- Token-based authorization

9.2 Auth Endpoints

POST   /api/auth/register/
POST   /api/auth/token/
POST   /api/auth/token/refresh/

9.3 Token Storage

Frontend stores:
- access_token
- refresh_token
- user metadata

Stored in localStorage for session persistence.

====================================================================
10. DATABASE MODELS OVERVIEW
====================================================================

1. UserProfile
2. Farm
3. DiseaseDetection
4. WeatherData
5. Alert
6. MarketPrice
7. FarmingRecommendation
8. FarmAnalytics
9. PestRecord
10. IrrigationSchedule
11. ActivityLog

Each model is normalized and linked via foreign keys.

====================================================================
11. API ENDPOINT CATEGORIES
====================================================================

Authentication
User Profile
Farm Management
Disease Detection
Weather & Alerts
Market Prices
Recommendations
Pest & Irrigation
Analytics
Activity Logs

All endpoints follow REST principles.

====================================================================
12. FRONTEND INTEGRATION
====================================================================

Frontend communicates via:
http://localhost:8001/api

Authorization header:
Authorization: Bearer <access_token>

Scripts must load in order:
1. api-integration.js
2. script-integrated.js

====================================================================
13. ENVIRONMENT VARIABLES
====================================================================

.env file:

DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://...
ACCESS_TOKEN_LIFETIME=3600
REFRESH_TOKEN_LIFETIME=604800
CORS_ALLOWED_ORIGINS=http://localhost:8000

Loaded using python-decouple.

====================================================================
14. ADMIN PANEL
====================================================================

Access:
http://localhost:8000/admin/

Admin features:
- View users
- Manage farms
- Inspect detections
- Monitor alerts

====================================================================
15. SECURITY MEASURES
====================================================================

- JWT authentication
- Token expiration
- CORS restrictions
- Secure password validation
- Session cleanup on logout

====================================================================
16. TESTING PROCEDURES
====================================================================

- Manual API testing
- Token validation
- Database record verification
- Unauthorized access checks
- Error handling tests

====================================================================
17. DEPLOYMENT PREPARATION
====================================================================

- DEBUG=False
- ALLOWED_HOSTS configured
- collectstatic executed
- Gunicorn + Nginx recommended

====================================================================
18. TROUBLESHOOTING
====================================================================

Database errors → check SSL, credentials
JWT errors → refresh token
CORS errors → update settings.py
Migration issues → clear cache and retry

====================================================================
19. PERFORMANCE OPTIMIZATION
====================================================================

- Redis caching
- Pagination
- Indexed foreign keys
- Query optimization

====================================================================
20. FINAL STATUS
====================================================================

Backend Setup            : COMPLETE
Database Integration     : VERIFIED
Authentication           : STABLE
API Layer                : READY
Frontend Integration     : READY
AI Integration           : PENDING (Next Phase)

====================================================================
END OF DOCUMENT
====================================================================
