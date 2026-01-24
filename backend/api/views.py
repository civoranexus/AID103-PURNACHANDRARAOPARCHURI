# Django REST Framework Views for CropGuard AI
# File: api/views.py

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
import requests
from datetime import timedelta

from .models import (
    UserProfile, Farm, DiseaseDetection, WeatherData, Alert,
    MarketPrice, FarmingRecommendation, FarmAnalytics, PestRecord,
    IrrigationSchedule, ActivityLog
)
from .serializers import (
    UserProfileSerializer, FarmListSerializer, FarmDetailSerializer,
    FarmCreateUpdateSerializer, DiseaseDetectionListSerializer,
    DiseaseDetectionDetailSerializer, DiseaseDetectionCreateSerializer,
    WeatherDataSerializer, AlertListSerializer, AlertDetailSerializer,
    MarketPriceSerializer, FarmingRecommendationSerializer,
    FarmAnalyticsSerializer, PestRecordListSerializer,
    PestRecordDetailSerializer, IrrigationScheduleSerializer,
    ActivityLogSerializer, UserRegistrationSerializer
)


# ============================================
# PAGINATION
# ============================================
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ============================================
# PERMISSIONS
# ============================================
class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit their objects"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


# ============================================
# AUTHENTICATION VIEWS
# ============================================
class UserRegistrationViewSet(viewsets.ViewSet):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def create(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# USER PROFILE VIEWSET
# ============================================
class UserProfileViewSet(viewsets.ViewSet):
    """User profile management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Get current user profile"""
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        """Update user profile"""
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get user statistics"""
        farms = Farm.objects.filter(user=request.user).count()
        detections = DiseaseDetection.objects.filter(farm__user=request.user).count()
        alerts = Alert.objects.filter(user=request.user, is_read=False).count()
        
        return Response({
            'total_farms': farms,
            'total_detections': detections,
            'unread_alerts': alerts
        })


# ============================================
# FARM VIEWSET
# ============================================
class FarmViewSet(viewsets.ModelViewSet):
    """Farm CRUD operations"""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FarmListSerializer
        elif self.action == 'retrieve':
            return FarmDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return FarmCreateUpdateSerializer
        return FarmListSerializer
    
    def get_queryset(self):
        return Farm.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        farm = serializer.save(user=self.request.user)
        # Create analytics for new farm
        FarmAnalytics.objects.create(farm=farm)
        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            farm=farm,
            activity_type='farm_created',
            description=f"Farm '{farm.farm_name}' created"
        )
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get farm analytics"""
        farm = self.get_object()
        analytics = FarmAnalytics.objects.get(farm=farm)
        serializer = FarmAnalyticsSerializer(analytics)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def weather(self, request, pk=None):
        """Get latest weather for farm"""
        farm = self.get_object()
        weather = WeatherData.objects.filter(farm=farm).latest('recorded_at')
        serializer = WeatherDataSerializer(weather)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def recent_detections(self, request, pk=None):
        """Get recent disease detections for farm"""
        farm = self.get_object()
        detections = DiseaseDetection.objects.filter(farm=farm)[:10]
        serializer = DiseaseDetectionListSerializer(detections, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def fetch_weather(self, request, pk=None):
        """Fetch and update weather data from API"""
        farm = self.get_object()
        api_key = 'YOUR_OPENWEATHERMAP_API_KEY'  # Use environment variable
        
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={farm.latitude}&lon={farm.longitude}&appid={api_key}&units=metric"
            response = requests.get(url, timeout=10)
            data = response.json()
            
            # Create weather record
            weather = WeatherData.objects.create(
                farm=farm,
                temperature=data['main']['temp'],
                humidity=data['main']['humidity'],
                rainfall=0,
                wind_speed=data['wind']['speed'],
                condition=data['weather'][0]['main'].lower(),
                description=data['weather'][0]['description'],
                source='openweather',
                recorded_at=timezone.now()
            )
            
            # Assess disease risk based on weather
            weather.alert_level = self._assess_disease_risk(weather)
            weather.save()
            
            # Create alert if risk detected
            if weather.alert_level in ['orange', 'red']:
                Alert.objects.create(
                    user=self.request.user,
                    farm=farm,
                    alert_type='weather',
                    title='Weather Alert',
                    message=f"High disease risk detected due to {weather.condition}",
                    severity='warning'
                )
            
            serializer = WeatherDataSerializer(weather)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _assess_disease_risk(self, weather):
        """Assess disease risk based on weather conditions"""
        if weather.humidity > 80 and weather.temperature > 20:
            return 'red'  # High risk
        elif weather.humidity > 70 and weather.temperature > 15:
            return 'orange'  # Medium risk
        elif weather.rainfall > 10:
            return 'orange'  # Medium risk
        return 'green'  # Low risk


# ============================================
# DISEASE DETECTION VIEWSET
# ============================================
class DiseaseDetectionViewSet(viewsets.ModelViewSet):
    """Disease detection CRUD operations"""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action in ['create']:
            return DiseaseDetectionCreateSerializer
        elif self.action == 'retrieve':
            return DiseaseDetectionDetailSerializer
        return DiseaseDetectionListSerializer
    
    def get_queryset(self):
        return DiseaseDetection.objects.filter(farm__user=self.request.user)
    
    def perform_create(self, serializer):
        detection = serializer.save()
        farm = detection.farm
        
        # Update farm stats
        farm.total_analysis += 1
        farm.last_analysis = timezone.now()
        farm.save()
        
        # Update analytics
        analytics = FarmAnalytics.objects.get(farm=farm)
        analytics.total_detections += 1
        analytics.total_diseases_detected += 1
        analytics.average_severity = self._calculate_severity(detection.severity)
        analytics.save()
        
        # Create alert
        Alert.objects.create(
            user=self.request.user,
            farm=farm,
            alert_type='disease',
            title=f'Disease Detected: {detection.detected_disease}',
            message=f"Disease detected with {detection.confidence}% confidence",
            severity='critical' if detection.severity == 'critical' else 'warning',
            related_detection=detection
        )
        
        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            farm=farm,
            activity_type='analysis_run',
            description=f"Disease analysis run - {detection.detected_disease} detected"
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm disease detection"""
        detection = self.get_object()
        detection.is_confirmed = True
        detection.save()
        return Response({'message': 'Detection confirmed'})
    
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Provide feedback on detection accuracy"""
        detection = self.get_object()
        feedback = request.data.get('feedback')
        if feedback in ['accurate', 'inaccurate', 'partial']:
            detection.user_feedback = feedback
            detection.save()
            return Response({'message': 'Feedback recorded'})
        return Response({'error': 'Invalid feedback'}, status=status.HTTP_400_BAD_REQUEST)
    
    def _calculate_severity(self, severity):
        """Calculate numeric severity value"""
        severity_map = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
        return severity_map.get(severity, 0)


# ============================================
# WEATHER DATA VIEWSET
# ============================================
class WeatherDataViewSet(viewsets.ReadOnlyModelViewSet):
    """Weather data read-only access"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WeatherDataSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        farm_id = self.request.query_params.get('farm_id')
        if farm_id:
            return WeatherData.objects.filter(farm_id=farm_id, farm__user=self.request.user).order_by('-recorded_at')
        return WeatherData.objects.filter(farm__user=self.request.user).order_by('-recorded_at')


# ============================================
# ALERT VIEWSET
# ============================================
class AlertViewSet(viewsets.ModelViewSet):
    """Alert management"""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AlertDetailSerializer
        return AlertListSerializer
    
    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread alerts"""
        alerts = Alert.objects.filter(user=request.user, is_read=False)
        serializer = AlertListSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all alerts as read"""
        Alert.objects.filter(user=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'message': 'All alerts marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark specific alert as read"""
        alert = self.get_object()
        alert.is_read = True
        alert.read_at = timezone.now()
        alert.save()
        return Response({'message': 'Alert marked as read'})


# ============================================
# MARKET PRICE VIEWSET
# ============================================
class MarketPriceViewSet(viewsets.ReadOnlyModelViewSet):
    """Market price data (read-only)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MarketPriceSerializer
    pagination_class = StandardResultsSetPagination
    filterset_fields = ['crop_name', 'region', 'state']
    
    def get_queryset(self):
        return MarketPrice.objects.all().order_by('-updated_at')
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending crop prices"""
        prices = MarketPrice.objects.filter(
            price_trend__in=['up', 'down']
        ).order_by('-price_change_percentage')[:20]
        serializer = MarketPriceSerializer(prices, many=True)
        return Response(serializer.data)


# ============================================
# RECOMMENDATION VIEWSET
# ============================================
class FarmingRecommendationViewSet(viewsets.ModelViewSet):
    """Farming recommendations"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FarmingRecommendationSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return FarmingRecommendation.objects.filter(farm__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Mark recommendation as applied"""
        recommendation = self.get_object()
        recommendation.is_applied = True
        recommendation.applied_at = timezone.now()
        recommendation.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            farm=recommendation.farm,
            activity_type='recommendation_applied',
            description=f"Recommendation applied: {recommendation.title}"
        )
        
        return Response({'message': 'Recommendation marked as applied'})


# ============================================
# PEST RECORD VIEWSET
# ============================================
class PestRecordViewSet(viewsets.ModelViewSet):
    """Pest management"""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PestRecordDetailSerializer
        return PestRecordListSerializer
    
    def get_queryset(self):
        return PestRecord.objects.filter(farm__user=self.request.user)
    
    def perform_create(self, serializer):
        pest = serializer.save()
        
        # Create alert
        Alert.objects.create(
            user=self.request.user,
            farm=pest.farm,
            alert_type='pest',
            title=f'Pest Alert: {pest.pest_name}',
            message=f"Pest detected: {pest.pest_name} at {pest.severity} level",
            severity='warning'
        )


# ============================================
# IRRIGATION SCHEDULE VIEWSET
# ============================================
class IrrigationScheduleViewSet(viewsets.ModelViewSet):
    """Irrigation schedule management"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IrrigationScheduleSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return IrrigationSchedule.objects.filter(farm__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming irrigation schedules"""
        today = timezone.now().date()
        schedules = IrrigationSchedule.objects.filter(
            farm__user=request.user,
            scheduled_date__gte=today,
            status__in=['planned', 'scheduled']
        ).order_by('scheduled_date')
        serializer = IrrigationScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark irrigation as completed"""
        schedule = self.get_object()
        schedule.status = 'completed'
        schedule.completed_at = timezone.now()
        actual_water = request.data.get('actual_water_used')
        if actual_water:
            schedule.actual_water_used = actual_water
        schedule.save()
        return Response({'message': 'Irrigation marked as completed'})


# ============================================
# ACTIVITY LOG VIEWSET
# ============================================
class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """User activity log (read-only)"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivityLogSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user).order_by('-created_at')


# ============================================
# PHOTO UPLOAD ENDPOINT
# ============================================
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def photo_upload(request):
    """Upload photo for disease detection"""
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Store photo data (simplified - in production would save to storage)
    return Response({
        'id': 1,
        'filename': image_file.name,
        'size': image_file.size,
        'message': 'Photo uploaded successfully'
    }, status=status.HTTP_201_CREATED)


# ============================================
# DISEASE DETECTION ENDPOINT
# ============================================
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def disease_detection(request):
    """Detect diseases in uploaded images"""
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Mock disease detection results (in production would use ML model)
    diseases = [
        {'name': 'Powdery Mildew', 'confidence': 0.92, 'treatment': 'Apply sulfur-based fungicide'},
        {'name': 'Early Blight', 'confidence': 0.85, 'treatment': 'Remove infected leaves, apply mancozeb'},
        {'name': 'Leaf Rust', 'confidence': 0.78, 'treatment': 'Use rust-specific fungicides'},
        {'name': 'Healthy', 'confidence': 0.95, 'treatment': 'Continue regular monitoring'}
    ]
    
    import random
    detection = random.choice(diseases)
    
    # Save detection record to database
    try:
        disease_record = DiseaseDetection.objects.create(
            user=request.user,
            farm=request.user.userprofile.farm_set.first(),  # Get first farm if exists
            image_path=f'uploads/{image_file.name}',
            disease_name=detection['name'],
            confidence_score=detection['confidence'],
            severity_level='Medium',
            recommended_action=detection['treatment']
        )
        
        # Log activity
        ActivityLog.objects.create(
            user=request.user,
            action=f'Detected {detection["name"]} in image',
            details=f'Confidence: {detection["confidence"]*100:.1f}%'
        )
    except Exception as e:
        print(f'Error saving disease detection: {e}')
    
    return Response({
        'disease_name': detection['name'],
        'confidence': detection['confidence'],
        'treatment': detection['treatment'],
        'filename': image_file.name,
        'message': 'Disease detection completed'
    }, status=status.HTTP_200_OK)
