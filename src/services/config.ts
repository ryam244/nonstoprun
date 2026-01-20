/**
 * API Configuration
 * Supports both mock mode and production APIs
 */

// Check if running in mock mode
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

// Mapbox Configuration
export const MAPBOX_CONFIG = {
  accessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  // Default style - can be customized later
  styleURL: 'mapbox://styles/mapbox/streets-v12',
  // Japan-focused default center (Tokyo Station)
  defaultCenter: {
    latitude: 35.6812,
    longitude: 139.7671,
  },
  defaultZoom: 14,
} as const;

// GraphHopper Configuration
export const GRAPHHOPPER_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_GRAPHHOPPER_API_URL || 'http://localhost:8989',
  apiKey: process.env.EXPO_PUBLIC_GRAPHHOPPER_API_KEY || '',
  // Routing profile for running/walking
  profile: 'foot',
  // Request timeout in ms
  timeout: 30000,
} as const;

// Supported cities for Phase 1 (Major Japanese cities)
export const SUPPORTED_CITIES = [
  { name: '東京', center: { lat: 35.6812, lng: 139.7671 }, radius: 30 },
  { name: '大阪', center: { lat: 34.6937, lng: 135.5023 }, radius: 20 },
  { name: '名古屋', center: { lat: 35.1815, lng: 136.9066 }, radius: 15 },
  { name: '横浜', center: { lat: 35.4437, lng: 139.6380 }, radius: 15 },
  { name: '福岡', center: { lat: 33.5904, lng: 130.4017 }, radius: 15 },
  { name: '札幌', center: { lat: 43.0618, lng: 141.3545 }, radius: 15 },
  { name: '神戸', center: { lat: 34.6901, lng: 135.1956 }, radius: 10 },
  { name: '京都', center: { lat: 35.0116, lng: 135.7681 }, radius: 10 },
] as const;

// Check if location is in supported area
export function isLocationSupported(lat: number, lng: number): boolean {
  for (const city of SUPPORTED_CITIES) {
    const distance = getDistanceKm(lat, lng, city.center.lat, city.center.lng);
    if (distance <= city.radius) {
      return true;
    }
  }
  return false;
}

// Haversine formula for distance calculation
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
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
