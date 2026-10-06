"""Arabic copy for the page text (English text node / attribute -> Arabic), used by scripts/build_ar.py.

Terms follow docs/glossary-ar.md. Keys are matched after whitespace collapsing and, as a fallback, ignoring case and
punctuation, so small punctuation differences between data/*.json and the HTML do not need duplicate entries.
Everything marked (CHAIRMAN) or (TESTIMONIAL) is flagged for client review in docs/ar-copy-review.md.
"""
COMP = 'تعمير بلس للمقاولات ش.ذ.م.م'
ADDR = 'مبنى سكاي بزنس، مكتب M30، دبي فستيفال سيتي، دبي، الإمارات العربية المتحدة'
IDENT = [  # identical in both languages (brands, numbers, contacts, symbols)
    'English', 'عربي', '+', '*', '.', '|', '404', '2015', 'G+4', '100+', '22', '6', '10', '5', '1',
    '+971 4 329 0500', '+971 50 302 9281', 'info@taameer.ae', '@taameer_contracting', 'WhatsApp', 'Instagram',
    '741846', '1857822', '257369', '1314264', '2230336', '520139',
    'Alhashmi Planners, Arc. Engs.', 'R-Qitect Design Studio', 'Dewan Al Amara Engineering Consultants', 'Al-Shurooq Consultants',
    'Al Gurm Real Estate', 'Al Bastaki Business Services', 'A.M.E.C.', 'Al Sondos Holding', 'Atlas Copco',
    'Cooltech, a Tabreed company', 'CIFA, a Zoomlion company', 'Innovative Consultants', 'KF INC Investment Group',
    'Nahas Interiors', 'Oceanworld Group of Companies', 'RD2 Design', 'OWA', 'Atlas Copco Services Middle East',
    'Atlas Copco Services Middle East OMC', 'Bella Cure Beauty Lounge', 'TODAY Engineering Consultants',
]

