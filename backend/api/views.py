"""
Views for CropGuard AI API
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.utils import timezone
from PIL import Image
import io

from api.models import Farmer, Farm, CropImage, DiseaseAnalysis, Treatment, Alert, DiseaseProfile
from api.serializers import (
    FarmerSerializer, FarmSerializer, DiseaseAnalysisSerializer,
    AlertSerializer, DiseaseProfileSerializer, AnalysisDetailSerializer
)
from api.analysis_engine import ImageAnalyzer, AlertGenerator


class HealthCheckView(APIView):
    """Health check endpoint"""
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'CropGuard AI Backend',
            'version': '1.0.0',
            'timestamp': timezone.now()
        })


class FarmerViewSet(viewsets.ModelViewSet):
    """ViewSet for Farmer model"""
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer
    
    @action(detail=True, methods=['get'])
    def farms(self, request, pk=None):
        """Get all farms for a farmer"""
        farmer = self.get_object()
        farms = farmer.farms.all()
        serializer = FarmSerializer(farms, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def analyses(self, request, pk=None):
        """Get all analyses for a farmer's farms"""
        farmer = self.get_object()
        analyses = DiseaseAnalysis.objects.filter(farm__farmer=farmer)
        serializer = DiseaseAnalysisSerializer(analyses, many=True)
        return Response(serializer.data)


