/**
 * Non-Stop Run Type Definitions
 */

// Geographic coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// A point along a route
export interface RoutePoint extends Coordinates {
  altitude?: number;
  timestamp?: number;
}

// Traffic signal information
export interface TrafficSignal {
  location: Coordinates;
  type: 'traffic_signals' | 'crossing' | 'stop';
  waitTimeSeconds?: number;
}

// Generated running course
export interface Course {
  id: string;
  name: string;
  distance: number; // in meters
  estimatedTime: number; // in seconds
  elevationGain: number; // in meters
  signalCount: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  routePoints: RoutePoint[];
  signals: TrafficSignal[];
  color: string; // for map display
  description?: string;
}

// Course generation request
export interface CourseRequest {
  startPoint: Coordinates;
  targetDistance: number; // in km
  avoidSignals: boolean;
  preferParks: boolean;
  preferRiverside: boolean;
}

// Course generation response
export interface CourseResponse {
  courses: Course[];
  generatedAt: string;
  searchRadiusKm: number;
}

// GraphHopper API types
export interface GraphHopperRoute {
  paths: GraphHopperPath[];
}

export interface GraphHopperPath {
  distance: number;
  time: number;
  ascend: number;
  descend: number;
  points: {
    coordinates: [number, number][];
    type: 'LineString';
  };
  instructions: GraphHopperInstruction[];
}

export interface GraphHopperInstruction {
  distance: number;
  heading: number;
  sign: number;
  interval: [number, number];
  text: string;
  time: number;
  street_name: string;
}

// Location state
export interface LocationState {
  current: Coordinates | null;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
}

// App state for Zustand store
export interface AppState {
  // Selected distance
  targetDistance: number;
  setTargetDistance: (distance: number) => void;

  // Generated courses
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;

  // Running state
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  runStartTime: number | null;
  setRunStartTime: (time: number | null) => void;

  // Location
  location: LocationState;
  setLocation: (location: Partial<LocationState>) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Navigation instruction for running
export interface NavigationInstruction {
  direction: 'straight' | 'left' | 'right' | 'u-turn' | 'arrive';
  distance: number; // meters to next turn
  streetName: string;
  description: string;
}

// Running stats
export interface RunningStats {
  elapsedTime: number; // seconds
  distanceCovered: number; // meters
  currentPace: number; // seconds per km
  averagePace: number; // seconds per km
  signalsPassed: number;
  signalsAhead: number;
}
