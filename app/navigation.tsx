/**
 * Navigation Screen
 * Real-time running navigation with timer and stats
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NavigationMapView } from '@/components/MapView';
import { useLocation } from '@/hooks/useLocation';
import { useAppStore } from '@/stores/appStore';
import { saveRunRecord, formatPace, formatDuration } from '@/services/runHistory';
import type { Coordinates } from '@/types';

// Colors
const PRIMARY = '#13ec49';
const PRIMARY_MEDIUM = 'rgba(19, 236, 73, 0.2)';
const BG_LIGHT = '#f6f8f6';
const BG_DARK = '#102215';
const WHITE = '#ffffff';
const SLATE_100 = '#f1f5f9';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_800 = '#1e293b';
const SLATE_900 = '#0f172a';
const RED_500 = '#ef4444';

export default function NavigationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { current: currentLocation, getMockLocation } = useLocation();
  const { courses, selectedCourseId, isRunning, setIsRunning, setRunStartTime } = useAppStore();

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const location = currentLocation || getMockLocation();

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [routeHistory, setRouteHistory] = useState<Coordinates[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bgColor = isDark ? BG_DARK : BG_LIGHT;
  const textColor = isDark ? WHITE : SLATE_900;
  const subtextColor = isDark ? SLATE_400 : SLATE_500;
  const cardBg = isDark ? SLATE_900 : WHITE;
  const borderColor = isDark ? SLATE_800 : SLATE_100;

  // Start timer on mount
  useEffect(() => {
    if (!isRunning) {
      setIsRunning(true);
      setRunStartTime(Date.now());
    }

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Track route history
  useEffect(() => {
    if (currentLocation) {
      setRouteHistory((prev) => [...prev, currentLocation]);
    }
  }, [currentLocation]);

  // Calculate pace (simulated)
  useEffect(() => {
    if (selectedCourse && elapsedTime > 0) {
      // Simulate pace based on expected time
      const progress = Math.min(elapsedTime / selectedCourse.estimatedTime, 1);
      const coveredDistance = selectedCourse.distance * progress;
      if (coveredDistance > 0) {
        const paceSecondsPerKm = elapsedTime / (coveredDistance / 1000);
        setCurrentPace(paceSecondsPerKm);
      }
    }
  }, [elapsedTime, selectedCourse]);

  const handleEndRun = useCallback(async () => {
    Alert.alert(
      'ランニングを終了',
      '本当にランニングを終了しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '終了する',
          style: 'destructive',
          onPress: async () => {
            // Stop timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsRunning(false);

            // Save run record
            if (selectedCourse) {
              try {
                const record = await saveRunRecord(
                  selectedCourse,
                  elapsedTime,
                  routeHistory
                );
                // Navigate to result screen
                router.replace({
                  pathname: '/result',
                  params: { runId: record.id },
                });
              } catch (error) {
                console.error('Failed to save run:', error);
                Alert.alert('エラー', '記録の保存に失敗しました');
                router.replace('/');
              }
            } else {
              router.replace('/');
            }
          },
        },
      ]
    );
  }, [selectedCourse, elapsedTime, routeHistory]);

  const handleBack = () => {
    Alert.alert(
      '戻る',
      'ランニングを中断しますか？記録は保存されません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '中断する',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsRunning(false);
            router.back();
          },
        },
      ]
    );
  };

  // Calculate progress
  const progress = selectedCourse
    ? Math.min(elapsedTime / selectedCourse.estimatedTime, 1)
    : 0;
  const remainingDistance = selectedCourse
    ? Math.max(selectedCourse.distance * (1 - progress), 0)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </Pressable>
        <View style={styles.runningIndicator}>
          <View style={styles.runningDot} />
          <Text style={[styles.headerTitle, { color: textColor }]}>ランニング中</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Direction Indicator */}
      <View style={styles.directionContainer}>
        <View style={[styles.directionIcon, { backgroundColor: PRIMARY_MEDIUM }]}>
          <Ionicons
            name="arrow-forward"
            size={80}
            color={PRIMARY}
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </View>
        <Text style={[styles.distanceText, { color: textColor }]}>
          {remainingDistance >= 1000
            ? `${(remainingDistance / 1000).toFixed(1)}km`
            : `${Math.round(remainingDistance)}m`}
        </Text>
        <Text style={[styles.instructionText, { color: subtextColor }]}>
          残り距離
        </Text>
      </View>

      {/* Map Area */}
      <View style={styles.mapArea}>
        <NavigationMapView
          center={location}
          course={selectedCourse}
          heading={0}
          style={styles.map}
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.statHeader}>
            <Ionicons name="speedometer-outline" size={16} color={subtextColor} />
            <Text style={[styles.statLabel, { color: subtextColor }]}>現在のペース</Text>
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>
            {formatPace(currentPace)}
          </Text>
          <Text style={[styles.statUnit, { color: SLATE_400 }]}>/km</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.statHeader}>
            <Ionicons name="timer-outline" size={16} color={subtextColor} />
            <Text style={[styles.statLabel, { color: subtextColor }]}>経過時間</Text>
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>
            {formatDuration(elapsedTime)}
          </Text>
          <Text style={[styles.statUnit, { color: SLATE_400 }]}>計測中</Text>
        </View>
      </View>

      {/* End Run Button */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.endButton} onPress={handleEndRun}>
          <Ionicons name="stop" size={24} color={WHITE} />
          <Text style={styles.endButtonText}>ランニングを終了</Text>
        </Pressable>

        {/* Status Indicators */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Ionicons name="cellular" size={16} color={PRIMARY} />
            <Text style={[styles.statusText, { color: SLATE_400 }]}>GPS 良好</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="notifications-off" size={16} color={PRIMARY} />
            <Text style={[styles.statusText, { color: SLATE_400 }]}>前方の信号: 0</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  runningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  runningDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RED_500,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 48,
  },
  directionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  directionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  mapArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  map: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statUnit: {
    fontSize: 12,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: RED_500,
    borderRadius: 9999,
    gap: 12,
    shadowColor: RED_500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  endButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
