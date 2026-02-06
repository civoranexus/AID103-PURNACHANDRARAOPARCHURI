/**
 * CropGuard AI - Multi-Language Support Module
 * Supports: English, Hindi, Telugu, Tamil, Marathi, Gujarati, Bengali
 * 
 * Usage: Call LanguageManager.setLanguage('hi') to switch language
 * All UI text is stored in translations object
 */

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('cropguard-language') || 'en';
        this.translations = {
            en: {
                // Header & Navigation
                dashboard: 'Dashboard',
                photocapture: 'Photo Capture',
                diseasedetection: 'Disease Detection',
                pestmanagement: 'Pest Management',
                irrigation: 'Irrigation',
                market: 'Market Prices',
                analytics: 'Analytics',
                notifications: 'Notifications',
                settings: 'Settings',
                help: 'Help',
                logout: 'Logout',
                
                // Common
                welcome: 'Welcome',
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                add: 'Add',
                close: 'Close',
                refresh: 'Refresh',
                export: 'Export',
                
                // Dashboard
                farmhealth: 'Farm Health',
                healthscore: 'Health Score',
                activealerts: 'Active Alerts',
                recentactivity: 'Recent Activity',
                weather: 'Weather',
                temperature: 'Temperature',
                humidity: 'Humidity',
                rainfall: 'Rainfall',
                
                // Photo Capture
                takephoto: 'Take Photo',
                uploadphoto: 'Upload Photo',
                selectfarm: 'Select Farm',
                cropname: 'Crop Name',
                location: 'Location',
                notes: 'Notes',
                
                // Disease Detection
                detectdisease: 'Detect Disease',
                confidence: 'Confidence',
                severity: 'Severity',
                treatment: 'Treatment',
                recommendation: 'Recommendation',
                
                // Pest Management
                pestdetected: 'Pest Detected',
                pesttype: 'Pest Type',
                intensity: 'Intensity',
                control: 'Control Method',
                
                // Irrigation
                schedule: 'Schedule',
                duration: 'Duration',
                wateramount: 'Water Amount',
                soilmoisture: 'Soil Moisture',
                
                // Market
                prices: 'Prices',
                trend: 'Trend',
                demand: 'Demand',
                supply: 'Supply',
                
                // Forms
                email: 'Email',
                password: 'Password',
                phone: 'Phone',
                address: 'Address',
                city: 'City',
                state: 'State',
                country: 'Country',
                farmsize: 'Farm Size',
                croptype: 'Crop Type',
                
                // Messages
                loadingsuccess: 'Loaded successfully',
                savingsuccess: 'Saved successfully',
                deletionsuccess: 'Deleted successfully',
                errormessage: 'An error occurred. Please try again.',
                requiredfield: 'This field is required',
                invalidinput: 'Invalid input',
                
                // Notifications
                newdisease: 'New disease detected',
                pestwarning: 'Pest warning',
                weatheralert: 'Weather alert',
                irrigationreminder: 'Irrigation reminder',
                
                // Status
                healthy: 'Healthy',
                atrisk: 'At Risk',
                critical: 'Critical',
                low: 'Low',
                medium: 'Medium',
                high: 'High',
            },
            hi: {
                // Header & Navigation
                dashboard: 'डैशबोर्ड',
                photocapture: 'फोटो कैप्चर',
                diseasedetection: 'रोग पहचान',
                pestmanagement: 'कीट प्रबंधन',
                irrigation: 'सिंचाई',
                market: 'बाजार मूल्य',
                analytics: 'विश्लेषण',
                notifications: 'सूचनाएं',
                settings: 'सेटिंग्स',
                help: 'मदद',
                logout: 'लॉगआउट',
                
                // Common
                welcome: 'स्वागत है',
                loading: 'लोड हो रहा है...',
                error: 'त्रुटि',
                success: 'सफल',
                save: 'सहेजें',
                cancel: 'रद्द करें',
                delete: 'हटाएं',
                edit: 'संपादित करें',
                add: 'जोड़ें',
                close: 'बंद करें',
                refresh: 'ताज़ा करें',
                export: 'निर्यात करें',
                
                // Dashboard
                farmhealth: 'खेत का स्वास्थ्य',
                healthscore: 'स्वास्थ्य स्कोर',
                activealerts: 'सक्रिय सतर्कताएं',
                recentactivity: 'हाल की गतिविधि',
                weather: 'मौसम',
                temperature: 'तापमान',
                humidity: 'आर्द्रता',
                rainfall: 'वर्षा',
                
                // Photo Capture
                takephoto: 'फोटो लें',
                uploadphoto: 'फोटो अपलोड करें',
                selectfarm: 'खेत चुनें',
                cropname: 'फसल का नाम',
                location: 'स्थान',
                notes: 'नोट्स',
                
                // Disease Detection
                detectdisease: 'रोग का पता लगाएं',
                confidence: 'आत्मविश्वास',
                severity: 'गंभीरता',
                treatment: 'उपचार',
                recommendation: 'सुझाव',
                
                // Pest Management
                pestdetected: 'कीट पाया गया',
                pesttype: 'कीट का प्रकार',
                intensity: 'तीव्रता',
                control: 'नियंत्रण विधि',
                
                // Irrigation
                schedule: 'समय सारणी',
                duration: 'अवधि',
                wateramount: 'पानी की मात्रा',
                soilmoisture: 'मिट्टी की नमी',
                
                // Market
                prices: 'मूल्य',
                trend: 'प्रवृत्ति',
                demand: 'मांग',
                supply: 'आपूर्ति',
                
                // Forms
                email: 'ईमेल',
                password: 'पासवर्ड',
                phone: 'फोन',
                address: 'पता',
                city: 'शहर',
                state: 'राज्य',
                country: 'देश',
                farmsize: 'खेत का आकार',
                croptype: 'फसल का प्रकार',
                
                // Messages
                loadingsuccess: 'सफलतापूर्वक लोड हुआ',
                savingsuccess: 'सफलतापूर्वक सहेजा गया',
                deletionsuccess: 'सफलतापूर्वक हटाया गया',
                errormessage: 'एक त्रुटि हुई। कृपया फिर से प्रयास करें।',
                requiredfield: 'यह क्षेत्र आवश्यक है',
                invalidinput: 'अमान्य इनपुट',
                
                // Notifications
                newdisease: 'नया रोग पाया गया',
                pestwarning: 'कीट चेतावनी',
                weatheralert: 'मौसम सतर्कता',
                irrigationreminder: 'सिंचाई अनुस्मारक',
                
                // Status
                healthy: 'स्वस्थ',
                atrisk: 'जोखिम में',
                critical: 'महत्वपूर्ण',
                low: 'कम',
                medium: 'माध्यम',
                high: 'उच्च',
            },
            te: {
                // Telugu translations
                dashboard: 'డ్యాష్‌బోర్డ్',
                photocapture: 'ఫోటో క్యాప్చర్',
                diseasedetection: 'వ్యాధి సనాక్తం',
                pestmanagement: 'పేస్ట్ నిర్వహణ',
                irrigation: 'నీటిపాచన',
                market: 'మార్కెట్ ధరలు',
                analytics: 'విశ్లేషణ',
                notifications: 'నోటిఫికేషన్‌లు',
                settings: 'సెట్టింగ్‌లు',
                help: 'సహాయం',
                logout: 'లాగ్‌అవుట్',
                
                welcome: 'స్వాగతం',
                loading: 'లోడ్ చేస్తోంది...',
                error: 'లోపం',
                success: 'విజయం',
                save: 'సేవ్ చేయి',
                cancel: 'రద్దు చేయి',
                delete: 'తొలగించు',
                farmhealth: 'పొలం ఆరోగ్యం',
                weather: 'వాతావరణం',
                temperature: 'ఉష్ణోగ్రత',
                humidity: 'ఆర్ద్రత',
                rainfall: 'వర్షపాతం',
            },
            ta: {
                // Tamil translations
                dashboard: 'டாஷ்போர்டு',
                photocapture: 'புகைப்படம் பிடிப்பு',
                diseasedetection: 'நோய் கண்டறிதல்',
                pestmanagement: 'பூச்சி ব்যবস்థாபனம்',
                irrigation: 'பாசனம்',
                market: 'சந்தை விலைகள்',
                analytics: 'பகுப்பாய்வு',
                notifications: 'அறிவிப்புகள்',
                settings: 'அமைப்புகள்',
                help: 'உதவி',
                logout: 'வெளியேறு',
                
                welcome: 'வரவேற்கிறோம்',
                loading: 'ஏற்றுகிறது...',
                error: 'பிழை',
                success: 'வெற்றி',
                save: 'சேமிக்கவும்',
                cancel: 'ரத்துசெய்யவும்',
                delete: 'நீக்கவும்',
            },
            mr: {
                // Marathi translations
                dashboard: 'डॅशबोर्ड',
                photocapture: 'फोटो कॅप्चर',
                diseasedetection: 'रोग शोध',
                pestmanagement: 'कीट व्यवस्थापन',
                irrigation: 'सिंचन',
                market: 'बाजार भाव',
                analytics: 'विश्लेषण',
                notifications: 'सूचना',
                settings: 'सेटिंग्ज',
                help: 'मदत',
                logout: 'लॉगआउट',
                
                welcome: 'स्वागत आहे',
                loading: 'लोड होत आहे...',
                error: 'त्रुटी',
                success: 'यशस्वी',
                save: 'जतन करा',
            },
            gu: {
                // Gujarati translations
                dashboard: 'ડેશબોર્ડ',
                photocapture: 'ફોટો કેપ્ચર',
                diseasedetection: 'રોગ શોધ',
                pestmanagement: 'જંતુ વ્યવસ્થાપન',
                irrigation: 'સિંચાઈ',
                market: 'બજારના ભાવ',
                analytics: 'વિશ્લેષણ',
                notifications: 'સૂચનાઓ',
                settings: 'સેટિંગ્સ',
                help: 'મદદ',
                logout: 'લૉગ આઉટ',
                
                welcome: 'સ્વાગતમ',
                loading: 'લોડ થઇ રહ્યું છે...',
                error: 'ભૂલ',
                success: 'સફળતા',
                save: 'સંગ્રહ કરો',
            },
            bn: {
                // Bengali translations
                dashboard: 'ড্যাশবোর্ড',
                photocapture: 'ফটো ক্যাপচার',
                diseasedetection: 'রোগ সনাক্তকরণ',
                pestmanagement: 'কীটপতঙ্গ ব্যবস্থাপনা',
                irrigation: 'সেচ',
                market: 'বাজার মূল্য',
                analytics: 'বিশ্লেষণ',
                notifications: 'বিজ্ঞপ্তি',
                settings: 'সেটিংস',
                help: 'সাহায্য',
                logout: 'লগআউট',
                
                welcome: 'স্বাগতম',
                loading: 'লোড হচ্ছে...',
                error: 'ত্রুটি',
                success: 'সফল',
                save: 'সংরক্ষণ করুন',
            }
        };
        
        this.init();
    }

    init() {
        // Initialize current language
        this.setLanguage(this.currentLanguage);
    }

    setLanguage(langCode) {
        if (!this.translations[langCode]) {
            console.warn(`Language ${langCode} not found, defaulting to English`);
            langCode = 'en';
        }
        
        this.currentLanguage = langCode;
        localStorage.setItem('cropguard-language', langCode);
        
        // Update DOM with new language
        this.updateUI();
        
        // Dispatch event for other components
        const event = new CustomEvent('languageChanged', { detail: { language: langCode } });
        window.dispatchEvent(event);
        
        console.log(`Language changed to: ${langCode}`);
    }

    updateUI() {
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.get(key);
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    get(key) {
        if (!this.translations[this.currentLanguage]) {
            return this.translations.en[key] || key;
        }
        return this.translations[this.currentLanguage][key] || this.translations.en[key] || key;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getAvailableLanguages() {
        return {
            en: 'English',
            hi: 'हिन्दी (Hindi)',
            te: 'తెలుగు (Telugu)',
            ta: 'தமிழ் (Tamil)',
            mr: 'मराठी (Marathi)',
            gu: 'ગુજરાતી (Gujarati)',
            bn: 'বাংলা (Bengali)'
        };
    }

    // Export all translations for a language
    getAllTranslations(langCode = this.currentLanguage) {
        return this.translations[langCode] || this.translations.en;
    }

    // Add custom translations
    addCustomTranslation(langCode, key, value) {
        if (!this.translations[langCode]) {
            this.translations[langCode] = {};
        }
        this.translations[langCode][key] = value;
    }

    // Batch add translations
    addTranslations(langCode, translationObj) {
        if (!this.translations[langCode]) {
            this.translations[langCode] = {};
        }
        Object.assign(this.translations[langCode], translationObj);
    }
}

// Initialize globally
const i18n = new LanguageManager();

// Example usage for HTML:
/*
<h1 data-translate="welcome"></h1>
<button data-translate="save"></button>
<p data-translate="farmhealth"></p>

// In JavaScript:
i18n.setLanguage('hi');  // Switch to Hindi
const text = i18n.get('welcome');  // Get translated text

// Create language switcher
const languages = i18n.getAvailableLanguages();
Object.keys(languages).forEach(code => {
    const btn = document.createElement('button');
    btn.textContent = languages[code];
    btn.onclick = () => i18n.setLanguage(code);
});
*/
