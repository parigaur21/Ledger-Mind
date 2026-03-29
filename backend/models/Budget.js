const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['food', 'transport', 'housing', 'shopping', 'entertainment', 'utilities', 'healthcare', 'education', 'travel', 'other'],
    lowercase: true
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Budget limit must be positive']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  alertAt80: {
    type: Boolean,
    default: false
  },
  alertExceeded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

budgetSchema.index({ user: 1, month: 1, year: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
