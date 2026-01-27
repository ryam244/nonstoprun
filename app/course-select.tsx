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
import { CourseMapView } from '@/components/MapView';
import { generateCourses, formatDistance, formatTime } from '@/services/courseGenerator';
import { useAppStore } from '@/stores/appStore';
import { useLocation } from '@/hooks/useLocation';
import type { Course } from '@/types';

// Colors
const PRIMARY = '#13ec49';
const PRIMARY_MEDIUM = 'rgba(19, 236, 73, 0.2)';
const BG_LIGHT = '#f6f8f6';
const BG_DARK = '#102215';
const WHITE = '#ffffff';
const SLATE_100 = '#f1f5f9';
const SLATE_200 = '#e2e8f0';
const SLATE_300 = '#cbd5e1';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_700 = '#334155';
const SLATE_800 = '#1e293b';
const SLATE_900 = '#0f172a';
const BLUE_500 = '#3b82f6';
const PURPLE_500 = '#a855f7';

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

  const bgColor = isDark ? BG_DARK : BG_LIGHT;
  const textColor = isDark ? WHITE : SLATE_900;
  const subtextColor = isDark ? SLATE_400 : SLATE_500;
  const cardBg = isDark ? SLATE_900 : WHITE;

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
      { text: 'おすすめ', color: PRIMARY },
      { text: '景色が良い', color: BLUE_500 },
      { text: '最速', color: PURPLE_500 },
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
              <ActivityIndicator size="large" color={PRIMARY} />
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
            <Ionicons name="search" size={20} color={PRIMARY} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="エリアまたは公園を検索..."
              placeholderTextColor={SLATE_400}
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
                  borderBottomColor: isDark ? SLATE_800 : SLATE_200,
                },
              ]}
            >
              <Ionicons
                name="add"
                size={24}
                color={isDark ? SLATE_300 : SLATE_700}
              />
            </Pressable>
            <Pressable style={styles.zoomButton}>
              <Ionicons
                name="remove"
                size={24}
                color={isDark ? SLATE_300 : SLATE_700}
              />
            </Pressable>
          </View>
          <Pressable
            style={[styles.locationButton, { backgroundColor: cardBg }]}
          >
            <Ionicons
              name="navigate"
              size={24}
              color={isDark ? SLATE_300 : SLATE_700}
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
          snapToInterval={CARD_WIDTH + 16}
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
                  isSelected && { borderWidth: 2, borderColor: PRIMARY },
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
                    <Text style={[styles.statLabel, { color: SLATE_400 }]}>
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
                    <Text style={[styles.statLabel, { color: SLATE_400 }]}>
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
                    <Text style={[styles.statLabel, { color: SLATE_400 }]}>
                      信号
                    </Text>
                    <View style={styles.statValue}>
                      <Text
                        style={[
                          styles.statText,
                          { color: textColor },
                          course.signalCount === 0 && {
                            color: PRIMARY,
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
                    <Text style={[styles.statLabel, { color: SLATE_400 }]}>
                      高低差
                    </Text>
                    <Text style={[styles.elevationText, { color: SLATE_400 }]}>
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
            (!selectedCourseId || isGeneratingCourses) && styles.startButtonDisabled,
          ]}
          onPress={handleStartRun}
          disabled={!selectedCourseId || isGeneratingCourses}
        >
          <Ionicons name="play" size={24} color={SLATE_900} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
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
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 60,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 9999,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  mapControls: {
    position: 'absolute',
    top: 100,
    right: 16,
    gap: 12,
  },
  zoomControls: {
    borderRadius: 9999,
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
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SLATE_900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  courseCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: SLATE_900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 9999,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  stat: {
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  elevationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
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
    fontSize: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: PRIMARY,
    borderRadius: 9999,
    gap: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: SLATE_900,
    fontSize: 18,
    fontWeight: '700',
  },
});
