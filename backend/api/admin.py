# Django Admin Configuration for CropGuard AI
# File: api/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Q
from .models import (
    UserProfile, Farm, DiseaseDetection, WeatherData, Alert,
    MarketPrice, FarmingRecommendation, FarmAnalytics,
    PestRecord, IrrigationSchedule, ActivityLog
)


# ============================================
# USER PROFILE ADMIN
# ============================================
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'state', 'language_preference', 'total_farms', 'created_at')
    list_filter = ('language_preference', 'state', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone', 'state')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone', 'profile_picture')
        }),
        ('Location Details', {
            'fields': ('state', 'district', 'village')
        }),
        ('Preferences', {
            'fields': ('language_preference', 'notification_preference', 'email_alerts', 'sms_alerts')
        }),
        ('Statistics', {
            'fields': ('total_farms', 'total_analysis')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


# ============================================
# FARM ADMIN
# ============================================
@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'user_link', 'crop_type', 'area_display', 'health_status_badge', 'created_at')
    list_filter = ('crop_type', 'state', 'created_at')
    search_fields = ('name', 'user__username', 'crop_type', 'state')
    readonly_fields = ('created_at', 'updated_at', 'id')
    fieldsets = (
        ('Farm Information', {
            'fields': ('id', 'user', 'name', 'crop_type', 'description')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'state', 'district', 'village')
        }),
        ('Details', {
            'fields': ('area', 'soil_type', 'irrigation_type')
        }),
        ('Status', {
            'fields': ('health_status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def user_link(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'Farmer'

    def area_display(self, obj):
        return f"{obj.area} acres"
    area_display.short_description = 'Area'

    def health_status_badge(self, obj):
        colors = {'healthy': 'green', 'warning': 'orange', 'critical': 'red'}
        color = colors.get(obj.health_status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.health_status.upper()
        )
    health_status_badge.short_description = 'Health Status'


# ============================================
# DISEASE DETECTION ADMIN
# ============================================
@admin.register(DiseaseDetection)
class DiseaseDetectionAdmin(admin.ModelAdmin):
    list_display = ('disease_name', 'farm_link', 'confidence_display', 'severity_badge', 'detected_date')
    list_filter = ('disease_name', 'severity', 'detected_date')
    search_fields = ('disease_name', 'farm__name', 'user__username')
    readonly_fields = ('detected_date', 'updated_date', 'confidence_display')
    fieldsets = (
        ('Detection Information', {
            'fields': ('user', 'farm', 'disease_name', 'confidence_display')
        }),
        ('Details', {
            'fields': ('affected_area', 'severity', 'description')
        }),
        ('Treatment', {
            'fields': ('treatment_recommended', 'treatment_applied')
        }),
        ('Timestamps', {
            'fields': ('detected_date', 'updated_date'),
            'classes': ('collapse',)
        })
    )

    def farm_link(self, obj):
        url = reverse('admin:api_farm_change', args=[obj.farm.id])
        return format_html('<a href="{}">{}</a>', url, obj.farm.name)
    farm_link.short_description = 'Farm'

    def confidence_display(self, obj):
        return f"{obj.confidence * 100:.1f}%"
    confidence_display.short_description = 'Confidence'

    def severity_badge(self, obj):
        colors = {'low': 'green', 'medium': 'orange', 'high': 'red'}
        color = colors.get(obj.severity, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.severity.upper()
        )
    severity_badge.short_description = 'Severity'


# ============================================
# WEATHER DATA ADMIN
# ============================================
@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ('farm_link', 'temperature_display', 'humidity_display', 'recorded_date')
    list_filter = ('recorded_date', 'farm__state')
    search_fields = ('farm__name', 'farm__user__username')
    readonly_fields = ('recorded_date',)
    fieldsets = (
        ('Location', {
            'fields': ('farm',)
        }),
        ('Weather Conditions', {
            'fields': ('temperature', 'humidity', 'pressure', 'wind_speed', 'wind_direction')
        }),
        ('Precipitation', {
            'fields': ('rainfall', 'visibility', 'uv_index')
        }),
        ('Timestamps', {
            'fields': ('recorded_date',),
            'classes': ('collapse',)
        })
    )

    def farm_link(self, obj):
        url = reverse('admin:api_farm_change', args=[obj.farm.id])
        return format_html('<a href="{}">{}</a>', url, obj.farm.name)
    farm_link.short_description = 'Farm'

    def temperature_display(self, obj):
        return f"{obj.temperature}°C"
    temperature_display.short_description = 'Temperature'

    def humidity_display(self, obj):
        return f"{obj.humidity}%"
    humidity_display.short_description = 'Humidity'


# ============================================
# ALERT ADMIN
# ============================================
@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'farm_link', 'alert_type_badge', 'is_resolved_badge', 'created_at')
    list_filter = ('alert_type', 'is_resolved', 'created_at')
    search_fields = ('title', 'description', 'farm__name')
    readonly_fields = ('created_at', 'updated_at')
    actions = ['mark_as_resolved']
    fieldsets = (
        ('Alert Information', {
            'fields': ('user', 'farm', 'title', 'alert_type')
        }),
        ('Details', {
            'fields': ('description', 'severity')
        }),
        ('Status', {
            'fields': ('is_resolved',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def farm_link(self, obj):
        url = reverse('admin:api_farm_change', args=[obj.farm.id])
        return format_html('<a href="{}">{}</a>', url, obj.farm.name)
    farm_link.short_description = 'Farm'

    def alert_type_badge(self, obj):
        colors = {
            'disease': '#667eea',
            'weather': '#ffd700',
            'pest': '#ff6b6b',
            'irrigation': '#51cf66',
            'other': '#999'
        }
        color = colors.get(obj.alert_type, '#999')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.alert_type.upper()
        )
    alert_type_badge.short_description = 'Type'

    def is_resolved_badge(self, obj):
        icon = '✅' if obj.is_resolved else '⏳'
        return format_html('{} {}', icon, 'Resolved' if obj.is_resolved else 'Pending')
    is_resolved_badge.short_description = 'Status'

    def mark_as_resolved(self, request, queryset):
        updated = queryset.update(is_resolved=True)
        self.message_user(request, f'{updated} alerts marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected alerts as resolved'


# ============================================
# MARKET PRICE ADMIN
# ============================================
@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = ('crop_name', 'current_price_display', 'region', 'trend_badge', 'recorded_date')
    list_filter = ('crop_name', 'region', 'recorded_date')
    search_fields = ('crop_name', 'region')
    readonly_fields = ('recorded_date',)
    fieldsets = (
        ('Crop Information', {
            'fields': ('crop_name', 'region')
        }),
        ('Pricing', {
            'fields': ('current_price', 'min_price', 'max_price', 'average_price')
        }),
        ('Market Data', {
            'fields': ('volume_traded', 'price_change_percent')
        }),
        ('Timestamps', {
            'fields': ('recorded_date',),
            'classes': ('collapse',)
        })
    )

    def current_price_display(self, obj):
        return f"₹{obj.current_price}/quintal"
    current_price_display.short_description = 'Current Price'

    def trend_badge(self, obj):
        if obj.price_change_percent > 0:
            return format_html(
                '<span style="color: #51cf66; font-weight: bold;">↑ {:.1f}%</span>',
                obj.price_change_percent
            )
        else:
            return format_html(
                '<span style="color: #ff6b6b; font-weight: bold;">↓ {:.1f}%</span>',
                abs(obj.price_change_percent)
            )
    trend_badge.short_description = 'Trend'


# ============================================
# PEST RECORD ADMIN
# ============================================
@admin.register(PestRecord)
class PestRecordAdmin(admin.ModelAdmin):
    list_display = ('pest_name', 'farm_link', 'intensity_badge', 'first_observed', 'treatment_status')
    list_filter = ('pest_name', 'intensity', 'first_observed')
    search_fields = ('pest_name', 'farm__name')
    readonly_fields = ('first_observed', 'last_observed')
    fieldsets = (
        ('Pest Information', {
            'fields': ('farm', 'pest_name', 'description')
        }),
        ('Activity', {
            'fields': ('intensity', 'affected_area')
        }),
        ('Timestamps', {
            'fields': ('first_observed', 'last_observed'),
            'classes': ('collapse',)
        })
    )

    def farm_link(self, obj):
        url = reverse('admin:api_farm_change', args=[obj.farm.id])
        return format_html('<a href="{}">{}</a>', url, obj.farm.name)
    farm_link.short_description = 'Farm'

    def intensity_badge(self, obj):
        colors = {'low': 'green', 'medium': 'orange', 'high': 'red'}
        color = colors.get(obj.intensity, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.intensity.upper()
        )
    intensity_badge.short_description = 'Intensity'

    def treatment_status(self, obj):
        return '✅ Treated' if obj.is_treated else '⏳ Pending'
    treatment_status.short_description = 'Treatment'


# ============================================
# IRRIGATION SCHEDULE ADMIN
# ============================================
@admin.register(IrrigationSchedule)
class IrrigationScheduleAdmin(admin.ModelAdmin):
    list_display = ('farm_link', 'scheduled_date', 'duration_display', 'water_amount_display', 'status_badge')
    list_filter = ('farm', 'scheduled_date', 'is_completed')
    search_fields = ('farm__name', 'farm__user__username')
    readonly_fields = ('created_date',)
    fieldsets = (
        ('Schedule Information', {
            'fields': ('farm', 'scheduled_date', 'duration_minutes')
        }),
        ('Water Details', {
            'fields': ('water_amount', 'water_unit')
        }),
        ('Status', {
            'fields': ('is_completed', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_date',),
            'classes': ('collapse',)
        })
    )

    def farm_link(self, obj):
        url = reverse('admin:api_farm_change', args=[obj.farm.id])
        return format_html('<a href="{}">{}</a>', url, obj.farm.name)
    farm_link.short_description = 'Farm'

    def duration_display(self, obj):
        return f"{obj.duration_minutes} minutes"
    duration_display.short_description = 'Duration'

    def water_amount_display(self, obj):
        return f"{obj.water_amount} {obj.water_unit}"
    water_amount_display.short_description = 'Water Amount'

    def status_badge(self, obj):
        if obj.is_completed:
            return format_html('<span style="color: #51cf66; font-weight: bold;">✅ Completed</span>')
        else:
            return format_html('<span style="color: #667eea; font-weight: bold;">⏳ Pending</span>')
    status_badge.short_description = 'Status'


# ============================================
# ACTIVITY LOG ADMIN
# ============================================
@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('activity_type', 'user_link', 'farm_link', 'timestamp')
    list_filter = ('activity_type', 'timestamp')
    search_fields = ('user__username', 'farm__name', 'description')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    fieldsets = (
        ('Activity Information', {
            'fields': ('user', 'farm', 'activity_type')
        }),
        ('Details', {
            'fields': ('description',)
        }),
        ('Timestamps', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        })
    )

    def user_link(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'

    def farm_link(self, obj):
        if obj.farm:
            url = reverse('admin:api_farm_change', args=[obj.farm.id])
            return format_html('<a href="{}">{}</a>', url, obj.farm.name)
        return '-'
    farm_link.short_description = 'Farm'


# ============================================
# OTHER MODELS ADMIN
# ============================================
@admin.register(FarmingRecommendation)
class FarmingRecommendationAdmin(admin.ModelAdmin):
    list_display = ('title', 'farm_link', 'recommendation_type', 'created_date')
    list_filter = ('recommendation_type', 'created_date')
    search_fields = ('title', 'farm__name')


@admin.register(FarmAnalytics)
class FarmAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('farm_link', 'health_score_display', 'yield_prediction', 'analysis_date')
    list_filter = ('analysis_date', 'farm')
    search_fields = ('farm__name', 'farm__user__username')
    readonly_fields = ('analysis_date',)

    def farm_link(self, obj):
        url = reverse('admin:api_farm_change', args=[obj.farm.id])
        return format_html('<a href="{}">{}</a>', url, obj.farm.name)
    farm_link.short_description = 'Farm'

    def health_score_display(self, obj):
        return f"{obj.health_score:.1f}/100"
    health_score_display.short_description = 'Health Score'


# ============================================
# ADMIN CUSTOMIZATION
# ============================================
admin.site.site_header = "CropGuard AI - Administration"
admin.site.site_title = "CropGuard AI Admin"
admin.site.index_title = "Welcome to CropGuard AI Admin Dashboard"
