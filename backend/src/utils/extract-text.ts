// pdf-parse has no types; use require + assertion so ts-node and tsc both work
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text?: string }>;
import logger from './logger';

const TEXT_MIMES = ['text/plain', 'text/csv'];
const MAX_TEXT_LENGTH = 500_000; // ~500k chars for Gemini context

/**
 * Extract plain text from a document buffer for AI (summarize, query).
 * Supports: PDF (pdf-parse), text/plain, text/csv. Others return empty string.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (!buffer?.length) return '';

  const type = (mimeType || '').toLowerCase();

  if (type === 'application/pdf') {
    try {
      const data = await pdfParse(buffer);
      const text = (data?.text || '').trim();
      return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;
    } catch (err) {
      logger.warn('pdf-parse failed:', err);
      return '';
    }
  }

  if (TEXT_MIMES.includes(type)) {
    const text = buffer.toString('utf-8').trim();
    return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;
  }

  return '';
}
