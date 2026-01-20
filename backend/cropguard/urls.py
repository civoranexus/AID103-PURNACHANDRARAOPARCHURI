"""
Django URL configuration for cropguard project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api.views import (
    FarmerViewSet, FarmViewSet, AnalysisViewSet,
    HealthCheckView, AnalyzeImageView, LocationNamesView
)

router = DefaultRouter()
router.register(r'farmers', FarmerViewSet, basename='farmer')
router.register(r'farms', FarmViewSet, basename='farm')
router.register(r'analyses', AnalysisViewSet, basename='analysis')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/analyze/', AnalyzeImageView.as_view(), name='analyze-image'),
    path('api/locations/<str:region>/', LocationNamesView.as_view(), name='location-names'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
