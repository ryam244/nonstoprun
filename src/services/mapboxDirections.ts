/**
 * Mapbox Directions API Client
 * Uses the same access token as map display
 */

import type { Coordinates, Course, RoutePoint } from '../types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DIRECTIONS_API_URL = 'https://api.mapbox.com/directions/v5/mapbox';

interface MapboxRouteResponse {
  routes: Array<{
    distance: number;  // meters
    duration: number;  // seconds
    geometry: {
      coordinates: [number, number][];  // [lng, lat]
    };
  }>;
  waypoints: Array<{
    location: [number, number];
    name: string;
  }>;
}

/**
 * Generate a circular running route using Mapbox Directions API
 */
export async function generateMapboxRoute(
  start: Coordinates,
  targetDistanceKm: number
): Promise<MapboxRouteResponse | null> {
  try {
    // Generate waypoints for a circular route
    const waypoints = generateCircularWaypoints(start, targetDistanceKm);

    // Format coordinates for Mapbox API: lng,lat;lng,lat;...
    const coordinates = waypoints
      .map((wp) => `${wp.longitude},${wp.latitude}`)
      .join(';');

    const url = `${DIRECTIONS_API_URL}/walking/${coordinates}?` +
      `geometries=geojson&` +
      `overview=full&` +
      `steps=false&` +
      `access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      console.error('Mapbox Directions API error:', response.status, error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Mapbox Directions API error:', error);
    return null;
  }
}

/**
 * Generate waypoints for a circular route
 */
function generateCircularWaypoints(
  start: Coordinates,
  targetDistanceKm: number,
  numPoints: number = 4
): Coordinates[] {
  const waypoints: Coordinates[] = [start];

  // Calculate radius based on target distance
  // For a circular path: circumference ≈ 2πr, so r ≈ distance/(2π)
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
function offsetCoordinate(
  start: Coordinates,
  distanceKm: number,
  bearingRad: number
): Coordinates {
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
 * Convert Mapbox response to Course format
 */
export function convertMapboxToCourse(
  response: MapboxRouteResponse,
  courseId: string,
  name: string,
  color: string
): Course | null {
  if (!response.routes || response.routes.length === 0) {
    return null;
  }

  const route = response.routes[0];

  const routePoints: RoutePoint[] = route.geometry.coordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));

  // Estimate elevation (Mapbox walking profile doesn't include elevation)
  const estimatedElevation = Math.random() * 30 + 10;

  return {
    id: courseId,
    name,
    distance: route.distance,
    estimatedTime: route.duration,
    elevationGain: estimatedElevation,
    signalCount: 0, // TODO: Query OSM for traffic signals
    difficulty: getDifficulty(route.distance, estimatedElevation),
    routePoints,
    waypoints: routePoints, // Add waypoints for map display
    signals: [],
    color,
    description: generateDescription(route.distance, estimatedElevation),
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

/**
 * Generate mock route for offline/testing
 */
export function generateMockMapboxRoute(
  start: Coordinates,
  targetDistanceKm: number
): MapboxRouteResponse {
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
    routes: [
      {
        distance: targetDistanceKm * 1000,
        duration: targetDistanceKm * 6 * 60, // ~6 min/km pace
        geometry: {
          coordinates,
        },
      },
    ],
    waypoints: waypoints.map((wp) => ({
      location: [wp.longitude, wp.latitude],
      name: '',
    })),
  };
}
