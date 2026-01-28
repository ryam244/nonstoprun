/**
 * MapView Component
 * Mapbox GL implementation for displaying running courses
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapboxGL from '@rnmapbox/maps';
import type { Course, Coordinates, TrafficSignal } from '../types';

// Colors
const PRIMARY = '#13ec49';
const WHITE = '#ffffff';
const RED = '#ef4444';
const SLATE_900 = '#0f172a';

// Initialize Mapbox with access token
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
MapboxGL.setAccessToken(MAPBOX_TOKEN);

interface MapViewProps {
  center?: Coordinates;
  zoom?: number;
  courses?: Course[];
  selectedCourseId?: string | null;
  showUserLocation?: boolean;
  signals?: TrafficSignal[];
  onCourseSelect?: (courseId: string) => void;
  style?: object;
}

export function CourseMapView({
  center,
  zoom = 14,
  courses = [],
  selectedCourseId,
  showUserLocation = true,
  signals = [],
  style,
}: MapViewProps) {
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // Default center (Tokyo Station)
  const defaultCenter: Coordinates = {
    latitude: 35.6812,
    longitude: 139.7671,
  };

  const mapCenter = center || defaultCenter;

  useEffect(() => {
    if (cameraRef.current && center) {
      cameraRef.current.setCamera({
        centerCoordinate: [center.longitude, center.latitude],
        zoomLevel: zoom,
        animationDuration: 500,
      });
    }
  }, [center, zoom]);

  // Generate GeoJSON for course routes
  const generateRouteGeoJSON = (course: Course) => {
    if (!course.waypoints || course.waypoints.length < 2) {
      return null;
    }

    return {
      type: 'Feature' as const,
      properties: {
        id: course.id,
        color: course.color,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: course.waypoints.map((wp) => [wp.longitude, wp.latitude]),
      },
    };
  };

  // Generate GeoJSON for traffic signals
  const generateSignalsGeoJSON = () => {
    if (signals.length === 0) return null;

    return {
      type: 'FeatureCollection' as const,
      features: signals.map((signal, index) => ({
        type: 'Feature' as const,
        id: `signal-${index}`,
        properties: {
          type: signal.type,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [signal.location.longitude, signal.location.latitude],
        },
      })),
    };
  };

  const signalsGeoJSON = generateSignalsGeoJSON();

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={true}
        scaleBarEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={zoom}
          centerCoordinate={[mapCenter.longitude, mapCenter.latitude]}
          animationMode="flyTo"
          animationDuration={500}
        />

        {/* User Location */}
        {showUserLocation && (
          <MapboxGL.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
          />
        )}

        {/* Traffic Signals */}
        {signalsGeoJSON && (
          <MapboxGL.ShapeSource id="signals" shape={signalsGeoJSON}>
            <MapboxGL.CircleLayer
              id="signals-circle"
              style={{
                circleRadius: 8,
                circleColor: RED,
                circleOpacity: 0.9,
                circleStrokeWidth: 2,
                circleStrokeColor: WHITE,
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Course Routes */}
        {courses.map((course) => {
          const geoJSON = generateRouteGeoJSON(course);
          if (!geoJSON) return null;

          const isSelected = course.id === selectedCourseId;

          return (
            <MapboxGL.ShapeSource
              key={course.id}
              id={`route-${course.id}`}
              shape={geoJSON}
            >
              <MapboxGL.LineLayer
                id={`route-line-${course.id}`}
                style={{
                  lineColor: course.color,
                  lineWidth: isSelected ? 6 : 4,
                  lineOpacity: isSelected ? 1 : 0.6,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </MapboxGL.ShapeSource>
          );
        })}

        {/* Start/End Marker for selected course */}
        {selectedCourse && selectedCourse.waypoints && selectedCourse.waypoints.length > 0 && (
          <MapboxGL.PointAnnotation
            id="start-point"
            coordinate={[
              selectedCourse.waypoints[0].longitude,
              selectedCourse.waypoints[0].latitude,
            ]}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={20} color={WHITE} />
            </View>
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>
    </View>
  );
}

// Simplified map for navigation screen
export function NavigationMapView({
  center,
  course,
  heading = 0,
  signals = [],
  style,
}: {
  center?: Coordinates;
  course?: Course;
  heading?: number;
  signals?: TrafficSignal[];
  style?: object;
}) {
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const defaultCenter: Coordinates = {
    latitude: 35.6812,
    longitude: 139.7671,
  };

  const mapCenter = center || defaultCenter;

  useEffect(() => {
    if (cameraRef.current && center) {
      cameraRef.current.setCamera({
        centerCoordinate: [center.longitude, center.latitude],
        zoomLevel: 16,
        heading: heading,
        animationDuration: 300,
      });
    }
  }, [center, heading]);

  const generateRouteGeoJSON = (courseData: Course) => {
    if (!courseData.waypoints || courseData.waypoints.length < 2) {
      return null;
    }

    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: courseData.waypoints.map((wp) => [wp.longitude, wp.latitude]),
      },
    };
  };

  // Generate GeoJSON for traffic signals
  const generateSignalsGeoJSON = () => {
    if (signals.length === 0) return null;

    return {
      type: 'FeatureCollection' as const,
      features: signals.map((signal, index) => ({
        type: 'Feature' as const,
        id: `signal-${index}`,
        properties: {},
        geometry: {
          type: 'Point' as const,
          coordinates: [signal.location.longitude, signal.location.latitude],
        },
      })),
    };
  };

  const signalsGeoJSON = generateSignalsGeoJSON();

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
        scaleBarEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={16}
          centerCoordinate={[mapCenter.longitude, mapCenter.latitude]}
          heading={heading}
          pitch={45}
          animationMode="flyTo"
          animationDuration={300}
        />

        {/* User Location with heading */}
        <MapboxGL.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
        />

        {/* Traffic Signals */}
        {signalsGeoJSON && (
          <MapboxGL.ShapeSource id="nav-signals" shape={signalsGeoJSON}>
            <MapboxGL.CircleLayer
              id="nav-signals-circle"
              style={{
                circleRadius: 10,
                circleColor: RED,
                circleOpacity: 0.9,
                circleStrokeWidth: 2,
                circleStrokeColor: WHITE,
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Course Route */}
        {course && (
          <MapboxGL.ShapeSource
            id="nav-route"
            shape={generateRouteGeoJSON(course) || undefined}
          >
            <MapboxGL.LineLayer
              id="nav-route-line"
              style={{
                lineColor: course.color || PRIMARY,
                lineWidth: 6,
                lineOpacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
  },
  map: {
    flex: 1,
  },
  startMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: WHITE,
    shadowColor: SLATE_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default CourseMapView;
