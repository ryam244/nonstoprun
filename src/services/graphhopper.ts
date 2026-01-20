/**
 * GraphHopper API Client
 * Supports both self-hosted (ConoHa) and mock mode
 */

import { GRAPHHOPPER_CONFIG, USE_MOCK_API } from './config';
import type { Coordinates, Course, CourseRequest, RoutePoint } from '../types';

interface GraphHopperRouteResponse {
  paths: Array<{
    distance: number;
    time: number;
    ascend: number;
    descend: number;
    points: {
      coordinates: [number, number][];
    };
  }>;
}

/**
 * Generate a circular running route using GraphHopper
 */
export async function generateRoute(
  start: Coordinates,
  targetDistanceKm: number
): Promise<GraphHopperRouteResponse | null> {
  if (USE_MOCK_API) {
    return generateMockRoute(start, targetDistanceKm);
  }

  try {
    // Generate waypoints for a circular route
    const waypoints = generateCircularWaypoints(start, targetDistanceKm);

    const points = waypoints.map((wp) => `${wp.latitude},${wp.longitude}`).join('&point=');

    const url = `${GRAPHHOPPER_CONFIG.baseURL}/route?point=${points}&profile=${GRAPHHOPPER_CONFIG.profile}&points_encoded=false&ch.disable=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(GRAPHHOPPER_CONFIG.apiKey && {
          Authorization: `Bearer ${GRAPHHOPPER_CONFIG.apiKey}`,
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`GraphHopper API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GraphHopper API error:', error);
    return null;
  }
}

/**
 * Generate waypoints for a circular route
 * Creates a roughly circular path around the start point
 */
function generateCircularWaypoints(
  start: Coordinates,
  targetDistanceKm: number,
  numPoints: number = 4
): Coordinates[] {
  const waypoints: Coordinates[] = [start];

  // Calculate radius based on target distance (circumference = 2 * π * r)
  const radiusKm = targetDistanceKm / (2 * Math.PI);

  // Generate points around the circle
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const point = offsetCoordinate(start, radiusKm, angle);
    waypoints.push(point);
  }

  // Return to start
  waypoints.push(start);

  return waypoints;
}

/**
 * Offset a coordinate by distance and bearing
 */
function offsetCoordinate(start: Coordinates, distanceKm: number, bearingRad: number): Coordinates {
  const R = 6371; // Earth's radius in km

  const lat1 = toRad(start.latitude);
  const lng1 = toRad(start.longitude);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearingRad)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(distanceKm / R) * Math.cos(lat1),
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
 * Generate mock route for development
 */
function generateMockRoute(
  start: Coordinates,
  targetDistanceKm: number
): GraphHopperRouteResponse {
  const waypoints = generateCircularWaypoints(start, targetDistanceKm, 8);

  // Create smooth path between waypoints
  const coordinates: [number, number][] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];

    // Interpolate between waypoints
    for (let t = 0; t < 1; t += 0.1) {
      coordinates.push([
        from.longitude + (to.longitude - from.longitude) * t,
        from.latitude + (to.latitude - from.latitude) * t,
      ]);
    }
  }
  coordinates.push([start.longitude, start.latitude]);

  return {
    paths: [
      {
        distance: targetDistanceKm * 1000,
        time: targetDistanceKm * 6 * 60 * 1000, // ~6 min/km
        ascend: Math.random() * 50,
        descend: Math.random() * 50,
        points: {
          coordinates,
        },
      },
    ],
  };
}

/**
 * Convert GraphHopper response to Course format
 */
export function convertToCourse(
  response: GraphHopperRouteResponse,
  courseId: string,
  name: string,
  color: string
): Course {
  const path = response.paths[0];

  const routePoints: RoutePoint[] = path.points.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return {
    id: courseId,
    name,
    distance: path.distance,
    estimatedTime: path.time / 1000, // Convert to seconds
    elevationGain: path.ascend,
    signalCount: 0, // TODO: Query OSM for traffic signals
    difficulty: getDifficulty(path.distance, path.ascend),
    routePoints,
    signals: [], // TODO: Add signal detection
    color,
    description: generateDescription(path.distance, path.ascend),
  };
}

function getDifficulty(distance: number, ascend: number): 'easy' | 'moderate' | 'hard' {
  const distanceKm = distance / 1000;
  const gradientPercent = (ascend / distance) * 100;

  if (distanceKm <= 5 && gradientPercent < 2) return 'easy';
  if (distanceKm <= 10 && gradientPercent < 4) return 'moderate';
  return 'hard';
}

function generateDescription(distance: number, ascend: number): string {
  const distanceKm = (distance / 1000).toFixed(1);
  const elevationGain = Math.round(ascend);

  if (elevationGain < 20) {
    return `${distanceKm}kmのフラットなコース`;
  } else if (elevationGain < 50) {
    return `${distanceKm}km、緩やかなアップダウン`;
  } else {
    return `${distanceKm}km、高低差${elevationGain}mのチャレンジコース`;
  }
}
