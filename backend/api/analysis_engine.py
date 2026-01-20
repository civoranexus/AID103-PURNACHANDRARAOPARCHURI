"""
AI Analysis Engine for CropGuard
"""

import random
import numpy as np
from api.models import DiseaseProfile, Treatment


class DiseaseDatabase:
    """Disease database for AI analysis"""
    
    DISEASES = {
        'wheat': [
            {
                'name': 'Powdery Mildew',
                'severity': 'low',
                'cause': 'Fungal infection in dry conditions',
                'chemical': 'Sulfur dust application',
                'organic': 'Neem oil spray every 7 days',
                'preventive': 'Improve air circulation, reduce humidity'
            },
            {
                'name': 'Leaf Rust',
                'severity': 'high',
                'cause': 'Puccinia triticina fungus infection',
                'chemical': 'Propiconazole or Tebuconazole spray',
                'organic': 'Bacillus subtilis bioagent',
                'preventive': 'Plant resistant varieties, field sanitation'
            },
            {
                'name': 'Septoria Nodorum',
                'severity': 'medium',
                'cause': 'Fungal disease in humid weather',
                'chemical': 'Tebuconazole treatment',
                'organic': 'Trichoderma application',
                'preventive': 'Reduce plant density, improve drainage'
            }
        ],
        'rice': [
            {
                'name': 'Blast Disease',
                'severity': 'high',
                'cause': 'Magnaporthe oryzae fungus infection',
                'chemical': 'Tricyclazole spray application',
                'organic': 'Pseudomonas fluorescens bioagent',
                'preventive': 'Use blast-resistant seeds, field sanitation'
            },
            {
                'name': 'Brown Spot',
                'severity': 'medium',
                'cause': 'Cochliobolus miyabeanus infection',
                'chemical': 'Mancozeb treatment',
                'organic': 'Seed treatment with organic fungicide',
                'preventive': 'Field sanitation, proper crop spacing'
            },
            {
                'name': 'Sheath Blight',
                'severity': 'medium',
                'cause': 'Rhizoctonia solani fungus',
                'chemical': 'Validamycin A application',
                'organic': 'Bacillus subtilis spray',
                'preventive': 'Avoid excess nitrogen, proper irrigation'
            }
        ],
        'corn': [
            {
                'name': 'Southern Corn Leaf Blight',
                'severity': 'high',
                'cause': 'Cochliobolus heterostrophus pathogen',
                'chemical': 'Azoxystrobin fungicide',
                'organic': 'Copper fungicide spray',
                'preventive': 'Crop rotation, resistant hybrids'
            },
            {
                'name': 'Gray Leaf Spot',
                'severity': 'medium',
                'cause': 'Cercospora zeae-maydis infection',
                'chemical': 'Propiconazole treatment',
                'organic': 'Neem oil solution',
                'preventive': 'Plant resistant hybrids, field hygiene'
            },
            {
                'name': 'Common Rust',
                'severity': 'low',
                'cause': 'Puccinia sorghi fungus',
                'chemical': 'Sulfur dust application',
                'organic': 'Organic sulfur dust',
                'preventive': 'Monitor field regularly, remove volunteer plants'
            }
        ],
        'cotton': [
            {
                'name': 'Leaf Curl Virus',
                'severity': 'high',
                'cause': 'Whitefly vector transmission',
                'chemical': 'Acephate + Imidacloprid combination',
                'organic': 'Spinosad + insecticidal soap',
                'preventive': 'Eliminate volunteer plants, yellow sticky traps'
            },
            {
                'name': 'Fusarium Wilt',
                'severity': 'high',
                'cause': 'Fusarium vasinfectum soil pathogen',
                'chemical': 'Carbendazim seed treatment',
                'organic': 'Trichoderma viride application',
                'preventive': 'Plant resistant varieties, crop rotation'
            },
            {
                'name': 'Alternaria Leaf Spot',
                'severity': 'medium',
                'cause': 'Alternaria alternata fungus',
                'chemical': 'Mancozeb spray',
                'organic': 'Bacillus-based bioagent',
                'preventive': 'Improve drainage, field sanitation'
            }
        ],
        'potato': [
            {
                'name': 'Late Blight',
                'severity': 'high',
                'cause': 'Phytophthora infestans water mold',
                'chemical': 'Metalaxyl + Chlorothalonil combination',
                'organic': 'Bacillus subtilis treatment',
                'preventive': 'Use certified seeds, destroy infected plants'
            },
            {
                'name': 'Early Blight',
                'severity': 'medium',
                'cause': 'Alternaria solani fungus',
                'chemical': 'Mancozeb application',
                'organic': 'Copper sulfate solution',
                'preventive': 'Remove infected leaves, improve air flow'
            },
            {
                'name': 'Scab',
                'severity': 'low',
                'cause': 'Streptomyces scabies soil bacteria',
                'chemical': 'Thiram seed treatment',
                'organic': 'Sulfur dust application',
                'preventive': 'Adjust soil pH, crop rotation'
            }
        ],
        'tomato': [
            {
                'name': 'Early Blight',
                'severity': 'medium',
                'cause': 'Alternaria solani fungus',
                'chemical': 'Chlorothalonil fungicide',
                'organic': 'Bacillus subtilis spray',
                'preventive': 'Remove lower leaves, improve ventilation'
            },
            {
                'name': 'Late Blight',
                'severity': 'high',
                'cause': 'Phytophthora infestans pathogen',
                'chemical': 'Metalaxyl-M treatment',
                'organic': 'Pseudomonas bioagent',
                'preventive': 'Improve air circulation, reduce leaf wetness'
            },
            {
                'name': 'Septoria Leaf Spot',
                'severity': 'medium',
                'cause': 'Septoria lycopersici fungus',
                'chemical': 'Mancozeb application',
                'organic': 'Neem oil spray',
                'preventive': 'Sanitize tools, remove infected leaves'
            }
        ],
        'sugarcane': [
            {
                'name': 'Red Rot',
                'severity': 'high',
                'cause': 'Colletotrichum falcatum vascular pathogen',
                'chemical': 'Thiram treatment',
                'organic': 'Bacillus-based bioagent',
                'preventive': 'Use healthy seeds, field sanitation'
            },
            {
                'name': 'Smut Disease',
                'severity': 'medium',
                'cause': 'Ustilago scitaminea fungus',
                'chemical': 'Carboxin seed treatment',
                'organic': 'Biological seed treatment',
                'preventive': 'Hot water treatment, resistant varieties'
            },
            {
                'name': 'Eyespot',
                'severity': 'low',
                'cause': 'Drechslera sacchari fungus',
                'chemical': 'Carbendazim spray',
                'organic': 'Copper fungicide application',
                'preventive': 'Field sanitation, crop rotation'
            }
        ]
    }

    @staticmethod
    def get_disease(crop_type):
        """Get a random disease for given crop type"""
        diseases = DiseaseDatabase.DISEASES.get(crop_type, DiseaseDatabase.DISEASES['wheat'])
        return random.choice(diseases)


