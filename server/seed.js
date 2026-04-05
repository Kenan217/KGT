import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, User, Sheet, Row, CodeCategory } from './db.js';

dotenv.config();

async function seed() {
  await connectDB();

  /* ── Clear existing data ── */
  await User.deleteMany({});
  await Sheet.deleteMany({});
  await Row.deleteMany({});
  await CodeCategory.deleteMany({});

  /* ── Create admin user ── */
  const adminPass = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', password: adminPass, role: 'admin', displayName: 'System Admin' });

  /* ── Create viewer user ── */
  const viewerPass = await bcrypt.hash('viewer123', 10);
  await User.create({ username: 'viewer', password: viewerPass, role: 'viewer', displayName: 'Viewer Account' });

  console.log('✅ Users created (admin/admin123, viewer/viewer123)');

  /* ── Create main sheet: K.G.T | Public Security Organization ── */
  const mainSheet = await Sheet.create({
    name: 'K.G.T | Public Security Organization',
    order: 0,
    columns: [
      { key: 'badge', label: 'Badge', type: 'text', width: 70 },
      { key: 'name', label: 'Name', type: 'text', width: 180 },
      { key: 'rank', label: 'Rank', type: 'text', width: 180 },
      { key: 'section', label: 'Section', type: 'dropdown', options: ['Above Sections', 'KGT', 'S.A.C.'], width: 120 },
      { key: 'responsibility', label: 'Responsibility', type: 'dropdown', options: ['Above', 'NONE', 'U.C.C', 'Internal Affairs'], width: 150 },
      { key: 'points', label: 'Points', type: 'text', width: 80 },
      { key: 'squads', label: "Squad's", type: 'dropdown', options: ['Above Squad', 'N/A'], width: 130 },
      { key: 'citizenId', label: 'Citizen ID', type: 'text', width: 100 },
      { key: 'discordName', label: 'Discord Name', type: 'text', width: 150 },
      { key: 'copyUserId', label: 'Copy User ID', type: 'text', width: 180 },
      { key: 'status', label: 'Status', type: 'badge', options: ['Active', 'Inactive', 'N/A'], width: 100 }
    ],
    sections: [
      { title: 'K.G.T. Executive Office', order: 0 },
      { title: 'Command Office', order: 1 },
      { title: 'K.G.T. Officers', order: 2 },
      { title: 'Special Agent in Charge', order: 3 }
    ]
  });

  /* ── Seed rows for main sheet ── */
  const rows = [
    { section: 'K.G.T. Executive Office', order: 0, data: { badge: 'Alpha', name: 'Alexander Michael Smith', rank: 'Director of KGT', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: 'znxx_1m2', copyUserId: '1220688303066578994', status: 'Active' }},
    { section: 'K.G.T. Executive Office', order: 1, data: { badge: 'Beta', name: 'Dutch Arthur', rank: 'Deputy of KGT', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: 'h.8p', copyUserId: '1152747007753076806', status: 'Active' }},
    { section: 'K.G.T. Executive Office', order: 2, data: { badge: 'Charlie', name: '-', rank: 'Executive of KGT', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { section: 'Command Office', order: 0, data: { badge: 'K-0', name: 'Marco Romano', rank: 'KGT Command Office', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: 'ryan5261._40442', copyUserId: '1232429986472919133', status: 'Active' }},
    { section: 'Command Office', order: 1, data: { badge: 'K-1', name: '', rank: 'KGT Command Office', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { section: 'K.G.T. Officers', order: 0, data: { badge: 'K-3', name: 'Nihad Shacker', rank: 'Operations Officer', section: 'KGT', responsibility: 'U.C.C', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: 'qr9q', copyUserId: '977168540731850783', status: 'Active' }},
    { section: 'K.G.T. Officers', order: 1, data: { badge: 'K-4', name: 'Alexander Alanezi', rank: 'Senior Officer', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: 'q76anl._86858', copyUserId: '1457096528383443178', status: 'Active' }},
    { section: 'K.G.T. Officers', order: 2, data: { badge: 'K-5', name: 'David Mark', rank: 'Field Officer', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '82m8', copyUserId: '1463589638668030099', status: 'Active' }},
    { section: 'K.G.T. Officers', order: 3, data: { badge: 'K-6', name: '', rank: 'Squads Officer', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { section: 'Special Agent in Charge', order: 0, data: { badge: 'K-8', name: 'Aurthur Morgan', rank: 'S.A.C.', section: 'KGT', responsibility: 'Internal Affairs', points: '-', squads: 'N/A', citizenId: '-', discordName: 'ammarmazin2025', copyUserId: '1421588674038071297', status: 'Active' }},
    { section: 'Special Agent in Charge', order: 1, data: { badge: 'K-10', name: 'Karlos Saifeddine', rank: 'S.A.C.', section: 'KGT', responsibility: 'U.C.C', points: '-', squads: 'N/A', citizenId: '-', discordName: 'mohamed.306', copyUserId: '1349961363128061962', status: 'Active' }}
  ];

  for (const row of rows) {
    await Row.create({ sheetId: mainSheet._id, ...row });
  }

  console.log('✅ Main sheet seeded with', rows.length, 'rows');

  /* ── Create additional sheets ── */
  await Sheet.create({
    name: 'Clothing',
    order: 1,
    columns: [
      { key: 'item', label: 'Item', type: 'text', width: 200 },
      { key: 'category', label: 'Category', type: 'dropdown', options: ['Uniform', 'Casual', 'Tactical', 'Formal'], width: 130 },
      { key: 'rank_required', label: 'Rank Required', type: 'text', width: 150 },
      { key: 'notes', label: 'Notes', type: 'text', width: 250 }
    ],
    sections: [{ title: 'Clothing Items', order: 0 }]
  });

  await Sheet.create({
    name: 'Radio Protocols',
    order: 2,
    columns: [
      { key: 'code', label: 'Code', type: 'text', width: 100 },
      { key: 'meaning', label: 'Meaning', type: 'text', width: 250 },
      { key: 'usage', label: 'Usage Context', type: 'text', width: 200 },
      { key: 'priority', label: 'Priority', type: 'dropdown', options: ['Low', 'Medium', 'High', 'Critical'], width: 120 }
    ],
    sections: [{ title: 'Radio Codes', order: 0 }]
  });

  await Sheet.create({
    name: 'A.O.P',
    order: 3,
    columns: [
      { key: 'area', label: 'Area', type: 'text', width: 200 },
      { key: 'status', label: 'Status', type: 'badge', options: ['Active', 'Inactive'], width: 120 },
      { key: 'notes', label: 'Notes', type: 'text', width: 300 }
    ],
    sections: [{ title: 'Area of Patrol', order: 0 }]
  });

  await Sheet.create({
    name: 'Prohibited Items',
    order: 4,
    columns: [
      { key: 'item', label: 'Item', type: 'text', width: 200 },
      { key: 'category', label: 'Category', type: 'dropdown', options: ['Weapon', 'Substance', 'Equipment', 'Other'], width: 130 },
      { key: 'penalty', label: 'Penalty', type: 'text', width: 200 },
      { key: 'notes', label: 'Notes', type: 'text', width: 250 }
    ],
    sections: [{ title: 'Prohibited Items List', order: 0 }]
  });

  console.log('✅ Additional sheets created');

  /* ── Seed coding system ── */
  await CodeCategory.create({
    name: 'Penal Codes',
    description: 'Criminal offense codes and classifications',
    order: 0,
    codes: [
      { code: 'PC-001', title: 'Assault', description: 'Intentional physical harm to another person', severity: 'medium' },
      { code: 'PC-002', title: 'Armed Robbery', description: 'Robbery committed with a weapon', severity: 'high' },
      { code: 'PC-003', title: 'Murder', description: 'Unlawful killing of another person', severity: 'critical' },
      { code: 'PC-004', title: 'Theft', description: 'Taking property without consent', severity: 'low' },
      { code: 'PC-005', title: 'Drug Trafficking', description: 'Distribution of controlled substances', severity: 'high' },
      { code: 'PC-006', title: 'Fraud', description: 'Deception for personal gain', severity: 'medium' }
    ]
  });

  await CodeCategory.create({
    name: 'Radio Codes',
    description: 'Standard radio communication codes',
    order: 1,
    codes: [
      { code: '10-1', title: 'Bad Reception', description: 'Signal is unclear, unable to copy', severity: 'low' },
      { code: '10-4', title: 'Acknowledged', description: 'Message received and understood', severity: 'low' },
      { code: '10-7', title: 'Out of Service', description: 'Unit is off-duty or unavailable', severity: 'low' },
      { code: '10-8', title: 'In Service', description: 'Unit is on-duty and available', severity: 'low' },
      { code: '10-20', title: 'Location', description: 'What is your current location?', severity: 'low' },
      { code: '10-99', title: 'Emergency', description: 'Officer needs emergency assistance', severity: 'critical' }
    ]
  });

  await CodeCategory.create({
    name: 'Situation Codes',
    description: 'Codes indicating current situation severity',
    order: 2,
    codes: [
      { code: 'CODE-1', title: 'Respond — No Lights/Sirens', description: 'Non-emergency response required', severity: 'low' },
      { code: 'CODE-2', title: 'Urgent — Lights Only', description: 'Urgent response, use lights but no sirens', severity: 'medium' },
      { code: 'CODE-3', title: 'Emergency — Full Response', description: 'Emergency! Use lights and sirens', severity: 'high' },
      { code: 'CODE-4', title: 'No Further Assistance', description: 'Scene is secure, no backup needed', severity: 'low' },
      { code: 'CODE-5', title: 'Stakeout', description: 'Undercover operation in progress', severity: 'medium' }
    ]
  });

  console.log('✅ Coding system categories seeded');
  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
