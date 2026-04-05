import dotenv from 'dotenv';
import { connectDB, Sheet, Row } from './db.js';

dotenv.config();

async function seedSheets() {
  await connectDB();

  /* ═══════════════════════════════════════════
     1. CLOTHING SHEET — K.G.T. Uniforms
     ═══════════════════════════════════════════ */
  const clothingSheet = await Sheet.findOne({ name: 'Clothing' });
  if (clothingSheet) {
    await Row.deleteMany({ sheetId: clothingSheet._id });
    await Sheet.findByIdAndUpdate(clothingSheet._id, {
      name: 'K.G.T. Uniforms',
      columns: [
        { key: 'category', label: 'Category', type: 'text', width: 160 },
        { key: 'agents_item', label: 'Agents (Item)', type: 'text', width: 100 },
        { key: 'agents_tex', label: 'Agents (Textures)', type: 'text', width: 110 },
        { key: 'senior_item', label: 'Senior Agents (Item)', type: 'text', width: 120 },
        { key: 'senior_tex', label: 'Senior Agents (Textures)', type: 'text', width: 130 },
        { key: 'officers_item', label: 'Officers (Item)', type: 'text', width: 110 },
        { key: 'officers_tex', label: 'Officers (Textures)', type: 'text', width: 120 },
        { key: 'doc_item', label: 'D.O.C. (Item)', type: 'text', width: 110 },
        { key: 'doc_tex', label: 'D.O.C. (Textures)', type: 'text', width: 110 }
      ],
      sections: [{ title: 'K.G.T. Uniforms', order: 0 }]
    });

    const clothingRows = [
      { category: 'Masks', agents_item: '169', agents_tex: '13', senior_item: '169', senior_tex: '13', officers_item: '169', officers_tex: '13', doc_item: '169', doc_tex: '13' },
      { category: 'Scarf & Chains', agents_item: '8', agents_tex: '0', senior_item: '8', senior_tex: '0', officers_item: '8', officers_tex: '0', doc_item: '8', doc_tex: '0' },
      { category: 'Jackets', agents_item: '990', agents_tex: '5', senior_item: '991', senior_tex: '5', officers_item: '989', officers_tex: '5', doc_item: '990', doc_tex: '5' },
      { category: 'Shirts', agents_item: '237', agents_tex: '0', senior_item: '237', senior_tex: '0', officers_item: '237', officers_tex: '0', doc_item: '237', doc_tex: '0' },
      { category: 'Body Armor', agents_item: '27', agents_tex: '9', senior_item: '27', senior_tex: '9', officers_item: '27', officers_tex: '9', doc_item: '27', doc_tex: '9' },
      { category: 'Hands', agents_item: '44', agents_tex: '0', senior_item: '80', senior_tex: '0', officers_item: '44', officers_tex: '0', doc_item: '44', doc_tex: '0' },
      { category: 'Legs', agents_item: '430', agents_tex: '0', senior_item: '430', senior_tex: '0', officers_item: '430', officers_tex: '0', doc_item: '430', doc_tex: '0' },
      { category: 'Shoes', agents_item: '25', agents_tex: '0', senior_item: '25', senior_tex: '0', officers_item: '25', officers_tex: '0', doc_item: '25', doc_tex: '0' },
      { category: 'Hats & Helmets', agents_item: '117', agents_tex: '0', senior_item: '117', senior_tex: '0', officers_item: '117', officers_tex: '0', doc_item: '117', doc_tex: '0' },
      { category: 'Glasses', agents_item: '12', agents_tex: '9', senior_item: '12', senior_tex: '9', officers_item: '12', officers_tex: '9', doc_item: '12', doc_tex: '9' }
    ];

    for (let i = 0; i < clothingRows.length; i++) {
      await Row.create({ sheetId: clothingSheet._id, section: 'K.G.T. Uniforms', order: i, data: clothingRows[i] });
    }
    console.log('✅ Clothing sheet updated');
  }

  /* ═══════════════════════════════════════════
     2. RADIO PROTOCOLS SHEET
     ═══════════════════════════════════════════ */
  const radioSheet = await Sheet.findOne({ name: 'Radio Protocols' });
  if (radioSheet) {
    await Row.deleteMany({ sheetId: radioSheet._id });
    await Sheet.findByIdAndUpdate(radioSheet._id, {
      name: 'Radio Protocols',
      columns: [
        { key: 'code', label: 'الرمز / Code', type: 'text', width: 100 },
        { key: 'pronunciation', label: 'طريقة النطق', type: 'text', width: 160 },
        { key: 'abbreviation', label: 'الاختصار', type: 'text', width: 200 },
        { key: 'example', label: 'مثال', type: 'text', width: 350 }
      ],
      sections: [
        { title: 'CODES 0', order: 0 },
        { title: 'CODES', order: 1 },
        { title: 'ETC. Codes', order: 2 },
        { title: 'Codes 10', order: 3 }
      ]
    });

    /* CODES 0 */
    const codes0 = [
      { code: '0-1', pronunciation: 'زيرو-ون', abbreviation: 'استدعاء او تسجيل/كروب حوادث', example: 'قيوم { أو } سيتاب { } عند المنطقة/المنادي' },
      { code: '0-2', pronunciation: 'زيرو-تو', abbreviation: 'الاشارة والجهة', example: '{ } سيتاب { } ديركشن { }' },
      { code: '0-3', pronunciation: 'زيرو-ثري', abbreviation: 'التأكد من اشارة البريدج', example: '{ } سيتاب { }' },
      { code: '0-4', pronunciation: 'زيرو-فور', abbreviation: 'المقطع الاتي', example: '{ } أتو { } ديوتيز { }' },
      { code: '0-5', pronunciation: 'زيرو-فايف', abbreviation: 'مشكوور', example: 'قيوم { أو } خالد { } عامل مع حالة المقاوليات' },
      { code: '0-6', pronunciation: 'زيرو-سكس', abbreviation: 'كو الشع', example: '{ } أتو { } سيستم { }' },
      { code: '0-7', pronunciation: 'زيرو-سفن', abbreviation: 'تسجيل خروج', example: '{ } أتو { } سيستم { }' },
      { code: '0-8', pronunciation: 'زيرو-إيت', abbreviation: 'تسجيل دخول', example: '{ } أتو { } سيستم { }' },
      { code: '0-9', pronunciation: 'زيرو-ناين', abbreviation: '-', example: '-' }
    ];

    for (let i = 0; i < codes0.length; i++) {
      await Row.create({ sheetId: radioSheet._id, section: 'CODES 0', order: i, data: codes0[i] });
    }

    /* CODES */
    const codes = [
      { code: 'CODE 1', pronunciation: 'كود-ون', abbreviation: 'استفسار أمني', example: 'قيوم { أو } سيتاب { } { كود1 }' },
      { code: 'CODE 2', pronunciation: 'كود-تون', abbreviation: 'اطفاء السفاير', example: '----------------' },
      { code: 'CODE 3', pronunciation: 'كود-تو', abbreviation: 'المساعد أمن وحدان', example: '----------------' },
      { code: 'CODE 4', pronunciation: 'كود-فور', abbreviation: 'حالي التحقق من السكان', example: 'قيوم { أو } سيتاب { }' },
      { code: 'CODE 5', pronunciation: 'كود-فايف', abbreviation: 'السلاح و المعدات', example: 'قيوم { دبل } { كست 7 } { كود5 }' },
      { code: 'CODE 6', pronunciation: '-', abbreviation: '-', example: '-' },
      { code: 'CODE 7', pronunciation: 'كود-سفن', abbreviation: 'فالتي أو مخر', example: 'قيوم { سيزابل } { كست 20 التحقق } { كود1 }' }
    ];

    for (let i = 0; i < codes.length; i++) {
      await Row.create({ sheetId: radioSheet._id, section: 'CODES', order: i, data: codes[i] });
    }

    /* ETC. Codes */
    const etcCodes = [
      { code: 'Requesting Transfer', pronunciation: 'ريكوستينغ ترانسفير', abbreviation: 'انتقال وحدة النقل', example: 'قيوم { أو } المستشفى { } Requesting Transfer { }' },
      { code: 'Request', pronunciation: 'ريكوست', abbreviation: '-', example: '{ Request } to last 10-5 { } قيوم { }' },
      { code: 'Responding', pronunciation: 'ريسبوندنغ تو', abbreviation: 'متوجه الى', example: '{ Responding } to last 10-5 { } أتو { } وحدة عموم الوحدات' },
      { code: 'Roll Call', pronunciation: 'رول كال', abbreviation: 'اصطفاف عسكري', example: 'قيوم { أو } يجب حضور { }' },
      { code: 'Respond to', pronunciation: 'ريسبوند تو', abbreviation: 'متوجه الى', example: 'قيوم { أتو } في حالة القوانين خلل الرادوي' },
      { code: 'Stand By', pronunciation: 'ستاند باي', abbreviation: 'في حالة القوانين خلل الراديو', example: '{ } أتو { }' },
      { code: 'Shot Fire', pronunciation: 'شوت فاير', abbreviation: 'اطلاق نار', example: 'قيوم { أتو } هاذا مسلح 1 { }' },
      { code: 'Agent Down', pronunciation: 'إيجنت داون', abbreviation: 'عنصر مسلح', example: 'قيوم { أتو } المنطقة { }' },
      { code: 'Badge Number', pronunciation: 'باج نمبر', abbreviation: 'بيانات', example: '-' },
      { code: 'Responding to', pronunciation: '-', abbreviation: '-', example: '-' }
    ];

    for (let i = 0; i < etcCodes.length; i++) {
      await Row.create({ sheetId: radioSheet._id, section: 'ETC. Codes', order: i, data: etcCodes[i] });
    }

    /* Codes 10 */
    const codes10 = [
      { code: '0 - 10', pronunciation: 'أتن-زيرو', abbreviation: 'تم الانتهاء من الحالة', example: 'قيوم { } كست 3 { } 10-3 { }' },
      { code: '1 - 10', pronunciation: 'أتن-ون', abbreviation: '-', example: '{ } + حالة { } المنادي حالة لتوضيح { أو } اول الكست 3 { } 10-1 { }' },
      { code: '2 - 10', pronunciation: 'أتن_تو', abbreviation: 'غير محدد', example: '-' },
      { code: '3 - 10', pronunciation: 'أتن_ثري', abbreviation: '-', example: '-' },
      { code: '4 - 10', pronunciation: '-', abbreviation: 'عام', example: '-' },
      { code: '10 - 10', pronunciation: 'أتن-تن الفورم', abbreviation: 'مطاردة عن الاقدام', example: '-' },
      { code: '20 - 10', pronunciation: 'أتن-تونتي', abbreviation: '-', example: '-' },
      { code: '33 - 10', pronunciation: 'أتن-توتل أتن', abbreviation: 'خاصة لأمن القائد سبادي & عاجل', example: '-' },
      { code: '10 - 10', pronunciation: 'أتن-أولي-كون', abbreviation: 'أولي كون', example: 'من { } أتو { } اماني 1 { } اجتياح 3 { } اجتياح 3-20' },
      { code: '21 - 10', pronunciation: 'توبل-تو', abbreviation: 'تداخل اطلاق نار', example: 'من { دبلت } أتو { } اماني 2 { } اجتياح 3-20' },
      { code: '22 - 10', pronunciation: 'أتن-ثري', abbreviation: 'اجتياح دورع', example: 'من { } أتو { } اماني { } اجتياح 3-20 الى { } يموومي' }
    ];

    for (let i = 0; i < codes10.length; i++) {
      await Row.create({ sheetId: radioSheet._id, section: 'Codes 10', order: i, data: codes10[i] });
    }

    console.log('✅ Radio Protocols sheet updated');
  }

  /* ═══════════════════════════════════════════
     3. A.O.P SHEET — Authorization of Power
     ═══════════════════════════════════════════ */
  const aopSheet = await Sheet.findOne({ name: 'A.O.P' });
  if (aopSheet) {
    await Row.deleteMany({ sheetId: aopSheet._id });
    await Sheet.findByIdAndUpdate(aopSheet._id, {
      name: 'A.O.P',
      columns: [
        { key: 'rank', label: 'الرتبة / Rank', type: 'text', width: 220 },
        { key: 'permission', label: 'الصلاحية / Permission', type: 'text', width: 700 }
      ],
      sections: [
        { title: 'Authorization of Power (A.O.P) - سلم الصلاحيات', order: 0 },
        { title: 'K.G.T. Command Office', order: 1 },
        { title: 'K.G.T. Officers', order: 2 },
        { title: 'K.G.T. S.A.C.', order: 3 },
        { title: 'A.S.A.C. ( Level 3 )', order: 4 },
        { title: 'Supervisory Special Agent ( Level 2 )', order: 5 },
        { title: 'ملاحظات هامة', order: 6 }
      ]
    });

    const aopRows = [
      /* General Rules */
      { section: 'Authorization of Power (A.O.P) - سلم الصلاحيات', order: 0, data: { rank: 'القانون بالاحمر', permission: 'اي خيار ملون بالاحمر يمر بأخذ الاذن او مناقشة Command Office وأعلى' } },
      { section: 'Authorization of Power (A.O.P) - سلم الصلاحيات', order: 1, data: { rank: 'القانون بالبرتقالي', permission: 'اي خيار ملون بالبرتقالي يمر بأخذ الاذن من المسؤول وما فوق' } },
      { section: 'Authorization of Power (A.O.P) - سلم الصلاحيات', order: 2, data: { rank: 'القانون بالابيض', permission: 'اي خيار ملون ابيض يمر بأخذ الاذن من A.S.A.C وما فوق' } },

      /* K.G.T. Command Office */
      { section: 'K.G.T. Command Office', order: 0, data: { rank: 'Command Office', permission: 'له كامل الصلاحيات بمنظمة الامن القومي' } },

      /* K.G.T. Officers */
      { section: 'K.G.T. Officers', order: 0, data: { rank: 'Officers', permission: 'اه كامل الصلاحيات الميدانية' } },

      /* K.G.T. S.A.C. */
      { section: 'K.G.T. S.A.C.', order: 0, data: { rank: 'S.A.C. - الصلاحية 1', permission: 'في حال تواجده يعتبر المسؤول الاول وفوق جميع الصناع بالميدان ، اه السلطة التكوينية واعبد أمره على كافة الصناع والمتاثر من فاطورهم الميدان' } },
      { section: 'K.G.T. S.A.C.', order: 1, data: { rank: 'S.A.C. - الصلاحية 2', permission: 'يحق له رفع اسم اي عميل غير مؤدي لمهامه بالشكل الصحيح للشؤون' } },
      { section: 'K.G.T. S.A.C.', order: 2, data: { rank: 'S.A.C. - الصلاحية 3', permission: 'يحق له اقامة RollCall ( اصطفاف عسكري ) وتفتيش جميع العساكر والتأكد من عنادهم العسكري ورفع اسم المخالفين للشؤون' } },

      /* A.S.A.C. ( Level 3 ) */
      { section: 'A.S.A.C. ( Level 3 )', order: 0, data: { rank: 'A.S.A.C. - الصلاحية 1', permission: 'اه الاحية بالتدخل فالاحداث الجنائية التالية والتصرف الكامل فيها بشرط ان كان المسؤول لا يجيد التصرف وبنك الاحيه بالاستلم عنه' } },
      { section: 'A.S.A.C. ( Level 3 )', order: 1, data: { rank: 'A.S.A.C. - الصلاحية 2', permission: 'اه اللاحة رفع اسم اي فرد للشؤون وطلب خصم 15 نقاطة تأديبيه ، يحق اه اكثر من ثلاث ونزهم لي عسكري الأكاديمية التعليد الراعيين او اللعربه' } },
      { section: 'A.S.A.C. ( Level 3 )', order: 2, data: { rank: 'A.S.A.C. - الصلاحية 3', permission: 'يحق له اقامة حملات ميدانية وجمع الوحدات وتمشيط الأماكن المشبوهة * يجب عليه رفع تقرير مفصل للحالة بعد الانتهاءنا *' } },

      /* Supervisory Special Agent ( Level 2 ) */
      { section: 'Supervisory Special Agent ( Level 2 )', order: 0, data: { rank: 'Level 2 - الصلاحية 1', permission: 'يحق له اقامة اجتماع مبسط بغرفة الاجتماعات والتحدث والشرح عن بعض سلبيات الميدان وطرح حلول لها' } },
      { section: 'Supervisory Special Agent ( Level 2 )', order: 1, data: { rank: 'Level 2 - الصلاحية 2', permission: 'يحق اه رفع ملاحظات على العملات الجدد ورفع تقارير لمسؤولين الأكاديمية' } },
      { section: 'Supervisory Special Agent ( Level 2 )', order: 2, data: { rank: 'Level 2 - الصلاحية 3', permission: 'له الحق بصرف وثق مؤقت بحالة جنائيه فقط' } },

      /* Notes */
      { section: 'ملاحظات هامة', order: 0, data: { rank: 'ملاحظة', permission: 'في حال الرتبة الي اقل منك عندهما صلاحيات فا هي ايضا لشملك ( فعل التحديث ونزيمه ر والفتوي )' } }
    ];

    for (const row of aopRows) {
      await Row.create({ sheetId: aopSheet._id, section: row.section, order: row.order, data: row.data });
    }

    console.log('✅ A.O.P sheet updated');
  }

  /* ═══════════════════════════════════════════
     4. PROHIBITED ITEMS SHEET
     ═══════════════════════════════════════════ */
  const prohibitedSheet = await Sheet.findOne({ name: 'Prohibited Items' });
  if (prohibitedSheet) {
    await Row.deleteMany({ sheetId: prohibitedSheet._id });
    await Sheet.findByIdAndUpdate(prohibitedSheet._id, {
      name: 'Prohibited Items',
      columns: [
        { key: 'itemName', label: 'اسم الغرض', type: 'text', width: 200 },
        { key: 'legal', label: 'قانوني ؟', type: 'dropdown', options: ['غير قانوني', 'يستعمل بالقانون', 'قانوني'], width: 130 },
        { key: 'chargeName', label: 'اسم التهمة / المخالفة', type: 'text', width: 220 },
        { key: 'confiscation', label: 'متى يتم سحبه', type: 'text', width: 300 }
      ],
      sections: [{ title: 'الاغراض المحظورة', order: 0 }]
    });

    const prohibitedRows = [
      { itemName: 'السلاح الخفيف بانواعه', legal: 'غير قانوني', chargeName: 'حيازة سلاح', confiscation: 'يسحب فوراً' },
      { itemName: 'الكلبشات', legal: 'غير قانوني', chargeName: 'معدات غير قانونية', confiscation: 'يسحب فوراً' },
      { itemName: 'المشاط', legal: 'غير قانوني', chargeName: 'رصاص سلاح غير قانوني', confiscation: 'يسحب فوراً' },
      { itemName: 'الدروع', legal: 'يستعمل بالقانون', chargeName: '-', confiscation: 'في حال تم القاء القبض على الشخص في حالة طلق نار فقط' },
      { itemName: 'السلاح الابيض بانواعه', legal: 'يستعمل بالقانون', chargeName: 'الاعتداء بسلاح أبيض', confiscation: 'يتم سحبه واعتباره كسلاح في حال تم استعماله كسلاح' },
      { itemName: 'المسروقات بانواعها', legal: 'غير قانوني', chargeName: 'حيازة مسروقات', confiscation: 'في حال تم القاء القبض على في حالة جنائية او ليس لديه سبب لحيازتها' },
      { itemName: 'ادوات السرقات بانواعها', legal: 'غير قانوني', chargeName: 'معدات غير قانونية', confiscation: 'يتم سحبه في حال تم استعماله بشكل غير قانوني مثل السرقات' }
    ];

    for (let i = 0; i < prohibitedRows.length; i++) {
      await Row.create({ sheetId: prohibitedSheet._id, section: 'الاغراض المحظورة', order: i, data: prohibitedRows[i] });
    }

    console.log('✅ Prohibited Items sheet updated');
  }

  console.log('\n🎉 All sheets updated successfully!');
  process.exit(0);
}

seedSheets().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
