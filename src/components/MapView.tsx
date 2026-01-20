/**
 * MapView Component
 * Displays map with Mapbox GL and renders running courses
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Mapbox, { Camera, LocationPuck, MapView as RNMapView, ShapeSource, LineLayer } from '@rnmapbox/maps';
import { MAPBOX_CONFIG, USE_MOCK_API } from '../services/config';
import type { Course, Coordinates } from '../types';
import { colors, borderRadius, typography, spacing } from '../theme';

// Initialize Mapbox
Mapbox.setAccessToken(MAPBOX_CONFIG.accessToken);

interface MapViewProps {
  center?: Coordinates;
  zoom?: number;
  courses?: Course[];
  selectedCourseId?: string | null;
  showUserLocation?: boolean;
  onCourseSelect?: (courseId: string) => void;
  style?: object;
}

export function CourseMapView({
  center,
  zoom = MAPBOX_CONFIG.defaultZoom,
  courses = [],
  selectedCourseId,
  showUserLocation = true,
  onCourseSelect,
  style,
}: MapViewProps) {
  const cameraRef = useRef<Camera>(null);

  // If no Mapbox token, show placeholder
  if (!MAPBOX_CONFIG.accessToken && !USE_MOCK_API) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>地図を読み込み中...</Text>
        <Text style={styles.placeholderSubtext}>
          Mapboxトークンを設定してください
        </Text>
      </View>
    );
  }

  // Convert course to GeoJSON
  const courseToGeoJSON = (course: Course) => ({
    type: 'Feature' as const,
    properties: {
      id: course.id,
      name: course.name,
      color: course.color,
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: course.routePoints.map((p) => [p.longitude, p.latitude]),
    },
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const otherCourses = courses.filter((c) => c.id !== selectedCourseId);

  return (
    <View style={[styles.container, style]}>
      <RNMapView
        style={styles.map}
        styleURL={MAPBOX_CONFIG.styleURL}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={
            center
              ? [center.longitude, center.latitude]
              : [MAPBOX_CONFIG.defaultCenter.longitude, MAPBOX_CONFIG.defaultCenter.latitude]
          }
          zoomLevel={zoom}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {showUserLocation && (
          <LocationPuck
            puckBearing="heading"
            puckBearingEnabled={true}
            pulsing={{ isEnabled: true, color: colors.primary }}
          />
        )}

        {/* Render non-selected courses (dimmed) */}
        {otherCourses.map((course) => (
          <ShapeSource
            key={course.id}
            id={`course-${course.id}`}
            shape={courseToGeoJSON(course)}
          >
            <LineLayer
              id={`line-${course.id}`}
              style={{
                lineColor: course.color,
                lineWidth: 4,
                lineOpacity: 0.4,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        ))}

        {/* Render selected course (highlighted) */}
        {selectedCourse && (
          <ShapeSource
            id={`course-selected-${selectedCourse.id}`}
            shape={courseToGeoJSON(selectedCourse)}
          >
            <LineLayer
              id={`line-selected-${selectedCourse.id}`}
              style={{
                lineColor: selectedCourse.color,
                lineWidth: 6,
                lineOpacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}
      </RNMapView>
    </View>
  );
}

// Simplified map for navigation screen
export function NavigationMapView({
  center,
  course,
  heading,
  style,
}: {
  center?: Coordinates;
  course?: Course;
  heading?: number;
  style?: object;
}) {
  if (!MAPBOX_CONFIG.accessToken && !USE_MOCK_API) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <View style={styles.mockPosition}>
          <View style={styles.mockPositionDot} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <RNMapView
        style={styles.map}
        styleURL={MAPBOX_CONFIG.styleURL}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        <Camera
          centerCoordinate={
            center
              ? [center.longitude, center.latitude]
              : [MAPBOX_CONFIG.defaultCenter.longitude, MAPBOX_CONFIG.defaultCenter.latitude]
          }
          zoomLevel={17}
          pitch={60}
          heading={heading || 0}
          animationMode="easeTo"
          animationDuration={500}
        />

        <LocationPuck
          puckBearing="heading"
          puckBearingEnabled={true}
          pulsing={{ isEnabled: true, color: colors.primary }}
        />

        {course && (
          <ShapeSource
            id="navigation-course"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: course.routePoints.map((p) => [p.longitude, p.latitude]),
              },
            }}
          >
            <LineLayer
              id="navigation-line"
              style={{
                lineColor: colors.primary,
                lineWidth: 8,
                lineOpacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}
      </RNMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: borderRadius.DEFAULT,
  },
  map: {
    flex: 1,
  },
  placeholder: {
    backgroundColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate500,
  },
  placeholderSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.slate400,
    marginTop: spacing.sm,
  },
  mockPosition: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockPositionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
});

export default CourseMapView;
