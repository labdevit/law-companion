import { useState, useEffect, useCallback } from "react";

const STREAK_KEY = "pandora_streak";

interface StreakData {
  dates: string[];
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  todayCompleted: number;
  achievements: string[];
}

const ACHIEVEMENTS = [
  { id: "first_section", label: "Premier pas", icon: "🎯", condition: (d: StreakData, total: number) => total >= 1 },
  { id: "five_sections", label: "Étudiant assidu", icon: "📚", condition: (d: StreakData, total: number) => total >= 5 },
  { id: "ten_sections", label: "Scholar", icon: "🎓", condition: (d: StreakData, total: number) => total >= 10 },
  { id: "streak_3", label: "3 jours de suite", icon: "🔥", condition: (d: StreakData) => d.currentStreak >= 3 },
  { id: "streak_7", label: "Semaine parfaite", icon: "⚡", condition: (d: StreakData) => d.currentStreak >= 7 },
  { id: "streak_30", label: "Mois légendaire", icon: "🏆", condition: (d: StreakData) => d.currentStreak >= 30 },
  { id: "daily_goal", label: "Objectif atteint", icon: "✅", condition: (d: StreakData) => d.todayCompleted >= d.dailyGoal },
  { id: "twenty_sections", label: "Maître", icon: "👑", condition: (d: StreakData, total: number) => total >= 20 },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i - 1]);
    const prev = new Date(sorted[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

export function useStreak(sectionsCompleted: number) {
  const [data, setData] = useState<StreakData>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STREAK_KEY) || "null");
      if (saved) {
        const today = getToday();
        if (saved.dates[saved.dates.length - 1]?.split("T")[0] !== today) {
          saved.todayCompleted = 0;
        }
        return saved;
      }
    } catch {}
    return {
      dates: [],
      currentStreak: 0,
      longestStreak: 0,
      dailyGoal: 3,
      todayCompleted: 0,
      achievements: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  }, [data]);

  const recordStudy = useCallback(() => {
    setData((prev) => {
      const today = getToday();
      const newDates = prev.dates.includes(today) ? prev.dates : [...prev.dates, today];
      const currentStreak = calculateStreak(newDates);
      return {
        ...prev,
        dates: newDates,
        currentStreak,
        longestStreak: Math.max(prev.longestStreak, currentStreak),
        todayCompleted: prev.todayCompleted + 1,
      };
    });
  }, []);

  const unlockedAchievements = ACHIEVEMENTS.filter(
    (a) => a.condition(data, sectionsCompleted)
  );

  const allAchievements = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: a.condition(data, sectionsCompleted),
  }));

  return {
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    dailyGoal: data.dailyGoal,
    todayCompleted: data.todayCompleted,
    unlockedAchievements,
    allAchievements,
    recordStudy,
    studyDates: data.dates,
  };
}
