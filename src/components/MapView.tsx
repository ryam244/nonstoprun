/**
 * MapView Component
 * Displays map placeholder for Expo Go, real map for development builds
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Course, Coordinates } from '../types';

// Colors
const PRIMARY = '#13ec49';
const WHITE = '#ffffff';
const SLATE_100 = '#f1f5f9';
const SLATE_200 = '#e2e8f0';
const SLATE_500 = '#64748b';
const SLATE_900 = '#0f172a';

// Mapbox requires native code, so we use a placeholder in Expo Go
const USE_NATIVE_MAP = false;

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
  courses = [],
  selectedCourseId,
  style,
}: MapViewProps) {
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <View style={[styles.container, styles.placeholder, style]}>
      {/* Map Background Pattern */}
      <View style={styles.mapPattern}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternLine,
              { top: i * 30, transform: [{ rotate: '45deg' }] },
            ]}
          />
        ))}
      </View>

      {/* Center Marker */}
      <View style={styles.centerMarker}>
        <Ionicons name="location" size={40} color={PRIMARY} />
      </View>

      {/* Course Preview */}
      {selectedCourse && (
        <View style={styles.coursePreview}>
          <View
            style={[
              styles.courseRing,
              { borderColor: selectedCourse.color },
            ]}
          />
        </View>
      )}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="map" size={20} color={SLATE_500} />
        <Text style={styles.infoText}>
          地図プレビュー（モックモード）
        </Text>
      </View>

      {/* Location Info */}
      {center && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
          </Text>
        </View>
      )}
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
  return (
    <View style={[styles.container, styles.placeholder, style]}>
      {/* Map Background */}
      <View style={styles.navMapBg} />

      {/* Direction Arrow */}
      <View style={styles.directionArrow}>
        <Ionicons
          name="navigate"
          size={60}
          color={PRIMARY}
          style={{ transform: [{ rotate: `${heading || 0}deg` }] }}
        />
      </View>

      {/* Current Position */}
      <View style={[styles.currentPosition, styles.positionShadow]}>
        <View style={styles.positionDot} />
      </View>

      {/* Course Path Indicator */}
      {course && (
        <View style={[styles.pathIndicator, { backgroundColor: course.color }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
  },
  placeholder: {
    backgroundColor: SLATE_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternLine: {
    position: 'absolute',
    left: -100,
    right: -100,
    height: 1,
    backgroundColor: SLATE_200,
  },
  centerMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coursePreview: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderStyle: 'dashed',
  },
  infoBanner: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9999,
    gap: 12,
    shadowColor: SLATE_900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    color: SLATE_500,
    fontSize: 14,
    fontWeight: '500',
  },
  locationInfo: {
    position: 'absolute',
    top: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: SLATE_500,
    fontFamily: 'monospace',
  },
  navMapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SLATE_200,
  },
  directionArrow: {
    position: 'absolute',
    top: '30%',
  },
  currentPosition: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    borderWidth: 4,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionShadow: {
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  positionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  pathIndicator: {
    position: 'absolute',
    bottom: 60,
    width: 100,
    height: 4,
    borderRadius: 2,
  },
});

export default CourseMapView;
