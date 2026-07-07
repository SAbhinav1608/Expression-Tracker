const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
    childName: {
      type: String,
      required: true,
    },
    sessionDuration: {
      type: Number,
      required: true,
    },
    quizScore: {
      type: Number,
      required: true,
    },
    memoryScore: {
      type: Number,
      required: true,
    },
    emotionDistribution: {
      type: Map,
      of: Number,
    },
    report: { type: String, required: true },
    modelName: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);