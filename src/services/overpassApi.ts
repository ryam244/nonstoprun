/**
 * Overpass API Service
 * Fetches traffic signal data from OpenStreetMap
 */

import type { Coordinates, TrafficSignal } from '../types';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Cache for signal data to avoid repeated API calls
const signalCache = new Map<string, { signals: TrafficSignal[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch traffic signals within a radius of a location
 */
export async function fetchTrafficSignals(
  center: Coordinates,
  radiusMeters: number = 2000
): Promise<TrafficSignal[]> {
  const cacheKey = `${center.latitude.toFixed(3)},${center.longitude.toFixed(3)},${radiusMeters}`;

  // Check cache
  const cached = signalCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.signals;
  }

  try {
    // Overpass QL query for traffic signals
    const query = `
      [out:json][timeout:25];
      (
        node["highway"="traffic_signals"](around:${radiusMeters},${center.latitude},${center.longitude});
        node["crossing"="traffic_signals"](around:${radiusMeters},${center.latitude},${center.longitude});
      );
      out body;
    `;

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      console.error('Overpass API error:', response.status);
      return getMockSignals(center, radiusMeters);
    }

    const data = await response.json();

    const signals: TrafficSignal[] = data.elements.map((element: any) => ({
      location: {
        latitude: element.lat,
        longitude: element.lon,
      },
      type: 'traffic_signals' as const,
      waitTimeSeconds: 30 + Math.random() * 60, // Estimated wait time
    }));

    // Update cache
    signalCache.set(cacheKey, { signals, timestamp: Date.now() });

    return signals;
  } catch (error) {
    console.error('Overpass API fetch error:', error);
    return getMockSignals(center, radiusMeters);
  }
}

/**
 * Count signals along a route
 */
export function countSignalsOnRoute(
  routePoints: Coordinates[],
  signals: TrafficSignal[],
  proximityMeters: number = 30
): { count: number; signalsOnRoute: TrafficSignal[] } {
  const signalsOnRoute: TrafficSignal[] = [];

  for (const signal of signals) {
    // Check if signal is close to any point on the route
    for (const point of routePoints) {
      const distance = getDistanceMeters(
        point.latitude,
        point.longitude,
        signal.location.latitude,
        signal.location.longitude
      );

      if (distance <= proximityMeters) {
        signalsOnRoute.push(signal);
        break; // Don't count same signal multiple times
      }
    }
  }

  return {
    count: signalsOnRoute.length,
    signalsOnRoute,
  };
}

/**
 * Get mock signals for development/fallback
 */
function getMockSignals(center: Coordinates, radiusMeters: number): TrafficSignal[] {
  const numSignals = Math.floor(radiusMeters / 200); // ~1 signal per 200m
  const signals: TrafficSignal[] = [];

  for (let i = 0; i < numSignals; i++) {
    const angle = (2 * Math.PI * i) / numSignals + Math.random() * 0.5;
    const distance = (Math.random() * 0.7 + 0.3) * radiusMeters; // 30-100% of radius

    const lat = center.latitude + (distance / 111000) * Math.cos(angle);
    const lng = center.longitude + (distance / (111000 * Math.cos(toRad(center.latitude)))) * Math.sin(angle);

    signals.push({
      location: { latitude: lat, longitude: lng },
      type: 'traffic_signals',
      waitTimeSeconds: 30 + Math.random() * 60,
    });
  }

  return signals;
}

/**
 * Calculate distance between two points in meters (Haversine formula)
 */
function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
