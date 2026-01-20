/**
 * App Store (Zustand)
 * Global state management for Non-Stop Run
 */

import { create } from 'zustand';
import type { Course, LocationState, Coordinates } from '../types';

interface AppState {
  // Selected distance
  targetDistance: number;
  setTargetDistance: (distance: number) => void;

  // Generated courses
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  clearCourses: () => void;

  // Selected course
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  getSelectedCourse: () => Course | null;

  // Running state
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  runStartTime: number | null;
  setRunStartTime: (time: number | null) => void;

  // Current location
  currentLocation: Coordinates | null;
  setCurrentLocation: (location: Coordinates | null) => void;

  // Loading states
  isGeneratingCourses: boolean;
  setIsGeneratingCourses: (loading: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset all state
  reset: () => void;
}

const INITIAL_STATE = {
  targetDistance: 5, // Default 5km
  courses: [],
  selectedCourseId: null,
  isRunning: false,
  runStartTime: null,
  currentLocation: null,
  isGeneratingCourses: false,
  error: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  ...INITIAL_STATE,

  // Distance
  setTargetDistance: (distance) => set({ targetDistance: distance }),

  // Courses
  setCourses: (courses) =>
    set({
      courses,
      selectedCourseId: courses.length > 0 ? courses[0].id : null,
    }),
  clearCourses: () => set({ courses: [], selectedCourseId: null }),

  // Selected course
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),
  getSelectedCourse: () => {
    const { courses, selectedCourseId } = get();
    return courses.find((c) => c.id === selectedCourseId) || null;
  },

  // Running
  setIsRunning: (running) => set({ isRunning: running }),
  setRunStartTime: (time) => set({ runStartTime: time }),

  // Location
  setCurrentLocation: (location) => set({ currentLocation: location }),

  // Loading
  setIsGeneratingCourses: (loading) => set({ isGeneratingCourses: loading }),

  // Error
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Reset
  reset: () => set(INITIAL_STATE),
}));

export default useAppStore;
