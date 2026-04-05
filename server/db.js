import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

/* Force Google DNS for SRV resolution */
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

/* ── User Schema ── */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  displayName: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

/* ── Sheet Schema ── */
const sheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
  columns: [{
    key: String,
    label: String,
    type: { type: String, enum: ['text', 'dropdown', 'badge'], default: 'text' },
    options: [String],
    width: { type: Number, default: 150 }
  }],
  sections: [{
    title: String,
    order: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

/* ── Row Schema (personnel entries) ── */
const rowSchema = new mongoose.Schema({
  sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet', required: true },
  section: { type: String, default: '' },
  order: { type: Number, default: 0 },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

rowSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/* ── Code Category Schema (for Coding System page) ── */
const codeCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  codes: [{
    code: String,
    title: String,
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Sheet = mongoose.model('Sheet', sheetSchema);
const Row = mongoose.model('Row', rowSchema);
const CodeCategory = mongoose.model('CodeCategory', codeCategorySchema);

export { connectDB, User, Sheet, Row, CodeCategory };