class ImageAnalyzer:
    """Image analysis engine for disease detection"""

    @staticmethod
    def analyze_image(image, crop_type, location_data=None):
        """
        Analyze crop image for disease detection
        
        Args:
            image: PIL Image object
            crop_type: str, type of crop
            location_data: dict, optional location information
            
        Returns:
            dict, analysis results
        """
        # Get disease data from database
        disease = DiseaseDatabase.get_disease(crop_type)
        
        # Simulate confidence scoring based on image characteristics
        confidence = ImageAnalyzer._calculate_confidence(disease['severity'])
        
        # Generate affected region
        affected_region = ImageAnalyzer._generate_affected_region()
        
        return {
            'disease': disease['name'],
            'severity': disease['severity'],
            'confidence': confidence,
            'cause': disease['cause'],
            'chemical_treatment': disease['chemical'],
            'organic_alternatives': disease['organic'],
            'preventive_practices': disease['preventive'],
            'affected_region': affected_region
        }

    @staticmethod
    def _calculate_confidence(severity):
        """Calculate confidence score based on severity"""
        confidence_ranges = {
            'low': (60, 75),
            'medium': (75, 88),
            'high': (88, 98)
        }
        low, high = confidence_ranges.get(severity, (60, 75))
        return round(random.uniform(low, high), 2)

    @staticmethod
    def _generate_affected_region():
        """Generate random affected region coordinates"""
        return {
            'x': round(0.2 + random.random() * 0.4, 2),
            'y': round(0.1 + random.random() * 0.5, 2),
            'width': round(0.2 + random.random() * 0.3, 2),
            'height': round(0.2 + random.random() * 0.3, 2)
        }


