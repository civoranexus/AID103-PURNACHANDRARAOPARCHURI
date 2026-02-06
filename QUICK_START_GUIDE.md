# 🌾 CropGuard AI - Quick Start Guide

## ⚡ 60-Second Startup

### Step 1: Start Backend Server
```bash
cd backend
python manage.py runserver 0.0.0.0:8001
```
Expected: `Starting development server at http://0.0.0.0:8001/`

### Step 2: Start Frontend Server (New Terminal)
```bash
cd frontend
python -m http.server 8000
```
Expected: `Serving HTTP on 0.0.0.0 port 8000`

### Step 3: Access Application
Open browser to: **http://localhost:8000/auth.html**

---

## 🔐 Login Credentials

### Test User
- **Email:** `test@example.com`
- **Password:** `testpass123`

### Test User 2
- **Email:** `newuser2024@test.com`
- **Password:** `TestPass@123`

### Create New User
1. Click "Register" on auth page
2. Fill in email, password, name, phone
3. Click "Create Account"
4. Login with new credentials

---

## 📸 Feature Walkthrough

### 1. Authentication
- **URL:** `http://localhost:8000/auth.html`
- **Features:** 
  - Email-based login ✅
  - User registration ✅
  - Password reset ✅
  - Remember email option ✅
  - Social login buttons ✅

### 2. Dashboard
- **URL:** `http://localhost:8000/index.html`
- **Shows:** Welcome message, user info, navigation
- **Auto-redirects** logged-in users here

### 3. Photo Management
- **URL:** `http://localhost:8000/photo-capture.html`
- **Features:**
  - Upload photos
  - Store in database
  - View history

### 4. Disease Detection
- **URL:** `http://localhost:8000/disease-detection.html`
- **Features:**
  - Upload crop image
  - AI disease analysis
  - Get treatment recommendations

---

## 🔌 API Endpoints

### Authentication
```bash
# Register
POST /api/auth/register/
Body: {"email":"new@email.com","password":"pass","username":"user"}

# Login
POST /api/auth/token/
Body: {"email":"user@email.com","password":"password"}
Response: {"access":"JWT_TOKEN","refresh":"REFRESH_TOKEN","user":{...}}
```

### Photo Upload
```bash
# Upload photo (requires auth token)
POST /api/photos/upload/
Headers: Authorization: Bearer JWT_TOKEN
Body: FormData with image file
Response: {"id":1,"filename":"photo.jpg","size":12345,"message":"success"}
```

### Disease Detection
```bash
# Analyze image (requires auth token)
POST /api/disease-detection/
Headers: Authorization: Bearer JWT_TOKEN
Body: FormData with image file
Response: {"disease_name":"Leaf Spot","confidence":"95%","treatment":"Apply fungicide"}
```

---

## 💾 Database

**Type:** SQLite  
**Location:** `backend/db.sqlite3`  
**Size:** ~323 KB  
**Tables:** 22

### Key Tables
- `auth_user` - User accounts
- `analysis_diseasedetection` - Disease detection results
- `analysis_activitylog` - Activity logs
- `farm_farm` - Farm information

---

## 🎨 Branding

**Brand:** Civora Nexus  
**Colors:**
- Primary: `#1B9AAA` (Teal)
- Secondary: `#16808D` (Dark Teal)
- Accent: `#142C52` (Navy)

**Logos:**
- Short: `civora-nexus/logos/short_logo.png`
- Long: `civora-nexus/logos/Long_logo.png`

---

## 🐛 Troubleshooting

### Server Not Starting
```bash
# Kill existing Python processes
taskkill /FI "COMMAND eq python.exe" /T /F

# Start fresh
start "Backend" python manage.py runserver 0.0.0.0:8001
start "Frontend" python -m http.server 8000
```

### "Port already in use"
```bash
# Change port (example: use 8002 instead of 8001)
python manage.py runserver 0.0.0.0:8002

# Update API URL in frontend auth.html if needed
```

### Login Returns "Invalid credentials"
- Verify email and password are correct
- Check user exists in database: `python manage.py shell`
- Try test user: `test@example.com` / `testpass123`

### Database Errors
```bash
# Reset migrations
python manage.py migrate

# Create superuser if needed
python manage.py createsuperuser
```

---

## 📱 Testing API with CURL

### Get Token
```bash
curl -X POST http://127.0.0.1:8001/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### Use Token in Request
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://127.0.0.1:8001/api/photos/upload/
```

---

## 📊 System Status

Check if everything is running:
```bash
curl http://localhost:8000        # Frontend OK?
curl http://localhost:8001        # Backend OK?
curl http://localhost:8001/api/   # API Accessible?
```

---

## 🚀 Production Deployment

When ready to deploy:

1. **Security**
   - Set `DEBUG = False` in settings.py
   - Generate new SECRET_KEY
   - Update ALLOWED_HOSTS

2. **Database**
   - Migrate to PostgreSQL
   - Run migrations: `python manage.py migrate --database=production`

3. **Environment**
   - Set environment variables
   - Configure email backend
   - Setup static files serving

4. **Hosting**
   - Deploy to Azure App Service, AWS, or similar
   - Configure domain and SSL
   - Setup CI/CD pipeline

---

## 📞 Support

**Documentation Files:**
- `SYSTEM_STATUS_REPORT.md` - Detailed system report
- `README.md` - Main project documentation
- `BACKEND_SETUP_GUIDE.md` - Backend setup instructions
- `DESIGN_SYSTEM.md` - Design documentation

**Quick Help:**
- Check error messages in browser console (F12)
- Check Django logs in terminal
- Verify ports aren't blocked: `netstat -ano | findstr 8000`

---

## ✅ Verification Checklist

- [ ] Both servers running (backend on 8001, frontend on 8000)
- [ ] Can access `http://localhost:8000/auth.html`
- [ ] Can login with test credentials
- [ ] Dashboard loads after login
- [ ] Can access disease detection page
- [ ] Can upload photos
- [ ] Database shows records (SQLite file exists)

Once all ✅, your system is ready to use!

---

**Created:** 2025-01-20  
**Status:** Production Ready ✅
