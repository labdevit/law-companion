import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PAGE_SEPARATOR = "\n\n--- Saut de page ---\n\n";
const DEFAULT_MAX_CHARS = 180000;

function normalizeWhitespace(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractTextFromDocument(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx");

  if (isPdf) return extractTextFromPdf(file);
  if (isDocx) return extractTextFromDocx(file);

  throw new Error("Format de document non supporté pour l'extraction locale");
}

export function optimizeExtractedTextForAI(text: string, maxChars = DEFAULT_MAX_CHARS): string {
  const normalized = normalizeWhitespace(text);
  if (normalized.length <= maxChars) return normalized;

  const segments = normalized.split(PAGE_SEPARATOR).filter(Boolean);
  if (segments.length <= 3) {
    const head = normalized.slice(0, Math.floor(maxChars * 0.45));
    const middleStart = Math.max(Math.floor(normalized.length / 2) - Math.floor(maxChars * 0.1), 0);
    const middle = normalized.slice(middleStart, middleStart + Math.floor(maxChars * 0.2));
    const tail = normalized.slice(-Math.floor(maxChars * 0.35));
    return normalizeWhitespace(`${head}\n\n[... contenu intermédiaire condensé ...]\n\n${middle}\n\n[... fin du document ...]\n\n${tail}`);
  }

  const selected = new Set<number>();
  const orderedSegments: string[] = [];
  const targetIndices = new Set<number>([
    0,
    1,
    Math.max(segments.length - 2, 0),
    Math.max(segments.length - 1, 0),
    Math.floor(segments.length * 0.25),
    Math.floor(segments.length * 0.5),
    Math.floor(segments.length * 0.75),
  ]);

  const pushIndex = (index: number) => {
    if (index < 0 || index >= segments.length || selected.has(index)) return;
    selected.add(index);
    orderedSegments.push(segments[index]);
  };

  [...targetIndices].sort((a, b) => a - b).forEach(pushIndex);

  let joined = orderedSegments.join(PAGE_SEPARATOR);
  if (joined.length <= maxChars) return normalizeWhitespace(joined);

  const head = joined.slice(0, Math.floor(maxChars * 0.5));
  const tail = joined.slice(-Math.floor(maxChars * 0.5));
  return normalizeWhitespace(`${head}\n\n[... extrait condensé de plusieurs pages ...]\n\n${tail}`);
}

async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    const cleanedPage = normalizeWhitespace(pageText);
    if (cleanedPage) {
      pages.push(`Page ${pageNumber}\n${cleanedPage}`);
    }
  }

  return normalizeWhitespace(pages.join(PAGE_SEPARATOR));
}

async function extractTextFromDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return normalizeWhitespace(value);
}
