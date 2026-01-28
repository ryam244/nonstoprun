/**
 * Run History Service
 * Saves and loads run history using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Coordinates, Course } from '../types';

const RUN_HISTORY_KEY = '@nonstoprun:run_history';

export interface RunRecord {
  id: string;
  date: string; // ISO string
  courseId: string;
  courseName: string;
  distance: number; // meters
  duration: number; // seconds
  averagePace: number; // seconds per km
  signalsPassed: number;
  elevationGain: number;
  route: Coordinates[];
  exportedToHealth: boolean;
}

/**
 * Generate unique run ID
 */
function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a completed run to history
 */
export async function saveRunRecord(
  course: Course,
  duration: number,
  route: Coordinates[]
): Promise<RunRecord> {
  const record: RunRecord = {
    id: generateRunId(),
    date: new Date().toISOString(),
    courseId: course.id,
    courseName: course.name,
    distance: course.distance,
    duration,
    averagePace: duration / (course.distance / 1000),
    signalsPassed: 0, // TODO: Track actual signals passed
    elevationGain: course.elevationGain,
    route,
    exportedToHealth: false,
  };

  const history = await getRunHistory();
  history.unshift(record); // Add to beginning

  await AsyncStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(history));

  return record;
}

/**
 * Get all run history
 */
export async function getRunHistory(): Promise<RunRecord[]> {
  try {
    const data = await AsyncStorage.getItem(RUN_HISTORY_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load run history:', error);
  }
  return [];
}

/**
 * Get a specific run by ID
 */
export async function getRunById(id: string): Promise<RunRecord | null> {
  const history = await getRunHistory();
  return history.find((run) => run.id === id) || null;
}

/**
 * Mark run as exported to Health
 */
export async function markRunExported(id: string): Promise<void> {
  const history = await getRunHistory();
  const index = history.findIndex((run) => run.id === id);

  if (index !== -1) {
    history[index].exportedToHealth = true;
    await AsyncStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(history));
  }
}

/**
 * Delete a run from history
 */
export async function deleteRun(id: string): Promise<void> {
  const history = await getRunHistory();
  const filtered = history.filter((run) => run.id !== id);
  await AsyncStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(filtered));
}

/**
 * Get run statistics
 */
export async function getRunStats(): Promise<{
  totalRuns: number;
  totalDistance: number;
  totalDuration: number;
  averagePace: number;
}> {
  const history = await getRunHistory();

  if (history.length === 0) {
    return {
      totalRuns: 0,
      totalDistance: 0,
      totalDuration: 0,
      averagePace: 0,
    };
  }

  const totalDistance = history.reduce((sum, run) => sum + run.distance, 0);
  const totalDuration = history.reduce((sum, run) => sum + run.duration, 0);

  return {
    totalRuns: history.length,
    totalDistance,
    totalDuration,
    averagePace: totalDuration / (totalDistance / 1000),
  };
}

/**
 * Format pace as MM'SS"
 */
export function formatPace(secondsPerKm: number): string {
  if (!secondsPerKm || !isFinite(secondsPerKm)) return '--\'--"';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
}

/**
 * Format duration as HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
