import dotenv from 'dotenv';
import { connectDB, Sheet, Row } from './db.js';

dotenv.config();

async function seedPersonnel() {
  await connectDB();

  const sheet = await Sheet.findOne({ name: 'K.G.T | Public Security Organization' });
  if (!sheet) { console.log('❌ Sheet not found'); process.exit(1); }

  /* Clear existing rows */
  await Row.deleteMany({ sheetId: sheet._id });

  /* Update sections */
  await Sheet.findByIdAndUpdate(sheet._id, {
    sections: [
      { title: 'K.G.T. Executive Office', order: 0 },
      { title: 'Command Office', order: 1 },
      { title: 'K.G.T. Officers', order: 2 },
      { title: 'Special Agent in Charge', order: 3 },
      { title: 'Assistant Special Agent in Charge', order: 4 },
      { title: 'Supervisory Special Agent', order: 5 },
      { title: 'Special Agent', order: 6 },
      { title: 'Agent', order: 7 },
      { title: 'Probationary Agent', order: 8 }
    ],
    columns: [
      { key: 'badge', label: 'Badge', type: 'text', width: 70 },
      { key: 'name', label: 'Name', type: 'text', width: 200 },
      { key: 'rank', label: 'Rank', type: 'dropdown', width: 180, options: [
        'Director of KGT', 'Deputy of KGT', 'Executive of KGT',
        'KGT Command Office', 'Operations Officer', 'Senior Officer',
        'Field Officer', 'Squads Officer', 'S.A.C.', 'A.S.A.C.',
        'S.S.A.', 'Special Agent', 'Agent', 'Probationary Agent'
      ]},
      { key: 'section', label: 'Section', type: 'dropdown', width: 130, options: ['Above Sections', 'KGT'] },
      { key: 'responsibility', label: 'Responsibility', type: 'dropdown', width: 140, options: ['Above', 'NONE', 'U.C.C', 'Internal Affairs'] },
      { key: 'points', label: 'Points', type: 'text', width: 70 },
      { key: 'squads', label: "Squad's", type: 'dropdown', width: 130, options: ['Above Squad', 'Investigation S.', 'D.O.C.', 'D.A.D.', 'N/A'] },
      { key: 'citizenId', label: 'Citizen ID', type: 'text', width: 100 },
      { key: 'discordName', label: 'Discord Name', type: 'text', width: 150 },
      { key: 'copyUserId', label: 'Copy User ID', type: 'text', width: 190 },
      { key: 'status', label: 'Status', type: 'badge', width: 90, options: ['Active', 'Inactive', 'N/A'] }
    ]
  });

  const rows = [
    /* ═══ K.G.T. Executive Office ═══ */
    { s: 'K.G.T. Executive Office', o: 0, d: { badge: 'Alpha', name: 'Alexander Michael Smith', rank: 'Director of KGT', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: 'znxx_1m2', copyUserId: '1220688303066578994', status: 'Active' }},
    { s: 'K.G.T. Executive Office', o: 1, d: { badge: 'Beta', name: 'Dutch Arthur', rank: 'Deputy of KGT', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: 'h.8p', copyUserId: '1152747007753076806', status: 'Active' }},
    { s: 'K.G.T. Executive Office', o: 2, d: { badge: 'Charlie', name: '-', rank: 'Executive of KGT', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ Command Office ═══ */
    { s: 'Command Office', o: 0, d: { badge: 'K-0', name: 'Marco Romano', rank: 'KGT Command Office', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: 'ryan5261_40442', copyUserId: '1232429986472919133', status: 'Active' }},
    { s: 'Command Office', o: 1, d: { badge: 'K-1', name: '', rank: 'KGT Command Office', section: 'Above Sections', responsibility: 'Above', points: 'N/A', squads: 'Above Squad', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ K.G.T. Officers ═══ */
    { s: 'K.G.T. Officers', o: 0, d: { badge: 'K-3', name: 'Nihad Shacker', rank: 'Operations Officer', section: 'KGT', responsibility: 'U.C.C', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: 'qr9q', copyUserId: '977168540731850783', status: 'Active' }},
    { s: 'K.G.T. Officers', o: 1, d: { badge: 'K-4', name: 'Alexander Alanezi', rank: 'Senior Officer', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: 'q76ani_86858', copyUserId: '1457096528383443178', status: 'Active' }},
    { s: 'K.G.T. Officers', o: 2, d: { badge: 'K-5', name: 'David Mark', rank: 'Field Officer', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '82m8', copyUserId: '1463589638668030099', status: 'Active' }},
    { s: 'K.G.T. Officers', o: 3, d: { badge: 'K-6', name: '', rank: 'Squads Officer', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ Special Agent in Charge ═══ */
    { s: 'Special Agent in Charge', o: 0, d: { badge: 'K-8', name: 'Aurthur Morgan', rank: 'S.A.C.', section: 'KGT', responsibility: 'Internal Affairs', points: '-', squads: 'N/A', citizenId: '-', discordName: 'ammarmazin2025', copyUserId: '1421588674038071297', status: 'Active' }},
    { s: 'Special Agent in Charge', o: 1, d: { badge: 'K-10', name: 'Karlos Saifeddine', rank: 'S.A.C.', section: 'KGT', responsibility: 'U.C.C', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: 'mohamed.306', copyUserId: '1349961363128061962', status: 'Active' }},
    { s: 'Special Agent in Charge', o: 2, d: { badge: 'K-11', name: 'Relex Morf', rank: 'S.A.C.', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '5_hs', copyUserId: '739024549529649204', status: 'N/A' }},
    { s: 'Special Agent in Charge', o: 3, d: { badge: 'K-12', name: '', rank: 'S.A.C.', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Special Agent in Charge', o: 4, d: { badge: 'K-13', name: '', rank: 'S.A.C.', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ Assistant Special Agent in Charge ═══ */
    { s: 'Assistant Special Agent in Charge', o: 0, d: { badge: 'K-20', name: '', rank: 'A.S.A.C.', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Assistant Special Agent in Charge', o: 1, d: { badge: 'K-21', name: '', rank: 'A.S.A.C.', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Assistant Special Agent in Charge', o: 2, d: { badge: 'K-22', name: '', rank: 'A.S.A.C.', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Assistant Special Agent in Charge', o: 3, d: { badge: 'K-23', name: '', rank: 'A.S.A.C.', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Assistant Special Agent in Charge', o: 4, d: { badge: 'K-24', name: '', rank: 'A.S.A.C.', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ Supervisory Special Agent ═══ */
    { s: 'Supervisory Special Agent', o: 0, d: { badge: 'K-30', name: 'Micah Bell', rank: 'S.S.A.', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: 'deaa__gamer', copyUserId: '708716740829380679', status: 'Active' }},
    { s: 'Supervisory Special Agent', o: 1, d: { badge: 'K-31', name: '', rank: 'S.S.A.', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Supervisory Special Agent', o: 2, d: { badge: 'K-32', name: '', rank: 'S.S.A.', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Supervisory Special Agent', o: 3, d: { badge: 'K-33', name: '', rank: 'S.S.A.', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Supervisory Special Agent', o: 4, d: { badge: 'K-34', name: '', rank: 'S.S.A.', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ Special Agent ═══ */
    { s: 'Special Agent', o: 0, d: { badge: 'K-40', name: '-', rank: 'Special Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: 'wzifcs4', copyUserId: '1343289005437092062', status: 'Active' }},
    { s: 'Special Agent', o: 1, d: { badge: 'K-41', name: 'John William', rank: 'Special Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '_twe.', copyUserId: '1448723985670864987', status: 'Active' }},
    { s: 'Special Agent', o: 2, d: { badge: 'K-42', name: '', rank: 'Special Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Special Agent', o: 3, d: { badge: 'K-43', name: '', rank: 'Special Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Special Agent', o: 4, d: { badge: 'K-44', name: '', rank: 'Special Agent', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ Agent ═══ */
    { s: 'Agent', o: 0, d: { badge: 'K-50', name: 'Arthur Leo', rank: 'Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: 'kSuz', copyUserId: '1287774373281009729', status: 'Active' }},
    { s: 'Agent', o: 1, d: { badge: 'K-51', name: 'Nawaf Alanezi', rank: 'Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: 'yjeh_0', copyUserId: '1320553778079989793', status: 'Active' }},
    { s: 'Agent', o: 2, d: { badge: 'K-52', name: 'Daniel William', rank: 'Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '.bqp.', copyUserId: '7305977856819200050', status: 'Active' }},
    { s: 'Agent', o: 3, d: { badge: 'K-53', name: '', rank: 'Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Agent', o: 4, d: { badge: 'K-54', name: '', rank: 'Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Agent', o: 5, d: { badge: 'K-55', name: '', rank: 'Agent', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},

    /* ═══ Probationary Agent ═══ */
    { s: 'Probationary Agent', o: 0, d: { badge: 'K-60', name: 'David William', rank: 'Probationary Agent', section: 'KGT', responsibility: 'NONE', points: '-', squads: 'N/A', citizenId: '-', discordName: '9ye.', copyUserId: '1096481604900061214', status: 'Active' }},
    { s: 'Probationary Agent', o: 1, d: { badge: 'K-61', name: '', rank: 'Probationary Agent', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Probationary Agent', o: 2, d: { badge: 'K-62', name: '', rank: 'Probationary Agent', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Probationary Agent', o: 3, d: { badge: 'K-63', name: '', rank: 'Probationary Agent', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }},
    { s: 'Probationary Agent', o: 4, d: { badge: 'K-64', name: '', rank: 'Probationary Agent', section: 'KGT', responsibility: 'NONE', points: 'N/A', squads: 'N/A', citizenId: '-', discordName: '-', copyUserId: '-', status: 'N/A' }}
  ];

  for (const row of rows) {
    await Row.create({ sheetId: sheet._id, section: row.s, order: row.o, data: row.d });
  }

  console.log(`✅ Added ${rows.length} personnel rows across 9 sections`);
  process.exit(0);
}

seedPersonnel().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
