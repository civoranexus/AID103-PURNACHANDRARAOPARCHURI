# Django URL Configuration
# File: api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'auth/register', views.UserRegistrationViewSet, basename='register')
router.register(r'profile', views.UserProfileViewSet, basename='profile')
router.register(r'farms', views.FarmViewSet, basename='farm')
router.register(r'detections', views.DiseaseDetectionViewSet, basename='detection')
router.register(r'weather', views.WeatherDataViewSet, basename='weather')
router.register(r'alerts', views.AlertViewSet, basename='alert')
router.register(r'market-prices', views.MarketPriceViewSet, basename='market-price')
router.register(r'recommendations', views.FarmingRecommendationViewSet, basename='recommendation')
router.register(r'pests', views.PestRecordViewSet, basename='pest')
router.register(r'irrigation', views.IrrigationScheduleViewSet, basename='irrigation')
router.register(r'activity-logs', views.ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    # Authentication
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API routes
    path('', include(router.urls)),
]
