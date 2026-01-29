# Django Admin Configuration - Simplified
# File: api/admin.py

from django.contrib import admin
from .models import (
    UserProfile, Farm, DiseaseDetection, WeatherData, Alert,
    MarketPrice, FarmingRecommendation, FarmAnalytics,
    PestRecord, IrrigationSchedule, ActivityLog
)

# Register all models
admin.site.register(UserProfile)
admin.site.register(Farm)
admin.site.register(DiseaseDetection)
admin.site.register(WeatherData)
admin.site.register(Alert)
admin.site.register(MarketPrice)
admin.site.register(FarmingRecommendation)
admin.site.register(FarmAnalytics)
admin.site.register(PestRecord)
admin.site.register(IrrigationSchedule)
admin.site.register(ActivityLog)

