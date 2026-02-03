# ===============================
# CropGuard AI – Backend Deployment
# ===============================

# 1. Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python manage.py makemigrations
python manage.py migrate

# 4. Create admin user (optional but recommended)
python manage.py createsuperuser

# 5. Start backend server
python manage.py runserver

# Backend will be available at:
# http://127.0.0.1:8001/
