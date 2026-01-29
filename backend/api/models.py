# Django Models for CropGuard AI
# File: api/models.py

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# ============================================
# USER PROFILE MODEL
# ============================================
class UserProfile(models.Model):
    """Extended user profile with farm-specific information"""
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('ta', 'Tamil'),
        ('te', 'Telugu'),
        ('kn', 'Kannada'),
        ('mr', 'Marathi'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    state = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    village = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    
    # Preferences
    language_preference = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    notification_preference = models.BooleanField(default=True)
    email_alerts = models.BooleanField(default=True)
    sms_alerts = models.BooleanField(default=False)
    
    # Stats
    total_farms = models.IntegerField(default=0)
    total_analysis = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    class Meta:
        db_table = 'users_userprofile'
        ordering = ['-created_at']


# ============================================
# FARM MODEL
# ============================================
class Farm(models.Model):
    """Represents a single farm"""
    
    CROP_CHOICES = [
        ('wheat', 'Wheat'),
        ('rice', 'Rice'),
        ('corn', 'Corn'),
        ('cotton', 'Cotton'),
        ('potato', 'Potato'),
        ('tomato', 'Tomato'),
        ('sugarcane', 'Sugarcane'),
        ('groundnut', 'Groundnut'),
        ('soybean', 'Soybean'),
        ('sorghum', 'Sorghum'),
        ('other', 'Other'),
    ]
    
    SOIL_TYPES = [
        ('clay', 'Clay'),
        ('sandy', 'Sandy'),
        ('loamy', 'Loamy'),
        ('silty', 'Silty'),
        ('mixed', 'Mixed'),
    ]
    
    IRRIGATION_TYPES = [
        ('rainfed', 'Rainfed'),
        ('canal', 'Canal'),
        ('tubewell', 'Tubewell'),
        ('drip', 'Drip'),
        ('sprinkler', 'Sprinkler'),
        ('mixed', 'Mixed'),
    ]
    
    REGIONS = [
        ('north', 'North India'),
        ('south', 'South India'),
        ('east', 'East India'),
        ('west', 'West India'),
        ('central', 'Central India'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    farm_name = models.CharField(max_length=255)
    
    # Location
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    area_in_acres = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.1)])
    region = models.CharField(max_length=50, choices=REGIONS)
    address = models.TextField(blank=True)
    
    # Crop Info
    crop_type = models.CharField(max_length=100, choices=CROP_CHOICES)
    planting_date = models.DateField()
    expected_harvest_date = models.DateField(null=True, blank=True)
    
    # Farm Details
    soil_type = models.CharField(max_length=50, choices=SOIL_TYPES)
    irrigation_type = models.CharField(max_length=50, choices=IRRIGATION_TYPES)
    
    # Status
    is_active = models.BooleanField(default=True)
    total_analysis = models.IntegerField(default=0)
    last_analysis = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.farm_name} - {self.user.username}"
    
    class Meta:
        db_table = 'farms_farm'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['region', 'crop_type']),
        ]


# ============================================
# CROP DISEASE DETECTION MODEL
# ============================================
class DiseaseDetection(models.Model):
    """Stores disease detection analysis results"""
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    CONFIDENCE_RANGE = [
        (models.DecimalField(validators=[MinValueValidator(0), MaxValueValidator(100)]), 'Confidence %'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='detections')
    
    # Image
    original_image = models.ImageField(upload_to='disease_images/')
    image_url = models.URLField(max_length=500, blank=True)
    image_thumbnail = models.ImageField(upload_to='disease_thumbnails/', null=True, blank=True)
    
    # Detection Results
    detected_disease = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Detailed Info
    disease_description = models.TextField(blank=True)
    affected_area_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Treatment Recommendations
    chemical_treatment = models.TextField(blank=True)
    organic_treatment = models.TextField(blank=True)
    preventive_measures = models.TextField(blank=True)
    
    # Additional Info
    weather_condition = models.CharField(max_length=100, blank=True)
    region_specific_notes = models.TextField(blank=True)
    
    # Status
    is_confirmed = models.BooleanField(default=False)
    user_feedback = models.CharField(max_length=20, choices=[
        ('accurate', 'Accurate'),
        ('inaccurate', 'Inaccurate'),
        ('partial', 'Partially Accurate'),
    ], null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.detected_disease} - {self.farm.farm_name}"
    
    class Meta:
        db_table = 'analysis_diseasedetection'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farm', '-created_at']),
            models.Index(fields=['severity', 'created_at']),
        ]


