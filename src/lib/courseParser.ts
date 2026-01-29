import { QuizQuestion } from "@/data/courses";

export interface ParsedSection {
  title: string;
  content: string;
  quiz: QuizQuestion[];
}

export interface ParsedChapter {
  title: string;
  sections: ParsedSection[];
}

export interface ParsedCourse {
  title: string;
  chapters: ParsedChapter[];
}

// Regex patterns for structure detection
const CHAPTER_PATTERNS = [
  /^(?:chapitre|chapter|partie|part)\s*[:\-]?\s*(\d+)?[:\-.\s]*(.+)/i,
  /^(?:#{1,2})\s*(.+)/,
  /^([IVXLCDM]+)[.\-:\s]+(.+)/i,
];

const SECTION_PATTERNS = [
  /^(?:section|leçon|lesson)\s*[:\-]?\s*(\d+)?[:\-.\s]*(.+)/i,
  /^(?:#{3,4})\s*(.+)/,
  /^(\d+)[.\-)\s]+(.+)/,
  /^([a-z])[.\-)]\s*(.+)/i,
];

// Keywords that suggest highlight importance
const HIGHLIGHT_KEYWORDS = [
  "important", "essentiel", "clé", "fondamental", "principal", "crucial",
  "définition", "exemple", "attention", "remarque", "noter", "retenir"
];

/**
 * Parse raw text into structured course format
 */
export function parseTextToCourse(text: string): ParsedCourse {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) {
    return { title: "Cours importé", chapters: [] };
  }

  // Try to extract course title from first lines
  let courseTitle = "Cours importé";
  let startIdx = 0;
  
  // Check if first line looks like a title (short, no punctuation at end)
  if (lines[0].length < 100 && !lines[0].match(/[.,:;]$/)) {
    courseTitle = lines[0].replace(/^#+\s*/, "");
    startIdx = 1;
  }

  const chapters: ParsedChapter[] = [];
  let currentChapter: ParsedChapter | null = null;
  let currentSection: ParsedSection | null = null;
  let contentBuffer: string[] = [];

  const flushContent = () => {
    if (currentSection && contentBuffer.length > 0) {
      currentSection.content = formatContentToHTML(contentBuffer.join("\n"));
      contentBuffer = [];
    }
  };

  const flushSection = () => {
    flushContent();
    if (currentChapter && currentSection) {
      currentChapter.sections.push(currentSection);
      currentSection = null;
    }
  };

  const flushChapter = () => {
    flushSection();
    if (currentChapter && currentChapter.sections.length > 0) {
      chapters.push(currentChapter);
      currentChapter = null;
    }
  };

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for chapter pattern
    const chapterMatch = matchPatterns(line, CHAPTER_PATTERNS);
    if (chapterMatch) {
      flushChapter();
      currentChapter = {
        title: chapterMatch,
        sections: []
      };
      continue;
    }

    // Check for section pattern
    const sectionMatch = matchPatterns(line, SECTION_PATTERNS);
    if (sectionMatch && currentChapter) {
      flushSection();
      currentSection = {
        title: sectionMatch,
        content: "",
        quiz: []
      };
      continue;
    }

    // If no chapter exists, create a default one
    if (!currentChapter) {
      currentChapter = {
        title: "Introduction",
        sections: []
      };
    }

    // If no section exists, create a default one
    if (!currentSection) {
      currentSection = {
        title: line.length < 80 ? line : "Section 1",
        content: "",
        quiz: []
      };
      if (line.length >= 80) {
        contentBuffer.push(line);
      }
      continue;
    }

    // Add to content buffer
    contentBuffer.push(line);
  }

  // Flush remaining content
  flushChapter();

  // If no chapters were created, create one from all content
  if (chapters.length === 0 && contentBuffer.length > 0) {
    chapters.push({
      title: "Chapitre 1",
      sections: [{
        title: "Section 1",
        content: formatContentToHTML(contentBuffer.join("\n")),
        quiz: []
      }]
    });
  }

  // Generate quiz questions for each section
  chapters.forEach(chapter => {
    chapter.sections.forEach(section => {
      section.quiz = generateQuizFromContent(section.content, section.title);
    });
  });

  return { title: courseTitle, chapters };
}

/**
 * Parse JSON format course
 */
