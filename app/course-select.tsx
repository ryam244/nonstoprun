import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import { CourseMapView } from '@/components/MapView';
import { generateCourses, formatDistance, formatTime } from '@/services/courseGenerator';
import { useAppStore } from '@/stores/appStore';
import { useLocation } from '@/hooks/useLocation';
import type { Course } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 100;

export default function CourseSelectScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ distance: string }>();

  const { current: currentLocation, isLoading: locationLoading, getMockLocation } = useLocation();
  const {
    courses,
    setCourses,
    selectedCourseId,
    setSelectedCourseId,
    isGeneratingCourses,
    setIsGeneratingCourses,
  } = useAppStore();

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const textColor = isDark ? colors.white : colors.slate900;
  const subtextColor = isDark ? colors.slate400 : colors.slate500;
  const cardBg = isDark ? colors.slate900 : colors.white;

  const targetDistance = params.distance ? parseFloat(params.distance) : 5;

  // Generate courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      setIsGeneratingCourses(true);

      const location = currentLocation || getMockLocation();
      const response = await generateCourses(location, targetDistance);

      setCourses(response.courses);
      setIsGeneratingCourses(false);
    };

    if (!locationLoading) {
      loadCourses();
    }
  }, [targetDistance, currentLocation, locationLoading]);

  const handleStartRun = () => {
    router.push('/navigation');
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const getIconForCourse = (index: number): 'notifications-off' | 'leaf' | 'speedometer' => {
    const icons: Array<'notifications-off' | 'leaf' | 'speedometer'> = [
      'notifications-off',
      'leaf',
      'speedometer',
    ];
    return icons[index % icons.length];
  };

  const getBadgeForCourse = (index: number): { text: string; color: string } => {
    const badges = [
      { text: 'おすすめ', color: colors.primary },
      { text: '景色が良い', color: colors.blue500 },
      { text: '最速', color: colors.purple500 },
    ];
    return badges[index % badges.length];
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark
                ? 'rgba(16, 34, 21, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
            },
          ]}
        >
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: textColor }]}>コース選択</Text>
          <Pressable style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={textColor} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Map */}
      <View style={styles.mapContainer}>
        <CourseMapView
          center={currentLocation || getMockLocation()}
          courses={courses}
          selectedCourseId={selectedCourseId}
          showUserLocation={true}
          style={styles.map}
        />

        {/* Loading Overlay */}
        {isGeneratingCourses && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingCard, { backgroundColor: cardBg }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: textColor }]}>
                コースを生成中...
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark
                  ? 'rgba(15, 23, 42, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="エリアまたは公園を検索..."
              placeholderTextColor={colors.slate400}
            />
          </View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <View
            style={[
              styles.zoomControls,
              {
                backgroundColor: isDark
                  ? 'rgba(15, 23, 42, 0.9)'
                  : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
          >
            <Pressable
              style={[
                styles.zoomButton,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? colors.slate800 : colors.slate200,
                },
              ]}
            >
              <Ionicons
                name="add"
                size={24}
                color={isDark ? colors.slate300 : colors.slate700}
              />
            </Pressable>
            <Pressable style={styles.zoomButton}>
              <Ionicons
                name="remove"
                size={24}
                color={isDark ? colors.slate300 : colors.slate700}
              />
            </Pressable>
          </View>
          <Pressable
            style={[styles.locationButton, { backgroundColor: cardBg }, shadows.xl]}
          >
            <Ionicons
              name="navigate"
              size={24}
              color={isDark ? colors.slate300 : colors.slate700}
            />
          </Pressable>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Course Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          snapToInterval={CARD_WIDTH + spacing.md}
          decelerationRate="fast"
        >
          {courses.map((course, index) => {
            const isSelected = course.id === selectedCourseId;
            const badge = getBadgeForCourse(index);
            const icon = getIconForCourse(index);

            return (
              <Pressable
                key={course.id}
                onPress={() => handleCourseSelect(course.id)}
                style={[
                  styles.courseCard,
                  { backgroundColor: cardBg, width: CARD_WIDTH },
                  isSelected && { borderWidth: 2, borderColor: colors.primary },
                  shadows.lg,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <View style={[styles.badge, { backgroundColor: `${badge.color}20` }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>
                        {badge.text}
                      </Text>
                    </View>
                    <Text
                      style={[styles.courseName, { color: textColor }]}
                      numberOfLines={1}
                    >
                      {course.name}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${course.color}20` },
                    ]}
                  >
                    <Ionicons name={icon} size={24} color={course.color} />
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: colors.slate400 }]}>
                      距離
                    </Text>
                    <View style={styles.statValue}>
                      <Ionicons name="map-outline" size={14} color={subtextColor} />
                      <Text style={[styles.statText, { color: textColor }]}>
                        {formatDistance(course.distance)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: colors.slate400 }]}>
                      予想時間
                    </Text>
                    <View style={styles.statValue}>
                      <Ionicons name="time-outline" size={14} color={subtextColor} />
                      <Text style={[styles.statText, { color: textColor }]}>
                        {formatTime(course.estimatedTime)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: colors.slate400 }]}>
                      信号
                    </Text>
                    <View style={styles.statValue}>
                      <Text
                        style={[
                          styles.statText,
                          { color: textColor },
                          course.signalCount === 0 && {
                            color: colors.primary,
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {course.signalCount} 基
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.elevationRow}>
                  <View style={[styles.elevationChart, { borderColor: course.color }]} />
                  <View style={styles.elevationLabel}>
                    <Text style={[styles.statLabel, { color: colors.slate400 }]}>
                      高低差
                    </Text>
                    <Text style={[styles.elevationText, { color: colors.slate400 }]}>
                      {Math.round(course.elevationGain)}m
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Start Button */}
        <Pressable
          style={[
            styles.startButton,
            shadows.primary,
            (!selectedCourseId || isGeneratingCourses) && styles.startButtonDisabled,
          ]}
          onPress={handleStartRun}
          disabled={!selectedCourseId || isGeneratingCourses}
        >
          <Ionicons name="play" size={24} color={colors.slate900} />
          <Text style={styles.startButtonText}>ランニングを開始する</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingCard: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.DEFAULT,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  searchContainer: {
    position: 'absolute',
    top: 100,
    left: spacing.md,
    right: 60,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  mapControls: {
    position: 'absolute',
    top: 100,
    right: spacing.md,
    gap: spacing.sm,
  },
  zoomControls: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.xl,
  },
  cardsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  courseCard: {
    borderRadius: borderRadius.DEFAULT,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: {
    gap: 2,
  },
  statLabel: {
    fontSize: typography.fontSize['2xs'],
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  elevationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  elevationChart: {
    flex: 1,
    height: 32,
    borderBottomWidth: 2,
  },
  elevationLabel: {
    alignItems: 'flex-end',
  },
  elevationText: {
    fontSize: typography.fontSize['2xs'],
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: colors.slate900,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});
