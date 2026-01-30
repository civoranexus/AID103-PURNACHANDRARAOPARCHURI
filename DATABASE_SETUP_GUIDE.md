# Database Connection Troubleshooting & Setup Guide

## Current Database Configuration

### Default (SQLite)
- **Location:** `backend/db.sqlite3`
- **Status:** ✓ Ready to use
- **Best for:** Local development and testing

## Database Setup Instructions

### Step 1: Initialize SQLite Database (Recommended for Testing)

```bash
cd backend

# Run Django migrations (creates db.sqlite3 automatically)
python manage.py migrate

# Create superuser account
python manage.py createsuperuser
# Follow prompts:
# Username: admin
# Email: admin@example.com
# Password: [enter secure password]

# Verify database was created
ls -la db.sqlite3
```

### Step 2: Test Database Connection

```bash
# Open Django shell
python manage.py shell

# Test database connection
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT 1")
print("Database connection successful!")
exit()
```

### Step 3: Run Initial Data Setup

```bash
# Load any initial data (if available)
python manage.py loaddata initial_data

# Or create test data
python manage.py shell
from api.models import UserProfile, Farm
from django.contrib.auth.models import User

# Create test user
user = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpass123'
)

# Create test farm
farm = Farm.objects.create(
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
print(f"Created farm: {farm.farm_name}")
exit()
```

## PostgreSQL Setup (Production)

### For Windows

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 14 or 15
   - Run installer

2. **During Installation**
   - Remember the password for `postgres` user
   - Keep port as 5432
   - Install pgAdmin 4 for GUI management

3. **Create Database**
   - Open pgAdmin 4
   - Right-click "Databases" > "Create" > "Database"
   - Name: `cropguard_db`
   - Owner: (leave as postgres or create new user)
   - Click Save

4. **Create User (Optional)**
   - Right-click "Login/Group Roles" > "Create" > "Login/Group Role"
   - Name: `cropguard_user`
   - Password: `your_secure_password`
   - Privileges: Check "Can login" and "Superuser"

### For macOS

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb cropguard_db

# Create user
createuser cropguard_user
psql postgres
ALTER USER cropguard_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE cropguard_db TO cropguard_user;
```

### For Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Switch to postgres user
sudo -i -u postgres

# Create database
createdb cropguard_db

# Create user and set password
createuser cropguard_user
psql
ALTER USER cropguard_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE cropguard_db TO cropguard_user;
\q

# Exit postgres user
exit
```

### Configure Django for PostgreSQL

1. **Update `backend/requirements.txt`** (already done)
   - Ensure `psycopg2-binary==2.9.6` is included

2. **Update `backend/cropguard_backend/settings.py`**

```python
# Option A: Using environment variable (Recommended)
import dj_database_url
import os

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600)}
else:
    # Fallback to SQLite
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}

# Option B: Direct connection string
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'cropguard_db',
        'USER': 'cropguard_user',
        'PASSWORD': 'secure_password',
        'HOST': 'localhost',
        'PORT': '5432',
        'CONN_MAX_AGE': 600,
    }
}
```

3. **Set Environment Variable (Recommended)**

Windows (Command Prompt):
```bash
set DATABASE_URL=postgresql://cropguard_user:secure_password@localhost:5432/cropguard_db
```

Windows (PowerShell):
```powershell
$env:DATABASE_URL='postgresql://cropguard_user:secure_password@localhost:5432/cropguard_db'
```

macOS/Linux:
```bash
export DATABASE_URL='postgresql://cropguard_user:secure_password@localhost:5432/cropguard_db'
```

Or create `.env` file:
```
DATABASE_URL=postgresql://cropguard_user:secure_password@localhost:5432/cropguard_db
```

4. **Run Migrations**
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

## MySQL Setup (Alternative)

### Installation & Setup

Windows:
- Download MySQL Community Server: https://dev.mysql.com/downloads/mysql/
- Run installer and follow setup wizard

macOS:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

Linux:
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE cropguard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cropguard_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON cropguard_db.* TO 'cropguard_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Configure Django for MySQL

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'cropguard_db',
        'USER': 'cropguard_user',
        'PASSWORD': 'secure_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

## Database Connection Issues

### Issue: "sqlite3.OperationalError: unable to open database file"

**Cause:** Database file location problem or permissions issue

**Solution:**
```bash
cd backend
# Remove old database
rm db.sqlite3

# Recreate it
python manage.py migrate

# Check permissions
ls -la db.sqlite3  # Should show read/write permissions
```

### Issue: "psycopg2.OperationalError: could not connect to server"

**Cause:** PostgreSQL server not running or wrong credentials

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows: Check Services (services.msc)
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Verify connection string
# Format: postgresql://username:password@localhost:5432/dbname

# Test connection
psql postgresql://username:password@localhost:5432/dbname

# Or with psycopg2
python
import psycopg2
conn = psycopg2.connect("host=localhost dbname=cropguard_db user=cropguard_user password=secure_password")
print("Connection successful!")
conn.close()
```

### Issue: "relation 'api_userprofile' does not exist"

**Cause:** Migrations not run yet

**Solution:**
```bash
cd backend
python manage.py migrate
python manage.py migrate api  # Specific app migration
```

### Issue: "Access denied for user 'cropguard_user'@'localhost'"

**Cause:** Wrong password or user doesn't have privileges

**Solution:**
```bash
# Reset MySQL password
# Windows: Use MySQL Notifier or Command Prompt as Admin
# Linux/macOS:
sudo mysql -u root
ALTER USER 'cropguard_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# Then update settings.py with new password
```

## Verify Database Setup

### Check Database Contents

```bash
cd backend

# Django shell command
python manage.py shell

# List all users
from django.contrib.auth.models import User
User.objects.all()

# List all farms
from api.models import Farm
Farm.objects.all()

# Check database tables
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print([row[0] for row in cursor.fetchall()])

# Exit shell
exit()
```

### Via Admin Interface

```bash
# Start Django server
python manage.py runserver

# Visit http://localhost:8000/admin
# Login with superuser credentials
# Browse models and data
```

## Database Backup & Restore

### SQLite Backup

```bash
cd backend

# Simple file copy (while server is stopped)
cp db.sqlite3 db.sqlite3.backup
```

### PostgreSQL Backup

```bash
# Backup
pg_dump cropguard_db -U cropguard_user > backup.sql

# Restore
psql cropguard_db -U cropguard_user < backup.sql
```

### MySQL Backup

```bash
# Backup
mysqldump -u cropguard_user -p cropguard_db > backup.sql

# Restore
mysql -u cropguard_user -p cropguard_db < backup.sql
```

## Production Database Checklist

- [ ] Database server installed and running
- [ ] Database created: `cropguard_db`
- [ ] User created with secure password
- [ ] User has full privileges on database
- [ ] Connection string configured in environment
- [ ] Migrations run: `python manage.py migrate`
- [ ] Superuser created: `python manage.py createsuperuser`
- [ ] Static files collected: `python manage.py collectstatic`
- [ ] Test connection: `python manage.py dbshell`
- [ ] Backup strategy implemented
- [ ] SSL enabled for database connection (production)

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- MySQL Documentation: https://dev.mysql.com/doc/
- Django Database Documentation: https://docs.djangoproject.com/en/stable/ref/databases/
- dj-database-url: https://github.com/jacobian/dj-database-url

---

**If you have a specific database URL, please provide it and I can help configure it!**