export function parseJSONToCourse(jsonStr: string): ParsedCourse {
  try {
    const data = JSON.parse(jsonStr);
    
    // Handle array of chapters
    if (Array.isArray(data)) {
      return {
        title: "Cours importé",
        chapters: data.map((ch, i) => normalizeChapter(ch, i))
      };
    }
    
    // Handle course object
    return {
      title: data.title || data.titre || data.name || "Cours importé",
      chapters: (data.chapters || data.chapitres || data.parts || [])
        .map((ch: any, i: number) => normalizeChapter(ch, i))
    };
  } catch {
    throw new Error("Format JSON invalide");
  }
}

function normalizeChapter(ch: any, index: number): ParsedChapter {
  const title = ch.title || ch.titre || ch.name || `Chapitre ${index + 1}`;
  const sections = ch.sections || ch.lessons || ch.lecons || ch.parts || [];
  
  return {
    title,
    sections: sections.map((s: any, i: number) => normalizeSection(s, i))
  };
}

function normalizeSection(s: any, index: number): ParsedSection {
  const title = s.title || s.titre || s.name || `Section ${index + 1}`;
  let content = s.content || s.contenu || s.text || s.texte || "";
  
  // Convert plain text to HTML if needed
  if (!content.includes("<")) {
    content = formatContentToHTML(content);
  }
  
  // Parse or generate quiz
  let quiz: QuizQuestion[] = [];
  if (s.quiz && Array.isArray(s.quiz)) {
    quiz = s.quiz.map(normalizeQuizQuestion).filter(Boolean) as QuizQuestion[];
  } else if (s.questions && Array.isArray(s.questions)) {
    quiz = s.questions.map(normalizeQuizQuestion).filter(Boolean) as QuizQuestion[];
  }
  
  // Generate quiz if none provided
  if (quiz.length === 0) {
    quiz = generateQuizFromContent(content, title);
  }
  
  return { title, content, quiz };
}

function normalizeQuizQuestion(q: any): QuizQuestion | null {
  if (!q || !q.question) return null;
  
  // MCQ
  if (q.choices || q.options || q.reponses) {
    const choices = q.choices || q.options || q.reponses || [];
    let correctAnswer = 0;
    
    if (typeof q.correctAnswer === "number") {
      correctAnswer = q.correctAnswer;
    } else if (typeof q.answer === "number") {
      correctAnswer = q.answer;
    } else if (typeof q.correct === "number") {
      correctAnswer = q.correct;
    } else if (typeof q.correctAnswer === "string") {
      correctAnswer = choices.findIndex((c: string) => 
        c.toLowerCase().includes(q.correctAnswer.toLowerCase())
      );
      if (correctAnswer < 0) correctAnswer = 0;
    }
    
    return {
      type: "mcq",
      question: q.question,
      choices: choices.slice(0, 4),
      correctAnswer,
      explanation: q.explanation || q.explication || "Voir le cours pour plus de détails."
    };
  }
  
  // True/False
  if (typeof q.correctAnswer === "boolean" || typeof q.answer === "boolean" || q.type === "tf" || q.type === "vf") {
    return {
      type: "tf",
      question: q.question,
      correctAnswer: q.correctAnswer ?? q.answer ?? true,
      explanation: q.explanation || q.explication || "Voir le cours pour plus de détails."
    };
  }
  
  // Short answer
  if (q.keywords || q.mots_cles || (Array.isArray(q.correctAnswer) || Array.isArray(q.answer))) {
    return {
      type: "short",
      question: q.question,
      correctAnswer: q.keywords || q.mots_cles || q.correctAnswer || q.answer || [],
      explanation: q.explanation || q.explication || "Voir le cours pour plus de détails."
    };
  }
  
  return null;
}

/**
 * Format plain text to styled HTML
 */
function formatContentToHTML(text: string): string {
  const lines = text.split("\n");
  const htmlParts: string[] = [];
  let inList = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }
    
    // Detect bullet points
    if (trimmed.match(/^[-•*]\s+/)) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      const content = applyHighlights(trimmed.replace(/^[-•*]\s+/, ""));
      htmlParts.push(`<li>${content}</li>`);
      continue;
    }
    
    // Detect numbered lists
    if (trimmed.match(/^\d+[.)\s]+/)) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      const content = applyHighlights(trimmed.replace(/^\d+[.)\s]+/, ""));
      htmlParts.push(`<li>${content}</li>`);
      continue;
    }
    
    // Close list if needed
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
    
    // Detect headers (bold or short lines)
    if (trimmed.length < 60 && !trimmed.match(/[.,:;]$/)) {
      htmlParts.push(`<h4>${trimmed}</h4>`);
      continue;
    }
    
    // Regular paragraph
    htmlParts.push(`<p>${applyHighlights(trimmed)}</p>`);
  }
  
  if (inList) {
    htmlParts.push("</ul>");
  }
  
  return htmlParts.join("\n");
}

