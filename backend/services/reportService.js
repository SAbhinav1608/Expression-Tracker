const mongoose = require('mongoose');
const Report = require('../models/Report');
const Child = require('../models/Child');
const { generateGeminiReport } = require('./geminiService');

const EMOTION_LABELS = ['Happy', 'Sad', 'Angry', 'Fear', 'Neutral', 'Disgust'];

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : NaN;
};

const validatePayload = (payload) => {
  const errors = [];
  const childName = String(payload.childName || '').trim();
  const userId = String(payload.userId || '').trim();
  const childId = String(payload.childId || '').trim();
  const sessionDuration = toNumber(payload.sessionDuration);
  const quizScore = toNumber(payload.quizScore);
  const memoryScore = toNumber(payload.memoryScore);
  const emotionDistribution = payload.emotionDistribution || {};

  if (!childName) {
    errors.push('childName is required');
  }

  if (!Number.isFinite(sessionDuration) || sessionDuration < 0) {
    errors.push('sessionDuration must be a non-negative number');
  }

  if (!Number.isFinite(quizScore) || quizScore < 0) {
    errors.push('quizScore must be a non-negative number');
  }

  if (!Number.isFinite(memoryScore) || memoryScore < 0) {
    errors.push('memoryScore must be a non-negative number');
  }

  const normalizedEmotionDistribution = {};
  EMOTION_LABELS.forEach((emotion) => {
    const value = toNumber(emotionDistribution[emotion]);
    if (!Number.isFinite(value) || value < 0) {
      errors.push(`emotionDistribution.${emotion} must be a non-negative number`);
      return;
    }

    normalizedEmotionDistribution[emotion] = value;
  });

  return {
    errors,
    value: {
      childName,
      userId: userId || null,
      childId: childId || null,
      sessionDuration,
      quizScore,
      memoryScore,
      emotionDistribution: normalizedEmotionDistribution,
    },
  };
};

const createSessionReport = async (payload, adminId = null) => {
  const { errors, value } = validatePayload(payload);
  if (errors.length) {
    const error = new Error(errors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  let resolvedChild = null;
  if (value.childId) {
    if (!mongoose.isValidObjectId(value.childId)) {
      const error = new Error('childId must be a valid MongoDB ObjectId');
      error.statusCode = 400;
      throw error;
    }

    resolvedChild = await Child.findOne({ _id: value.childId, parentId: adminId });
    if (!resolvedChild) {
      const error = new Error('Child not found for this admin');
      error.statusCode = 404;
      throw error;
    }
  } else if (value.userId) {
    resolvedChild = await Child.findOne({ userId: value.userId, parentId: adminId });
    if (!resolvedChild) {
      const error = new Error('Child not found for this admin');
      error.statusCode = 404;
      throw error;
    }
  }

  const reportInput = {
    ...value,
    childName: resolvedChild?.childName || value.childName,
  };

  const { reportText, modelName } = await generateGeminiReport(reportInput);

  const savedReport = await Report.create({
    childId: resolvedChild?._id || value.childId || null,
    userId: resolvedChild?.userId || value.userId || null,
    childName: resolvedChild?.childName || value.childName,
    sessionDuration: reportInput.sessionDuration,
    quizScore: reportInput.quizScore,
    memoryScore: reportInput.memoryScore,
    emotionDistribution: reportInput.emotionDistribution,
    report: reportText,
    modelName,
    createdBy: adminId,
  });

  return {
    reportText,
    savedReport,
  };
};

module.exports = {
  createSessionReport,
};