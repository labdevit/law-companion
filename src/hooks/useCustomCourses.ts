import { useState, useEffect, useCallback } from "react";
import { Course, Chapter, Section, QuizQuestion } from "@/data/courses";

const CUSTOM_COURSES_KEY = "pandora_custom_courses";

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Available course colors
export const COURSE_COLORS = [
  { name: "Bleu", value: "from-blue-500 to-indigo-600" },
  { name: "Vert", value: "from-emerald-500 to-teal-600" },
  { name: "Orange", value: "from-orange-500 to-amber-600" },
  { name: "Rouge", value: "from-red-500 to-rose-600" },
  { name: "Violet", value: "from-purple-500 to-violet-600" },
  { name: "Cyan", value: "from-cyan-500 to-sky-600" },
  { name: "Rose", value: "from-pink-500 to-fuchsia-600" },
];

// Available emoji icons
export const COURSE_ICONS = [
  "📚", "📖", "📝", "⚖️", "💼", "🏛️", "📋", "🔬", 
  "💡", "🎯", "🧠", "📊", "🔐", "🌍", "💰", "🏥",
  "🎓", "✨", "🔧", "🎨", "🌱", "⚡", "🔮", "🎪"
];

export interface CustomCourseData {
  title: string;
  icon: string;
  color: string;
  chapters: {
    title: string;
    sections: {
      title: string;
      content: string;
      quiz: QuizQuestion[];
    }[];
  }[];
}

export function useCustomCourses() {
  const [customCourses, setCustomCourses] = useState<Course[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_COURSES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_COURSES_KEY, JSON.stringify(customCourses));
  }, [customCourses]);

  const addCourse = useCallback((data: CustomCourseData): Course => {
    const courseId = generateId("custom");
    
    const newCourse: Course = {
      id: courseId,
      title: data.title,
      icon: data.icon,
      color: data.color,
      chapters: data.chapters.map((ch, chIndex) => ({
        id: `${courseId}_ch${chIndex + 1}`,
        title: ch.title,
        sections: ch.sections.map((sec, secIndex) => ({
          id: `${courseId}_ch${chIndex + 1}_s${secIndex + 1}`,
          title: sec.title,
          content: sec.content,
          quiz: sec.quiz,
        })),
      })),
    };

    setCustomCourses((prev) => [...prev, newCourse]);
    return newCourse;
  }, []);

  const updateCourse = useCallback((courseId: string, data: CustomCourseData) => {
    setCustomCourses((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          title: data.title,
          icon: data.icon,
          color: data.color,
          chapters: data.chapters.map((ch, chIndex) => ({
            id: `${courseId}_ch${chIndex + 1}`,
            title: ch.title,
            sections: ch.sections.map((sec, secIndex) => ({
              id: `${courseId}_ch${chIndex + 1}_s${secIndex + 1}`,
              title: sec.title,
              content: sec.content,
              quiz: sec.quiz,
            })),
          })),
        };
      })
    );
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setCustomCourses((prev) => prev.filter((c) => c.id !== courseId));
  }, []);

  const duplicateCourse = useCallback((courseId: string) => {
    const course = customCourses.find((c) => c.id === courseId);
    if (!course) return;

    const newCourseId = generateId("custom");
    const duplicated: Course = {
      ...course,
      id: newCourseId,
      title: `${course.title} (copie)`,
      chapters: course.chapters.map((ch, chIndex) => ({
        ...ch,
        id: `${newCourseId}_ch${chIndex + 1}`,
        sections: ch.sections.map((sec, secIndex) => ({
          ...sec,
          id: `${newCourseId}_ch${chIndex + 1}_s${secIndex + 1}`,
        })),
      })),
    };

    setCustomCourses((prev) => [...prev, duplicated]);
  }, [customCourses]);

  return {
    customCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
  };
}
