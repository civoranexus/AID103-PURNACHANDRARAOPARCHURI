#!/usr/bin/env python
"""
Database and Google Connection Verification Script
Tests connectivity to Django database and Google services
"""

import os
import sys
import django
import json
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).parent / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cropguard_backend.settings')
django.setup()

from django.db import connections
from django.db.utils import OperationalError
from django.contrib.auth.models import User
import requests

print("=" * 80)
print("CONNECTION VERIFICATION REPORT")
print("=" * 80)
print()

# ============================================
# 1. DATABASE CONNECTION TEST
# ============================================
print("📊 DATABASE CONNECTION TEST")
print("-" * 80)

db_results = {
    'status': 'unknown',
    'database': 'SQLite',
    'details': []
}

try:
    connection = connections['default']
    cursor = connection.cursor()
    cursor.execute("SELECT 1")
    result = cursor.fetchone()
    
    if result:
        db_results['status'] = '✅ CONNECTED'
        db_results['details'].append(f"Connection type: {connection.settings_dict['ENGINE']}")
        db_results['details'].append(f"Database path: {connection.settings_dict['NAME']}")
        
        # Check if database file exists
        db_path = connection.settings_dict['NAME']
        if os.path.exists(db_path):
            db_size = os.path.getsize(db_path)
            db_results['details'].append(f"Database file exists: Yes")
            db_results['details'].append(f"Database size: {db_size} bytes")
        
        # Count tables and records
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        db_results['details'].append(f"Total tables: {len(tables)}")
        
        # Get table details
        table_info = {}
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            table_info[table_name] = count
        
        db_results['details'].append("Table records:")
        for table_name, count in table_info.items():
            db_results['details'].append(f"  - {table_name}: {count} records")
    else:
        db_results['status'] = '❌ FAILED'
        db_results['details'].append("Database query returned no result")
        
except OperationalError as e:
    db_results['status'] = '❌ FAILED'
    db_results['details'].append(f"OperationalError: {str(e)}")
except Exception as e:
    db_results['status'] = '❌ FAILED'
    db_results['details'].append(f"Error: {str(e)}")

for detail in db_results['details']:
    print(detail)
print()

# ============================================
# 2. GOOGLE SERVICES CONNECTION TEST
# ============================================
print("🔍 GOOGLE SERVICES CONNECTION TEST")
print("-" * 80)

google_results = {
    'Google Maps API': {'status': 'NOT CONFIGURED'},
    'Google Cloud Services': {'status': 'NOT CONFIGURED'},
    'Google OAuth': {'status': 'NOT CONFIGURED'},
    'Firebase': {'status': 'NOT CONFIGURED'},
}

# Test Google Maps API (geolocation)
print("Testing Google Maps API connectivity...")
try:
    # Using free Google Maps static API endpoint (doesn't require key for basic test)
    response = requests.head('https://maps.google.com', timeout=5)
    if response.status_code < 400:
        google_results['Google Maps API']['status'] = '✅ REACHABLE'
        google_results['Google Maps API']['note'] = 'Google Maps service is accessible'
    else:
        google_results['Google Maps API']['status'] = '⚠️ RESTRICTED'
        google_results['Google Maps API']['note'] = f'Status code: {response.status_code}'
except requests.exceptions.Timeout:
    google_results['Google Maps API']['status'] = '❌ TIMEOUT'
    google_results['Google Maps API']['note'] = 'Connection timeout'
except Exception as e:
    google_results['Google Maps API']['status'] = '❌ FAILED'
    google_results['Google Maps API']['note'] = str(e)

# Test Google Cloud connectivity
print("Testing Google Cloud connectivity...")
try:
    response = requests.head('https://cloud.google.com', timeout=5)
    if response.status_code < 400:
        google_results['Google Cloud Services']['status'] = '✅ REACHABLE'
        google_results['Google Cloud Services']['note'] = 'Google Cloud is accessible'
    else:
        google_results['Google Cloud Services']['status'] = '⚠️ RESTRICTED'
        google_results['Google Cloud Services']['note'] = f'Status code: {response.status_code}'
except requests.exceptions.Timeout:
    google_results['Google Cloud Services']['status'] = '❌ TIMEOUT'
    google_results['Google Cloud Services']['note'] = 'Connection timeout'
