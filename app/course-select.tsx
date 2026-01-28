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
import { fetchTrafficSignals, countSignalsOnRoute } from '@/services/overpassApi';
import { useAppStore } from '@/stores/appStore';
import { useLocation } from '@/hooks/useLocation';
import type { Course, TrafficSignal } from '@/types';

// Colors
const PRIMARY = '#13ec49';
const BG_LIGHT = '#f6f8f6';
const BG_DARK = '#102215';
const WHITE = '#ffffff';
const SLATE_200 = '#e2e8f0';
const SLATE_300 = '#cbd5e1';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_700 = '#334155';
const SLATE_800 = '#1e293b';
const SLATE_900 = '#0f172a';
const BLUE_500 = '#3b82f6';
const PURPLE_500 = '#a855f7';
const RED_500 = '#ef4444';

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

  // State for traffic signals
  const [signals, setSignals] = useState<TrafficSignal[]>([]);
  const [courseSignalCounts, setCourseSignalCounts] = useState<Record<string, number>>({});

  const bgColor = isDark ? BG_DARK : BG_LIGHT;
  const textColor = isDark ? WHITE : SLATE_900;
  const subtextColor = isDark ? SLATE_400 : SLATE_500;
  const cardBg = isDark ? SLATE_900 : WHITE;

  const targetDistance = params.distance ? parseFloat(params.distance) : 5;

  // Fetch signals and generate courses on mount
  useEffect(() => {
    const loadData = async () => {
      setIsGeneratingCourses(true);

      const location = currentLocation || getMockLocation();

      // Fetch traffic signals in parallel with course generation
      const [response, fetchedSignals] = await Promise.all([
        generateCourses(location, targetDistance),
        fetchTrafficSignals(location, targetDistance * 1000), // radius in meters
      ]);

      setSignals(fetchedSignals);

      // Count signals on each course
      const signalCounts: Record<string, number> = {};
      for (const course of response.courses) {
        if (course.waypoints) {
          const { count } = countSignalsOnRoute(course.waypoints, fetchedSignals);
          signalCounts[course.id] = count;
          // Update course signal count
          course.signalCount = count;
        }
      }
      setCourseSignalCounts(signalCounts);

      // Sort courses by signal count (fewer = better)
      const sortedCourses = [...response.courses].sort((a, b) => a.signalCount - b.signalCount);

      setCourses(sortedCourses);
      setIsGeneratingCourses(false);
    };

    if (!locationLoading) {
      loadData();
    }
  }, [targetDistance, currentLocation, locationLoading]);

  const handleStartRun = () => {
    router.push('/navigation');
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const getIconForCourse = (signalCount: number): 'notifications-off' | 'warning' | 'alert-circle' => {
    if (signalCount === 0) return 'notifications-off';
    if (signalCount <= 2) return 'warning';
    return 'alert-circle';
  };

  const getBadgeForCourse = (signalCount: number, index: number): { text: string; color: string } => {
    if (signalCount === 0) {
      return { text: 'ノンストップ', color: PRIMARY };
    }
    if (signalCount <= 2) {
      return { text: '信号少なめ', color: BLUE_500 };
    }
    return { text: `信号${signalCount}個`, color: PURPLE_500 };
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
          signals={signals}
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
              <Text style={[styles.loadingSubtext, { color: subtextColor }]}>
                信号情報を取得しています
              </Text>
            </View>
          </View>
        )}

        {/* Signal Count Badge */}
        {signals.length > 0 && !isGeneratingCourses && (
          <View style={styles.signalBadge}>
            <View style={styles.signalDot} />
            <Text style={styles.signalBadgeText}>
              周辺の信号: {signals.length}個
            </Text>
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
            const signalCount = courseSignalCounts[course.id] ?? course.signalCount;
            const badge = getBadgeForCourse(signalCount, index);
            const icon = getIconForCourse(signalCount);

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
                      { backgroundColor: signalCount === 0 ? `${PRIMARY}20` : `${RED_500}20` },
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={24}
                      color={signalCount === 0 ? PRIMARY : RED_500}
                    />
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
                          signalCount === 0 && {
                            color: PRIMARY,
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {signalCount} 個
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 12,
  },
  signalBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 6,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  signalBadgeText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    position: 'absolute',
    top: 140,
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
    top: 140,
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
