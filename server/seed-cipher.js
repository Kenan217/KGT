import dotenv from 'dotenv';
import { connectDB, Sheet, Row } from './db.js';

dotenv.config();

async function seedCipher() {
  await connectDB();

  /* ═══════════════════════════════════════════
     CIPHER CODES SHEET — شفرات الاتصال
     EXTREMELY carefully read from reference image
     Shapes: ▲ △ ● ○ ■ □ ◆ ◇
     ═══════════════════════════════════════════ */

  const existing = await Sheet.findOne({ name: 'Cipher Codes' });
  if (existing) {
    await Row.deleteMany({ sheetId: existing._id });
    await Sheet.findByIdAndDelete(existing._id);
    console.log('🗑️  Old Cipher Codes sheet removed');
  }

  const count = await Sheet.countDocuments();

  const cipherSheet = await Sheet.create({
    name: 'Cipher Codes',
    order: count,
    columns: [
      { key: 'letter', label: 'الحرف / Letter', type: 'text', width: 120 },
      { key: 'cipher', label: 'الشفرة / Cipher', type: 'text', width: 250 }
    ],
    sections: [
      { title: 'الحروف — Letters (A-Z)', order: 0 },
      { title: 'الأرقام والشفرات — Numbers (0-9)', order: 1 }
    ]
  });

  /* ── Letters A-Z — Read from reference image ──
     Reference arrangement (column by column, left to right):
     Col1: A-F | Col2: G-L | Col3: M-R | Col4: S-X | Col5: Y-Z
  */
  const letters = [
    { letter: 'A', cipher: '▲●◆' },
    { letter: 'B', cipher: '●▲◆' },
    { letter: 'C', cipher: '■●▲' },
    { letter: 'D', cipher: '◆▲●' },
    { letter: 'E', cipher: '●■▲' },
    { letter: 'F', cipher: '▲◆●' },
    { letter: 'G', cipher: '■▲●' },
    { letter: 'H', cipher: '◆●■' },
    { letter: 'I', cipher: '▲▲●■' },
    { letter: 'J', cipher: '●●▲' },
    { letter: 'K', cipher: '■■▲' },
    { letter: 'L', cipher: '◆■●' },
    { letter: 'M', cipher: '▲■■' },
    { letter: 'N', cipher: '●●◆' },
    { letter: 'O', cipher: '■▲■' },
    { letter: 'P', cipher: '◆■▲' },
    { letter: 'Q', cipher: '▲●◆' },
    { letter: 'R', cipher: '▲▲■' },
    { letter: 'S', cipher: '▲◆■▲' },
    { letter: 'T', cipher: '●◆●' },
    { letter: 'U', cipher: '▲◆■' },
    { letter: 'V', cipher: '◆◆■' },
    { letter: 'W', cipher: '■◆●' },
    { letter: 'X', cipher: '■◆●' },
    { letter: 'Y', cipher: '▲▲◆' },
    { letter: 'Z', cipher: '◆●●' }
  ];

  for (let i = 0; i < letters.length; i++) {
    await Row.create({
      sheetId: cipherSheet._id,
      section: 'الحروف — Letters (A-Z)',
      order: i,
      data: letters[i]
    });
  }

  /* ── Numbers 0-9 ── */
  const numbers = [
    { letter: '0', cipher: '■●' },
    { letter: '1', cipher: '▲●' },
    { letter: '2', cipher: '●■' },
    { letter: '3', cipher: '▲▲' },
    { letter: '4', cipher: '◆■' },
    { letter: '5', cipher: '●◆' },
    { letter: '6', cipher: '■▲' },
    { letter: '7', cipher: '◆◆' },
    { letter: '8', cipher: '▲◆' },
    { letter: '9', cipher: '◆▲' }
  ];

  for (let i = 0; i < numbers.length; i++) {
    await Row.create({
      sheetId: cipherSheet._id,
      section: 'الأرقام والشفرات — Numbers (0-9)',
      order: i,
      data: numbers[i]
    });
  }

  console.log('✅ Cipher Codes sheet created with', letters.length + numbers.length, 'rows');
  console.log('🎉 Done!');
  process.exit(0);
}

seedCipher().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
