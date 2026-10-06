"""Fills every empty "ar" value in data/*.json from the translation memory below (English string -> Arabic).

Text-level replacement, so the JSON layout/formatting of the files is untouched. Re-runnable: only empty "ar" values are filled.
Source of truth for terms: docs/glossary-ar.md. Items marked WARN in docs/ar-copy-review.md need client confirmation.
Usage: python scripts/ar_data.py [--check]   (--check only lists English strings that still have no Arabic)
"""
import json, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDIT = {'projects.json', 'site.json', 'team.json', 'testimonials.json'}

COMP = 'تعمير بلس للمقاولات ش.ذ.م.م'
NOTE_TEAM = 'نفّذها أعضاء من فريق تعمير بلس (خبرة سابقة، وليست من مشاريع الشركة).'
EMAAR = 'من EMAAR'

TR = {
    # ---- company / contact / nav / stats ----
    'Taameer Plus Contracting LLC': COMP,
    'Construct A Better Tomorrow': 'نبني غداً أفضل',
    'A leading contracting, design, fit-out and technical services provider based in Dubai, UAE — building trust before concrete since 2015.':
        'شركة رائدة في المقاولات والتصميم والتشطيبات الداخلية والخدمات الفنية، مقرها دبي، الإمارات — نبني الثقة قبل الخرسانة منذ عام 2015.',
    '© 2026 Taameer Plus Contracting LLC. All rights reserved.': '© 2026 ' + COMP + '. جميع الحقوق محفوظة.',
    'Sky Business Building, Office M30, Festival City, Dubai, UAE': 'مبنى سكاي بزنس، مكتب M30، دبي فستيفال سيتي، دبي، الإمارات العربية المتحدة',
    'Home': 'الرئيسية', 'About': 'من نحن', 'Services': 'خدماتنا', 'Projects': 'مشاريعنا', 'Testimonials': 'آراء العملاء', 'Contact': 'اتصل بنا',
    'Established in Dubai': 'تأسست في دبي', 'Approved Contractor': 'مقاول معتمد', 'Delivered Projects': 'مشاريع منجزة',

    # ---- why us ----
    'Approved G+4 Contractor': 'مقاول معتمد G+4',
    'Licensed by the Government of Dubai for multi-story residential and commercial structural developments.':
        'مرخّصة من حكومة دبي لتنفيذ المشاريع الإنشائية السكنية والتجارية متعددة الطوابق.',
    'Turnkey & Value Engineering': 'تسليم المفتاح والهندسة القيمية',
    'Design-Build contracts covering structural, architectural, and electromechanical works under one roof, saving cost and time.':
        'عقود تصميم وتنفيذ تشمل الأعمال الإنشائية والمعمارية والكهروميكانيكية تحت مظلة واحدة، لتوفير التكلفة والوقت.',
    'Uncompromising Quality': 'جودة لا تقبل المساومة',
    'Rigorous quality control, trustworthy relations with private and government agencies, and reliable delivery timelines.':
        'رقابة صارمة على الجودة، وعلاقات موثوقة مع الجهات الخاصة والحكومية، والتزام بمواعيد التسليم.',

    # ---- services ----
    'Construction': 'الإنشاءات',
    'Full-scale construction ranging from G+1 luxury villas to G+4 residential and commercial buildings, with complete structural integrity.':
        'أعمال إنشائية متكاملة، من الفلل الفاخرة G+1 إلى المباني السكنية والتجارية G+4، بسلامة إنشائية كاملة.',
    'As an approved G+4 contractor, Taameer Plus has successfully completed many turnkey projects, including the structure and full fit-out of villas and service blocks, with remarkable quality.':
        'بصفتها مقاولاً معتمداً من فئة G+4، أنجزت تعمير بلس بنجاح العديد من مشاريع تسليم المفتاح، بما في ذلك الهيكل الإنشائي والتشطيبات الداخلية الكاملة للفلل والملاحق الخدمية، بجودة متميزة.',
    'Design & Build': 'التصميم والتنفيذ',
    'Direct single-contract solutions covering structural, architectural, and electromechanical works, evaluated for cost and buildability by one team.':
        'حلول بعقد واحد مباشر تغطي الأعمال الإنشائية والمعمارية والكهروميكانيكية، يقيّم فريق واحد تكلفتها وقابليتها للتنفيذ.',
    'Taameer Plus handles Design-Build projects by entering into a direct contract with the client to provide all design aspects related to structural, architectural and electromechanical works. The team evaluates alternative materials and methods efficiently and accurately, and value engineering and constructability are applied continuously and more effectively when designers and Taameer Plus work together as one team throughout the design process. These steps ultimately save the owner significant amounts of money and time.':
        'تتولى تعمير بلس مشاريع التصميم والتنفيذ بإبرام عقد مباشر مع العميل لتقديم جميع جوانب التصميم المتعلقة بالأعمال الإنشائية والمعمارية والكهروميكانيكية. ويقيّم الفريق المواد والأساليب البديلة بكفاءة ودقة، وتُطبَّق الهندسة القيمية وقابلية التنفيذ باستمرار وبفاعلية أكبر عندما يعمل المصممون وتعمير بلس كفريق واحد طوال مرحلة التصميم. وتوفّر هذه الخطوات للمالك في النهاية مبالغ كبيرة من المال والوقت.',
    'Decoration & Fit-out': 'الديكور والتشطيبات الداخلية',
    'Premium corporate, retail, hospitality, and residential fit-out and decoration, including custom wall cladding and joinery through our carpentry division.':
        'تشطيبات داخلية وديكورات راقية للمكاتب والمتاجر وقطاع الضيافة والمساكن، بما في ذلك تكسية الجدران والأعمال الخشبية المخصصة عبر قسم النجارة لدينا.',
    'Renovation': 'التجديد',
    'Complete building and villa refurbishments, interior modernisations, and structural updates executed on schedule.':
        'تجديد كامل للمباني والفلل، وتحديث للأعمال الداخلية، وتعديلات إنشائية تُنفَّذ في موعدها.',
    'Maintenance': 'الصيانة',
    'Ongoing technical services, active maintenance, and facility support that keep structures in prime condition long after handover.':
        'خدمات فنية مستمرة وصيانة دورية ودعم للمرافق يُبقي المنشآت في أفضل حالاتها بعد التسليم بوقت طويل.',
    'Turnkey Projects': 'مشاريع تسليم المفتاح',
    'Experienced professionals handling all phases of construction — new build to renovation — coordinated with qualified subcontractors to meet deadlines.':
        'متخصصون ذوو خبرة يتولون جميع مراحل الإنشاء، من البناء الجديد إلى التجديد، بالتنسيق مع مقاولين من الباطن مؤهلين لالتزام المواعيد.',
    'Taameer Plus provides experienced and knowledgeable professionals to handle all phases of project construction. As a general contractor, we handle all types and volumes of projects, from new construction to renovations. Our project management team maintains full coordination throughout every phase with our field staff and qualified subcontractors, delivering projects on schedule with the highest standards of safety and quality to ensure deadlines are met.':
        'توفّر تعمير بلس متخصصين ذوي خبرة ومعرفة لإدارة جميع مراحل إنشاء المشروع. وبصفتنا مقاولاً عاماً، نتولى مختلف أنواع المشاريع وأحجامها، من الإنشاءات الجديدة إلى أعمال التجديد. ويحافظ فريق إدارة المشاريع لدينا على التنسيق الكامل في كل مرحلة مع فرقنا الميدانية ومقاولينا من الباطن المؤهلين، لتسليم المشاريع في موعدها وفق أعلى معايير السلامة والجودة، بما يضمن الالتزام بالمواعيد النهائية.',

    # ---- licenses ----
    'Taameer Plus Carpentry LLC': 'نجارة تعمير بلس ش.ذ.م.م',
    'Limited Liability Company (LLC)': 'شركة ذات مسؤولية محدودة (ش.ذ.م.م)',
    'Building Contracting': 'مقاولات المباني',
    'Decoration Design & Implementation': 'تصميم وتنفيذ الديكور',
    'Building Maintenance': 'صيانة المباني',
    'Carpentry': 'النجارة',
    'Active': 'سارية',

    # ---- project types ----
    'Renovation & Decoration': 'التجديد والديكور',
    'Fit-out': 'التشطيبات الداخلية',
    'Landscaping': 'تنسيق الحدائق والمساحات الخارجية',
    'Showcase': 'معرض أعمال',

    # ---- project titles ----
    'Private Villa Renovation': 'تجديد فيلا خاصة',
    'Proposed G Residential Villa': 'فيلا سكنية مقترحة G',
    'Fit-out of KF INC Headquarters Office': 'تشطيبات داخلية لمكتب المقر الرئيسي لشركة KF INC',
    'Renovation & Decoration of G+2 Triplex Villa': 'تجديد وديكور فيلا تريبلكس G+2',
    'Renovation & Decoration of Atlas Copco Headquarters': 'تجديد وديكور المقر الرئيسي لشركة Atlas Copco',
    'Construction of G+2 Private Villa': 'إنشاء فيلا خاصة G+2',
    'Full Renovation of Residential & Retail Building (G+4P+H+22+R)': 'تجديد شامل لمبنى سكني وتجاري (G+4P+H+22+R)',
    'Proposed G+1 Residential Villas': 'فلل سكنية مقترحة G+1',
    'Construction & Fit-out of Private Gym': 'إنشاء وتشطيبات داخلية لصالة رياضية خاصة',
    'Renovation & Decoration of Private Villa': 'تجديد وديكور فيلا خاصة',
    'Perfume Shop Fit-out & Decoration': 'تشطيبات داخلية وديكور لمتجر عطور',
    'Renovation & Decoration of G+1 Private Villa': 'تجديد وديكور فيلا خاصة G+1',
    'Renovation & Decoration of Dress Shop (Faiz Couture)': 'تجديد وديكور متجر فساتين (Faiz Couture)',
    'Renovation & Decoration of Residential Flat': 'تجديد وديكور شقة سكنية',
    'Fit-out & Decoration of Private Villa': 'تشطيبات داخلية وديكور فيلا خاصة',
    'Fit-out of Ladies Beauty Lounge & Spa': 'تشطيبات داخلية لصالون تجميل وسبا نسائي',
    'Fit-out of Thai Restaurant': 'تشطيبات داخلية لمطعم تايلندي',
    'Fit-out & Landscaping for Private Villa': 'تشطيبات داخلية وتنسيق حدائق لفيلا خاصة',
    'Renovation of Private Villa': 'تجديد فيلا خاصة',
    'Service Blocks & Extensions': 'الملاحق الخدمية والتوسعات',
    'Wall Cladding': 'تكسية الجدران',
    # ---- project descriptions ----
    'As an approved G+4 contractor, Taameer Plus has completed many turnkey projects, including structure and full fit-out for villas and service blocks, with remarkable quality.':
        'بصفتها مقاولاً معتمداً من فئة G+4، أنجزت تعمير بلس العديد من مشاريع تسليم المفتاح، بما في ذلك الهيكل الإنشائي والتشطيبات الداخلية الكاملة للفلل والملاحق الخدمية، بجودة متميزة.',
    'Wall cladding for multiple projects, designed and executed by the Taameer Plus team.':
        'أعمال تكسية الجدران لعدة مشاريع، صمّمها ونفّذها فريق تعمير بلس.',

    # ---- project locations ----
    'Palm Jumeirah, UAE': 'نخلة جميرا، الإمارات',
    'Dubai, UAE': 'دبي، الإمارات',
    'Al Saadiyat Island, Abu Dhabi': 'جزيرة السعديات، أبوظبي',
    'Dubai Marina, Dubai': 'دبي مارينا، دبي',
    'Gold & Diamond Park by EMAAR, Dubai': 'غولد آند دايموند بارك ' + EMAAR + '، دبي',
    'Al Warqa 1st, Dubai': 'الورقاء 1، دبي',
    'JVC, Al Barsha 4th, Dubai': 'قرية جميرا الدائرية (JVC)، البرشاء 4، دبي',
    'Al Awir 1, Dubai': 'العوير 1، دبي',
    'Wadi Alshabak, Dubai': 'وادي الشباك، دبي',
    'Marina, Abu Dhabi': 'المارينا، أبوظبي',
    'Al Warqa 4th, Dubai': 'الورقاء 4، دبي',
    'Al Barsha 1st, Dubai': 'البرشاء 1، دبي',
    'MBR City by EMAAR, Dubai': 'مدينة محمد بن راشد ' + EMAAR + '، دبي',
    'Al Bustan Shopping Centre, Dubai': 'مركز البستان للتسوق، دبي',
    'Villa #5, Al Twar 2, Dubai': 'فيلا رقم 5، الطوار 2، دبي',
    'Souk Al Bahar by EMAAR, Dubai Mall, Dubai': 'سوق البحار ' + EMAAR + '، دبي مول، دبي',
    'Um Nahad, Dubai': 'أم نهد، دبي',
    'The 77 Hub Mall, Mirdif, Dubai': 'ذا 77 هب مول، مردف، دبي',
    'Muteena, Deira, Dubai': 'المطينة، ديرة، دبي',
    'Jumeirah Golf Estates by WASL, Dubai': 'عقارات جميرا للجولف من WASL، دبي',
    'DAMAC Hills by DAMAC, Dubai': 'داماك هيلز من DAMAC، دبي',
    'Multiple locations': 'مواقع متعددة',
    'Multiple projects': 'مشاريع متعددة',
    'Nadd Al Hamar, Dubai': 'ند الحمر، دبي',
    'Dubai Investment Park, Dubai': 'مجمع دبي للاستثمار، دبي',
    'Souq Al Kabeer, Dubai': 'سوق الكبير، دبي',

    # ---- project periods ----
    '7 Months': '7 أشهر', '8 Months': '8 أشهر', '10 Months': '10 أشهر', '12 Months': '12 شهراً', '13 Months': '13 شهراً',
    '35 Days': '35 يوماً', '40 Days': '40 يوماً', '60 Days': '60 يوماً', '90 Days': '90 يوماً', '100 Days': '100 يوم',
    '110 Days': '110 أيام', '120 Days': '120 يوماً', '135 Days': '135 يوماً', 'Multiple': 'متعددة',

    # ---- team experience (prior experience of team members) ----
    '2B+G+6+HC 4-Star Hotel': 'فندق 4 نجوم 2B+G+6+HC',
    'G+P+10 Typical + Gym + 2 Roof': 'G+P+10 طوابق متكررة + صالة رياضية + سطحان',
    'Dubai Investments Headquarters': 'المقر الرئيسي لشركة دبي للاستثمار',
    'G+M+5 Floors + Roof Shopping Mall / Residential': 'مركز تسوق / سكني G+M+5 طوابق + سطح',
    'Executed by members of the Taameer Plus team (prior experience, not a company project).': NOTE_TEAM,

    # ---- team ----
    'Taameer Plus is a very selective company when it comes to staff — we consider our employees the real treasure of our company.':
        'تنتقي تعمير بلس موظفيها بعناية فائقة، فنحن نعدّ العاملين لدينا الثروة الحقيقية للشركة.',
    'Over the years, Taameer Plus has built an experienced team of professional, creative and hard-working engineers, motivated to deliver projects with uncompromising quality, the best economical solution and the shortest time. Trustworthy relations are key to building good relationships with local private and government agencies.':
        'على مر السنين، كوّنت تعمير بلس فريقاً من المهندسين المحترفين المبدعين والمجتهدين، يحدوهم الدافع إلى تنفيذ المشاريع بجودة لا تقبل المساومة وبأفضل حل اقتصادي وأقصر مدة زمنية. وتُعدّ العلاقات الموثوقة أساساً لبناء علاقات جيدة مع الجهات المحلية الخاصة والحكومية.',
    'Eng. Mohannad Al Musleh': 'م. مهند المصلح', 'Eng. Rauof Al-Otaibi': 'م. رؤوف العتيبي', 'Eng. Mohammad Amer': 'م. محمد عامر',
    'General Manager': 'المدير العام', 'Business Development Manager': 'مدير تطوير الأعمال', 'Projects Manager': 'مدير المشاريع',
    'With extensive experience in the UAE’s construction and development sector, he has built strong expertise through senior roles with leading contracting companies in Dubai, contributing to the successful delivery of a diverse portfolio of prestigious projects.':
        'يتمتع بخبرة واسعة في قطاع الإنشاء والتطوير في دولة الإمارات، وقد بنى خبرة قوية من خلال مناصب عليا في شركات مقاولات رائدة في دبي، أسهم خلالها في تنفيذ مجموعة متنوعة من المشاريع المرموقة.',
    'With extensive experience in the UAE’s construction and development sector, he has built a strong background in business development and real estate, including five years in a Vice President role with a leading Dubai developer.':
        'يتمتع بخبرة واسعة في قطاع الإنشاء والتطوير في دولة الإمارات، وقد بنى خلفية قوية في تطوير الأعمال والعقارات، بما في ذلك خمس سنوات في منصب نائب الرئيس لدى مطوّر عقاري رائد في دبي.',
    'With extensive experience in the UAE construction sector, he has successfully managed a wide range of major projects, building a strong track record in project delivery, coordination, and execution.':
        'يتمتع بخبرة واسعة في قطاع الإنشاء في دولة الإمارات، وقد أدار بنجاح مجموعة واسعة من المشاريع الكبرى، وبنى سجلاً حافلاً في تسليم المشاريع وتنسيقها وتنفيذها.',

    # ---- testimonials (translations of third-party letters; labelled on the page) ----
    'They made very good recommendations during the design phase of the project and the communication from their team was very good. It was a pleasure working with your team.':
        'قدّموا توصيات ممتازة جداً خلال مرحلة تصميم المشروع، وكان التواصل مع فريقهم جيداً للغاية. وكان من دواعي سرورنا العمل مع فريقكم.',
    'Taameer Plus Contracting LLC team accomplished designing and constructing work for the beauty lounge successfully, and adhered professionally to project completion budget, schedule, and quality.':
        'أنجز فريق ' + COMP + ' أعمال تصميم صالون التجميل وتنفيذه بنجاح، والتزم باحترافية بميزانية إنجاز المشروع وجدوله الزمني ومعايير جودته.',
    'M/s Taameer Plus Contracting LLC have completed the entire works in accordance with the contract specifications and specified construction timeline, showing a satisfactory degree of proper planning, coordination, safety, and quality of workmanship.':
        'أنجزت شركة ' + COMP + ' جميع الأعمال وفق مواصفات العقد والجدول الزمني المحدد للإنشاء، وأظهرت درجة مرضية من التخطيط السليم والتنسيق والسلامة وجودة التنفيذ.',
    'Nicole Rowe': 'نيكول رو', 'Maitha Ahli': 'ميثاء الأهلي', 'Abdulla Al Zaabi': 'عبدالله الزعابي',
    'Regional Human Resources Manager, Power Technique': 'مديرة الموارد البشرية الإقليمية، Power Technique',
    'Owner': 'مالكة Bella Cure Beauty Lounge', 'Chairman': 'رئيس مجلس الإدارة',
    'Atlas Copco Services Middle East OMC': 'Atlas Copco Services Middle East OMC',
    'Bella Cure Beauty Lounge': 'Bella Cure Beauty Lounge',
    'TODAY Engineering Consultants': 'TODAY Engineering Consultants',
    "Jan's Noodles Restaurant": "مطعم Jan's Noodles",
}

PAIR = re.compile(r'("en":\s*)("(?:[^"\\]|\\.)*")(,\s*"ar":\s*)""')


def process(path, check):
    raw = open(path, encoding='utf-8').read()
    missing = []

    def sub(m):
        en = json.loads(m.group(2))
        if en == '':
            return m.group(0)
        ar = TR.get(en)
        if ar is None:
            missing.append(en)
            return m.group(0)
        return m.group(1) + m.group(2) + m.group(3) + json.dumps(ar, ensure_ascii=False)

    out = PAIR.sub(sub, raw)
    if not check and out != raw:
        open(path, 'w', encoding='utf-8', newline='').write(out)
    return missing, len(PAIR.findall(raw))


if __name__ == '__main__':
    check = '--check' in sys.argv
    for f in sorted(EDIT):
        missing, n = process(os.path.join(ROOT, 'data', f), check)
        print(f, 'empty ar before:', n, 'untranslated:', len(missing))
        for m in sorted(set(missing)):
            print('   MISSING:', m)
