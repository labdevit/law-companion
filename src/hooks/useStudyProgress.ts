import { useState, useEffect, useCallback } from "react";

interface SectionProgress {
  score: number;
  total: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
  lastAttempt: string;
}

interface CourseProgress {
  [sectionId: string]: SectionProgress;
}

interface StudyStats {
  totalScore: number;
  totalQuestions: number;
  sectionsCompleted: number;
  totalSections: number;
  coursesStarted: string[];
  streak: number;
  lastStudyDate: string;
}

const STORAGE_KEY = "pandora_progress";
const FAVORITES_KEY = "pandora_favorites";

export function useStudyProgress() {
  const [progress, setProgress] = useState<CourseProgress>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });

  // Persist progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const updateSectionProgress = useCallback((
    sectionId: string, 
    score: number, 
    total: number
  ): boolean => {
    const passed = total > 0 ? score / total >= 0.7 : false;
    
    setProgress((prev) => {
      const existing = prev[sectionId];
      return {
        ...prev,
        [sectionId]: {
          score,
          total,
          bestScore: Math.max(existing?.bestScore || 0, score),
          attempts: (existing?.attempts || 0) + 1,
          completed: passed || existing?.completed || false,
          lastAttempt: new Date().toISOString(),
        },
      };
    });

    return passed;
  }, []);

  const toggleFavorite = useCallback((sectionId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((sectionId: string) => {
    return favorites.has(sectionId);
  }, [favorites]);

  const getSectionProgress = useCallback((sectionId: string) => {
    return progress[sectionId];
  }, [progress]);

  const getStats = useCallback((): StudyStats => {
    const sections = Object.values(progress);
    const totalScore = sections.reduce((sum, p) => sum + (p.bestScore || 0), 0);
    const totalQuestions = sections.reduce((sum, p) => sum + (p.total || 0), 0);
    const sectionsCompleted = sections.filter(p => p.completed).length;
    
    return {
      totalScore,
      totalQuestions,
      sectionsCompleted,
      totalSections: sections.length,
      coursesStarted: [],
      streak: 0,
      lastStudyDate: new Date().toISOString(),
    };
  }, [progress]);

  const getProgressPercentage = useCallback((courseId: string, sectionIds: string[]) => {
    const completed = sectionIds.filter(id => progress[id]?.completed).length;
    return sectionIds.length > 0 ? Math.round((completed / sectionIds.length) * 100) : 0;
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({});
    setFavorites(new Set());
  }, []);

  const resetSectionProgress = useCallback((sectionId: string) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });
  }, []);

  const toggleSectionComplete = useCallback((sectionId: string, total: number = 1) => {
    setProgress((prev) => {
      const existing = prev[sectionId];
      const isCurrentlyComplete = existing?.completed || false;
      
      if (isCurrentlyComplete) {
        // Remove completion status
        return {
          ...prev,
          [sectionId]: {
            ...existing,
            completed: false,
          },
        };
      } else {
        // Mark as complete
        return {
          ...prev,
          [sectionId]: {
            score: existing?.score || total,
            total,
            bestScore: existing?.bestScore || total,
            attempts: existing?.attempts || 0,
            completed: true,
            lastAttempt: new Date().toISOString(),
          },
        };
      }
    });
  }, []);

  return {
    progress,
    favorites,
    updateSectionProgress,
    toggleFavorite,
    isFavorite,
    getSectionProgress,
    getStats,
    getProgressPercentage,
    resetProgress,
    resetSectionProgress,
    toggleSectionComplete,
  };
}
