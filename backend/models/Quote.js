const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 240 },
  author: { type: String, default: 'FlowAI' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);
