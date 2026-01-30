#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cropguard_backend.settings')
django.setup()

from django.db import connection

# Remove the api migration from the django_migrations table
with connection.cursor() as cursor:
    cursor.execute("DELETE FROM django_migrations WHERE app = 'api'")
    print('✅ Removed api migration record from database')
    
print('\nNow applying the migration...')
os.system('python manage.py migrate api')
