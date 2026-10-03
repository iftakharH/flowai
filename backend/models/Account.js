const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  type: { type: String, enum: ['cash', 'card'], default: 'cash' },
  openingBalance: { type: Number, default: 0 },
  last4: { type: String, default: '', maxlength: 4 },
  color: { type: String, default: 'sage' },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
