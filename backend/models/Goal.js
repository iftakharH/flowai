const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  targetAmount: { type: Number, required: true, min: 0.01 },
  savedAmount: { type: Number, default: 0, min: 0 },
  deadline: { type: Date, required: true },
  color: { type: String, default: 'sage' },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
