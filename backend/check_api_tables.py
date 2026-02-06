#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cropguard_backend.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Check for UserProfile table
    cursor.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='api_userprofile')")
    up = cursor.fetchone()[0]
    
    cursor.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='api_farm')")
    farm = cursor.fetchone()[0]
    
    cursor.execute("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='api_diseasedetection')")
    dd = cursor.fetchone()[0]
    
    print(f'UserProfile table exists: {up}')
    print(f'Farm table exists: {farm}')
    print(f'DiseaseDetection table exists: {dd}')
    
    if up and farm and dd:
        print('\n✅ All API tables have been created successfully!')
        print('\nNow testing data insertion...')
        
        # Test insertion
        from api.models import UserProfile
        from django.contrib.auth.models import User
        
        user = User.objects.create_user(username='testuser', password='testpass123')
        profile = UserProfile.objects.create(user=user, location='Test Farm')
        
        print(f'✅ Created test user: {user.username}')
        print(f'✅ Created test profile: {profile.location}')
        print('\n🎉 DATA IS BEING STORED IN THE CLOUD DATABASE!')
    else:
        print('\n❌ Some tables are missing')
        print('Running migration...')
        os.system('python manage.py migrate api')
