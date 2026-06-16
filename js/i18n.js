(function () {
  window.TradeAI = window.TradeAI || {};
  window.TradeAI.i18n = window.TradeAI.i18n || {};

  const LANGUAGE_KEY = "tradeai_language";
  const ENABLE_LANGUAGE_SWITCHER = false;
  const RTL_LANGUAGES = new Set(["ar"]);
  const languages = [
    ["en", "English"],
    ["hi", "Hindi"],
    ["gu", "Gujarati"],
    ["mr", "Marathi"],
    ["ta", "Tamil"],
    ["te", "Telugu"],
    ["bn", "Bengali"],
    ["es", "Spanish"],
    ["ar", "Arabic"],
    ["zh", "Chinese"],
  ];

  const dictionary = {
    en: {
      about: "About",
      aboutPageTitle: "Building AI Infrastructure For Global Trade",
      aboutPageLead:
        "TradeAI helps exporters, importers and MSMEs discover buyers, analyze markets and automate international trade decisions with practical intelligence.",
      accountType: "Account type",
      action: "Action",
      addBuyer: "Add Buyer",
      addCategory: "Add category, HS code, MOQ, price, target countries and product tags.",
      address: "Address",
      admin: "Admin",
      adminPanel: "Admin Panel",
      aiBuyerMatching: "AI Buyer Matching",
      aiFindsBuyers: "AI Finds Buyers",
      aiInsights: "AI Insights",
      aiMatchScore: "AI Match Score",
      aiReports: "AI Trade Reports",
      aiTradeCopilot: "AI Trade Copilot",
      analytics: "Analytics",
      analyzeCodes: "Analyze Codes",
      askCopilot: "Ask Copilot",
      buyer: "Buyer",
      buyerDiscovery: "Buyer Discovery",
      buyerDiscoveryDesc: "Find verified global buyers and international distributors instantly.",
      buyerDiscoveryTime: "Average Buyer Discovery Time",
      buyerFinder: "Buyer Finder",
      buyers: "Buyers",
      cancel: "Cancel",
      category: "Category",
      chartKicker: "Import Demand Snapshot",
      chartNote:
        "Backend or clearly labeled sample trade data loads after search. Product keywords are mapped to HS codes when possible.",
      chartPill: "MVP Data Preview",
      chartTitleDefault: "Search To View Import Demand",
      chartTitleProduct: "Top Importing Countries For {product}",
      changelog: "Changelog",
      company: "Company",
      companyName: "Company Name",
      confirm: "Confirm",
      contact: "Contact",
      contactSales: "Contact Sales",
      copilot: "Copilot",
      coreFeatures: "Core Features",
      corridors: "Corridors",
      countries: "Countries",
      createAccount: "Create Account",
      dashboard: "Dashboard",
      dashboards: "Dashboards",
      email: "Email",
      enterprise: "Enterprise",
      explorerDashboard: "Explorer Dashboard",
      exportDashboard: "Export Dashboard",
      exporterDashboard: "Exporter Dashboard",
      features: "Features",
      forgotPassword: "Forgot Password?",
      generateReport: "Generate report",
      helpCentre: "Help Centre",
      languageSelectAria: "Select language",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "AI-powered tools for exporters, importers and global trade professionals.",
      heroTitleA: "Everything You Need",
      heroTitleB: "To Trade Globally.",
      home: "Home",
      hsCode: "HS Code Intelligence",
      hsCodeAccuracy: "HS-Code Matching Accuracy",
      hsCodeDesc: "Analyze customs classifications, tariffs and trade regulations.",
      importerDashboard: "Importer Dashboard",
      importers: "Importers",
      inquiries: "Inquiries",
      inquiryDashboard: "Inquiry Dashboard",
      industry: "Industry",
      legal: "Legal",
      login: "Login",
      logout: "Logout",
      marketAnalysis: "Market Analysis",
      marketAnalytics: "Market Analytics",
      marketAnalyticsDesc: "Monitor global demand, supplier competition and market opportunities.",
      menu: "Menu",
      marketplace: "Marketplace",
      name: "Name",
      notifications: "Notifications",
      password: "Password",
      pricing: "Pricing",
      privacyPolicy: "Privacy Policy",
      product: "Product",
      productUpload: "Product Upload",
      products: "Products",
      profile: "Profile",
      register: "Register",
      reports: "Reports",
      resources: "Resources",
      role: "Role",
      savedSearches: "Saved Searches",
      skipToContent: "Skip to content",
      searchAria: "Search Product, Country, or HS Code",
      searchButton: "Search Market",
      searchLabel: "Search Product, Country, or HS Code",
      searchPlaceholder: "Search Product, Country, HS Code...",
      settings: "Settings",
      status: "Status",
      startFree: "Start Free",
      suppliers: "Suppliers",
      systemStatus: "System Status",
      talkSales: "Talk To Sales",
      terms: "Terms & Conditions",
      tradeAnalytics: "Trade Analytics",
      trust: "Trust",
      trustedTitle: "Trusted By Global Businesses",
      uploadProduct: "Upload Product",
      users: "Users",
      viewAnalytics: "View Analytics",
      welcomeBack: "Welcome Back",
      whyTradeAIExists: "Why TradeAI Exists",
    },
    hi: {
      about: "हमारे बारे में",
      aboutPageTitle: "वैश्विक व्यापार के लिए AI इंफ्रास्ट्रक्चर बना रहे हैं",
      aboutPageLead:
        "TradeAI निर्यातकों, आयातकों और MSME को खरीदार खोजने, बाजार समझने और अंतरराष्ट्रीय व्यापार निर्णयों को आसान बनाने में मदद करता है।",
      accountType: "खाता प्रकार",
      action: "कार्य",
      addBuyer: "खरीदार जोड़ें",
      addCategory: "श्रेणी, HS कोड, MOQ, कीमत, लक्षित देश और उत्पाद टैग जोड़ें।",
      address: "पता",
      admin: "एडमिन",
      adminPanel: "एडमिन पैनल",
      aiBuyerMatching: "AI खरीदार मिलान",
      aiFindsBuyers: "AI खरीदार ढूंढता है",
      aiInsights: "AI इनसाइट्स",
      aiMatchScore: "AI मैच स्कोर",
      aiReports: "AI व्यापार रिपोर्ट",
      aiTradeCopilot: "AI व्यापार सहायक",
      analytics: "एनालिटिक्स",
      analyzeCodes: "कोड विश्लेषण करें",
      askCopilot: "Copilot से पूछें",
      buyer: "खरीदार",
      buyerDiscovery: "खरीदार खोज",
      buyerDiscoveryDesc: "सत्यापित वैश्विक खरीदार और अंतरराष्ट्रीय वितरक तुरंत खोजें।",
      buyerDiscoveryTime: "औसत खरीदार खोज समय",
      buyerFinder: "खरीदार खोजक",
      buyers: "खरीदार",
      cancel: "रद्द करें",
      category: "श्रेणी",
      chartKicker: "आयात मांग स्नैपशॉट",
      chartNote: "खोज के बाद लाइव ट्रेड डेटा लोड होगा। संभव होने पर उत्पाद शब्दों को HS कोड से मिलाया जाता है।",
      chartPill: "लाइव डेटा प्रीव्यू",
      chartTitleDefault: "आयात मांग देखने के लिए खोजें",
      chartTitleProduct: "{product} के लिए शीर्ष आयातक देश",
      changelog: "बदलाव सूची",
      company: "कंपनी",
      companyName: "कंपनी का नाम",
      confirm: "पुष्टि करें",
      contact: "संपर्क",
      contactSales: "सेल्स से संपर्क करें",
      copilot: "Copilot",
      coreFeatures: "मुख्य सुविधाएं",
      createAccount: "अकाउंट बनाएं",
      dashboard: "डैशबोर्ड",
      dashboards: "डैशबोर्ड",
      email: "ईमेल",
      enterprise: "एंटरप्राइज",
      explorerDashboard: "एक्सप्लोरर डैशबोर्ड",
      exportDashboard: "निर्यात डैशबोर्ड",
      exporterDashboard: "निर्यातक डैशबोर्ड",
      features: "सुविधाएं",
      forgotPassword: "पासवर्ड भूल गए?",
      generateReport: "रिपोर्ट बनाएं",
      helpCentre: "सहायता केंद्र",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "निर्यातकों, आयातकों और वैश्विक व्यापार पेशेवरों के लिए AI-संचालित टूल।",
      heroTitleA: "व्यापार के लिए जरूरी सब कुछ",
      heroTitleB: "वैश्विक स्तर पर।",
      home: "होम",
      hsCode: "HS कोड इंटेलिजेंस",
      hsCodeAccuracy: "HS-कोड मिलान सटीकता",
      hsCodeDesc: "कस्टम वर्गीकरण, टैरिफ और व्यापार नियमों का विश्लेषण करें।",
      importerDashboard: "आयातक डैशबोर्ड",
      importers: "आयातक",
      inquiries: "पूछताछ",
      inquiryDashboard: "पूछताछ डैशबोर्ड",
      industry: "उद्योग",
      legal: "कानूनी",
      login: "लॉगिन",
      logout: "लॉगआउट",
      marketAnalysis: "बाजार विश्लेषण",
      marketAnalytics: "बाजार एनालिटिक्स",
      marketAnalyticsDesc: "वैश्विक मांग, सप्लायर प्रतियोगिता और बाजार अवसर देखें।",
      marketplace: "मार्केटप्लेस",
      name: "नाम",
      notifications: "सूचनाएं",
      password: "पासवर्ड",
      pricing: "मूल्य",
      privacyPolicy: "गोपनीयता नीति",
      product: "उत्पाद",
      productUpload: "उत्पाद अपलोड",
      products: "उत्पाद",
      profile: "प्रोफाइल",
      register: "रजिस्टर",
      resources: "संसाधन",
      role: "भूमिका",
      savedSearches: "सेव की गई खोजें",
      skipToContent: "कंटेंट पर जाएं",
      searchAria: "उत्पाद, देश या HS कोड खोजें",
      searchButton: "बाजार खोजें",
      searchLabel: "उत्पाद, देश या HS कोड खोजें",
      searchPlaceholder: "उत्पाद, देश, HS कोड खोजें...",
      settings: "सेटिंग्स",
      status: "स्थिति",
      suppliers: "सप्लायर",
      systemStatus: "सिस्टम स्थिति",
      talkSales: "सेल्स से बात करें",
      terms: "नियम और शर्तें",
      tradeAnalytics: "व्यापार एनालिटिक्स",
      trust: "भरोसा",
      trustedTitle: "वैश्विक व्यवसायों द्वारा भरोसेमंद",
      uploadProduct: "उत्पाद अपलोड करें",
      users: "यूजर",
      viewAnalytics: "एनालिटिक्स देखें",
      welcomeBack: "फिर से स्वागत है",
      whyTradeAIExists: "TradeAI क्यों मौजूद है",
    },
    gu: {
      about: "અમારા વિશે",
      aboutPageTitle: "વૈશ્વિક વેપાર માટે AI ઇન્ફ્રાસ્ટ્રક્ચર બનાવી રહ્યા છીએ",
      aboutPageLead:
        "TradeAI નિકાસકારો, આયાતકારો અને MSME ને ખરીદદારો શોધવા, બજારોનું વિશ્લેષણ કરવા અને આંતરરાષ્ટ્રીય વેપાર નિર્ણયો સરળ બનાવવા મદદ કરે છે.",
      action: "ક્રિયા",
      addBuyer: "ખરીદાર ઉમેરો",
      admin: "એડમિન",
      analytics: "એનાલિટિક્સ",
      buyer: "ખરીદાર",
      buyerDiscovery: "ખરીદાર શોધ",
      buyers: "ખરીદદારો",
      cancel: "રદ કરો",
      category: "કેટેગરી",
      company: "કંપની",
      confirm: "પુષ્ટિ કરો",
      contact: "સંપર્ક",
      createAccount: "એકાઉન્ટ બનાવો",
      dashboard: "ડેશબોર્ડ",
      email: "ઈમેલ",
      features: "સુવિધાઓ",
      helpCentre: "મદદ કેન્દ્ર",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "નિકાસકારો, આયાતકારો અને વૈશ્વિક વેપાર વ્યાવસાયિકો માટે AI સાધનો.",
      heroTitleA: "તમને જરૂરી બધું",
      heroTitleB: "વૈશ્વિક વેપાર માટે.",
      home: "હોમ",
      importers: "આયાતકારો",
      inquiries: "પૂછપરછ",
      login: "લોગિન",
      logout: "લોગઆઉટ",
      marketplace: "માર્કેટપ્લેસ",
      notifications: "સૂચનાઓ",
      password: "પાસવર્ડ",
      pricing: "કિંમત",
      product: "પ્રોડક્ટ",
      products: "પ્રોડક્ટ્સ",
      register: "રજિસ્ટર",
      searchButton: "માર્કેટ શોધો",
      skipToContent: "મુખ્ય સામગ્રી પર જાઓ",
      searchPlaceholder: "પ્રોડક્ટ, દેશ, HS કોડ શોધો...",
      settings: "સેટિંગ્સ",
      status: "સ્થિતિ",
      suppliers: "સપ્લાયર્સ",
      talkSales: "સેલ્સ સાથે વાત કરો",
      trust: "વિશ્વાસ",
      users: "યુઝર્સ",
      welcomeBack: "ફરી સ્વાગત છે",
    },
    mr: {
      about: "आमच्याबद्दल",
      aboutPageTitle: "जागतिक व्यापारासाठी AI इन्फ्रास्ट्रक्चर तयार करत आहोत",
      aboutPageLead:
        "TradeAI निर्यातदार, आयातदार आणि MSME यांना खरेदीदार शोधणे, बाजारांचे विश्लेषण करणे आणि आंतरराष्ट्रीय व्यापार निर्णय सोपे करणे यासाठी मदत करते.",
      action: "कृती",
      addBuyer: "खरेदीदार जोडा",
      admin: "अॅडमिन",
      analytics: "विश्लेषण",
      buyer: "खरेदीदार",
      buyerDiscovery: "खरेदीदार शोध",
      buyers: "खरेदीदार",
      cancel: "रद्द करा",
      category: "श्रेणी",
      company: "कंपनी",
      confirm: "पुष्टी करा",
      contact: "संपर्क",
      createAccount: "खाते तयार करा",
      dashboard: "डॅशबोर्ड",
      email: "ईमेल",
      features: "वैशिष्ट्ये",
      helpCentre: "मदत केंद्र",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "निर्यातदार, आयातदार आणि जागतिक व्यापार व्यावसायिकांसाठी AI साधने.",
      heroTitleA: "तुम्हाला लागणारे सर्व",
      heroTitleB: "जागतिक व्यापारासाठी.",
      home: "होम",
      importers: "आयातदार",
      inquiries: "चौकशी",
      login: "लॉगिन",
      logout: "लॉगआउट",
      marketplace: "मार्केटप्लेस",
      notifications: "सूचना",
      password: "पासवर्ड",
      pricing: "किंमत",
      product: "उत्पादन",
      products: "उत्पादने",
      register: "नोंदणी",
      searchButton: "मार्केट शोधा",
      skipToContent: "मुख्य मजकुरावर जा",
      searchPlaceholder: "उत्पादन, देश, HS कोड शोधा...",
      settings: "सेटिंग्स",
      status: "स्थिती",
      suppliers: "पुरवठादार",
      talkSales: "सेल्सशी बोला",
      trust: "विश्वास",
      users: "यूजर्स",
      welcomeBack: "पुन्हा स्वागत आहे",
    },
    ta: {
      about: "எங்களை பற்றி",
      aboutPageTitle: "உலக வர்த்தகத்திற்கான AI கட்டமைப்பை உருவாக்குகிறோம்",
      aboutPageLead:
        "TradeAI ஏற்றுமதியாளர்கள், இறக்குமதியாளர்கள் மற்றும் MSMEகள் வாங்குபவர்களை கண்டறிய, சந்தைகளை பகுப்பாய்வு செய்ய மற்றும் சர்வதேச வர்த்தக முடிவுகளை எளிதாக்க உதவுகிறது.",
      action: "செயல்",
      addBuyer: "வாங்குபவரை சேர்க்கவும்",
      admin: "நிர்வாகி",
      analytics: "பகுப்பாய்வு",
      buyer: "வாங்குபவர்",
      buyerDiscovery: "வாங்குபவர் கண்டறிதல்",
      buyers: "வாங்குபவர்கள்",
      cancel: "ரத்து",
      category: "வகை",
      company: "நிறுவனம்",
      confirm: "உறுதி செய்",
      contact: "தொடர்பு",
      createAccount: "கணக்கு உருவாக்கு",
      dashboard: "டாஷ்போர்டு",
      email: "மின்னஞ்சல்",
      features: "அம்சங்கள்",
      helpCentre: "உதவி மையம்",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "ஏற்றுமதியாளர்கள், இறக்குமதியாளர்கள் மற்றும் உலக வர்த்தக நிபுணர்களுக்கான AI கருவிகள்.",
      heroTitleA: "உங்களுக்கு தேவையான அனைத்தும்",
      heroTitleB: "உலகளாவிய வர்த்தகத்திற்கு.",
      home: "முகப்பு",
      importers: "இறக்குமதியாளர்கள்",
      inquiries: "விசாரணைகள்",
      login: "உள்நுழை",
      logout: "வெளியேறு",
      marketplace: "மார்க்கெட்பிளேஸ்",
      notifications: "அறிவிப்புகள்",
      password: "கடவுச்சொல்",
      pricing: "விலை",
      product: "தயாரிப்பு",
      products: "தயாரிப்புகள்",
      register: "பதிவு",
      searchButton: "சந்தை தேடு",
      skipToContent: "உள்ளடக்கத்துக்கு செல்லவும்",
      searchPlaceholder: "தயாரிப்பு, நாடு, HS குறியீடு தேடு...",
      settings: "அமைப்புகள்",
      status: "நிலை",
      suppliers: "சப்ளையர்கள்",
      talkSales: "விற்பனை அணியுடன் பேசுங்கள்",
      trust: "நம்பிக்கை",
      users: "பயனர்கள்",
      welcomeBack: "மீண்டும் வரவேற்கிறோம்",
    },
    te: {
      about: "మా గురించి",
      aboutPageTitle: "గ్లోబల్ ట్రేడ్ కోసం AI మౌలిక వసతులు నిర్మిస్తున్నాం",
      aboutPageLead:
        "TradeAI ఎగుమతిదారులు, దిగుమతిదారులు మరియు MSMEలకు కొనుగోలుదారులను కనుగొనడం, మార్కెట్లను విశ్లేషించడం మరియు అంతర్జాతీయ వ్యాపార నిర్ణయాలను సులభం చేయడంలో సహాయపడుతుంది.",
      action: "చర్య",
      addBuyer: "కొనుగోలుదారుని జోడించండి",
      admin: "అడ్మిన్",
      analytics: "విశ్లేషణలు",
      buyer: "కొనుగోలుదారు",
      buyerDiscovery: "కొనుగోలుదారుల శోధన",
      buyers: "కొనుగోలుదారులు",
      cancel: "రద్దు",
      category: "వర్గం",
      company: "కంపెనీ",
      confirm: "నిర్ధారించండి",
      contact: "సంప్రదించండి",
      createAccount: "ఖాతా సృష్టించండి",
      dashboard: "డ్యాష్‌బోర్డ్",
      email: "ఈమెయిల్",
      features: "ఫీచర్లు",
      helpCentre: "సహాయ కేంద్రం",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "ఎగుమతిదారులు, దిగుమతిదారులు మరియు గ్లోబల్ ట్రేడ్ నిపుణుల కోసం AI సాధనాలు.",
      heroTitleA: "మీకు కావలసిన అన్నీ",
      heroTitleB: "గ్లోబల్ ట్రేడ్ కోసం.",
      home: "హోమ్",
      importers: "దిగుమతిదారులు",
      inquiries: "విచారణలు",
      login: "లాగిన్",
      logout: "లాగౌట్",
      marketplace: "మార్కెట్‌ప్లేస్",
      notifications: "నోటిఫికేషన్లు",
      password: "పాస్‌వర్డ్",
      pricing: "ధర",
      product: "ఉత్పత్తి",
      products: "ఉత్పత్తులు",
      register: "రిజిస్టర్",
      searchButton: "మార్కెట్ వెతకండి",
      skipToContent: "కంటెంట్‌కు వెళ్లండి",
      searchPlaceholder: "ఉత్పత్తి, దేశం, HS కోడ్ వెతకండి...",
      settings: "సెట్టింగ్స్",
      status: "స్థితి",
      suppliers: "సప్లయర్లు",
      talkSales: "సేల్స్‌తో మాట్లాడండి",
      trust: "నమ్మకం",
      users: "యూజర్లు",
      welcomeBack: "మళ్లీ స్వాగతం",
    },
    bn: {
      about: "আমাদের সম্পর্কে",
      aboutPageTitle: "বিশ্ব বাণিজ্যের জন্য AI অবকাঠামো তৈরি করছি",
      aboutPageLead:
        "TradeAI রপ্তানিকারক, আমদানিকারক এবং MSME-দের ক্রেতা খুঁজতে, বাজার বিশ্লেষণ করতে এবং আন্তর্জাতিক বাণিজ্য সিদ্ধান্ত সহজ করতে সাহায্য করে।",
      action: "অ্যাকশন",
      addBuyer: "ক্রেতা যোগ করুন",
      admin: "অ্যাডমিন",
      analytics: "অ্যানালিটিক্স",
      buyer: "ক্রেতা",
      buyerDiscovery: "ক্রেতা খোঁজা",
      buyers: "ক্রেতারা",
      cancel: "বাতিল",
      category: "ক্যাটাগরি",
      company: "কোম্পানি",
      confirm: "নিশ্চিত করুন",
      contact: "যোগাযোগ",
      createAccount: "অ্যাকাউন্ট তৈরি করুন",
      dashboard: "ড্যাশবোর্ড",
      email: "ইমেইল",
      features: "ফিচার",
      helpCentre: "সহায়তা কেন্দ্র",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "রপ্তানিকারক, আমদানিকারক এবং বৈশ্বিক বাণিজ্য পেশাদারদের জন্য AI টুল।",
      heroTitleA: "আপনার যা দরকার সব",
      heroTitleB: "বিশ্বব্যাপী বাণিজ্যের জন্য।",
      home: "হোম",
      importers: "আমদানিকারক",
      inquiries: "ইনকোয়ারি",
      login: "লগইন",
      logout: "লগআউট",
      marketplace: "মার্কেটপ্লেস",
      notifications: "নোটিফিকেশন",
      password: "পাসওয়ার্ড",
      pricing: "মূল্য",
      product: "পণ্য",
      products: "পণ্যসমূহ",
      register: "রেজিস্টার",
      searchButton: "মার্কেট খুঁজুন",
      skipToContent: "কনটেন্টে যান",
      searchPlaceholder: "পণ্য, দেশ, HS কোড খুঁজুন...",
      settings: "সেটিংস",
      status: "স্ট্যাটাস",
      suppliers: "সাপ্লায়ার",
      talkSales: "সেলসের সাথে কথা বলুন",
      trust: "বিশ্বাস",
      users: "ইউজার",
      welcomeBack: "আবার স্বাগতম",
    },
    es: {
      about: "Acerca de",
      aboutPageTitle: "Construyendo infraestructura de IA para el comercio global",
      aboutPageLead:
        "TradeAI ayuda a exportadores, importadores y MSME a descubrir compradores, analizar mercados y automatizar decisiones de comercio internacional con inteligencia práctica.",
      action: "Acción",
      addBuyer: "Agregar comprador",
      admin: "Admin",
      analytics: "Analítica",
      buyer: "Comprador",
      buyerDiscovery: "Descubrimiento de compradores",
      buyers: "Compradores",
      cancel: "Cancelar",
      category: "Categoría",
      company: "Empresa",
      confirm: "Confirmar",
      contact: "Contacto",
      createAccount: "Crear cuenta",
      dashboard: "Panel",
      email: "Correo",
      features: "Funciones",
      helpCentre: "Centro de ayuda",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "Herramientas con IA para exportadores, importadores y profesionales del comercio global.",
      heroTitleA: "Todo lo que necesitas",
      heroTitleB: "para comerciar globalmente.",
      home: "Inicio",
      importers: "Importadores",
      inquiries: "Consultas",
      login: "Iniciar sesión",
      logout: "Cerrar sesión",
      marketplace: "Mercado",
      notifications: "Notificaciones",
      password: "Contraseña",
      pricing: "Precios",
      product: "Producto",
      products: "Productos",
      register: "Registrarse",
      searchButton: "Buscar mercado",
      skipToContent: "Saltar al contenido",
      searchPlaceholder: "Buscar producto, país, código HS...",
      settings: "Configuración",
      status: "Estado",
      suppliers: "Proveedores",
      talkSales: "Hablar con ventas",
      trust: "Confianza",
      users: "Usuarios",
      welcomeBack: "Bienvenido de nuevo",
    },
    ar: {
      about: "من نحن",
      aboutPageTitle: "نبني بنية ذكاء اصطناعي للتجارة العالمية",
      aboutPageLead:
        "تساعد TradeAI المصدرين والمستوردين والشركات الصغيرة على اكتشاف المشترين وتحليل الأسواق وأتمتة قرارات التجارة الدولية بذكاء عملي.",
      action: "إجراء",
      addBuyer: "إضافة مشتر",
      admin: "المسؤول",
      analytics: "التحليلات",
      buyer: "المشتري",
      buyerDiscovery: "اكتشاف المشترين",
      buyers: "المشترون",
      cancel: "إلغاء",
      category: "الفئة",
      company: "الشركة",
      confirm: "تأكيد",
      contact: "اتصال",
      createAccount: "إنشاء حساب",
      dashboard: "لوحة التحكم",
      email: "البريد الإلكتروني",
      features: "الميزات",
      helpCentre: "مركز المساعدة",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "أدوات مدعومة بالذكاء الاصطناعي للمصدرين والمستوردين ومحترفي التجارة العالمية.",
      heroTitleA: "كل ما تحتاجه",
      heroTitleB: "للتجارة عالميا.",
      home: "الرئيسية",
      importers: "المستوردون",
      inquiries: "الاستفسارات",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      marketplace: "السوق",
      notifications: "الإشعارات",
      password: "كلمة المرور",
      pricing: "الأسعار",
      product: "المنتج",
      products: "المنتجات",
      register: "تسجيل",
      searchButton: "ابحث في السوق",
      skipToContent: "تخطي إلى المحتوى",
      searchPlaceholder: "ابحث عن منتج أو دولة أو رمز HS...",
      settings: "الإعدادات",
      status: "الحالة",
      suppliers: "الموردون",
      talkSales: "تحدث مع المبيعات",
      trust: "الثقة",
      users: "المستخدمون",
      welcomeBack: "مرحبا بعودتك",
    },
    zh: {
      about: "关于",
      aboutPageTitle: "为全球贸易构建 AI 基础设施",
      aboutPageLead:
        "TradeAI 帮助出口商、进口商和中小企业发现买家、分析市场，并用实用智能自动化国际贸易决策。",
      action: "操作",
      addBuyer: "添加买家",
      admin: "管理员",
      analytics: "分析",
      buyer: "买家",
      buyerDiscovery: "买家发现",
      buyers: "买家",
      cancel: "取消",
      category: "类别",
      company: "公司",
      confirm: "确认",
      contact: "联系",
      createAccount: "创建账户",
      dashboard: "仪表板",
      email: "电子邮件",
      features: "功能",
      helpCentre: "帮助中心",
      heroKicker: "Import-Export/AI-Powered/Global-Growth",
      heroLead: "面向出口商、进口商和全球贸易人士的 AI 工具。",
      heroTitleA: "全球贸易所需",
      heroTitleB: "一站式完成。",
      home: "首页",
      importers: "进口商",
      inquiries: "询盘",
      login: "登录",
      logout: "退出",
      marketplace: "市场",
      notifications: "通知",
      password: "密码",
      pricing: "价格",
      product: "产品",
      products: "产品",
      register: "注册",
      searchButton: "搜索市场",
      skipToContent: "跳到内容",
      searchPlaceholder: "搜索产品、国家、HS 编码...",
      settings: "设置",
      status: "状态",
      suppliers: "供应商",
      talkSales: "联系销售",
      trust: "信任",
      users: "用户",
      welcomeBack: "欢迎回来",
    },
  };

  const phase1Copy = {
    en: {
      landingHeroKicker: "Africa • Gulf • China Trade Corridors",
      landingHeroTitleA: "AI-Powered Export-Import Intelligence",
      landingHeroTitleB: "For Focused Trade Corridors",
      landingHeroLead:
        "TradeAI helps Indian exporters, importers and SMEs compare product-country opportunities, explore buyer/supplier discovery workflows, review HS code risks and generate AI-powered trade reports across East Africa, Gulf and China.",
      eastAfrica: "East Africa",
      gulfGcc: "Gulf / GCC",
      chinaSourcing: "China Sourcing",
      reportPreviews: "Report Previews",
      landingSearchFormAria: "Generate export opportunity preview",
      productHsCode: "Product / HS Code",
      productSearchPlaceholder: "Example: turmeric, textiles, machinery, electronics",
      targetCountry: "Target Country",
      selectCountry: "Select country",
      generatePreview: "Generate report preview",
      productCountryRequired:
        "Please enter a product or HS code and select a target country.",
      productRequired: "Please enter a product or HS code.",
      countryRequired: "Please select a target country.",
      loginTag: "AI Powered Trade Intelligence",
      loginHeroTitle: "Welcome Back To TradeAI",
      loginHeroLead:
        "Access AI-powered export-import analytics, buyer discovery workflows, supplier intelligence and global trade insights.",
      aiMarketAnalytics: "AI Market Analytics",
      globalTradeIntelligence: "Global Trade Intelligence",
      buyerDiscoveryWorkflow: "Buyer Discovery Workflow",
      loginSubtitle: "Continue to your dashboard",
      emailAddress: "Email Address",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter password",
      showPassword: "Show password",
      rememberMe: "Remember Me",
      loginToDashboard: "Login To Dashboard",
      or: "OR",
      continueWithGoogle: "Continue With Google",
      continueWithLinkedIn: "Continue With LinkedIn",
      dontHaveAccount: "Don't have an account?",
      registerTag: "AI Powered Global Trade Platform",
      registerHeroTitle: "Create Your TradeAI Account",
      registerHeroLead:
        "Access buyer discovery workflows, supplier intelligence, AI-powered analytics and export-import automation.",
      globalBuyerDiscovery: "Global Buyer Discovery",
      aiAutomation: "AI Automation",
      registerSubtitle: "Start your global trade journey",
      selected: "Selected:",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter full name",
      emailAddressPlaceholder: "Enter email address",
      companyNamePlaceholder: "Enter company name",
      chooseAccountType: "Choose your account type",
      explorer: "Explorer",
      exporter: "Exporter",
      importer: "Importer",
      tradeConsultant: "Trade Consultant",
      smeBusinessOwner: "SME / Business Owner",
      createPasswordPlaceholder: "Create password",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Confirm password",
      agreeToThe: "I agree to the",
      alreadyHaveAccount: "Already have an account?",
      alreadySignedInAs: "You are already signed in as {user}.",
      continueToDashboard: "Continue to Dashboard",
      switchAccountLogout: "Switch Account / Logout",
      yourTradeAIAccount: "your TradeAI account",
    },
    hi: {
      landingHeroKicker: "अफ्रीका • गल्फ • चीन व्यापार कॉरिडोर",
      landingHeroTitleA: "AI-संचालित निर्यात-आयात इंटेलिजेंस",
      landingHeroTitleB: "फोकस्ड ट्रेड कॉरिडोर के लिए",
      landingHeroLead:
        "TradeAI भारतीय निर्यातकों, आयातकों और SMEs को उत्पाद-देश अवसरों की तुलना करने, खरीदार/सप्लायर खोज वर्कफ़्लो देखने, HS कोड जोखिम समझने और पूर्वी अफ्रीका, गल्फ और चीन के लिए AI-संचालित ट्रेड रिपोर्ट बनाने में मदद करता है।",
      eastAfrica: "पूर्वी अफ्रीका",
      gulfGcc: "गल्फ / GCC",
      chinaSourcing: "चीन सोर्सिंग",
      reportPreviews: "रिपोर्ट प्रीव्यू",
      landingSearchFormAria: "निर्यात अवसर प्रीव्यू बनाएं",
      productHsCode: "उत्पाद / HS कोड",
      productSearchPlaceholder: "उदाहरण: हल्दी, टेक्सटाइल, मशीनरी, इलेक्ट्रॉनिक्स",
      targetCountry: "लक्षित देश",
      selectCountry: "देश चुनें",
      generatePreview: "प्रीव्यू बनाएं",
      productCountryRequired: "कृपया उत्पाद या HS कोड दर्ज करें और लक्षित देश चुनें।",
      productRequired: "कृपया उत्पाद या HS कोड दर्ज करें।",
      countryRequired: "कृपया लक्षित देश चुनें।",
      loginTag: "AI-संचालित ट्रेड इंटेलिजेंस",
      loginHeroTitle: "TradeAI में आपका फिर से स्वागत है",
      loginHeroLead:
        "AI-संचालित निर्यात-आयात एनालिटिक्स, खरीदार खोज वर्कफ़्लो, सप्लायर इंटेलिजेंस और वैश्विक व्यापार इनसाइट्स एक्सेस करें।",
      aiMarketAnalytics: "AI मार्केट एनालिटिक्स",
      globalTradeIntelligence: "वैश्विक ट्रेड इंटेलिजेंस",
      buyerDiscoveryWorkflow: "खरीदार खोज वर्कफ़्लो",
      loginSubtitle: "अपने डैशबोर्ड पर जारी रखें",
      emailAddress: "ईमेल पता",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      passwordPlaceholder: "पासवर्ड दर्ज करें",
      showPassword: "पासवर्ड दिखाएं",
      rememberMe: "मुझे याद रखें",
      loginToDashboard: "डैशबोर्ड में लॉगिन करें",
      or: "या",
      continueWithGoogle: "Google के साथ जारी रखें",
      continueWithLinkedIn: "LinkedIn के साथ जारी रखें",
      dontHaveAccount: "अकाउंट नहीं है?",
      registerTag: "AI-संचालित ग्लोबल ट्रेड प्लेटफ़ॉर्म",
      registerHeroTitle: "अपना TradeAI अकाउंट बनाएं",
      registerHeroLead:
        "खरीदार खोज वर्कफ़्लो, सप्लायर इंटेलिजेंस, AI-संचालित एनालिटिक्स और निर्यात-आयात ऑटोमेशन एक्सेस करें।",
      globalBuyerDiscovery: "वैश्विक खरीदार खोज",
      aiAutomation: "AI ऑटोमेशन",
      registerSubtitle: "अपनी वैश्विक व्यापार यात्रा शुरू करें",
      selected: "चयनित:",
      fullName: "पूरा नाम",
      fullNamePlaceholder: "पूरा नाम दर्ज करें",
      emailAddressPlaceholder: "ईमेल पता दर्ज करें",
      companyNamePlaceholder: "कंपनी का नाम दर्ज करें",
      chooseAccountType: "अपना अकाउंट प्रकार चुनें",
      explorer: "एक्सप्लोरर",
      exporter: "निर्यातक",
      importer: "आयातक",
      tradeConsultant: "ट्रेड कंसल्टेंट",
      smeBusinessOwner: "SME / बिजनेस ओनर",
      createPasswordPlaceholder: "पासवर्ड बनाएं",
      confirmPassword: "पासवर्ड पुष्टि करें",
      confirmPasswordPlaceholder: "पासवर्ड पुष्टि करें",
      agreeToThe: "मैं सहमत हूं",
      alreadyHaveAccount: "पहले से अकाउंट है?",
      alreadySignedInAs: "आप पहले से {user} के रूप में साइन इन हैं।",
      continueToDashboard: "डैशबोर्ड पर जाएं",
      switchAccountLogout: "अकाउंट बदलें / लॉगआउट",
      yourTradeAIAccount: "आपका TradeAI अकाउंट",
    },
    gu: {
      landingHeroKicker: "આફ્રિકા • ગલ્ફ • ચીન ટ્રેડ કોરિડોર",
      landingHeroTitleA: "AI સંચાલિત નિકાસ-આયાત ઇન્ટેલિજન્સ",
      landingHeroTitleB: "ફોકસ્ડ ટ્રેડ કોરિડોર માટે",
      productHsCode: "ઉત્પાદન / HS કોડ",
      productSearchPlaceholder: "ઉદાહરણ: હળદર, ટેક્સટાઇલ, મશીનરી, ઇલેક્ટ્રોનિક્સ",
      targetCountry: "લક્ષ્ય દેશ",
      selectCountry: "દેશ પસંદ કરો",
      generatePreview: "પ્રીવ્યુ બનાવો",
      productCountryRequired: "કૃપા કરીને ઉત્પાદન અથવા HS કોડ દાખલ કરો અને લક્ષ્ય દેશ પસંદ કરો.",
      productRequired: "કૃપા કરીને ઉત્પાદન અથવા HS કોડ દાખલ કરો.",
      countryRequired: "કૃપા કરીને લક્ષ્ય દેશ પસંદ કરો.",
      loginSubtitle: "તમારા ડેશબોર્ડ પર ચાલુ રાખો",
      emailAddress: "ઈમેલ સરનામું",
      emailPlaceholder: "તમારું ઈમેલ દાખલ કરો",
      passwordPlaceholder: "પાસવર્ડ દાખલ કરો",
      rememberMe: "મને યાદ રાખો",
      loginToDashboard: "ડેશબોર્ડમાં લોગિન કરો",
      or: "અથવા",
      registerSubtitle: "તમારી વૈશ્વિક વેપાર યાત્રા શરૂ કરો",
      fullName: "પૂરું નામ",
      fullNamePlaceholder: "પૂરું નામ દાખલ કરો",
      companyNamePlaceholder: "કંપનીનું નામ દાખલ કરો",
      confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
      alreadySignedInAs: "તમે પહેલેથી {user} તરીકે સાઇન ઇન છો.",
      continueToDashboard: "ડેશબોર્ડ પર ચાલુ રાખો",
      switchAccountLogout: "અકાઉન્ટ બદલો / લોગઆઉટ",
      yourTradeAIAccount: "તમારું TradeAI અકાઉન્ટ",
    },
    mr: {
      landingHeroKicker: "आफ्रिका • गल्फ • चीन व्यापार कॉरिडॉर",
      landingHeroTitleA: "AI-संचालित निर्यात-आयात इंटेलिजन्स",
      landingHeroTitleB: "फोकस्ड ट्रेड कॉरिडॉरसाठी",
      productHsCode: "उत्पादन / HS कोड",
      targetCountry: "लक्ष्य देश",
      selectCountry: "देश निवडा",
      generatePreview: "प्रीव्यू तयार करा",
      productCountryRequired: "कृपया उत्पादन किंवा HS कोड भरा आणि लक्ष्य देश निवडा.",
      productRequired: "कृपया उत्पादन किंवा HS कोड भरा.",
      countryRequired: "कृपया लक्ष्य देश निवडा.",
      emailAddress: "ईमेल पत्ता",
      emailPlaceholder: "तुमचा ईमेल भरा",
      passwordPlaceholder: "पासवर्ड भरा",
      rememberMe: "मला लक्षात ठेवा",
      loginToDashboard: "डॅशबोर्डमध्ये लॉगिन करा",
      or: "किंवा",
      fullName: "पूर्ण नाव",
      confirmPassword: "पासवर्ड पुष्टी करा",
      alreadySignedInAs: "तुम्ही आधीच {user} म्हणून साइन इन आहात.",
      continueToDashboard: "डॅशबोर्डवर जा",
      switchAccountLogout: "अकाउंट बदला / लॉगआउट",
      yourTradeAIAccount: "तुमचे TradeAI अकाउंट",
    },
    ta: {
      landingHeroKicker: "ஆப்பிரிக்கா • வளைகுடா • சீனா வர்த்தக வழித்தடங்கள்",
      landingHeroTitleA: "AI இயக்கும் ஏற்றுமதி-இறக்குமதி நுண்ணறிவு",
      landingHeroTitleB: "தேர்ந்தெடுத்த வர்த்தக வழித்தடங்களுக்கு",
      productHsCode: "தயாரிப்பு / HS குறியீடு",
      targetCountry: "இலக்கு நாடு",
      selectCountry: "நாட்டைத் தேர்ந்தெடுக்கவும்",
      generatePreview: "முன்னோட்டம் உருவாக்கவும்",
      productCountryRequired: "தயாரிப்பு அல்லது HS குறியீட்டை உள்ளிட்டு இலக்கு நாட்டைத் தேர்ந்தெடுக்கவும்.",
      productRequired: "தயாரிப்பு அல்லது HS குறியீட்டை உள்ளிடவும்.",
      countryRequired: "இலக்கு நாட்டைத் தேர்ந்தெடுக்கவும்.",
      emailAddress: "மின்னஞ்சல் முகவரி",
      emailPlaceholder: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
      passwordPlaceholder: "கடவுச்சொல்லை உள்ளிடவும்",
      rememberMe: "என்னை நினைவில் கொள்ளவும்",
      loginToDashboard: "டாஷ்போர்டில் உள்நுழைக",
      or: "அல்லது",
      fullName: "முழு பெயர்",
      confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
      alreadySignedInAs: "நீங்கள் ஏற்கனவே {user} ஆக உள்நுழைந்துள்ளீர்கள்.",
      continueToDashboard: "டாஷ்போர்டுக்கு தொடரவும்",
      switchAccountLogout: "கணக்கை மாற்று / வெளியேறு",
      yourTradeAIAccount: "உங்கள் TradeAI கணக்கு",
    },
    te: {
      landingHeroKicker: "ఆఫ్రికా • గల్ఫ్ • చైనా వాణిజ్య కారిడార్లు",
      landingHeroTitleA: "AI ఆధారిత ఎగుమతి-దిగుమతి ఇంటెలిజెన్స్",
      landingHeroTitleB: "ఫోకస్ చేసిన ట్రేడ్ కారిడార్ల కోసం",
      productHsCode: "ఉత్పత్తి / HS కోడ్",
      targetCountry: "లక్ష్య దేశం",
      selectCountry: "దేశాన్ని ఎంచుకోండి",
      generatePreview: "ప్రివ్యూ రూపొందించండి",
      productCountryRequired: "దయచేసి ఉత్పత్తి లేదా HS కోడ్ నమోదు చేసి లక్ష్య దేశాన్ని ఎంచుకోండి.",
      productRequired: "దయచేసి ఉత్పత్తి లేదా HS కోడ్ నమోదు చేయండి.",
      countryRequired: "దయచేసి లక్ష్య దేశాన్ని ఎంచుకోండి.",
      emailAddress: "ఈమెయిల్ చిరునామా",
      emailPlaceholder: "మీ ఈమెయిల్ నమోదు చేయండి",
      passwordPlaceholder: "పాస్‌వర్డ్ నమోదు చేయండి",
      rememberMe: "నన్ను గుర్తుంచుకోండి",
      loginToDashboard: "డాష్‌బోర్డ్‌కు లాగిన్ చేయండి",
      or: "లేదా",
      fullName: "పూర్తి పేరు",
      confirmPassword: "పాస్‌వర్డ్ నిర్ధారించండి",
      alreadySignedInAs: "మీరు ఇప్పటికే {user}గా సైన్ ఇన్ అయ్యారు.",
      continueToDashboard: "డాష్‌బోర్డ్‌కు కొనసాగండి",
      switchAccountLogout: "ఖాతా మార్చండి / లాగౌట్",
      yourTradeAIAccount: "మీ TradeAI ఖాతా",
    },
    bn: {
      landingHeroKicker: "আফ্রিকা • গাল্ফ • চীন বাণিজ্য করিডর",
      landingHeroTitleA: "AI-চালিত রপ্তানি-আমদানি ইন্টেলিজেন্স",
      landingHeroTitleB: "ফোকাসড ট্রেড করিডরের জন্য",
      productHsCode: "পণ্য / HS কোড",
      targetCountry: "লক্ষ্য দেশ",
      selectCountry: "দেশ নির্বাচন করুন",
      generatePreview: "প্রিভিউ তৈরি করুন",
      productCountryRequired: "অনুগ্রহ করে পণ্য বা HS কোড লিখুন এবং লক্ষ্য দেশ নির্বাচন করুন।",
      productRequired: "অনুগ্রহ করে পণ্য বা HS কোড লিখুন।",
      countryRequired: "অনুগ্রহ করে লক্ষ্য দেশ নির্বাচন করুন।",
      emailAddress: "ইমেল ঠিকানা",
      emailPlaceholder: "আপনার ইমেল লিখুন",
      passwordPlaceholder: "পাসওয়ার্ড লিখুন",
      rememberMe: "আমাকে মনে রাখুন",
      loginToDashboard: "ড্যাশবোর্ডে লগইন করুন",
      or: "অথবা",
      fullName: "পুরো নাম",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      alreadySignedInAs: "আপনি ইতিমধ্যে {user} হিসেবে সাইন ইন করেছেন।",
      continueToDashboard: "ড্যাশবোর্ডে চালিয়ে যান",
      switchAccountLogout: "অ্যাকাউন্ট বদলান / লগআউট",
      yourTradeAIAccount: "আপনার TradeAI অ্যাকাউন্ট",
    },
    es: {
      landingHeroKicker: "Corredores comerciales de África • Golfo • China",
      landingHeroTitleA: "Inteligencia de exportación e importación con IA",
      landingHeroTitleB: "Para corredores comerciales enfocados",
      landingHeroLead:
        "TradeAI ayuda a exportadores, importadores y pymes de India a comparar oportunidades producto-país, explorar flujos de compradores/proveedores, revisar riesgos de códigos HS y generar informes comerciales con IA para África Oriental, el Golfo y China.",
      productHsCode: "Producto / Código HS",
      productSearchPlaceholder: "Ejemplo: cúrcuma, textiles, maquinaria, electrónica",
      targetCountry: "País objetivo",
      selectCountry: "Seleccionar país",
      generatePreview: "Generar vista previa",
      productCountryRequired: "Ingresa un producto o código HS y selecciona un país objetivo.",
      productRequired: "Ingresa un producto o código HS.",
      countryRequired: "Selecciona un país objetivo.",
      emailAddress: "Correo electrónico",
      emailPlaceholder: "Ingresa tu correo",
      passwordPlaceholder: "Ingresa la contraseña",
      rememberMe: "Recordarme",
      loginToDashboard: "Entrar al panel",
      or: "O",
      fullName: "Nombre completo",
      confirmPassword: "Confirmar contraseña",
      alreadySignedInAs: "Ya has iniciado sesión como {user}.",
      continueToDashboard: "Continuar al panel",
      switchAccountLogout: "Cambiar cuenta / cerrar sesión",
      yourTradeAIAccount: "tu cuenta de TradeAI",
    },
    ar: {
      landingHeroKicker: "ممرات تجارة أفريقيا • الخليج • الصين",
      landingHeroTitleA: "ذكاء التصدير والاستيراد المدعوم بالذكاء الاصطناعي",
      landingHeroTitleB: "لممرات تجارية مركزة",
      productHsCode: "المنتج / رمز HS",
      productSearchPlaceholder: "مثال: كركم، منسوجات، آلات، إلكترونيات",
      targetCountry: "الدولة المستهدفة",
      selectCountry: "اختر الدولة",
      generatePreview: "إنشاء معاينة",
      productCountryRequired: "يرجى إدخال منتج أو رمز HS واختيار دولة مستهدفة.",
      productRequired: "يرجى إدخال منتج أو رمز HS.",
      countryRequired: "يرجى اختيار دولة مستهدفة.",
      emailAddress: "عنوان البريد الإلكتروني",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      passwordPlaceholder: "أدخل كلمة المرور",
      rememberMe: "تذكرني",
      loginToDashboard: "الدخول إلى لوحة التحكم",
      or: "أو",
      fullName: "الاسم الكامل",
      confirmPassword: "تأكيد كلمة المرور",
      alreadySignedInAs: "أنت مسجل الدخول بالفعل باسم {user}.",
      continueToDashboard: "المتابعة إلى لوحة التحكم",
      switchAccountLogout: "تبديل الحساب / تسجيل الخروج",
      yourTradeAIAccount: "حسابك في TradeAI",
    },
    zh: {
      landingHeroKicker: "非洲 • 海湾 • 中国贸易走廊",
      landingHeroTitleA: "AI 驱动的进出口情报",
      landingHeroTitleB: "面向重点贸易走廊",
      productHsCode: "产品 / HS 编码",
      productSearchPlaceholder: "例如：姜黄、纺织品、机械、电子产品",
      targetCountry: "目标国家",
      selectCountry: "选择国家",
      generatePreview: "生成预览",
      productCountryRequired: "请输入产品或 HS 编码并选择目标国家。",
      productRequired: "请输入产品或 HS 编码。",
      countryRequired: "请选择目标国家。",
      emailAddress: "电子邮件地址",
      emailPlaceholder: "输入你的电子邮件",
      passwordPlaceholder: "输入密码",
      rememberMe: "记住我",
      loginToDashboard: "登录到仪表板",
      or: "或",
      fullName: "全名",
      confirmPassword: "确认密码",
      alreadySignedInAs: "你已以 {user} 身份登录。",
      continueToDashboard: "继续到仪表板",
      switchAccountLogout: "切换账号 / 退出",
      yourTradeAIAccount: "你的 TradeAI 账号",
    },
  };

  Object.keys(phase1Copy).forEach((language) => {
    dictionary[language] = {
      ...(dictionary[language] || {}),
      ...phase1Copy[language],
    };
  });

  const phrases = {
    "About": "about",
    "About Us": "about",
    "Action": "action",
    "Add Buyer": "addBuyer",
    "Admin": "admin",
    "Admin Panel": "adminPanel",
    "AI Buyer Matching": "aiBuyerMatching",
    "AI Finds Buyers": "aiFindsBuyers",
    "AI Insights": "aiInsights",
    "AI Match Score": "aiMatchScore",
    "AI Trade Copilot": "aiTradeCopilot",
    "AI Trade Reports": "aiReports",
    "Analytics": "analytics",
    "Analyze Codes": "analyzeCodes",
    "Ask Copilot": "askCopilot",
    "Buyer": "buyer",
    "Buyer Discovery": "buyerDiscovery",
    "Buyer Finder": "buyerFinder",
    "Buyers": "buyers",
    "Cancel": "cancel",
    "Category": "category",
    "Changelog": "changelog",
    "Company": "company",
    "Company Name": "companyName",
    "Confirm": "confirm",
    "Contact": "contact",
    "Contact Sales": "contactSales",
    "Copilot": "copilot",
    "Core Features": "coreFeatures",
    "Create Account": "createAccount",
    "Dashboard": "dashboard",
    "Dashboards": "dashboards",
    "Email": "email",
    "Enterprise": "enterprise",
    "Explorer Dashboard": "explorerDashboard",
    "Export Dashboard": "exportDashboard",
    "Exporter Dashboard": "exporterDashboard",
    "Features": "features",
    "Forgot Password?": "forgotPassword",
    "Generate report": "generateReport",
    "Help Centre": "helpCentre",
    "Home": "home",
    "HS Code Intelligence": "hsCode",
    "Importer Dashboard": "importerDashboard",
    "Importers": "importers",
    "Inquiries": "inquiries",
    "Inquiry Dashboard": "inquiryDashboard",
    "Industry": "industry",
    "Legal": "legal",
    "Login": "login",
    "Logout": "logout",
    "Market Analysis": "marketAnalysis",
    "Market Analytics": "marketAnalytics",
    "Marketplace": "marketplace",
    "Name": "name",
    "Notifications": "notifications",
    "Password": "password",
    "Pricing": "pricing",
    "Privacy Policy": "privacyPolicy",
    "Product": "product",
    "Product Upload": "productUpload",
    "Products": "products",
    "Profile": "profile",
    "Register": "register",
    "Resources": "resources",
    "Role": "role",
    "Saved Searches": "savedSearches",
    "Skip to content": "skipToContent",
    "Search Market": "searchButton",
    "Settings": "settings",
    "Status": "status",
    "Suppliers": "suppliers",
    "System Status": "systemStatus",
    "Talk To Sales": "talkSales",
    "Terms & Conditions": "terms",
    "Trade Analytics": "tradeAnalytics",
    "Trust": "trust",
    "Upload Product": "uploadProduct",
    "Users": "users",
    "View Analytics": "viewAnalytics",
    "Welcome Back": "welcomeBack",
    "Why TradeAI Exists": "whyTradeAIExists",
    "Search Product, Country, or HS Code": "searchLabel",
    "Search Product, Country, HS Code...": "searchPlaceholder",
  };

  const keyAliases = {
    aiMarketAnalytics: "marketAnalytics",
    alreadyHaveAccount: "login",
    chooseAccountType: "accountType",
    companyNamePlaceholder: "companyName",
    confirmPassword: "password",
    continueToDashboard: "dashboard",
    createPasswordPlaceholder: "password",
    emailAddress: "email",
    emailAddressPlaceholder: "email",
    emailPlaceholder: "email",
    explorer: "explorerDashboard",
    exporter: "exporterDashboard",
    fullName: "name",
    fullNamePlaceholder: "name",
    globalBuyerDiscovery: "buyerDiscovery",
    globalTradeIntelligence: "tradeAnalytics",
    landingSearchFormAria: "generateReport",
    loginHeroTitle: "welcomeBack",
    productHsCode: "product",
    registerHeroTitle: "createAccount",
    showPassword: "password",
    switchAccountLogout: "logout",
    targetCountry: "countries",
    tradeConsultant: "analytics",
    navFeatures: "features",
    navDashboard: "dashboard",
    navContact: "contact",
    featuresKicker: "features",
    featuresTitle: "coreFeatures",
    featuresLead: "buyerDiscoveryDesc",
    exploreBuyers: "buyerDiscovery",
    statsKicker: "trustedTitle",
    statsTitle: "trustedTitle",
    statsLead: "marketAnalyticsDesc",
    ctaKicker: "createAccount",
    ctaTitle: "createAccount",
    ctaLead: "heroLead",
    facilitatedTradeVolume: "tradeAnalytics",
    homeAria: "home",
    mainNavAria: "home",
    languageControlsAria: "languageSelectAria",
    notificationToggleAria: "notifications",
    notificationPanelAria: "notifications",
    themeToggleAria: "settings",
    mobileMenuToggleAria: "menu",
    mobileMenuAria: "menu",
    capabilitiesAria: "features",
    customerSegmentsAria: "marketplace",
    comparisonTableAria: "marketplace",
  };

  Object.keys(dictionary).forEach((language) => {
    dictionary[language] = { ...dictionary.en, ...dictionary[language] };
    Object.entries(keyAliases).forEach(([alias, sourceKey]) => {
      dictionary[language][alias] = dictionary[language][alias] || dictionary[language][sourceKey];
    });
  });

  Object.entries(dictionary.en).forEach(([key, phrase]) => {
    phrases[normalizeText(phrase)] = phrases[normalizeText(phrase)] || key;
  });

  function storage() {
    return window.TradeAI?.storage;
  }

  function getStoredLanguage() {
    return storage()?.get(LANGUAGE_KEY) || "en";
  }

  function setStoredLanguage(language) {
    storage()?.set(LANGUAGE_KEY, language);
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  let activeLanguage = getStoredLanguage();

  function getCopy(keyOrPhrase, variables = {}) {
    const key = dictionary.en[keyOrPhrase] ? keyOrPhrase : phrases[normalizeText(keyOrPhrase)];
    let copy =
      dictionary[activeLanguage]?.[key] ||
      dictionary[activeLanguage]?.[keyOrPhrase] ||
      dictionary.en[key] ||
      keyOrPhrase;

    Object.keys(variables).forEach((name) => {
      copy = copy.replace(new RegExp(`{${name}}`, "g"), variables[name]);
    });

    return copy;
  }

  function ensureLanguageSelector() {
    if (!ENABLE_LANGUAGE_SWITCHER) {
      document
        .querySelectorAll(".language-toolbar, .language-wrapper, .language-select, .mobile-language-select")
        .forEach((element) => {
          element.hidden = true;
          element.setAttribute("aria-hidden", "true");
        });
      return [];
    }

    let selects = Array.from(document.querySelectorAll(".language-select"));
    if (selects.length) return selects;

    const host =
      document.querySelector(".auth-buttons") ||
      document.querySelector(".nav-actions") ||
      document.querySelector(".nav-container");

    if (!host) return [];

    const wrapper = document.createElement("div");
    wrapper.className = "language-wrapper auto-language-wrapper";

    const select = document.createElement("select");
    select.className = "language-select";
    select.setAttribute("aria-label", getCopy("languageSelectAria"));

    languages.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });

    wrapper.appendChild(select);
    const firstAction = host.querySelector(".theme-btn, .icon-btn, .login-btn, .cta, .cta-btn");
    if (firstAction) {
      host.insertBefore(wrapper, firstAction);
    } else {
      host.appendChild(wrapper);
    }

    return [select];
  }

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(
      parent.closest(
        "script, style, code, pre, textarea, select, option, [data-i18n-skip], [contenteditable='true']",
      ),
    );
  }

  function translateTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = normalizeText(node.nodeValue);
      const source = node.__tradeaiSourceText || text;
      if (!text || shouldSkipNode(node) || !phrases[source]) continue;
      nodes.push(node);
    }

    nodes.forEach((node) => {
      const originalRaw = node.__tradeaiSourceRaw || node.nodeValue;
      const source = node.__tradeaiSourceText || normalizeText(originalRaw);
      node.__tradeaiSourceText = source;
      node.__tradeaiSourceRaw = originalRaw;
      const translated = getCopy(source);
      const leading = originalRaw.match(/^\s*/)?.[0] || "";
      const trailing = originalRaw.match(/\s*$/)?.[0] || "";
      node.nodeValue = `${leading}${translated}${trailing}`;
    });
  }

  function translateAttributes() {
    document.querySelectorAll("[placeholder], [aria-label], [title], input[value]").forEach((element) => {
      ["placeholder", "aria-label", "title", "value"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        if (attribute === "value" && !["button", "submit", "reset"].includes(element.type)) return;

        const originalKey = `tradeaiOriginal${attribute}`;
        const source = element.dataset[originalKey] || element.getAttribute(attribute);
        const normalized = normalizeText(source);
        if (!phrases[normalized]) return;

        element.dataset[originalKey] = source;
        element.setAttribute(attribute, getCopy(normalized));
      });
    });
  }

  function applyLanguage(language) {
    const validLanguages = new Set(languages.map(([value]) => value));
    activeLanguage = validLanguages.has(language) ? language : "en";
    setStoredLanguage(activeLanguage);

    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = RTL_LANGUAGES.has(activeLanguage) ? "rtl" : "ltr";

    ensureLanguageSelector().forEach((select) => {
      select.value = activeLanguage;
      select.setAttribute("aria-label", getCopy("languageSelectAria"));
    });

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      if (element.dataset.i18nDynamic) return;
      element.textContent = getCopy(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", getCopy(element.dataset.i18nPlaceholder));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      element.setAttribute("aria-label", getCopy(element.dataset.i18nAria));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.setAttribute("title", getCopy(element.dataset.i18nTitle));
    });

    if (document.documentElement.dataset.i18nAuto === "true") {
      translateTextNodes();
      translateAttributes();
    }

    window.dispatchEvent(
      new CustomEvent("tradeai:language-change", {
        detail: { language: activeLanguage },
      }),
    );
  }

  function bindLanguageSelects() {
    if (!ENABLE_LANGUAGE_SWITCHER) return;

    ensureLanguageSelector().forEach((select) => {
      if (select.dataset.i18nBound === "true") return;
      select.dataset.i18nBound = "true";
      select.addEventListener("change", (event) => {
        applyLanguage(event.target.value);
        window.TradeAI?.analytics?.track("language_changed", {
          language: event.target.value,
        });
      });
    });
  }

  Object.assign(window.TradeAI.i18n, {
    applyLanguage,
    getCopy,
    setStoredLanguage,
    get language() {
      return activeLanguage;
    },
  });

  function boot() {
    bindLanguageSelects();
    applyLanguage(activeLanguage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
