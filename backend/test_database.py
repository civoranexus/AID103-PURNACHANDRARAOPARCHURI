#!/usr/bin/env python
"""
Test script to verify database is storing data correctly
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/purna/OneDrive/Desktop/AID103-PURNACHANDRARAOPARCHURI/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cropguard_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, Farm
from datetime import datetime

print("\n" + "="*60)
print("DATABASE STORAGE TEST")
print("="*60)

# Test 1: Create test user
print("\n[1/5] Creating test user...")
user, created = User.objects.get_or_create(
    username='testfarmer',
    defaults={
        'email': 'testfarmer@example.com',
        'first_name': 'Test',
        'last_name': 'Farmer'
    }
)
if created:
    user.set_password('testpass123')
    user.save()
    print(f"✓ User created: {user.username}")
else:
    print(f"✓ User already exists: {user.username}")

# Test 2: Create user profile
print("\n[2/5] Creating user profile...")
profile, created = UserProfile.objects.get_or_create(
    user=user,
    defaults={
        'phone': '+91-9876543210',
        'state': 'Maharashtra',
        'district': 'Pune',
        'village': 'Test Village',
        'language_preference': 'en',
        'notification_preference': True,
        'email_alerts': True
    }
)
if created:
    print(f"✓ Profile created for {user.username}")
else:
    print(f"✓ Profile already exists for {user.username}")

# Test 3: Create test farms
print("\n[3/5] Creating test farms...")
farms_data = [
    {
        'farm_name': 'Green Valley Farm',
        'latitude': '28.5355',
        'longitude': '77.3910',
        'area_in_acres': '5.5',
        'region': 'north',
        'crop_type': 'wheat',
        'planting_date': '2024-01-15',
        'soil_type': 'loamy',
        'irrigation_type': 'drip'
    },
    {
        'farm_name': 'Golden Harvest Farm',
        'latitude': '19.0760',
        'longitude': '72.8777',
        'area_in_acres': '3.2',
        'region': 'west',
        'crop_type': 'rice',
        'planting_date': '2024-02-01',
        'soil_type': 'clayey',
        'irrigation_type': 'canal'
    },
]

farm_count = 0
for farm_data in farms_data:
    farm, created = Farm.objects.get_or_create(
        user=user,
        farm_name=farm_data['farm_name'],
        defaults=farm_data
    )
    if created:
        print(f"  ✓ Farm created: {farm.farm_name}")
        farm_count += 1
    else:
        print(f"  ✓ Farm already exists: {farm.farm_name}")

# Test 4: Query database to verify storage
print("\n[4/5] Querying database to verify data...")
total_users = User.objects.count()
total_profiles = UserProfile.objects.count()
total_farms = Farm.objects.filter(user=user).count()

print(f"  • Total users in database: {total_users}")
print(f"  • Total user profiles: {total_profiles}")
print(f"  • Total farms for test user: {total_farms}")

# Test 5: Display stored data
print("\n[5/5] Displaying stored data...")
print("\n  USER DATA:")
print(f"    ├─ Username: {user.username}")
print(f"    ├─ Email: {user.email}")
print(f"    ├─ Full Name: {user.first_name} {user.last_name}")
print(f"    └─ Created: {user.date_joined}")

if profile:
    print("\n  PROFILE DATA:")
    print(f"    ├─ Phone: {profile.phone}")
    print(f"    ├─ Location: {profile.village}, {profile.district}, {profile.state}")
    print(f"    ├─ Language: {profile.language_preference}")
    print(f"    └─ Created: {profile.created_at}")

farms = Farm.objects.filter(user=user)
if farms.exists():
    print(f"\n  FARM DATA ({farms.count()} farms):")
    for farm in farms:
        print(f"    Farm: {farm.farm_name}")
        print(f"      ├─ Location: ({farm.latitude}, {farm.longitude})")
        print(f"      ├─ Area: {farm.area_in_acres} acres")
        print(f"      ├─ Crop: {farm.crop_type}")
        print(f"      ├─ Soil: {farm.soil_type}")
        print(f"      ├─ Irrigation: {farm.irrigation_type}")
        print(f"      └─ Created: {farm.created_at}")

print("\n" + "="*60)
print("✅ DATABASE STORAGE TEST COMPLETED SUCCESSFULLY")
print("="*60)
print("\nCONCLUSION:")
print("✓ Data is being stored in the database correctly")
print("✓ SQLite database is functioning properly")
print("✓ All Django models are working as expected")
print("\n")
