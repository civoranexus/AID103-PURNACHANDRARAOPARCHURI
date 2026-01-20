"""
Models for CropGuard AI - Disease Detection System
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

class Farmer(models.Model):
    """Model to store farmer information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.district}"


class Farm(models.Model):
    """Model to store farm information"""
    CROP_CHOICES = [
        ('wheat', 'Wheat'),
        ('rice', 'Rice'),
        ('corn', 'Corn'),
        ('cotton', 'Cotton'),
        ('potato', 'Potato'),
        ('tomato', 'Tomato'),
        ('sugarcane', 'Sugarcane'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='farms')
    crop_type = models.CharField(max_length=50, choices=CROP_CHOICES)
    area_name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.DecimalField(max_digits=9, decimal_places=6, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    planting_date = models.DateField()
    expected_harvest_date = models.DateField(null=True, blank=True)
    farm_size_acres = models.FloatField(validators=[MinValueValidator(0.1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.crop_type.title()} Farm - {self.area_name}"


class CropImage(models.Model):
    """Model to store crop images"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='crop_images/%Y/%m/%d/')
    image_url = models.URLField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.IntegerField()  # in bytes

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Image - {self.farm.crop_type} - {self.uploaded_at}"


class DiseaseAnalysis(models.Model):
    """Model to store disease analysis results"""
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop_image = models.OneToOneField(CropImage, on_delete=models.CASCADE, related_name='analysis')
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='analyses')
    disease_detected = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    confidence_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    possible_cause = models.TextField()
    affected_region_x = models.FloatField(default=0)
    affected_region_y = models.FloatField(default=0)
    affected_region_width = models.FloatField(default=0)
    affected_region_height = models.FloatField(default=0)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-analyzed_at']

    def __str__(self):
        return f"{self.disease_detected} - {self.severity.upper()}"


class Treatment(models.Model):
    """Model to store treatment recommendations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.OneToOneField(DiseaseAnalysis, on_delete=models.CASCADE, related_name='treatment')
    chemical_treatment = models.TextField()
    organic_alternatives = models.TextField()
    preventive_practices = models.TextField()
    estimated_recovery_days = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(90)])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Treatment for {self.analysis.disease_detected}"


class Alert(models.Model):
    """Model to store system alerts"""
    ALERT_TYPE_CHOICES = [
        ('critical', 'Critical'),
        ('warning', 'Warning'),
        ('info', 'Information'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.title}"


class DiseaseProfile(models.Model):
    """Model to store disease information and profiles"""
    CROP_CHOICES = [
        ('wheat', 'Wheat'),
        ('rice', 'Rice'),
        ('corn', 'Corn'),
        ('cotton', 'Cotton'),
        ('potato', 'Potato'),
        ('tomato', 'Tomato'),
        ('sugarcane', 'Sugarcane'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop_type = models.CharField(max_length=50, choices=CROP_CHOICES)
    disease_name = models.CharField(max_length=255)
    description = models.TextField()
    symptoms = models.TextField()
    optimal_temperature = models.CharField(max_length=100, blank=True)
    optimal_humidity = models.CharField(max_length=100, blank=True)
    chemical_treatment = models.TextField()
    organic_alternatives = models.TextField()
    preventive_practices = models.TextField()
    recovery_time_days = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(120)])

    class Meta:
        unique_together = ['crop_type', 'disease_name']

    def __str__(self):
        return f"{self.disease_name} - {self.crop_type.title()}"
