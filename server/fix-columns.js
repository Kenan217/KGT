import dotenv from 'dotenv';
import { connectDB, Sheet } from './db.js';

dotenv.config();

async function fixColumns() {
  await connectDB();

  const sheet = await Sheet.findOne({ name: 'K.G.T | Public Security Organization' });
  if (!sheet) {
    console.log('❌ Main sheet not found');
    process.exit(1);
  }

  const rankOptions = [
    'Director of KGT',
    'Deputy of KGT',
    'Executive of KGT',
    'KGT Command Office',
    'Operations Officer',
    'Senior Officer',
    'Field Officer',
    'Squads Officer',
    'S.A.C.',
    'A.S.A.C.',
    'Supervisory Special Agent',
    'Agent',
    'Trainee'
  ];

  /* Update the rank column to be a dropdown */
  const columns = sheet.columns.map(col => {
    if (col.key === 'rank') {
      return { ...col.toObject(), type: 'dropdown', options: rankOptions };
    }
    if (col.key === 'name') {
      return { ...col.toObject(), label: 'Name', width: 200 };
    }
    return col;
  });

  await Sheet.findByIdAndUpdate(sheet._id, { columns });
  console.log('✅ Rank column updated to dropdown with options');
  console.log('   Options:', rankOptions.join(', '));
  process.exit(0);
}

fixColumns().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