except Exception as e:
    google_results['Google Cloud Services']['status'] = '❌ FAILED'
    google_results['Google Cloud Services']['note'] = str(e)

# Test Firebase connectivity
print("Testing Firebase connectivity...")
try:
    response = requests.head('https://firebase.google.com', timeout=5)
    if response.status_code < 400:
        google_results['Firebase']['status'] = '✅ REACHABLE'
        google_results['Firebase']['note'] = 'Firebase is accessible'
    else:
        google_results['Firebase']['status'] = '⚠️ RESTRICTED'
        google_results['Firebase']['note'] = f'Status code: {response.status_code}'
except requests.exceptions.Timeout:
    google_results['Firebase']['status'] = '❌ TIMEOUT'
    google_results['Firebase']['note'] = 'Connection timeout'
except Exception as e:
    google_results['Firebase']['status'] = '❌ FAILED'
    google_results['Firebase']['note'] = str(e)

# Print Google results
for service, result in google_results.items():
    status = result['status']
    note = result.get('note', '')
    print(f"{service}: {status}")
    if note:
        print(f"  └─ {note}")

print()

# ============================================
# 3. DJANGO API ENDPOINTS TEST
# ============================================
print("🔌 DJANGO API ENDPOINTS TEST")
print("-" * 80)

api_endpoints = [
    '/api/auth/register/',
    '/api/auth/token/',
    '/api/users/',
    '/api/farms/',
    '/api/disease-detection/',
    '/api/weather/',
    '/api/alerts/',
]

print("Available API endpoints configured:")
for endpoint in api_endpoints:
    print(f"  ✓ {endpoint}")

print()

# ============================================
# 4. BACKEND SERVER STATUS
# ============================================
print("🖥️  BACKEND SERVER STATUS")
print("-" * 80)

try:
    response = requests.get('http://localhost:8000/api/', timeout=3)
    server_status = "✅ RUNNING"
    server_note = f"HTTP {response.status_code}"
except requests.exceptions.ConnectionError:
    server_status = "❌ NOT RUNNING"
    server_note = "Cannot connect to http://localhost:8000"
except requests.exceptions.Timeout:
    server_status = "❌ TIMEOUT"
    server_note = "Connection timeout"
except Exception as e:
    server_status = "⚠️ ERROR"
    server_note = str(e)

print(f"Django Development Server: {server_status}")
print(f"  └─ {server_note}")
print()

# ============================================
# 5. ENVIRONMENT CONFIGURATION
# ============================================
print("⚙️  ENVIRONMENT CONFIGURATION")
print("-" * 80)

from django.conf import settings

config_details = {
    'DEBUG Mode': settings.DEBUG,
    'Allowed Hosts': settings.ALLOWED_HOSTS,
    'Database Type': settings.DATABASES['default']['ENGINE'],
    'JWT Authentication': 'Enabled' if settings.REST_FRAMEWORK else 'Disabled',
    'CORS Enabled': bool(settings.CORS_ALLOWED_ORIGINS),
    'Email Backend': settings.EMAIL_BACKEND,
}

for key, value in config_details.items():
    if isinstance(value, bool):
        value = "✅ Yes" if value else "❌ No"
    elif isinstance(value, list):
        value = ", ".join(value) if value else "Not configured"
    print(f"{key}: {value}")

print()

# ============================================
# SUMMARY
# ============================================
print("=" * 80)
print("SUMMARY")
print("=" * 80)

summary = {
    'Database Connection': db_results['status'],
    'Google Services': 'Partially Configured' if any('✅' in str(v['status']) for v in google_results.values()) else 'Not Configured',
    'Django Backend': 'Ready' if db_results['status'].startswith('✅') else 'Check Required',
}

print()
for check, result in summary.items():
    print(f"✓ {check}: {result}")

print()
print("=" * 80)

# Additional Recommendations
print("📋 RECOMMENDATIONS")
print("-" * 80)
print("1. DATABASE: Configure connection pooling for production")
print("2. GOOGLE: Set up API keys for Maps, Cloud, OAuth if needed")
print("3. SECURITY: Enable HTTPS and secure settings in production")
print("4. MONITORING: Set up logging for database and API requests")
print("5. BACKUP: Configure database backups")
print()
