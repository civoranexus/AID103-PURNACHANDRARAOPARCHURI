#!/usr/bin/env python
"""
Check database tables
"""
import os
import sys
import django
import sqlite3

# Setup Django
sys.path.insert(0, 'c:\\Users\\purna\\OneDrive\\Desktop\\AID103-PURNACHANDRARAOPARCHURI\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cropguard_backend.settings')
django.setup()

from django.db import connection

print("\n" + "="*60)
print("DATABASE TABLES CHECK")
print("="*60)

# Get list of tables
with connection.cursor() as cursor:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
print(f"\n✓ Total tables in database: {len(tables)}")
print("\nTables found:")
for table in tables:
    print(f"  • {table[0]}")

# Check if API tables exist
api_tables = [
    'api_userprofile',
    'farms_farm',
    'analysis_diseasedetection',
    'analysis_weatherdata',
    'notificatio_alert'
]

print("\nAPI Model Tables:")
existing_tables = [t[0] for t in tables]
for expected_table in api_tables:
    if expected_table in existing_tables:
        print(f"  ✓ {expected_table} - EXISTS")
    else:
        print(f"  ✗ {expected_table} - MISSING")

print("\n" + "="*60)