# ============================================
# WEATHER DATA MODEL
# ============================================
class WeatherData(models.Model):
    """Stores weather information for farms"""
    
    WEATHER_CONDITIONS = [
        ('sunny', 'Sunny'),
        ('cloudy', 'Cloudy'),
        ('rainy', 'Rainy'),
        ('stormy', 'Stormy'),
        ('foggy', 'Foggy'),
        ('partly_cloudy', 'Partly Cloudy'),
    ]
    
    ALERT_LEVELS = [
        ('green', 'Safe'),
        ('yellow', 'Watch'),
        ('orange', 'Warning'),
        ('red', 'Alert'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='weather_data')
    
    # Weather Metrics
    temperature = models.DecimalField(max_digits=5, decimal_places=2, help_text="Temperature in Celsius")
    humidity = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    rainfall = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Rainfall in mm")
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Wind speed in km/h")
    
    # Weather Condition
    condition = models.CharField(max_length=50, choices=WEATHER_CONDITIONS)
    description = models.CharField(max_length=255, blank=True)
    
    # Disease Risk Assessment
    alert_level = models.CharField(max_length=20, choices=ALERT_LEVELS, default='green')
    disease_risk = models.TextField(blank=True, help_text="Predicted crop diseases based on weather")
    recommendations = models.TextField(blank=True)
    
    # Data Source
    source = models.CharField(max_length=50, choices=[
        ('openweather', 'OpenWeatherMap'),
        ('weatherapi', 'WeatherAPI'),
        ('manual', 'Manual Entry'),
        ('device', 'Device Sensor'),
    ])
    
    # Timestamps
    recorded_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Weather - {self.farm.farm_name} - {self.recorded_at}"
    
    class Meta:
        db_table = 'analysis_weatherdata'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['farm', '-recorded_at']),
        ]


# ============================================
# ALERTS/NOTIFICATIONS MODEL
# ============================================
class Alert(models.Model):
    """Stores notifications and alerts for users"""
    
    ALERT_TYPES = [
        ('disease', 'Disease Detection'),
        ('weather', 'Weather Alert'),
        ('water', 'Irrigation Alert'),
        ('pest', 'Pest Alert'),
        ('market', 'Market Price'),
        ('system', 'System Alert'),
    ]
    
    SEVERITY_LEVELS = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    
    # Alert Content
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='info')
    
    # Related Data
    related_detection = models.ForeignKey(DiseaseDetection, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Actions
    action_required = models.BooleanField(default=False)
    action_url = models.URLField(max_length=500, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    class Meta:
        db_table = 'notifications_alert'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_read', '-created_at']),
        ]


# ============================================
# MARKET PRICE MODEL
# ============================================
class MarketPrice(models.Model):
    """Stores crop market prices"""
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop_name = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, blank=True)
    
    # Price Info
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price per quintal in INR")
    price_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Market Info
    market_name = models.CharField(max_length=255)
    market_area = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Trends
    price_trend = models.CharField(max_length=20, choices=[
        ('up', 'Increasing'),
        ('down', 'Decreasing'),
        ('stable', 'Stable'),
    ], default='stable')
    price_change_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.crop_name} - {self.market_name} - Rs. {self.price}"
    
    class Meta:
        db_table = 'analysis_marketprice'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['crop_name', 'region']),
            models.Index(fields=['state', '-updated_at']),
        ]


