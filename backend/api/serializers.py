# Django REST Framework Serializers for CropGuard AI
# File: api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Farm, DiseaseDetection, WeatherData, Alert,
    MarketPrice, FarmingRecommendation, FarmAnalytics, PestRecord,
    IrrigationSchedule, ActivityLog
)


# ============================================
# USER SERIALIZERS
# ============================================
class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile with extended information"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'phone', 'state', 'district', 'village',
            'profile_picture', 'language_preference', 'notification_preference',
            'email_alerts', 'sms_alerts', 'total_farms', 'total_analysis',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_farms', 'total_analysis']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8, required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone', 'state']
    
    def validate(self, data):
        password2 = data.pop('password2', None)
        if password2 and data['password'] != password2:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data
    
    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        state = validated_data.pop('state', '')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, phone=phone, state=state)
        return user


# ============================================
# FARM SERIALIZERS
# ============================================
class FarmListSerializer(serializers.ModelSerializer):
    """Simplified farm serializer for list view"""
    region_display = serializers.CharField(source='get_region_display', read_only=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    
    class Meta:
        model = Farm
        fields = [
            'id', 'farm_name', 'latitude', 'longitude', 'area_in_acres',
            'crop_type', 'crop_type_display', 'region', 'region_display',
            'total_analysis', 'last_analysis', 'created_at'
        ]
        read_only_fields = ['id', 'total_analysis', 'last_analysis', 'created_at']


class FarmDetailSerializer(serializers.ModelSerializer):
    """Detailed farm serializer"""
    region_display = serializers.CharField(source='get_region_display', read_only=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    soil_type_display = serializers.CharField(source='get_soil_type_display', read_only=True)
    irrigation_type_display = serializers.CharField(source='get_irrigation_type_display', read_only=True)
    
    class Meta:
        model = Farm
        fields = [
            'id', 'farm_name', 'latitude', 'longitude', 'area_in_acres',
            'crop_type', 'crop_type_display', 'planting_date', 'expected_harvest_date',
            'region', 'region_display', 'address', 'soil_type', 'soil_type_display',
            'irrigation_type', 'irrigation_type_display', 'is_active',
            'total_analysis', 'last_analysis', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_analysis', 'last_analysis', 'created_at', 'updated_at']


class FarmCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating farms"""
    class Meta:
        model = Farm
        fields = [
            'farm_name', 'latitude', 'longitude', 'area_in_acres',
            'crop_type', 'planting_date', 'expected_harvest_date',
            'region', 'address', 'soil_type', 'irrigation_type'
        ]


# ============================================
# DISEASE DETECTION SERIALIZERS
# ============================================
class DiseaseDetectionListSerializer(serializers.ModelSerializer):
    """Simplified disease detection serializer"""
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = DiseaseDetection
        fields = [
            'id', 'farm', 'detected_disease', 'severity', 'severity_display',
            'confidence', 'original_image', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DiseaseDetectionDetailSerializer(serializers.ModelSerializer):
    """Detailed disease detection serializer"""
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = DiseaseDetection
        fields = [
            'id', 'farm', 'original_image', 'image_url', 'image_thumbnail',
            'detected_disease', 'disease_description', 'severity', 'severity_display',
            'confidence', 'affected_area_percentage', 'chemical_treatment',
            'organic_treatment', 'preventive_measures', 'weather_condition',
            'region_specific_notes', 'is_confirmed', 'user_feedback',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DiseaseDetectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating disease detection records"""
    class Meta:
        model = DiseaseDetection
        fields = [
            'farm', 'original_image', 'image_url', 'detected_disease',
            'severity', 'confidence', 'disease_description'
        ]


# ============================================
# WEATHER DATA SERIALIZERS
# ============================================
class WeatherDataSerializer(serializers.ModelSerializer):
    """Weather data serializer"""
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    alert_level_display = serializers.CharField(source='get_alert_level_display', read_only=True)
    
    class Meta:
        model = WeatherData
        fields = [
            'id', 'farm', 'temperature', 'humidity', 'rainfall', 'wind_speed',
            'condition', 'condition_display', 'description', 'alert_level',
            'alert_level_display', 'disease_risk', 'recommendations',
            'source', 'recorded_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================
# ALERT SERIALIZERS
# ============================================
class AlertListSerializer(serializers.ModelSerializer):
    """Simplified alert serializer"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'alert_type', 'alert_type_display', 'title', 'severity',
            'severity_display', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AlertDetailSerializer(serializers.ModelSerializer):
    """Detailed alert serializer"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'user', 'farm', 'alert_type', 'alert_type_display',
            'title', 'message', 'severity', 'severity_display',
            'related_detection', 'is_read', 'read_at', 'action_required',
            'action_url', 'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================
# MARKET PRICE SERIALIZERS
# ============================================
class MarketPriceSerializer(serializers.ModelSerializer):
    """Market price serializer"""
    price_trend_display = serializers.CharField(source='get_price_trend_display', read_only=True)
    
    class Meta:
        model = MarketPrice
        fields = [
            'id', 'crop_name', 'variety', 'price', 'price_range_min',
            'price_range_max', 'market_name', 'market_area', 'region', 'state',
            'price_trend', 'price_trend_display', 'price_change_percentage',
            'updated_at', 'created_at'
        ]
        read_only_fields = ['id', 'updated_at', 'created_at']


# ============================================
# FARMING RECOMMENDATION SERIALIZERS
# ============================================
class FarmingRecommendationSerializer(serializers.ModelSerializer):
    """Farming recommendation serializer"""
    recommendation_type_display = serializers.CharField(
        source='get_recommendation_type_display', read_only=True
    )
    
    class Meta:
        model = FarmingRecommendation
        fields = [
            'id', 'farm', 'recommendation_type', 'recommendation_type_display',
            'title', 'description', 'steps', 'estimated_cost',
            'expected_benefit', 'applicable_from', 'applicable_till',
            'is_applied', 'applied_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================
# FARM ANALYTICS SERIALIZERS
# ============================================
class FarmAnalyticsSerializer(serializers.ModelSerializer):
    """Farm analytics serializer"""
    trend_display = serializers.CharField(source='get_trend_display', read_only=True)
    
    class Meta:
        model = FarmAnalytics
        fields = [
            'id', 'farm', 'total_detections', 'total_diseases_detected',
            'average_severity', 'disease_free_days', 'crop_yield_estimate',
            'water_usage', 'fertilizer_usage', 'health_score',
            'trend', 'trend_display', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


# ============================================
# PEST RECORD SERIALIZERS
# ============================================
class PestRecordListSerializer(serializers.ModelSerializer):
    """Simplified pest record serializer"""
    pest_type_display = serializers.CharField(source='get_pest_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = PestRecord
        fields = [
            'id', 'farm', 'pest_name', 'pest_type', 'pest_type_display',
            'severity', 'severity_display', 'image', 'detected_at'
        ]
        read_only_fields = ['id']


class PestRecordDetailSerializer(serializers.ModelSerializer):
    """Detailed pest record serializer"""
    pest_type_display = serializers.CharField(source='get_pest_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    treatment_result_display = serializers.CharField(
        source='get_treatment_result_display', read_only=True
    )
    
    class Meta:
        model = PestRecord
        fields = [
            'id', 'farm', 'pest_name', 'pest_type', 'pest_type_display',
            'severity', 'severity_display', 'description', 'image',
            'treatment_applied', 'chemical_used', 'organic_method',
            'treatment_result', 'treatment_result_display', 'detected_at',
            'treated_at', 'resolved_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ============================================
# IRRIGATION SCHEDULE SERIALIZERS
# ============================================
class IrrigationScheduleSerializer(serializers.ModelSerializer):
    """Irrigation schedule serializer"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = IrrigationSchedule
        fields = [
            'id', 'farm', 'scheduled_date', 'scheduled_time', 'water_amount',
            'water_source', 'recommendation_reason', 'weather_impact',
            'status', 'status_display', 'completed_at', 'actual_water_used',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================
# ACTIVITY LOG SERIALIZERS
# ============================================
class ActivityLogSerializer(serializers.ModelSerializer):
    """Activity log serializer"""
    activity_type_display = serializers.CharField(
        source='get_activity_type_display', read_only=True
    )
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'farm', 'activity_type', 'activity_type_display',
            'description', 'details', 'ip_address', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
