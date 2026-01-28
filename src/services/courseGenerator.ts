/**
 * Course Generator Service
 * Generates multiple running courses with different characteristics
 * Uses Mapbox Directions API for route generation
 */

import {
  generateMapboxRoute,
  convertMapboxToCourse,
  generateMockMapboxRoute
} from './mapboxDirections';
import { USE_MOCK_API, isLocationSupported } from './config';
import type { Coordinates, Course, CourseResponse } from '../types';

// Colors (inline to avoid theme import issues)
const PRIMARY = '#13ec49';
const BLUE_500 = '#3b82f6';
const PURPLE_500 = '#a855f7';

// Course types with different characteristics
const COURSE_TYPES = [
  {
    id: 'fast',
    name: '最速コース',
    color: PRIMARY,
    description: '信号が最も少ないルート',
    angleOffset: 0,
  },
  {
    id: 'scenic',
    name: '景観コース',
    color: BLUE_500,
    description: '公園や川沿いを通るルート',
    angleOffset: Math.PI / 4, // 45 degrees offset
  },
  {
    id: 'balanced',
    name: 'バランスコース',
    color: PURPLE_500,
    description: '距離と景観のバランス',
    angleOffset: -Math.PI / 4, // -45 degrees offset
  },
] as const;

/**
 * Generate multiple course options
 */
export async function generateCourses(
  startPoint: Coordinates,
  targetDistanceKm: number
): Promise<CourseResponse> {
  // Check if location is in supported area
  const supported = isLocationSupported(startPoint.latitude, startPoint.longitude);

  if (!supported) {
    console.warn('Location not in supported area, using mock data');
  }

  const courses: Course[] = [];

  // Generate courses in parallel
  const coursePromises = COURSE_TYPES.map(async (type) => {
    // Slightly adjust the route for variety
    const adjustedStart = adjustStartPoint(startPoint, type.angleOffset, 0.1);

    let routeResponse;

    if (USE_MOCK_API) {
      // Use mock data for development
      routeResponse = generateMockMapboxRoute(adjustedStart, targetDistanceKm);
    } else {
      // Use real Mapbox Directions API
      routeResponse = await generateMapboxRoute(adjustedStart, targetDistanceKm);
    }

    if (routeResponse) {
      return convertMapboxToCourse(
        routeResponse,
        `course_${type.id}_${Date.now()}`,
        type.name,
        type.color
      );
    }
    return null;
  });

  const results = await Promise.all(coursePromises);

  // Filter out failed routes
  for (const course of results) {
    if (course) {
      courses.push(course);
    }
  }

  // Sort by signal count (fewer signals = better for non-stop running)
  courses.sort((a, b) => a.signalCount - b.signalCount);

  return {
    courses,
    generatedAt: new Date().toISOString(),
    searchRadiusKm: targetDistanceKm / 2,
  };
}

/**
 * Adjust start point slightly for route variety
 */
function adjustStartPoint(
  point: Coordinates,
  angleOffset: number,
  distanceKm: number
): Coordinates {
  const R = 6371;
  const lat1 = toRad(point.latitude);
  const lng1 = toRad(point.longitude);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(angleOffset)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(angleOffset) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: toDeg(lat2),
    longitude: toDeg(lng2),
  };
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function toDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format pace in M'SS" format
 */
export function formatPace(secondsPerKm: number): string {
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
}

/**
 * Format distance in km
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  if (km < 1) {
    return `${Math.round(meters)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Estimate completion time based on pace
 */
export function estimateTime(distanceMeters: number, paceSecondsPerKm: number): number {
  return (distanceMeters / 1000) * paceSecondsPerKm;
}
