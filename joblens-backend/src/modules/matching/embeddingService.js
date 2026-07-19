import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

// NOTE: gemini-embedding-001 requires taskType — gemini-embedding-2 silently rejected it,
// which is what broke the Evangadi Forum chatbot. Don't drop this.
export const embedText = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
  if (!text || !text.trim()) return null;

  try {
    const result = await model.embedContent({
      content: { parts: [{ text: text.slice(0, 8000) }] },
      taskType,
    });
    return result.embedding.values; // array of 768 floats
  } catch (err) {
    console.error('Embedding failed:', err.message);
    return null;
  }
};

export const embedJobText = (job) =>
  embedText(
    `${job.title}. ${job.description || ''} Skills: ${(job.skills || []).join(', ')}`,
    'RETRIEVAL_DOCUMENT'
  );

export const embedProfileText = (profile, skills) =>
  embedText(
    `Profession: ${profile.profession || ''}. Industry: ${profile.industry || ''}. ` +
      `Skills: ${skills.map((s) => s.name).join(', ')}. Bio: ${profile.bio || ''}`,
    'RETRIEVAL_QUERY'
  );