TEXT = {
    # ---------- shared: header, footer, CTA ----------
    'Taameer Plus Contracting LLC': COMP,
    'Skip to content': 'انتقل إلى المحتوى',
    'Taameer Plus Contracting LLC — home': COMP + ' — الرئيسية',
    'Main': 'القائمة الرئيسية', 'Main (mobile)': 'القائمة الرئيسية (الجوال)', 'Menu': 'القائمة', 'Breadcrumb': 'مسار التنقل',
    'Get a Quote': 'اطلب عرض سعر',
    'Construct A Better Tomorrow. A leading contracting, design, fit-out and technical services provider based in Dubai, UAE — building trust before concrete since 2015.':
        'نبني غداً أفضل. شركة رائدة في المقاولات والتصميم والتشطيبات الداخلية والخدمات الفنية، مقرها دبي، الإمارات — نبني الثقة قبل الخرسانة منذ عام 2015.',
    'Download company profile': 'تحميل الملف التعريفي للشركة', '(PDF, 5 MB)': '(PDF، 5 ميغابايت)', 'Quick links': 'روابط سريعة',
    'Sky Business Building, Office M30,': 'مبنى سكاي بزنس، مكتب M30،', 'Festival City, Dubai, UAE': 'دبي فستيفال سيتي، دبي، الإمارات',
    'Office': 'المكتب', 'Mobile': 'الجوال', '(opens in a new tab)': '(يفتح في تبويب جديد)',
    '© 2026 Taameer Plus Contracting LLC. All rights reserved.': '© 2026 ' + COMP + '. جميع الحقوق محفوظة.',
    'Chat with Taameer Plus on WhatsApp (opens in a new tab)': 'تواصل مع تعمير بلس عبر واتساب (يفتح في تبويب جديد)',
    'Ready to build your next project?': 'هل أنت مستعد لبناء مشروعك القادم؟',
    'Contact Taameer Plus Contracting for expert consultations, value engineering and turnkey proposals.':
        'تواصل مع تعمير بلس للمقاولات للحصول على استشارات متخصصة وخدمات الهندسة القيمية وعروض مشاريع تسليم المفتاح.',
    'Ongoing': 'قيد التنفيذ', '3D Visualization': 'تصور ثلاثي الأبعاد', 'View project': 'عرض المشروع',
    'Location': 'الموقع', 'Consultant': 'الاستشاري', 'Type': 'النوع', 'Period': 'المدة', 'Completion': 'تاريخ الإنجاز',
    'Project': 'المشروع',

    # ---------- 404 ----------
    'Page not found — Taameer Plus Contracting LLC': 'الصفحة غير موجودة — ' + COMP,
    'The page you are looking for could not be found. Return to the Taameer Plus homepage or browse our construction and fit-out projects in Dubai.':
        'تعذّر العثور على الصفحة التي تبحث عنها. عد إلى الصفحة الرئيسية لتعمير بلس أو تصفّح مشاريعنا في الإنشاءات والتشطيبات الداخلية في دبي.',
    'This page could not be found. Visit the Taameer Plus homepage or browse our projects.':
        'تعذّر العثور على هذه الصفحة. زر الصفحة الرئيسية لتعمير بلس أو تصفّح مشاريعنا.',
    'Page not found': 'الصفحة غير موجودة', 'We could not find that page': 'لم نعثر على هذه الصفحة',
    'The page may have moved, or the link may be incorrect. Return to the homepage or browse our projects.':
        'ربما نُقلت الصفحة أو أن الرابط غير صحيح. عد إلى الصفحة الرئيسية أو تصفّح مشاريعنا.',
    'Back to home': 'العودة إلى الرئيسية', 'View projects': 'عرض المشاريع', 'Featured projects': 'مشاريع مميزة',
    'Or explore our work': 'أو استكشف أعمالنا', 'Browse the full portfolio on the': 'تصفّح سجل أعمالنا الكامل في', 'projects page': 'صفحة المشاريع',

    # ---------- nav labels / services (glossary) ----------
    'Home': 'الرئيسية', 'About': 'من نحن', 'Services': 'خدماتنا', 'Projects': 'مشاريعنا', 'Testimonials': 'آراء العملاء', 'Contact': 'اتصل بنا',
    'Construction': 'الإنشاءات', 'Design & Build': 'التصميم والتنفيذ', 'Decoration & Fit-out': 'الديكور والتشطيبات الداخلية',
    'Renovation': 'التجديد', 'Maintenance': 'الصيانة', 'Turnkey Projects': 'مشاريع تسليم المفتاح',

    # ---------- About ----------
    'About Us — Taameer Plus Contracting LLC': 'من نحن — ' + COMP,
    'About Taameer Plus Contracting LLC, an approved G+4 general contractor in Dubai since 2015: the Chairman’s message, our aims, leadership team, partners and official trade licenses.':
        'تعرّف على ' + COMP + '، مقاول عام معتمد G+4 في دبي منذ عام 2015: رسالة رئيس مجلس الإدارة، وأهدافنا، وفريق القيادة، والشركاء، والتراخيص التجارية الرسمية.',
    'About Taameer Plus Contracting LLC': 'عن ' + COMP,
    'Established in Dubai in 2015, Taameer Plus is a full-service contracting company with well-trained staff and uncompromising quality.':
        'تأسست تعمير بلس في دبي عام 2015، وهي شركة مقاولات متكاملة الخدمات بكوادر مدرّبة جيداً وجودة لا تقبل المساومة.',
    'Taameer Plus Contracting LLC — Dubai, UAE': COMP + ' — دبي، الإمارات',
    'About Taameer Plus': 'عن تعمير بلس',
    'Established in Dubai in 2015 as a small technical services company, Taameer Plus Contracting LLC has grown steadily through years of gaining exceptional experience in the market.':
        'تأسست ' + COMP + ' في دبي عام 2015 كشركة صغيرة للخدمات الفنية، ونمت بثبات عبر سنوات من اكتساب خبرة استثنائية في السوق.',
    'Portrait of Mr. Fahim Al-Ali, Chairman of Taameer Plus': 'صورة السيد فهيم العلي، رئيس مجلس إدارة تعمير بلس',
    'Chairman’s message': 'رسالة رئيس مجلس الإدارة',
    'Welcome to our company, Taameer Plus Contracting LLC. Taameer Plus has gained a good reputable name in the market over the years. Through hard work, professionalism and dedication it has become one of the leading companies in Dubai within the industry of design, fit-out, decoration and contracting.':
        'أهلاً بكم في شركتنا، ' + COMP + '. اكتسبت تعمير بلس على مر السنين سمعة طيبة في السوق، وبالجهد والاحتراف والتفاني أصبحت من الشركات الرائدة في دبي في مجال التصميم والتشطيبات الداخلية والديكور والمقاولات.',
    'I am confident that after meeting the Taameer Plus family, your experience with us will be a turning point in your understanding of construction — a fruitful start to a continuous business relationship, as':
        'وإنني على ثقة بأنكم بعد أن تتعرّفوا على عائلة تعمير بلس، ستكون تجربتكم معنا نقطة تحوّل في فهمكم للبناء، وبداية مثمرة لعلاقة عمل مستمرة، إذ',
    'we build trust before concrete.': 'نبني الثقة قبل الخرسانة.',
    'Mr. Fahim Al-Ali': 'السيد فهيم العلي', 'Chairman': 'رئيس مجلس الإدارة',
    'Pioneering engineering & construction solutions': 'حلول هندسية وإنشائية رائدة',
    'Established in Dubai in 2015 as a small technical services company, Taameer Plus Contracting LLC has grown steadily through years of gaining exceptional experience in the market. Today, Taameer Plus is a full-service contracting company with well-trained staff delivering high quality and standards, using state-of-the-art engineering processes.':
        'تأسست ' + COMP + ' في دبي عام 2015 كشركة صغيرة للخدمات الفنية، ونمت بثبات عبر سنوات من اكتساب خبرة استثنائية في السوق. واليوم، تُعدّ تعمير بلس شركة مقاولات متكاملة الخدمات بكوادر مدرّبة جيداً تقدّم جودة ومعايير عالية، باستخدام أحدث العمليات الهندسية.',
    'Our primary goal is to achieve the highest quality in all our operations without compromise — offering our customers a safe, cost-effective and professional service. Quality performance is the cornerstone of our company culture and a personal responsibility of every employee.':
        'هدفنا الأول تحقيق أعلى مستويات الجودة في جميع أعمالنا دون أي تنازل، لنقدّم لعملائنا خدمة آمنة واقتصادية واحترافية. ويُعدّ الأداء الجيد حجر الزاوية في ثقافة شركتنا ومسؤولية شخصية على كل موظف.',
    'Established in Dubai': 'تأسست في دبي',
    'From a small technical services company to a full-service contracting company.': 'من شركة صغيرة للخدمات الفنية إلى شركة مقاولات متكاملة الخدمات.',
    'Quality performance': 'جودة الأداء', 'Our aim': 'هدفنا',
    'To maintain quality performance at the highest level, these four aims are pursued.': 'للحفاظ على جودة الأداء في أعلى مستوياتها، نسعى إلى تحقيق هذه الأهداف الأربعة.',
    'Exceed Expectations': 'تجاوز التوقعات',
    'Fulfill or exceed customer needs and expectations by delivering a quality project consistently and promptly.': 'تلبية احتياجات العملاء وتوقعاتهم أو تجاوزها من خلال تسليم مشروع عالي الجودة باستمرار وفي الوقت المناسب.',
    'Continuous Improvement': 'التحسين المستمر',
    'Maintain the commitment to continuous improvement and communicate our goals to every employee.': 'الالتزام بالتحسين المستمر وإيصال أهدافنا إلى كل موظف.',
    'Safe & Efficient Environment': 'بيئة آمنة وكفؤة',
    'Promote a working environment where training and tools are provided so work proceeds safely.': 'تعزيز بيئة عمل تتوفر فيها التدريبات والأدوات اللازمة لسير العمل بأمان.',
    'Reviewed Standards': 'معايير تُراجع دورياً',
    'Implement a system of policies, periodically reviewed, so all working groups perform effectively.': 'تطبيق منظومة سياسات تُراجع دورياً لضمان أداء جميع فرق العمل بفاعلية.',
    'Landscaped garden path and warm evening lighting beside a newly built Dubai villa': 'ممر حديقة منسّق وإضاءة مسائية دافئة بجوار فيلا حديثة البناء في دبي',
    'Why Taameer Plus': 'لماذا تعمير بلس', 'Why choose us': 'لماذا تختارنا', 'Approved G+4 Contractor': 'مقاول معتمد G+4',
    'Turnkey & Value Engineering': 'تسليم المفتاح والهندسة القيمية', 'Uncompromising Quality': 'جودة لا تقبل المساومة',
    'Expert leadership': 'قيادة خبيرة', 'Meet our core leadership': 'تعرّف على فريق قيادتنا الأساسي',
    'Portrait of Eng. Mohannad Al Musleh, General Manager': 'صورة م. مهند المصلح، المدير العام',
    'Portrait of Eng. Rauof Al-Otaibi, Business Development Manager': 'صورة م. رؤوف العتيبي، مدير تطوير الأعمال',
    'Portrait of Eng. Mohammad Amer, Projects Manager': 'صورة م. محمد عامر، مدير المشاريع',
    'Our team': 'فريقنا', 'Recently executed': 'نُفّذت مؤخراً', 'Large-scale projects by the Taameer Plus team': 'مشاريع ضخمة نفّذها فريق تعمير بلس',
    'Buildings executed by members of the Taameer Plus team as part of their earlier experience. They are not Taameer Plus company projects.':
        'مبانٍ نفّذها أعضاء من فريق تعمير بلس ضمن خبراتهم السابقة، وهي ليست من مشاريع شركة تعمير بلس.',
    'Four-star hotel building with a brick and cream facade in Al Barsha 1st, Dubai': 'مبنى فندق أربع نجوم بواجهة من الطوب والكريمي في البرشاء 1، دبي',
    'Team experience': 'خبرة الفريق',
    'Tall residential tower with glazed balconies in Nadd Al Hamar, Dubai': 'برج سكني مرتفع بشرفات زجاجية في ند الحمر، دبي',
    'Dubai Investments headquarters, a glass and steel office complex with flags at Dubai Investment Park': 'المقر الرئيسي لشركة دبي للاستثمار، مجمع مكاتب من الزجاج والفولاذ تعلوه الأعلام في مجمع دبي للاستثمار',
    'Mixed-use shopping mall and residential building in Souq Al Kabeer, Dubai': 'مركز تسوق ومبنى سكني متعدد الاستخدامات في سوق الكبير، دبي',
    'Strategic alliance': 'تحالف استراتيجي', 'Our trusted partners': 'شركاؤنا الموثوقون',
    'Partner (R monogram)': 'شريك (شعار بحرف R)', 'Partner logo, R monogram': 'شعار شريك بحرف R',
    'Compliance & trust': 'الامتثال والثقة', 'Official licenses': 'التراخيص الرسمية',
    'Commercial licenses issued by the Dubai Department of Economy and Tourism. Open a license to view the full document (PDF).':
        'رخص تجارية صادرة عن دائرة الاقتصاد والسياحة في دبي. افتح الرخصة لعرض المستند كاملاً (PDF).',
    'Preview of the commercial license of Taameer Plus Contracting LLC': 'معاينة الرخصة التجارية لشركة ' + COMP,
    'Preview of the commercial license of Taameer Plus Carpentry LLC': 'معاينة الرخصة التجارية لشركة نجارة تعمير بلس ش.ذ.م.م',
    'Active': 'سارية', 'License No.': 'رقم الرخصة', 'Legal type': 'الشكل القانوني', 'Register No.': 'رقم السجل',
    'DCCI No.': 'رقم عضوية غرفة تجارة دبي', 'Issue date': 'تاريخ الإصدار', 'Expiry date': 'تاريخ الانتهاء',
    '7 September 2015': '7 سبتمبر 2015', '6 September 2027': '6 سبتمبر 2027', '19 February 2024': '19 فبراير 2024', '18 February 2027': '18 فبراير 2027',
    'Primary activities': 'الأنشطة الرئيسية', 'View license': 'عرض الرخصة', '(PDF, opens in a new tab)': '(PDF، يفتح في تبويب جديد)',
    'Taameer Plus Carpentry LLC': 'نجارة تعمير بلس ش.ذ.م.م',

    # ---------- Contact ----------
    'Contact — Taameer Plus Contracting LLC': 'اتصل بنا — ' + COMP,
    'Contact Taameer Plus Contracting in Dubai for expert consultations, value engineering and turnkey proposals: address, phone, email, WhatsApp and an enquiry form.':
        'تواصل مع تعمير بلس للمقاولات في دبي للحصول على استشارات متخصصة وخدمات الهندسة القيمية وعروض مشاريع تسليم المفتاح: العنوان والهاتف والبريد الإلكتروني وواتساب ونموذج استفسار.',
    'Contact Taameer Plus Contracting LLC': 'اتصل بـ' + COMP,
    'Ready to build your next project? Reach our head office in Festival City, Dubai, or send an enquiry online.':
        'هل أنت مستعد لبناء مشروعك القادم؟ تواصل مع مكتبنا الرئيسي في دبي فستيفال سيتي، أو أرسل استفساراً عبر الإنترنت.',
    'Contact us': 'اتصل بنا', 'Get in touch with our team': 'تواصل مع فريقنا',
    'Ready to build your next project? Contact Taameer Plus Contracting for expert consultations, value engineering, and turnkey proposals.':
        'هل أنت مستعد لبناء مشروعك القادم؟ تواصل مع تعمير بلس للمقاولات للحصول على استشارات متخصصة وخدمات الهندسة القيمية وعروض مشاريع تسليم المفتاح.',
    'Contact details': 'بيانات التواصل', 'Head office': 'المكتب الرئيسي', 'Address': 'العنوان',
    'Sky Business Building, Office M30, Festival City, Dubai, UAE': ADDR,
    'Email': 'البريد الإلكتروني', 'Chat with us instantly': 'تحدّث معنا فوراً',
    'Send a message': 'أرسل رسالة', 'Tell us about your project': 'حدّثنا عن مشروعك', 'Full name': 'الاسم الكامل',
    'Email address': 'عنوان البريد الإلكتروني', 'Phone number': 'رقم الهاتف', 'Project type': 'نوع المشروع', 'Select a service': 'اختر خدمة',
    'Other': 'أخرى', 'Message': 'الرسالة', 'Leave this field empty': 'اترك هذا الحقل فارغاً',
    'Fields marked': 'الحقول المميزة بعلامة', 'with an asterisk': 'النجمة', 'are required.': 'مطلوبة.',
    'Send message': 'إرسال الرسالة', 'Thank you for your message': 'شكراً لرسالتك',
    'Our team will get back to you. For anything urgent, call +971 4 329 0500 or message us on WhatsApp.':
        'سيتواصل معك فريقنا قريباً. وللأمور العاجلة، اتصل على +971 4 329 0500 أو راسلنا عبر واتساب.',
    'Find us': 'موقعنا', 'Visit our office': 'زر مكتبنا', 'Open in Google Maps': 'افتح في خرائط Google',

    # ---------- Home ----------
    'Taameer Plus Contracting LLC — Construction, Fit-out & Renovation in Dubai': COMP + ' — إنشاءات وتشطيبات داخلية وتجديد في دبي',
    'Approved G+4 general contractor in Dubai since 2015: turnkey construction, design & build, fit-out, decoration, renovation and maintenance across the UAE.':
        'مقاول عام معتمد G+4 في دبي منذ عام 2015: إنشاءات بنظام تسليم المفتاح، والتصميم والتنفيذ، والتشطيبات الداخلية، والديكور، والتجديد، والصيانة في أنحاء الإمارات.',
    'Taameer Plus Contracting LLC — Construct A Better Tomorrow': COMP + ' — نبني غداً أفضل',
    'Construct A Better Tomorrow — construction, fit-out and renovation in Dubai since 2015.': 'نبني غداً أفضل — إنشاءات وتشطيبات داخلية وتجديد في دبي منذ عام 2015.',
    'Construct A Better Tomorrow': 'نبني غداً أفضل',
    'An approved G+4 general contractor delivering turnkey construction, design & build, luxury fit-out and full-scale renovation across the UAE — with uncompromising quality since 2015.':
        'مقاول عام معتمد G+4 يقدّم الإنشاءات بنظام تسليم المفتاح، والتصميم والتنفيذ، والتشطيبات الداخلية الفاخرة، والتجديد الشامل في أنحاء الإمارات — بجودة لا تقبل المساومة منذ عام 2015.',
    'View Projects': 'عرض المشاريع',
    'Pool terrace and white facade of a renovated private villa on Palm Jumeirah': 'شرفة المسبح والواجهة البيضاء لفيلا خاصة مجدَّدة على نخلة جميرا',
    'Private villa renovation · Palm Jumeirah · 2025': 'تجديد فيلا خاصة · نخلة جميرا · 2025',
    'Established in Dubai in 2015 as a small technical services company, Taameer Plus Contracting LLC has grown steadily through years of exceptional experience in the market. Today it is a full-service contracting company with well-trained staff, delivering high quality and standards with state-of-the-art engineering processes.':
        'تأسست ' + COMP + ' في دبي عام 2015 كشركة صغيرة للخدمات الفنية، ونمت بثبات عبر سنوات من الخبرة الاستثنائية في السوق. واليوم هي شركة مقاولات متكاملة الخدمات بكوادر مدرّبة جيداً، تقدّم جودة ومعايير عالية بأحدث العمليات الهندسية.',
    'Our primary goal is to achieve the highest quality in all our operations without compromise, offering our customers a safe, cost-effective and professional service.':
        'هدفنا الأول تحقيق أعلى مستويات الجودة في جميع أعمالنا دون أي تنازل، لنقدّم لعملائنا خدمة آمنة واقتصادية واحترافية.',
    'More about us': 'المزيد عنّا', 'Approved contractor': 'مقاول معتمد', 'Delivered projects': 'مشاريع منجزة',
    '“After meeting the Taameer Plus family, your experience with us will be a turning point in your understanding of construction — a fruitful start to a continuous business relationship, as':
        '«بعد أن تتعرّفوا على عائلة تعمير بلس، ستكون تجربتكم معنا نقطة تحوّل في فهمكم للبناء، وبداية مثمرة لعلاقة عمل مستمرة، إذ',
    '”': '»',
    'Our expertise': 'خبراتنا', 'Comprehensive contracting services': 'خدمات مقاولات متكاملة',
    'A pioneer general contractor in the UAE, delivering construction solutions in a professional and cost-effective manner.':
        'مقاول عام رائد في الإمارات، يقدّم حلولاً إنشائية باحترافية وبتكلفة مجدية.',
    'All services': 'جميع الخدمات',
    'Newly built villa with pool at dusk, Dubai': 'فيلا حديثة البناء بمسبح عند الغروب، دبي',
    'Completed G+1 residential villa in Al Awir': 'فيلا سكنية G+1 مكتملة في العوير',
    'Reception with timber slat wall at the KF INC headquarters fit-out': 'منطقة استقبال بجدار من الشرائح الخشبية في تشطيبات المقر الرئيسي لشركة KF INC',
    'Renovated double-height living area in a Dubai Marina triplex villa': 'منطقة معيشة مجدَّدة بارتفاع مزدوج في فيلا تريبلكس بدبي مارينا',
    'Open-plan office at the Atlas Copco headquarters': 'مكتب مفتوح في المقر الرئيسي لشركة Atlas Copco',
    'Exterior of a completed G+2 private villa in Al Warqa 1st': 'واجهة فيلا خاصة G+2 مكتملة في الورقاء 1',
    'Exterior of a newly built residential villa in Dubai at dusk': 'واجهة فيلا سكنية حديثة البناء في دبي عند الغروب',
    'Track record': 'سجل الأعمال',
    'A selection of construction, renovation and fit-out works completed across Dubai and Abu Dhabi.': 'مجموعة مختارة من أعمال الإنشاء والتجديد والتشطيبات الداخلية المنجزة في أنحاء دبي وأبوظبي.',
    'All projects': 'جميع المشاريع', 'Before & after': 'قبل وبعد',
    'Construction and fit-out of a private gym': 'إنشاء وتشطيبات داخلية لصالة رياضية خاصة',
    'Drag the divider to compare the space before work began with the finished gym.': 'اسحب الفاصل لمقارنة المساحة قبل بدء الأعمال بالصالة الرياضية بعد اكتمالها.',
    'Marina, Abu Dhabi': 'المارينا، أبوظبي', '135 days': '135 يوماً', 'September 2024': 'سبتمبر 2024', 'View the project': 'عرض المشروع',
    'After: the completed gym with glazed frontage and a landscaped lawn': 'بعد: الصالة الرياضية المكتملة بواجهة زجاجية ومساحة عشبية منسقة',
    'Before: the same structure during construction': 'قبل: المبنى نفسه أثناء الإنشاء',
    'Client endorsements': 'شهادات العملاء', 'Letters of appreciation': 'خطابات الشكر والتقدير', 'Read all letters': 'اقرأ جميع الخطابات',
    'Letter of appreciation from Atlas Copco (thumbnail)': 'خطاب شكر من Atlas Copco (صورة مصغّرة)',
    'Nicole Rowe, Regional Human Resources Manager': 'نيكول رو، مديرة الموارد البشرية الإقليمية',
    'The Taameer Plus Contracting LLC team accomplished designing and constructing work for the beauty lounge successfully, and adhered professionally to project completion budget, schedule and quality.':
        'أنجز فريق ' + COMP + ' أعمال تصميم صالون التجميل وتنفيذه بنجاح، والتزم باحترافية بميزانية إنجاز المشروع وجدوله الزمني ومعايير جودته.',
    'Letter of appreciation from Bella Cure Beauty Lounge (thumbnail)': 'خطاب شكر من Bella Cure Beauty Lounge (صورة مصغّرة)',
    'Maitha Ahli, Owner': 'ميثاء الأهلي، مالكة Bella Cure Beauty Lounge',
    'Taameer Plus completed the entire works in accordance with the contract specifications and specified construction timeline, showing a satisfactory degree of proper planning, coordination, safety and quality of workmanship.':
        'أنجزت تعمير بلس جميع الأعمال وفق مواصفات العقد والجدول الزمني المحدد للإنشاء، وأظهرت درجة مرضية من التخطيط السليم والتنسيق والسلامة وجودة التنفيذ.',
    'Letter of appreciation from TODAY Engineering Consultants (thumbnail)': 'خطاب شكر من TODAY Engineering Consultants (صورة مصغّرة)',
    'Abdulla Al Zaabi, Chairman': 'عبدالله الزعابي، رئيس مجلس الإدارة',

    'Experienced professionals handling all phases of construction — from new build to renovation — coordinated with qualified subcontractors to meet deadlines.':
        'متخصصون ذوو خبرة يتولون جميع مراحل الإنشاء، من البناء الجديد إلى التجديد، بالتنسيق مع مقاولين من الباطن مؤهلين لالتزام المواعيد.',
    'Experienced professionals handling every phase of construction, from new build to renovation, coordinated with qualified subcontractors to meet deadlines.':
        'متخصصون ذوو خبرة يتولون جميع مراحل الإنشاء، من البناء الجديد إلى التجديد، بالتنسيق مع مقاولين من الباطن مؤهلين لالتزام المواعيد.',
    'Licensed by the Government of Dubai for multi-storey residential and commercial structural developments.':
        'مرخّصة من حكومة دبي لتنفيذ المشاريع الإنشائية السكنية والتجارية متعددة الطوابق.',

    # ---------- Project template (static parts) ----------
    'Project — Taameer Plus Contracting LLC': 'مشروع — ' + COMP,
    'Project details from Taameer Plus Contracting LLC: type, location, duration, completion date and the full image gallery of the work delivered.':
        'تفاصيل المشروع من ' + COMP + ': النوع والموقع والمدة وتاريخ الإنجاز ومعرض الصور الكامل للأعمال المنجزة.',
    'Project details and image gallery from Taameer Plus Contracting LLC, an approved G+4 general contractor in Dubai.':
        'تفاصيل المشروع ومعرض الصور من ' + COMP + '، مقاول عام معتمد G+4 في دبي.',
    'View all projects': 'عرض جميع المشاريع', 'Project details': 'تفاصيل المشروع', '3D Visualization.': 'تصور ثلاثي الأبعاد.',
    'These images are 3D visualizations of the project, not photographs of the finished building.': 'هذه الصور تصوّرات ثلاثية الأبعاد للمشروع، وليست صوراً فوتوغرافية للمبنى بعد اكتماله.',
    'Gallery': 'المعرض', 'Project images': 'صور المشروع', 'Transformation': 'التحوّل', 'Before and after': 'قبل وبعد',
    'Client feedback': 'رأي العميل', 'Read the letter': 'اقرأ الخطاب', 'More projects': 'مزيد من المشاريع',
    'Previous project': 'المشروع السابق', 'Next project': 'المشروع التالي', 'Keep exploring': 'واصل الاستكشاف', 'Related projects': 'مشاريع ذات صلة',

    # ---------- Projects ----------
    'Projects — Taameer Plus Contracting LLC': 'مشاريعنا — ' + COMP,
    'Browse the Taameer Plus portfolio: construction, renovation and decoration, fit-out and landscaping projects delivered across Dubai and Abu Dhabi.':
        'تصفّح سجل أعمال تعمير بلس: مشاريع الإنشاءات والتجديد والديكور والتشطيبات الداخلية وتنسيق الحدائق المنجزة في أنحاء دبي وأبوظبي.',
    'Villas, offices, shops and landscapes delivered across Dubai and Abu Dhabi. Filter by construction, renovation and decoration, fit-out or landscaping.':
        'فلل ومكاتب ومتاجر ومساحات خارجية منجزة في أنحاء دبي وأبوظبي. صفّ المشاريع حسب الإنشاءات أو التجديد والديكور أو التشطيبات الداخلية أو تنسيق الحدائق.',
    'Our Projects': 'مشاريعنا', 'Filter projects by type': 'تصفية المشاريع حسب النوع', 'All': 'الكل',
    'Renovation & Decoration': 'التجديد والديكور', 'Fit-out': 'التشطيبات الداخلية', 'Landscaping': 'تنسيق الحدائق والمساحات الخارجية',
    'Projects load from the portfolio data. Serve the site with a local server to see them.': 'تُحمَّل المشاريع من بيانات سجل الأعمال. شغّل الموقع عبر خادم محلي لعرضها.',
    'No projects of this type yet.': 'لا توجد مشاريع من هذا النوع بعد.',

    # ---------- Services ----------
    'Our Services — Taameer Plus Contracting LLC': 'خدماتنا — ' + COMP,
    'Construction, design & build, decoration and fit-out, renovation, maintenance and turnkey projects by Taameer Plus, a pioneer general contractor in the UAE. See related projects and our wall cladding showcase.':
        'الإنشاءات، والتصميم والتنفيذ، والديكور والتشطيبات الداخلية، والتجديد، والصيانة، ومشاريع تسليم المفتاح من تعمير بلس، مقاول عام رائد في الإمارات. اطلع على المشاريع ذات الصلة ومعرض تكسية الجدران.',
    'A pioneer general contractor in the UAE delivering construction solutions in a professional and cost-effective manner.':
        'مقاول عام رائد في الإمارات يقدّم حلولاً إنشائية باحترافية وبتكلفة مجدية.',
    'Our services': 'خدماتنا',
    'Taameer Plus is a pioneer general contractor in the United Arab Emirates, delivering construction solutions in a professional and cost-effective manner.':
        'تعمير بلس مقاول عام رائد في دولة الإمارات العربية المتحدة، يقدّم حلولاً إنشائية باحترافية وبتكلفة مجدية.',
    'Services on this page': 'الخدمات في هذه الصفحة',
    'Service 01': 'الخدمة 01', 'Service 02': 'الخدمة 02', 'Service 03': 'الخدمة 03', 'Service 04': 'الخدمة 04', 'Service 05': 'الخدمة 05', 'Service 06': 'الخدمة 06',
    'Browse our construction work on the': 'تصفّح أعمالنا الإنشائية في',
    'See the wall cladding showcase': 'اطلع على معرض تكسية الجدران',
    'Browse our fit-out and landscaping work on the': 'تصفّح أعمالنا في التشطيبات الداخلية وتنسيق الحدائق في',
    'Browse our renovation & decoration work on the': 'تصفّح أعمالنا في التجديد والديكور في',
    'View construction projects': 'عرض المشاريع الإنشائية',
    'Showcase': 'معرض أعمال', 'Wall cladding': 'تكسية الجدران',
    'Wall cladding for multiple projects. Designed and executed by the Taameer Plus team.': 'أعمال تكسية الجدران لعدة مشاريع، صمّمها ونفّذها فريق تعمير بلس.',
    'Living room wall with vertical slat cladding, floating shelf and a wall-mounted TV': 'جدار غرفة معيشة بتكسية من الشرائح العمودية ورف عائم وتلفاز مثبّت على الجدار',
    'Timber-effect wall cladding with a bar-chart feature logo in an office reception': 'تكسية جدران بمظهر الخشب مع شعار بتصميم المخطط الشريطي في استقبال مكتب',
    'Floor-to-ceiling vertical timber slat partition in an open-plan office': 'فاصل من الشرائح الخشبية العمودية من الأرضية إلى السقف في مكتب مفتوح',
    'Slatted timber wall panel behind a wall-mounted TV and desk in a with a desk and chair': 'لوح جداري من الشرائح الخشبية خلف تلفاز مثبّت على الجدار ومكتب وكرسي',
    'Geometric dark wall cladding with LED strip lighting in an office room': 'تكسية جدران داكنة بنقوش هندسية مع إضاءة LED شريطية في غرفة مكتب',
    'Vertical dark timber slat doors with a gold geometric emblem in an office': 'أبواب من شرائح خشبية داكنة عمودية بشعار هندسي ذهبي في مكتب',

    # ---------- Testimonials ----------
    'Testimonials — Taameer Plus Contracting LLC': 'آراء العملاء — ' + COMP,
    'Letters of appreciation from Atlas Copco, Bella Cure Beauty Lounge, TODAY Engineering Consultants and Jan’s Noodles Restaurant, with the original signed letters.':
        'خطابات شكر وتقدير من Atlas Copco وBella Cure Beauty Lounge وTODAY Engineering Consultants ومطعم Jan’s Noodles، مع الخطابات الأصلية الموقّعة.',
    'Letters of appreciation — Taameer Plus Contracting LLC': 'خطابات الشكر والتقدير — ' + COMP,
    'Read what clients and consultants say about working with Taameer Plus, and open the original signed letters.': 'اقرأ ما يقوله العملاء والاستشاريون عن تجربة العمل مع تعمير بلس، وافتح الخطابات الأصلية الموقّعة.',
    'Client endorsements ': 'شهادات العملاء',
    'Words from the clients and consultants we have worked with, together with the original signed letters.': 'كلمات من العملاء والاستشاريين الذين عملنا معهم، إلى جانب الخطابات الأصلية الموقّعة.',
    'Open the original letter from Atlas Copco': 'افتح الخطاب الأصلي من Atlas Copco',
    'Original letter of appreciation from Atlas Copco': 'الخطاب الأصلي للشكر والتقدير من Atlas Copco',
    'View original letter': 'عرض الخطاب الأصلي', 'Letter of appreciation': 'خطاب شكر وتقدير',
    '30 August 2023': '30 أغسطس 2023', 'Nicole Rowe': 'نيكول رو',
    'Regional Human Resources Manager, Power Technique': 'مديرة الموارد البشرية الإقليمية، Power Technique',
    'View the project: Renovation & Decoration of Atlas Copco Headquarters': 'عرض المشروع: تجديد وديكور المقر الرئيسي لشركة Atlas Copco',
    'Open the original letter from Bella Cure Beauty Lounge': 'افتح الخطاب الأصلي من Bella Cure Beauty Lounge',
    'Original letter of appreciation from Bella Cure Beauty Lounge': 'الخطاب الأصلي للشكر والتقدير من Bella Cure Beauty Lounge',
    'November 2022': 'نوفمبر 2022', 'Maitha Ahli': 'ميثاء الأهلي', 'Owner': 'مالكة Bella Cure Beauty Lounge',
    'View the project: Fit-out of Ladies Beauty Lounge & Spa': 'عرض المشروع: تشطيبات داخلية لصالون تجميل وسبا نسائي',
    'Open the original letter from TODAY Engineering Consultants': 'افتح الخطاب الأصلي من TODAY Engineering Consultants',
    'Original letter of appreciation from TODAY Engineering Consultants': 'الخطاب الأصلي للشكر والتقدير من TODAY Engineering Consultants',
    '27 December 2022': '27 ديسمبر 2022', 'Abdulla Al Zaabi': 'عبدالله الزعابي',
    'Open the original letter from Jan’s Noodles Restaurant': 'افتح الخطاب الأصلي من مطعم Jan’s Noodles',
    'Original letter of appreciation from Jan’s Noodles Restaurant': 'الخطاب الأصلي للشكر والتقدير من مطعم Jan’s Noodles',
    'Jan’s Noodles Restaurant': 'مطعم Jan’s Noodles',
    'Letter of appreciation from Jan’s Noodles Restaurant (thumbnail)': 'خطاب شكر من مطعم Jan’s Noodles (صورة مصغّرة)',
}
