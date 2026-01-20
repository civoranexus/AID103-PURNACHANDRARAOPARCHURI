"""
Admin configuration for CropGuard AI
"""

from django.contrib import admin
from api.models import Farmer, Farm, CropImage, DiseaseAnalysis, Treatment, Alert, DiseaseProfile


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'district', 'state', 'created_at')
    list_filter = ('state', 'district', 'created_at')
    search_fields = ('name', 'email', 'phone', 'district')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('crop_type', 'area_name', 'farmer', 'planting_date', 'created_at')
    list_filter = ('crop_type', 'created_at', 'farmer')
    search_fields = ('area_name', 'crop_type')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Farm Information', {
            'fields': ('id', 'farmer', 'crop_type', 'area_name', 'planting_date', 'expected_harvest_date')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Farm Details', {
            'fields': ('farm_size_acres',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(CropImage)
class CropImageAdmin(admin.ModelAdmin):
    list_display = ('farm', 'uploaded_at', 'file_size')
    list_filter = ('uploaded_at', 'farm__crop_type')
    search_fields = ('farm__area_name',)
    readonly_fields = ('id', 'uploaded_at', 'file_size')


@admin.register(DiseaseAnalysis)
class DiseaseAnalysisAdmin(admin.ModelAdmin):
    list_display = ('disease_detected', 'severity', 'farm', 'confidence_score', 'analyzed_at')
    list_filter = ('severity', 'analyzed_at', 'farm__crop_type')
    search_fields = ('disease_detected', 'farm__area_name')
    readonly_fields = ('id', 'analyzed_at')
    fieldsets = (
        ('Analysis Details', {
            'fields': ('id', 'crop_image', 'farm', 'disease_detected', 'severity', 'confidence_score')
        }),
        ('Results', {
            'fields': ('possible_cause', 'affected_region_x', 'affected_region_y', 'affected_region_width', 'affected_region_height')
        }),
        ('Timestamp', {
            'fields': ('analyzed_at',),
            'classes': ('collapse',)
        })
    )


@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('analysis', 'estimated_recovery_days', 'created_at')
    list_filter = ('created_at', 'estimated_recovery_days')
    search_fields = ('analysis__disease_detected',)
    readonly_fields = ('id', 'created_at')


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'alert_type', 'farm', 'is_read', 'created_at')
    list_filter = ('alert_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'farm__area_name')
    readonly_fields = ('id', 'created_at')
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = 'Mark selected alerts as read'


@admin.register(DiseaseProfile)
class DiseaseProfileAdmin(admin.ModelAdmin):
    list_display = ('disease_name', 'crop_type', 'recovery_time_days')
    list_filter = ('crop_type',)
    search_fields = ('disease_name', 'symptoms')
    readonly_fields = ('id',)
    fieldsets = (
        ('Disease Information', {
            'fields': ('id', 'crop_type', 'disease_name', 'description')
        }),
        ('Symptoms & Conditions', {
            'fields': ('symptoms', 'optimal_temperature', 'optimal_humidity')
        }),
        ('Treatment Options', {
            'fields': ('chemical_treatment', 'organic_alternatives', 'preventive_practices')
        }),
        ('Recovery', {
            'fields': ('recovery_time_days',)
        })
    )
