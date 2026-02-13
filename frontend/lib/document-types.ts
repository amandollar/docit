/**
 * Supported document types for workspace uploads.
 * Keep in sync with backend ALLOWED_DOCUMENT_MIMES (config/multer.ts).
 */

export const ALLOWED_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
] as const;

/** For use in <input accept="..."> */
export const ALLOWED_ACCEPT =
  "application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,text/plain,.txt,text/csv,.csv,image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

/** Human-readable list for UI (e.g. "PDF, Word, Excel, text, CSV, images") */
export const SUPPORTED_TYPES_LABEL = "PDF, Word, Excel, text, CSV, images";

export function isAllowedFile(file: File): boolean {
  if (ALLOWED_MIMES.includes(file.type as (typeof ALLOWED_MIMES)[number])) return true;
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}
