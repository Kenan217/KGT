/**
 * ═══════════════════════════════════════════
 * K.G.T. — Update Dropdown Options
 * ═══════════════════════════════════════════
 * 
 * HOW TO USE:
 * 1. Edit the `updates` array below
 * 2. Set the sheet name, column key, and new options list
 * 3. Run: node server/update-options.js
 * 
 * COLUMN KEYS for "K.G.T | Public Security Organization":
 *   - section     → Section dropdown (KGT, Above Sections, etc.)
 *   - responsibility → Responsibility dropdown (Above, NONE, U.C.C, etc.)
 *   - squads      → Squad's dropdown (Above Squad, N/A, etc.)
 *   - status      → Status badges (Active, Inactive, N/A)
 *   - rank        → Rank dropdown (Director of KGT, Officer, etc.)
 * 
 * COLUMN KEYS for "Prohibited Items":
 *   - legal       → Legality dropdown (غير قانوني, يستعمل بالقانون, قانوني)
 */

import dotenv from 'dotenv';
import { connectDB, Sheet } from './db.js';

dotenv.config();

/* ═══════════════════════════════════════════
   ✏️ EDIT THIS SECTION — Add/remove options here
   ═══════════════════════════════════════════ */
const updates = [
  {
    sheetName: 'K.G.T | Public Security Organization',
    columnKey: 'squads',
    options: [
      'Above Squad',
      'Investigation S.',
      'D.O.C.',
      'D.A.D.',
      'N/A'
    ]
  },
  {
    sheetName: 'K.G.T | Public Security Organization',
    columnKey: 'responsibility',
    options: [
      'Above',
      'NONE',
      'U.C.C',
      'Internal Affairs',
    ]
  }
  // Add more here if needed, for example:
  // {
  //   sheetName: 'K.G.T | Public Security Organization',
  //   columnKey: 'section',
  //   options: ['Above Sections', 'KGT', 'Special Unit']
  // }
];
/* ═══════════════════════════════════════════ */

async function updateOptions() {
  await connectDB();

  for (const update of updates) {
    const sheet = await Sheet.findOne({ name: update.sheetName });
    if (!sheet) {
      console.log(`❌ Sheet not found: "${update.sheetName}"`);
      continue;
    }

    const columns = sheet.columns.map(col => {
      if (col.key === update.columnKey) {
        return { ...col.toObject(), options: update.options };
      }
      return col;
    });

    const found = sheet.columns.some(c => c.key === update.columnKey);
    if (!found) {
      console.log(`❌ Column key "${update.columnKey}" not found in "${update.sheetName}"`);
      console.log(`   Available keys: ${sheet.columns.map(c => c.key).join(', ')}`);
      continue;
    }

    await Sheet.findByIdAndUpdate(sheet._id, { columns });
    console.log(`✅ Updated "${update.columnKey}" in "${update.sheetName}"`);
    console.log(`   Options: ${update.options.join(', ')}`);
  }

  process.exit(0);
}

updateOptions().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
