import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import env from '../../config/env';
import logger from '../../utils/logger';

/**
 * Google Gemini AI service (free tier).
 * Use gemini-1.5-flash for speed, gemini-1.5-pro for quality.
 * Get API key: https://aistudio.google.com/apikey
 */
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const DEFAULT_MODEL = 'gemini-1.5-flash';

function getModel(modelName: string = DEFAULT_MODEL): GenerativeModel {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate text from a single prompt (summarization, tags, etc.)
 */
export async function generateText(
  prompt: string,
  options?: { model?: string; maxTokens?: number }
): Promise<string> {
  try {
    const model = getModel(options?.model);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text?.trim() ?? '';
  } catch (error) {
    logger.error('Gemini generateText error:', error);
    throw error;
  }
}

/**
 * Generate content with system instruction (for summarization, analysis, etc.)
 */
export async function generateWithInstruction(
  systemInstruction: string,
  userContent: string,
  options?: { model?: string }
): Promise<string> {
  try {
    const model = getModel(options?.model);
    const combinedPrompt = `${systemInstruction}\n\n---\n\n${userContent}`;
    const result = await model.generateContent(combinedPrompt);
    const text = result.response.text();
    return text?.trim() ?? '';
  } catch (error) {
    logger.error('Gemini generateWithInstruction error:', error);
    throw error;
  }
}

/**
 * Chat-style generation for multi-turn or query use cases
 */
export async function generateChat(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  options?: { model?: string }
): Promise<string> {
  try {
    const model = getModel(options?.model);
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));
    const last = messages[messages.length - 1];
    if (last?.role !== 'user') {
      throw new Error('Last message must be from user');
    }
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(last.text);
    const text = result.response.text();
    return text?.trim() ?? '';
  } catch (error) {
    logger.error('Gemini generateChat error:', error);
    throw error;
  }
}

export { getModel, DEFAULT_MODEL };
