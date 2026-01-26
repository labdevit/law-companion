/**
 * Smart text matching utilities for quiz validation
 * Handles accents, partial matches, synonyms, and fuzzy matching
 */

// Remove accents from a string
export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Normalize text for comparison (lowercase, no accents, trim, collapse spaces)
export function normalizeText(str: string): string {
  return removeAccents(str.toLowerCase().trim()).replace(/\s+/g, " ");
}

// Check if two words are similar (Levenshtein distance)
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Check if word A is similar to word B (fuzzy match)
export function isSimilarWord(userWord: string, expectedWord: string, threshold = 0.75): boolean {
  const a = normalizeText(userWord);
  const b = normalizeText(expectedWord);
  
  // Exact match after normalization
  if (a === b) return true;
  
  // One contains the other
  if (a.includes(b) || b.includes(a)) return true;
  
  // Check if starts with same prefix (at least 4 chars)
  if (a.length >= 4 && b.length >= 4 && a.substring(0, 4) === b.substring(0, 4)) {
    return true;
  }
  
  // Levenshtein distance check for typos
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return true;
  
  const distance = levenshteinDistance(a, b);
  const similarity = 1 - distance / maxLen;
  
  return similarity >= threshold;
}

// Smart answer validation for short answers
export function validateShortAnswer(
  userAnswer: string,
  expectedKeywords: string[],
  minMatchRatio = 0.5 // At least 50% of keywords should match
): { isCorrect: boolean; matchedKeywords: string[]; missedKeywords: string[] } {
  const normalizedUser = normalizeText(userAnswer);
  const userWords = normalizedUser.split(/[\s,;.]+/).filter(w => w.length > 2);
  
  const matchedKeywords: string[] = [];
  const missedKeywords: string[] = [];
  
  for (const keyword of expectedKeywords) {
    const normalizedKeyword = normalizeText(keyword);
    const keywordParts = normalizedKeyword.split(/\s+/);
    
    let keywordMatched = false;
    
    // Check if the full keyword phrase is in the answer
    if (normalizedUser.includes(normalizedKeyword)) {
      keywordMatched = true;
    } else {
      // Check individual words with fuzzy matching
      for (const part of keywordParts) {
        if (part.length <= 2) continue;
        
        for (const userWord of userWords) {
          if (isSimilarWord(userWord, part)) {
            keywordMatched = true;
            break;
          }
        }
        if (keywordMatched) break;
      }
    }
    
    if (keywordMatched) {
      matchedKeywords.push(keyword);
    } else {
      missedKeywords.push(keyword);
    }
  }
  
  // Calculate required matches based on total keywords
  const requiredMatches = Math.max(1, Math.ceil(expectedKeywords.length * minMatchRatio));
  const isCorrect = matchedKeywords.length >= requiredMatches;
  
  return { isCorrect, matchedKeywords, missedKeywords };
}
