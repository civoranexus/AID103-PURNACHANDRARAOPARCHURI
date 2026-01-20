"""
Serializers for CropGuard AI API
"""

from rest_framework import serializers
from api.models import Farmer, Farm, CropImage, DiseaseAnalysis, Treatment, Alert, DiseaseProfile


class FarmerSerializer(serializers.ModelSerializer):
    """Serializer for Farmer model"""
    class Meta:
        model = Farmer
        fields = ['id', 'name', 'email', 'phone', 'address', 'district', 'state', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CropImageSerializer(serializers.ModelSerializer):
    """Serializer for CropImage model"""
    class Meta:
        model = CropImage
        fields = ['id', 'farm', 'image', 'image_url', 'uploaded_at', 'file_size']
        read_only_fields = ['id', 'uploaded_at', 'file_size']


class TreatmentSerializer(serializers.ModelSerializer):
    """Serializer for Treatment model"""
    class Meta:
        model = Treatment
        fields = ['id', 'analysis', 'chemical_treatment', 'organic_alternatives', 'preventive_practices', 'estimated_recovery_days', 'created_at']
        read_only_fields = ['id', 'created_at']


class DiseaseAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for DiseaseAnalysis model"""
    treatment = TreatmentSerializer(read_only=True)

    class Meta:
        model = DiseaseAnalysis
        fields = ['id', 'crop_image', 'farm', 'disease_detected', 'severity', 'confidence_score', 'possible_cause', 'affected_region_x', 'affected_region_y', 'affected_region_width', 'affected_region_height', 'treatment', 'analyzed_at']
        read_only_fields = ['id', 'analyzed_at']


class AlertSerializer(serializers.ModelSerializer):
    """Serializer for Alert model"""
    class Meta:
        model = Alert
        fields = ['id', 'farm', 'alert_type', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class FarmSerializer(serializers.ModelSerializer):
    """Serializer for Farm model"""
    images = CropImageSerializer(many=True, read_only=True)
    analyses = DiseaseAnalysisSerializer(many=True, read_only=True)
    alerts = AlertSerializer(many=True, read_only=True)

    class Meta:
        model = Farm
        fields = ['id', 'farmer', 'crop_type', 'area_name', 'latitude', 'longitude', 'planting_date', 'expected_harvest_date', 'farm_size_acres', 'images', 'analyses', 'alerts', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DiseaseProfileSerializer(serializers.ModelSerializer):
    """Serializer for DiseaseProfile model"""
    class Meta:
        model = DiseaseProfile
        fields = ['id', 'crop_type', 'disease_name', 'description', 'symptoms', 'optimal_temperature', 'optimal_humidity', 'chemical_treatment', 'organic_alternatives', 'preventive_practices', 'recovery_time_days']
        read_only_fields = ['id']


class AnalysisDetailSerializer(serializers.Serializer):
    """Serializer for detailed analysis response"""
    disease = serializers.CharField()
    severity = serializers.CharField()
    confidence = serializers.FloatField()
    cause = serializers.CharField()
    chemical_treatment = serializers.CharField()
    organic_alternatives = serializers.CharField()
    preventive_practices = serializers.CharField()
    affected_region = serializers.DictField(child=serializers.FloatField())
