const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const EMOTION_LABELS = ['Happy', 'Sad', 'Angry', 'Fear', 'Neutral', 'Disgust'];

const cleanResponseText = (text) => {
  if (!text) {
    return '';
  }

  return text
    .replace(/^```(?:json|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

const buildReportPrompt = ({
  childName,
  sessionDuration,
  quizScore,
  memoryScore,
  emotionDistribution,
}) => {
  const emotionSummary = EMOTION_LABELS.map(
    (emotion) => `${emotion}: ${emotionDistribution[emotion] ?? 0}`
  ).join(', ');

  return [
    'You are a child development assistant generating a professional session summary for a parent or clinician.',
    'Write in a warm, clear, polished tone.',
    'Do not mention policies, prompts, or that you are an AI.',
    'Use the exact section headings below and keep the output as plain text, not JSON.',
    'Headings required: Session Summary, Dominant Emotion, Emotional Trend Analysis, Engagement Level, Cognitive Performance Analysis, Recommendations.',
    '',
    `Child name: ${childName}`,
    `Session duration: ${sessionDuration} minutes`,
    `Quiz score: ${quizScore}`,
    `Memory score: ${memoryScore}`,
    `Emotion distribution counts: ${emotionSummary}`,
    '',
    'Guidance:',
    '- Explain the child\'s likely emotional experience during the session.',
    '- Identify the dominant emotion using the provided distribution.',
    '- Discuss emotional changes and stability over the session.',
    '- Assess engagement level from the available metrics.',
    '- Assess cognitive performance using quiz and memory scores.',
    '- End with 2 to 4 actionable recommendations for caregivers or educators.',
  ].join('\n');
};

const generateGeminiReport = async (payload) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }

  const prompt = buildReportPrompt(payload);
  const { default: fetch } = await import('node-fetch');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 1200,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Gemini report generation failed';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    const error = new Error('Gemini returned an empty report');
    error.statusCode = 502;
    throw error;
  }

  return {
    reportText: cleanResponseText(text),
    modelName: GEMINI_MODEL,
  };
};

module.exports = {
  generateGeminiReport,
};