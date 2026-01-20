"""
Apps configuration for CropGuard API
"""

from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = 'CropGuard AI API'

    def ready(self):
        pass
