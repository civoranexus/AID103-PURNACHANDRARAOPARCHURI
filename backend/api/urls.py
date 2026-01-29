# Django URL Configuration
# File: api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

# Import APIView for direct registration endpoint
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import UserRegistrationSerializer
from django.contrib.auth.models import User

# Custom Email-based Login View
class EmailTokenObtainView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'detail': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                # Generate token using TokenObtainPairView
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {'id': user.id, 'email': user.email, 'username': user.username}
                }, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Simple registration view
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

router = DefaultRouter()
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
    path('auth/token/', EmailTokenObtainView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    
    # Photo and Disease Detection
    path('photos/upload/', views.photo_upload, name='photo_upload'),
    path('disease-detection/', views.disease_detection, name='disease_detection'),
    
    # API routes
    path('', include(router.urls)),
]