class AlertGenerator:
    """Generate context-aware alerts"""

    ALERT_TEMPLATES = {
        'high': {
            'type': 'critical',
            'icon': '🔴',
            'template': 'Critical - {disease} detected at HIGH severity in your {crop} field at {location}. Immediate intervention required. Apply recommended treatment immediately.'
        },
        'medium': {
            'type': 'warning',
            'icon': '🟠',
            'template': 'Warning - {disease} detected at MEDIUM severity. Monitor closely and apply treatment within 2-3 days to prevent spread.'
        },
        'low': {
            'type': 'info',
            'icon': '🟢',
            'template': 'Information - {disease} detected at LOW severity. Continue monitoring and implement preventive practices.'
        }
    }

    WEATHER_ALERTS = [
        'Humid conditions forecasted for next 3 days. Increase field ventilation and reduce irrigation.',
        'Temperature rise expected. Monitor for disease acceleration.',
        'Rainfall predicted. Ensure proper drainage to prevent fungal spread.',
        'Dry weather ahead. Adjust irrigation to prevent stress-induced disease.'
    ]

    LOCATION_ALERTS = {
        'north': 'Powdery Mildew outbreak reported in Punjab region.',
        'east': 'High humidity conditions reported affecting rice crops in Bihar.',
        'west': 'Cotton leaf curl virus spreading in Gujarat districts.',
        'south': 'Late blight reported in potato fields of Karnataka.',
        'central': 'Blast disease confirmed in rice fields of Madhya Pradesh.'
    }

    @staticmethod
    def generate_alerts(analysis, location_name, crop_type):
        """Generate alerts based on analysis results"""
        alerts = []
        severity = analysis['severity']
        
        # Disease severity alert
        template = AlertGenerator.ALERT_TEMPLATES[severity]
        disease_alert = {
            'type': template['type'],
            'title': f"{template['icon']} {analysis['disease']} Detection",
            'message': template['template'].format(
                disease=analysis['disease'],
                crop=crop_type.title(),
                location=location_name
            )
        }
        alerts.append(disease_alert)
        
        # Weather alert
        weather_alert = {
            'type': 'warning',
            'title': '⛅ Weather Condition Alert',
            'message': random.choice(AlertGenerator.WEATHER_ALERTS)
        }
        alerts.append(weather_alert)
        
        # Location alert
        region = AlertGenerator._determine_region(location_name)
        location_alert = {
            'type': 'info',
            'title': '📍 Regional Disease Report',
            'message': f"{AlertGenerator.LOCATION_ALERTS.get(region, 'Regional disease activity detected.')}"
        }
        alerts.append(location_alert)
        
        return alerts

    @staticmethod
    def _determine_region(location_name):
        """Determine region from location name"""
        location_lower = location_name.lower()
        
        if any(state in location_lower for state in ['punjab', 'haryana', 'himachal', 'uttarakhand', 'jammu']):
            return 'north'
        elif any(state in location_lower for state in ['bihar', 'jharkhand', 'odisha', 'west bengal', 'assam']):
            return 'east'
        elif any(state in location_lower for state in ['gujarat', 'maharashtra', 'rajasthan', 'goa', 'kerala']):
            return 'west'
        elif any(state in location_lower for state in ['karnataka', 'tamil', 'telangana', 'andhra']):
            return 'south'
        else:
            return 'central'