class FarmViewSet(viewsets.ModelViewSet):
    """ViewSet for Farm model"""
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    
    @action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        """Get all images for a farm"""
        farm = self.get_object()
        images = farm.images.all()
        serializer = serializers.CropImageSerializer(images, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def recent_analysis(self, request, pk=None):
        """Get the most recent analysis for a farm"""
        farm = self.get_object()
        analysis = farm.analyses.first()
        if analysis:
            serializer = DiseaseAnalysisSerializer(analysis)
            return Response(serializer.data)
        return Response({'detail': 'No analysis found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def health_summary(self, request, pk=None):
        """Get farm health summary"""
        farm = self.get_object()
        analyses = farm.analyses.all()
        
        summary = {
            'total_analyses': analyses.count(),
            'high_severity': analyses.filter(severity='high').count(),
            'medium_severity': analyses.filter(severity='medium').count(),
            'low_severity': analyses.filter(severity='low').count(),
            'last_analysis': analyses.first().analyzed_at if analyses.exists() else None,
            'farm_status': 'healthy' if not analyses.filter(severity='high').exists() else 'requires_attention'
        }
        return Response(summary)


class AnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for DiseaseAnalysis model (Read-only)"""
    queryset = DiseaseAnalysis.objects.all()
    serializer_class = DiseaseAnalysisSerializer
    
    @action(detail=False, methods=['get'])
    def by_severity(self, request):
        """Get analyses filtered by severity"""
        severity = request.query_params.get('severity')
        if severity:
            analyses = DiseaseAnalysis.objects.filter(severity=severity)
        else:
            analyses = DiseaseAnalysis.objects.all()
        
        serializer = self.get_serializer(analyses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_crop(self, request):
        """Get analyses filtered by crop type"""
        crop_type = request.query_params.get('crop_type')
        if crop_type:
            analyses = DiseaseAnalysis.objects.filter(farm__crop_type=crop_type)
        else:
            analyses = DiseaseAnalysis.objects.all()
        
        serializer = self.get_serializer(analyses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get analysis statistics"""
        total = DiseaseAnalysis.objects.count()
        by_severity = {
            'high': DiseaseAnalysis.objects.filter(severity='high').count(),
            'medium': DiseaseAnalysis.objects.filter(severity='medium').count(),
            'low': DiseaseAnalysis.objects.filter(severity='low').count(),
        }
        
        return Response({
            'total_analyses': total,
            'by_severity': by_severity,
            'average_confidence': round(
                DiseaseAnalysis.objects.all().aggregate(
                    avg=models.Avg('confidence_score')
                )['avg'] or 0, 2
            )
        })


class AnalyzeImageView(APIView):
    """API endpoint for analyzing crop images"""
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        """
        Analyze crop image
        
        Expected POST data:
        - image: Image file
        - farm_id: UUID of the farm
        - crop_type: Type of crop
        - location: Location name
        """
        try:
            # Validate required fields
            farm_id = request.data.get('farm_id')
            crop_type = request.data.get('crop_type')
            location = request.data.get('location', 'Unknown Location')
            image_file = request.FILES.get('image')
            image_url = request.data.get('image_url')

            if not farm_id:
                return Response(
                    {'error': 'farm_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not crop_type:
                return Response(
                    {'error': 'crop_type is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not image_file and not image_url:
                return Response(
                    {'error': 'Either image file or image_url is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get farm
            try:
                farm = Farm.objects.get(id=farm_id)
            except Farm.DoesNotExist:
                return Response(
                    {'error': 'Farm not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Process image
            if image_file:
                # Validate file size
                if image_file.size > 5 * 1024 * 1024:  # 5MB
                    return Response(
                        {'error': 'Image size exceeds 5MB limit'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create CropImage object
                crop_image = CropImage.objects.create(
                    farm=farm,
                    image=image_file,
                    file_size=image_file.size
                )
            else:
                # Create CropImage object with URL
                crop_image = CropImage.objects.create(
                    farm=farm,
                    image_url=image_url,
                    file_size=0
                )

            # Load image
            if image_file:
                img = Image.open(image_file)
            else:
                # For URL-based images, we'll simulate analysis
                img = None

            # Run AI analysis
            analysis_result = ImageAnalyzer.analyze_image(img, crop_type, {'location': location})

            # Create DiseaseAnalysis object
            disease_analysis = DiseaseAnalysis.objects.create(
                crop_image=crop_image,
                farm=farm,
                disease_detected=analysis_result['disease'],
                severity=analysis_result['severity'],
                confidence_score=analysis_result['confidence'],
                possible_cause=analysis_result['cause'],
                affected_region_x=analysis_result['affected_region']['x'],
                affected_region_y=analysis_result['affected_region']['y'],
                affected_region_width=analysis_result['affected_region']['width'],
                affected_region_height=analysis_result['affected_region']['height']
            )

            # Create Treatment object
            treatment = Treatment.objects.create(
                analysis=disease_analysis,
                chemical_treatment=analysis_result['chemical_treatment'],
                organic_alternatives=analysis_result['organic_alternatives'],
                preventive_practices=analysis_result['preventive_practices'],
                estimated_recovery_days=7 if analysis_result['severity'] == 'low' else 14 if analysis_result['severity'] == 'medium' else 21
            )

            # Generate and create alerts
            alerts = AlertGenerator.generate_alerts(analysis_result, location, crop_type)
            for alert_data in alerts:
                Alert.objects.create(
                    farm=farm,
                    alert_type=alert_data['type'],
                    title=alert_data['title'],
                    message=alert_data['message']
                )

            # Prepare response
            response_data = {
                'analysis_id': str(disease_analysis.id),
                'image_id': str(crop_image.id),
                'disease': disease_analysis.disease_detected,
                'severity': disease_analysis.severity,
                'confidence': disease_analysis.confidence_score,
                'cause': disease_analysis.possible_cause,
                'treatment': {
                    'chemical': treatment.chemical_treatment,
                    'organic': treatment.organic_alternatives,
                    'preventive': treatment.preventive_practices,
                    'recovery_days': treatment.estimated_recovery_days
                },
                'affected_region': {
                    'x': float(disease_analysis.affected_region_x),
                    'y': float(disease_analysis.affected_region_y),
                    'width': float(disease_analysis.affected_region_width),
                    'height': float(disease_analysis.affected_region_height)
                },
                'alerts': alerts,
                'timestamp': timezone.now().isoformat()
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LocationNamesView(APIView):
    """API endpoint for getting location names by region"""

    LOCATIONS = {
        'north': [
            'Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand',
            'Jammu & Kashmir', 'Delhi', 'Chandigarh'
        ],
        'east': [
            'Bihar', 'Jharkhand', 'Odisha', 'West Bengal',
            'Assam', 'Sikkim', 'Meghalaya'
        ],
        'west': [
            'Gujarat', 'Maharashtra', 'Rajasthan', 'Goa',
            'Kerala', 'Lakshadweep'
        ],
        'south': [
            'Karnataka', 'Tamil Nadu', 'Telangana',
            'Andhra Pradesh', 'Puducherry'
        ],
        'central': [
            'Madhya Pradesh', 'Chhattisgarh', 'Uttar Pradesh'
        ]
    }

    def get(self, request, region):
        """Get locations for a region"""
        locations = self.LOCATIONS.get(region.lower(), [])
        
        if not locations:
            return Response(
                {'error': 'Region not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'region': region,
            'locations': locations
        })


# Import models for aggregate functions
from django.db.models import Avg
import api.serializers as serializers
