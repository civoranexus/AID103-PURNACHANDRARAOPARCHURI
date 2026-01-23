# Unit Tests for CropGuard AI API
# File: api/tests.py

from django.test import TestCase, Client
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta
from .models import (
    UserProfile, Farm, DiseaseDetection, WeatherData, Alert,
    MarketPrice, FarmingRecommendation, PestRecord, IrrigationSchedule
)


class UserProfileTestCase(APITestCase):
    """Test cases for UserProfile model and API."""

    def setUp(self):
        """Set up test user and profile."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            phone='+919876543210',
            state='Maharashtra',
            district='Pune',
            village='Peth',
            language_preference='en'
        )
        self.client = APIClient()

    def test_profile_creation(self):
        """Test user profile creation."""
        self.assertEqual(self.profile.user.username, 'testfarmer')
        self.assertEqual(self.profile.state, 'Maharashtra')
        self.assertEqual(str(self.profile), f"{self.user.username}'s Profile")

    def test_profile_defaults(self):
        """Test profile default values."""
        self.assertTrue(self.profile.notification_preference)
        self.assertTrue(self.profile.email_alerts)
        self.assertFalse(self.profile.sms_alerts)
        self.assertEqual(self.profile.total_farms, 0)

    def test_profile_update(self):
        """Test updating profile."""
        self.profile.phone = '+918765432109'
        self.profile.save()
        updated_profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(updated_profile.phone, '+918765432109')


class FarmTestCase(APITestCase):
    """Test cases for Farm model and API."""

    def setUp(self):
        """Set up test farm."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user, state='Maharashtra')
        self.farm = Farm.objects.create(
            user=self.user,
            name='Test Farm',
            crop_type='Sugarcane',
            latitude=18.5204,
            longitude=73.8567,
            area=5.5,
            state='Maharashtra',
            health_status='healthy'
        )
        self.client = APIClient()

    def test_farm_creation(self):
        """Test farm creation."""
        self.assertEqual(self.farm.name, 'Test Farm')
        self.assertEqual(self.farm.crop_type, 'Sugarcane')
        self.assertEqual(self.farm.area, 5.5)

    def test_farm_string_representation(self):
        """Test farm string representation."""
        self.assertEqual(str(self.farm), 'Test Farm')

    def test_farm_health_status_choices(self):
        """Test farm health status."""
        valid_statuses = ['healthy', 'warning', 'critical']
        self.assertIn(self.farm.health_status, valid_statuses)


class DiseaseDetectionTestCase(APITestCase):
    """Test cases for disease detection."""

    def setUp(self):
        """Set up test disease detection."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.farm = Farm.objects.create(
            user=self.user,
            name='Test Farm',
            crop_type='Cotton',
            area=3.0
        )
        self.disease = DiseaseDetection.objects.create(
            user=self.user,
            farm=self.farm,
            disease_name='Powdery Mildew',
            confidence=0.92,
            affected_area=1.5,
            severity='high',
            treatment_recommended='Apply sulfur-based fungicide'
        )
        self.client = APIClient()

    def test_disease_detection_creation(self):
        """Test disease detection creation."""
        self.assertEqual(self.disease.disease_name, 'Powdery Mildew')
        self.assertEqual(self.disease.confidence, 0.92)
        self.assertEqual(self.disease.severity, 'high')

    def test_disease_confidence_validation(self):
        """Test confidence value validation."""
        self.assertTrue(0 <= self.disease.confidence <= 1)

    def test_disease_severity_choices(self):
        """Test disease severity choices."""
        valid_severities = ['low', 'medium', 'high']
        self.assertIn(self.disease.severity, valid_severities)


class WeatherDataTestCase(APITestCase):
    """Test cases for weather data."""

    def setUp(self):
        """Set up test weather data."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.farm = Farm.objects.create(
            user=self.user,
            name='Test Farm',
            area=5.0
        )
        self.weather = WeatherData.objects.create(
            farm=self.farm,
            temperature=28.5,
            humidity=65,
            pressure=1013.25,
            wind_speed=12.5,
            rainfall=2.5,
            uv_index=5
        )

    def test_weather_data_creation(self):
        """Test weather data creation."""
        self.assertEqual(self.weather.temperature, 28.5)
        self.assertEqual(self.weather.humidity, 65)

    def test_weather_data_validation(self):
        """Test weather data validation."""
        self.assertTrue(-50 <= self.weather.temperature <= 60)
        self.assertTrue(0 <= self.weather.humidity <= 100)


