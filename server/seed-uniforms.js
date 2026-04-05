import dotenv from 'dotenv';
import { connectDB, Sheet, Row } from './db.js';

dotenv.config();

async function seedUniforms() {
  await connectDB();

  const sheet = await Sheet.findOne({ name: 'K.G.T. Uniforms' });
  if (!sheet) { console.log('❌ Sheet not found'); process.exit(1); }

  /* Clear existing rows */
  await Row.deleteMany({ sheetId: sheet._id });

  /* Update columns */
  await Sheet.findByIdAndUpdate(sheet._id, {
    sections: [
      { title: 'K.G.T. Uniforms', order: 0 }
    ],
    columns: [
      { key: 'category', label: 'Category', type: 'text', width: 140 },
      { key: 'agents_item', label: 'Agents (Item)', type: 'text', width: 110 },
      { key: 'agents_tex', label: 'Agents (Textures)', type: 'text', width: 130 },
      { key: 'senior_item', label: 'Senior Agents (Item)', type: 'text', width: 140 },
      { key: 'senior_tex', label: 'Senior Agents (Textures)', type: 'text', width: 150 },
      { key: 'officers_item', label: 'Officers (Item)', type: 'text', width: 120 },
      { key: 'officers_tex', label: 'Officers (Textures)', type: 'text', width: 140 },
      { key: 'doc_item', label: 'D.O.C. (Item)', type: 'text', width: 110 },
      { key: 'doc_tex', label: 'D.O.C. (Textures)', type: 'text', width: 130 }
    ]
  });

  const uniformData = [
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

  for (let i = 0; i < uniformData.length; i++) {
    await Row.create({
      sheetId: sheet._id,
      section: 'K.G.T. Uniforms',
      order: i,
      data: uniformData[i]
    });
  }

  console.log(`✅ Seeded ${uniformData.length} uniform rows`);
  process.exit(0);
}

seedUniforms().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