# ============================================
# FARMING RECOMMENDATION MODEL
# ============================================
class FarmingRecommendation(models.Model):
    """Stores crop recommendations and farming advice"""
    
    RECOMMENDATION_TYPES = [
        ('crop', 'Crop Selection'),
        ('water', 'Water Management'),
        ('soil', 'Soil Management'),
        ('pest', 'Pest Management'),
        ('fertilizer', 'Fertilizer'),
        ('harvesting', 'Harvesting'),
        ('storage', 'Storage'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='recommendations')
    
    # Recommendation Details
    recommendation_type = models.CharField(max_length=50, choices=RECOMMENDATION_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Implementation Details
    steps = models.TextField(help_text="Step-by-step implementation guide")
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expected_benefit = models.TextField(blank=True)
    
    # Timing
    applicable_from = models.DateField(null=True, blank=True)
    applicable_till = models.DateField(null=True, blank=True)
    
    # Status
    is_applied = models.BooleanField(default=False)
    applied_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.farm.farm_name}"
    
    class Meta:
        db_table = 'analysis_farmingrecommendation'
        ordering = ['-created_at']


# ============================================
# FARM HISTORY/ANALYTICS MODEL
# ============================================
class FarmAnalytics(models.Model):
    """Tracks farm performance and analytics"""
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.OneToOneField(Farm, on_delete=models.CASCADE, related_name='analytics')
    
    # Analytics Data
    total_detections = models.IntegerField(default=0)
    total_diseases_detected = models.IntegerField(default=0)
    average_severity = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    disease_free_days = models.IntegerField(default=0)
    
    # Performance
    crop_yield_estimate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Expected yield")
    water_usage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Water used in mm")
    fertilizer_usage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Fertilizer in kg")
    
    # Trends
    health_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    trend = models.CharField(max_length=20, choices=[
        ('improving', 'Improving'),
        ('declining', 'Declining'),
        ('stable', 'Stable'),
    ], default='stable')
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics - {self.farm.farm_name}"
    
    class Meta:
        db_table = 'analysis_farmanalytics'


# ============================================
# PEST MANAGEMENT MODEL
# ============================================
class PestRecord(models.Model):
    """Tracks pest infestations and management"""
    
    PEST_TYPES = [
        ('insect', 'Insect'),
        ('fungal', 'Fungal'),
        ('bacterial', 'Bacterial'),
        ('viral', 'Viral'),
        ('weed', 'Weed'),
        ('rodent', 'Rodent'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='pest_records')
    
    # Pest Details
    pest_name = models.CharField(max_length=255)
    pest_type = models.CharField(max_length=50, choices=PEST_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    
    # Description
    description = models.TextField()
    image = models.ImageField(upload_to='pest_images/', null=True, blank=True)
    
    # Management
    treatment_applied = models.CharField(max_length=255)
    chemical_used = models.CharField(max_length=255, blank=True)
    organic_method = models.CharField(max_length=255, blank=True)
    
    # Results
    treatment_result = models.CharField(max_length=20, choices=[
        ('effective', 'Effective'),
        ('partially_effective', 'Partially Effective'),
        ('ineffective', 'Ineffective'),
    ], null=True, blank=True)
    
    # Timestamps
    detected_at = models.DateTimeField()
    treated_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.pest_name} - {self.farm.farm_name}"
    
    class Meta:
        db_table = 'analysis_pestrecord'
        ordering = ['-detected_at']


# ============================================
# IRRIGATION SCHEDULE MODEL
# ============================================
class IrrigationSchedule(models.Model):
    """Manages irrigation planning and optimization"""
    
    IRRIGATION_STATUS = [
        ('planned', 'Planned'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='irrigation_schedules')
    
    # Schedule Details
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField(null=True, blank=True)
    
    # Water Details
    water_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Water in mm")
    water_source = models.CharField(max_length=100, blank=True)
    
    # Recommendations
    recommendation_reason = models.TextField(blank=True, help_text="Why this irrigation is recommended")
    weather_impact = models.CharField(max_length=255, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=IRRIGATION_STATUS, default='planned')
    completed_at = models.DateTimeField(null=True, blank=True)
    actual_water_used = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Irrigation - {self.farm.farm_name} - {self.scheduled_date}"
    
    class Meta:
        db_table = 'analysis_irrigationschedule'
        ordering = ['scheduled_date']


# ============================================
# ACTIVITY LOG MODEL
# ============================================
class ActivityLog(models.Model):
    """Tracks all user activities"""
    
    ACTIVITY_TYPES = [
        ('farm_created', 'Farm Created'),
        ('farm_updated', 'Farm Updated'),
        ('image_uploaded', 'Image Uploaded'),
        ('analysis_run', 'Analysis Run'),
        ('alert_created', 'Alert Created'),
        ('alert_viewed', 'Alert Viewed'),
        ('recommendation_applied', 'Recommendation Applied'),
        ('login', 'User Login'),
        ('settings_updated', 'Settings Updated'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    farm = models.ForeignKey(Farm, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Activity Details
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    details = models.JSONField(default=dict, blank=True)
    
    # IP and Device Info
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.activity_type} - {self.user.username}"
    
    class Meta:
        db_table = 'users_activitylog'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