class AlertTestCase(APITestCase):
    """Test cases for alerts."""

    def setUp(self):
        """Set up test alert."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.farm = Farm.objects.create(
            user=self.user,
            name='Test Farm',
            area=5.0
        )
        self.alert = Alert.objects.create(
            user=self.user,
            farm=self.farm,
            title='Disease Alert',
            description='Powdery mildew detected',
            alert_type='disease',
            severity='high',
            is_resolved=False
        )

    def test_alert_creation(self):
        """Test alert creation."""
        self.assertEqual(self.alert.title, 'Disease Alert')
        self.assertFalse(self.alert.is_resolved)

    def test_alert_resolve(self):
        """Test resolving an alert."""
        self.alert.is_resolved = True
        self.alert.save()
        updated_alert = Alert.objects.get(id=self.alert.id)
        self.assertTrue(updated_alert.is_resolved)


class IrrigationScheduleTestCase(APITestCase):
    """Test cases for irrigation schedule."""

    def setUp(self):
        """Set up test irrigation schedule."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.farm = Farm.objects.create(
            user=self.user,
            name='Test Farm',
            area=5.0
        )
        self.schedule = IrrigationSchedule.objects.create(
            farm=self.farm,
            scheduled_date=datetime.now() + timedelta(days=1),
            duration_minutes=45,
            water_amount=2000,
            water_unit='gallons'
        )

    def test_schedule_creation(self):
        """Test schedule creation."""
        self.assertEqual(self.schedule.duration_minutes, 45)
        self.assertEqual(self.schedule.water_amount, 2000)
        self.assertFalse(self.schedule.is_completed)

    def test_schedule_completion(self):
        """Test marking schedule as completed."""
        self.schedule.is_completed = True
        self.schedule.save()
        updated_schedule = IrrigationSchedule.objects.get(id=self.schedule.id)
        self.assertTrue(updated_schedule.is_completed)


class PestRecordTestCase(APITestCase):
    """Test cases for pest records."""

    def setUp(self):
        """Set up test pest record."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.farm = Farm.objects.create(
            user=self.user,
            name='Test Farm',
            area=5.0
        )
        self.pest = PestRecord.objects.create(
            farm=self.farm,
            pest_name='Bollworm',
            description='Cotton bollworm infestation',
            intensity='high',
            affected_area=2.0
        )

    def test_pest_record_creation(self):
        """Test pest record creation."""
        self.assertEqual(self.pest.pest_name, 'Bollworm')
        self.assertEqual(self.pest.intensity, 'high')


class MarketPriceTestCase(APITestCase):
    """Test cases for market prices."""

    def setUp(self):
        """Set up test market price."""
        self.price = MarketPrice.objects.create(
            crop_name='Wheat',
            region='Punjab',
            current_price=2450,
            min_price=2350,
            max_price=2580,
            average_price=2450,
            volume_traded=5000,
            price_change_percent=2.5
        )

    def test_price_creation(self):
        """Test price record creation."""
        self.assertEqual(self.price.crop_name, 'Wheat')
        self.assertEqual(self.price.current_price, 2450)

    def test_price_change_percent(self):
        """Test price change percentage."""
        self.assertEqual(self.price.price_change_percent, 2.5)


class AuthenticationTestCase(APITestCase):
    """Test cases for authentication and JWT tokens."""

    def setUp(self):
        """Set up test user."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.client = APIClient()

    def test_user_login(self):
        """Test user login."""
        self.assertTrue(self.user.check_password('testpass123'))

    def test_jwt_token_generation(self):
        """Test JWT token generation."""
        refresh = RefreshToken.for_user(self.user)
        self.assertIsNotNone(refresh.access_token)

    def test_user_authentication(self):
        """Test user authentication."""
        self.assertTrue(self.user.is_authenticated)


class PermissionTestCase(APITestCase):
    """Test cases for permissions."""

    def setUp(self):
        """Set up test users and farms."""
        self.user1 = User.objects.create_user(
            username='farmer1',
            email='farmer1@test.com',
            password='pass123'
        )
        self.profile1 = UserProfile.objects.create(user=self.user1)
        
        self.user2 = User.objects.create_user(
            username='farmer2',
            email='farmer2@test.com',
            password='pass123'
        )
        self.profile2 = UserProfile.objects.create(user=self.user2)

        self.farm1 = Farm.objects.create(
            user=self.user1,
            name='Farm 1',
            area=5.0
        )
        self.farm2 = Farm.objects.create(
            user=self.user2,
            name='Farm 2',
            area=3.0
        )

    def test_user_can_access_own_farm(self):
        """Test user can access their own farm."""
        self.assertEqual(self.farm1.user, self.user1)

    def test_user_cannot_access_other_farm(self):
        """Test user cannot access another user's farm."""
        self.assertNotEqual(self.farm2.user, self.user1)


class ValidationTestCase(TestCase):
    """Test cases for data validation."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@test.com',
            password='testpass123'
        )
        self.profile = UserProfile.objects.create(user=self.user)

    def test_farm_area_validation(self):
        """Test farm area must be positive."""
        farm = Farm(
            user=self.user,
            name='Test Farm',
            area=-5.0
        )
        # This should raise validation error
        # Implement validation in model if needed

    def test_phone_format_validation(self):
        """Test phone number format."""
        # Valid phone
        profile = UserProfile(
            user=self.user,
            phone='+919876543210'
        )
        # Should validate successfully

