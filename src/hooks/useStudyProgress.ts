import { useState, useEffect, useCallback } from "react";

interface SectionProgress {
  best: number;
  last: number;
  done: boolean;
  updatedAt: string;
}

interface StudyProgress {
  [sectionId: string]: SectionProgress;
}

const STORAGE_KEY_PROGRESS = "sl_progress";
const STORAGE_KEY_FAVORITES = "sl_favs";

export function useStudyProgress() {
  const [progress, setProgress] = useState<StudyProgress>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS) || "{}");
    } catch {
      return {};
    }
  });

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES) || "[]"));
    } catch {
      return new Set();
    }
  });

  // Persist progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  }, [progress]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify([...favorites]));
  }, [favorites]);

  const updateSectionProgress = useCallback((sectionId: string, score: number, total: number) => {
    const passed = total > 0 ? score / total >= 0.7 : true;
    
    setProgress((prev) => ({
      ...prev,
      [sectionId]: {
        best: Math.max(prev[sectionId]?.best || 0, score),
        last: score,
        done: passed,
        updatedAt: new Date().toISOString(),
      },
    }));

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

  const getTotalScore = useCallback(() => {
    return Object.values(progress).reduce((sum, p) => sum + (p.best || 0), 0);
  }, [progress]);

  const getCompletedCount = useCallback(() => {
    return Object.values(progress).filter((p) => p.done).length;
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({});
    setFavorites(new Set());
  }, []);

  return {
    progress,
    favorites,
    updateSectionProgress,
    toggleFavorite,
    isFavorite,
    getSectionProgress,
    getTotalScore,
    getCompletedCount,
    resetProgress,
  };
}
