import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PAGE_SEPARATOR = "\n\n--- Saut de page ---\n\n";
const DEFAULT_MAX_CHARS = 30000;
const MAX_SEGMENTS_TO_KEEP = 12;

function normalizeWhitespace(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateMiddle(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  const head = text.slice(0, Math.floor(maxChars * 0.55));
  const tail = text.slice(-Math.floor(maxChars * 0.3));
  return normalizeWhitespace(`${head}\n\n[... contenu intermédiaire condensé ...]\n\n${tail}`);
}

function splitIntoSentences(text: string) {
  return normalizeWhitespace(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function pickEvenlySpacedIndices(length: number, maxItems: number) {
  if (length <= maxItems) return Array.from({ length }, (_, index) => index);

  const selected = new Set<number>([0, 1, length - 2, length - 1]);
  const remaining = Math.max(maxItems - selected.size, 0);

  for (let step = 1; step <= remaining; step += 1) {
    const ratio = step / (remaining + 1);
    selected.add(Math.min(length - 1, Math.max(0, Math.floor(ratio * (length - 1)))));
  }

  return [...selected].sort((a, b) => a - b).slice(0, maxItems);
}

function compressSegment(segment: string, budget: number) {
  const cleaned = normalizeWhitespace(segment);
  if (cleaned.length <= budget) return cleaned;

  const lines = segment
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const headings = lines.filter((line) =>
    /^(page\s+\d+|chapitre\s+\d+|section\s+\d+|partie\s+\d+|titre\s*:|[ivxlcdm]+\.|\d+\.)/i.test(line)
  );

  const bullets = lines.filter((line) => /^([-*•]|\d+\.)\s+/.test(line));
  const sentences = splitIntoSentences(cleaned);
  const middleIndex = Math.floor(sentences.length / 2);
  const sampledSentences = [
    ...sentences.slice(0, 3),
    ...sentences.slice(Math.max(middleIndex - 1, 0), Math.max(middleIndex + 1, 0)),
    ...sentences.slice(-2),
  ];

  const parts = [...headings.slice(0, 4), ...bullets.slice(0, 6), ...sampledSentences]
    .map((part) => part.trim())
    .filter(Boolean);

  const uniqueParts: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueParts.push(part);
  }

  return truncateMiddle(uniqueParts.join("\n"), budget);
}

function toPseudoSegments(text: string) {
  const paragraphs = normalizeWhitespace(text)
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!paragraphs.length) return [normalizeWhitespace(text)];

  const segments: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > 3500 && current) {
      segments.push(current);
      current = paragraph;
      continue;
    }
    current = candidate;
  }

  if (current) segments.push(current);
  return segments;
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

  const rawSegments = normalized.includes(PAGE_SEPARATOR)
    ? normalized.split(PAGE_SEPARATOR).filter(Boolean)
    : toPseudoSegments(normalized);

  const indices = pickEvenlySpacedIndices(rawSegments.length, MAX_SEGMENTS_TO_KEEP);
  const selectedSegments = indices.map((index) => rawSegments[index]);
  const perSegmentBudget = Math.max(1400, Math.floor((maxChars - 2000) / Math.max(selectedSegments.length, 1)));

  const compressed = selectedSegments.map((segment, position) => {
    const sourceIndex = indices[position] + 1;
    return `Extrait ${sourceIndex}\n${compressSegment(segment, perSegmentBudget)}`;
  });

  return truncateMiddle(compressed.join(PAGE_SEPARATOR), maxChars);
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
