const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['overall', 'category'],
    },
    category: {
      type: String,
      // Required if type is 'category', otherwise ignored/empty.
      required: function() {
        return this.type === 'category';
      }
    },
    period: {
      type: String,
      required: true,
      enum: ['monthly'],
      default: 'monthly'
    }
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ user: 1, type: 1, category: 1 }, { unique: false });
const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