/**
 * Apply semantic highlighting to text
 */
function applyHighlights(text: string): string {
  // Highlight terms in quotes
  text = text.replace(/"([^"]+)"/g, '<span class="hl">$1</span>');
  text = text.replace(/«\s*([^»]+)\s*»/g, '<span class="hl">$1</span>');
  
  // Highlight terms after "c'est-à-dire", "notamment", "tel que"
  text = text.replace(
    /(c'est-à-dire|notamment|tel que|tels que|par exemple|comme)\s+([^,.;:]+)/gi,
    '$1 <span class="hlg">$2</span>'
  );
  
  // Highlight definitions (X est Y, X désigne Y)
  text = text.replace(
    /\b(est défini comme|est|désigne|signifie|correspond à)\s+([^,.;:]+)/gi,
    (_, verb, def) => `${verb} <span class="hl">${def.trim()}</span>`
  );
  
  // Highlight legal/technical terms
  const legalTerms = [
    "créancier", "débiteur", "obligation", "contrat", "convention",
    "responsabilité", "dommage", "préjudice", "faute", "causalité",
    "synallagmatique", "unilatéral", "résultat", "moyen"
  ];
  
  for (const term of legalTerms) {
    const regex = new RegExp(`\\b(${term})\\b`, "gi");
    text = text.replace(regex, '<span class="hl">$1</span>');
  }
  
  return text;
}

/**
 * Generate quiz questions from section content
 */
function generateQuizFromContent(htmlContent: string, sectionTitle: string): QuizQuestion[] {
  const quiz: QuizQuestion[] = [];
  
  // Extract key terms from highlights
  const hlMatches = htmlContent.match(/<span class="hl[go]?">([^<]+)<\/span>/g) || [];
  const keyTerms = hlMatches.map(m => m.replace(/<[^>]+>/g, "")).filter(t => t.length > 2);
  
  // Extract plain text
  const plainText = htmlContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  
  // Generate MCQ from definitions
  const defMatch = plainText.match(/(.+?)\s+(?:est défini comme|est|désigne)\s+(.+?)(?:\.|$)/i);
  if (defMatch) {
    quiz.push({
      type: "mcq",
      question: `Qu'est-ce que ${defMatch[1].toLowerCase().trim()} ?`,
      choices: [
        defMatch[2].trim().slice(0, 100),
        "Une procédure judiciaire spéciale",
        "Un document administratif",
        "Une sanction pénale"
      ],
      correctAnswer: 0,
      explanation: `${defMatch[1]} ${defMatch[2].slice(0, 150)}...`
    });
  }
  
  // Generate True/False from statements
  if (keyTerms.length >= 2) {
    quiz.push({
      type: "tf",
      question: `La section "${sectionTitle}" traite principalement de ${keyTerms[0]}.`,
      correctAnswer: true,
      explanation: `Cette section aborde effectivement la notion de ${keyTerms[0]}.`
    });
  }
  
  // Generate short answer from multiple key terms
  if (keyTerms.length >= 3) {
    quiz.push({
      type: "short",
      question: `Citez les notions clés abordées dans "${sectionTitle}".`,
      correctAnswer: keyTerms.slice(0, 4),
      explanation: `Les notions clés sont : ${keyTerms.slice(0, 4).join(", ")}.`
    });
  }
  
  // Add a default question if none generated
  if (quiz.length === 0) {
    quiz.push({
      type: "tf",
      question: `Ce chapitre concerne "${sectionTitle}".`,
      correctAnswer: true,
      explanation: "Question générée automatiquement."
    });
  }
  
  return quiz;
}

/**
 * Match line against multiple patterns
 */
function matchPatterns(line: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      // Return the captured title (last non-empty group)
      const groups = match.filter(g => g && g !== match[0]);
      return groups[groups.length - 1]?.trim() || null;
    }
  }
  return null;
}

/**
 * Auto-detect format and parse
 */
export function parseCourseContent(content: string): ParsedCourse {
  const trimmed = content.trim();
  
  // Try JSON first
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return parseJSONToCourse(trimmed);
    } catch {
      // Fall through to text parsing
    }
  }
  
  // Parse as text
  return parseTextToCourse(trimmed);
}
