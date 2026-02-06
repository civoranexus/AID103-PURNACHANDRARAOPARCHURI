#!/usr/bin/env python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cropguard_backend.settings')

import django
django.setup()

from django.db import connection

print('Checking for API tables in the cloud database...\n')

with connection.cursor() as cursor:
    # Get all tables
    cursor.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = [row[0] for row in cursor.fetchall()]
    
    api_tables = [t for t in tables if t.startswith('api_')]
    
    print(f'Total tables in database: {len(tables)}')
    print(f'API tables found: {len(api_tables)}\n')
    
    if api_tables:
        print('✅ API TABLES CREATED:')
        for table in sorted(api_tables):
            print(f'   - {table}')
        print('\n🎉 DATABASE SCHEMA IS READY!')
        print('\n✅ YES, DATA CAN NOW BE STORED IN THE CLOUD DATABASE!')
    else:
        print('❌ No API tables found')
        print('\nTables in database:')
        for table in sorted(tables):
            print(f'   - {table}')
