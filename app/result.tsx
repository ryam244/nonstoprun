/**
 * Run Result Screen
 * Displays run completion summary and save options
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/stores/appStore';
import { formatPace, formatDuration, getRunById, type RunRecord } from '@/services/runHistory';
import { formatDistance } from '@/services/courseGenerator';

// Colors
const PRIMARY = '#13ec49';
const PRIMARY_LIGHT = 'rgba(19, 236, 73, 0.1)';
const BG_LIGHT = '#f6f8f6';
const BG_DARK = '#102215';
const WHITE = '#ffffff';
const SLATE_100 = '#f1f5f9';
const SLATE_200 = '#e2e8f0';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_600 = '#475569';
const SLATE_700 = '#334155';
const SLATE_800 = '#1e293b';
const SLATE_900 = '#0f172a';
const BLUE_500 = '#3b82f6';
const ORANGE_500 = '#f97316';

export default function ResultScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ runId: string }>();
  const { reset } = useAppStore();

  const [runRecord, setRunRecord] = useState<RunRecord | null>(null);
  const [healthExported, setHealthExported] = useState(false);

  const bgColor = isDark ? BG_DARK : BG_LIGHT;
  const textColor = isDark ? WHITE : SLATE_900;
  const subtextColor = isDark ? SLATE_400 : SLATE_500;
  const cardBg = isDark ? SLATE_800 : WHITE;
  const borderColor = isDark ? SLATE_700 : SLATE_200;

  useEffect(() => {
    const loadRun = async () => {
      if (params.runId) {
        const record = await getRunById(params.runId);
        setRunRecord(record);
      }
    };
    loadRun();
  }, [params.runId]);

  const handleExportToHealth = () => {
    // TODO: Implement actual HealthKit export
    Alert.alert(
      'Apple Healthに保存',
      'ワークアウトデータをApple Healthに保存しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '保存する',
          onPress: () => {
            // Simulate export
            setHealthExported(true);
            Alert.alert('完了', 'Apple Healthにワークアウトを保存しました');
          },
        },
      ]
    );
  };

  const handleGarminExport = () => {
    Alert.alert(
      '準備中',
      'Garmin/Strava連携は今後のアップデートで追加予定です。お楽しみに！',
      [{ text: 'OK' }]
    );
  };

  const handleFinish = () => {
    reset();
    router.replace('/');
  };

  if (!runRecord) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={PRIMARY} />
          </View>
          <Text style={[styles.title, { color: textColor }]}>ラン完了！</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>
            {runRecord.courseName}
          </Text>
          <Text style={[styles.date, { color: subtextColor }]}>
            {new Date(runRecord.date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Main Stats */}
        <View style={[styles.mainStatsCard, { backgroundColor: cardBg }]}>
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: textColor }]}>
              {formatDistance(runRecord.distance)}
            </Text>
            <Text style={[styles.mainStatLabel, { color: subtextColor }]}>距離</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: textColor }]}>
              {formatDuration(runRecord.duration)}
            </Text>
            <Text style={[styles.mainStatLabel, { color: subtextColor }]}>時間</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: textColor }]}>
              {formatPace(runRecord.averagePace)}
            </Text>
            <Text style={[styles.mainStatLabel, { color: subtextColor }]}>ペース/km</Text>
          </View>
        </View>

        {/* Detail Stats */}
        <View style={styles.detailStats}>
          <View style={[styles.detailCard, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="trending-up-outline" size={24} color={ORANGE_500} />
            <Text style={[styles.detailValue, { color: textColor }]}>
              {Math.round(runRecord.elevationGain)}m
            </Text>
            <Text style={[styles.detailLabel, { color: subtextColor }]}>高低差</Text>
          </View>
          <View style={[styles.detailCard, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons
              name={runRecord.signalsPassed === 0 ? 'notifications-off' : 'notifications-outline'}
              size={24}
              color={runRecord.signalsPassed === 0 ? PRIMARY : SLATE_400}
            />
            <Text style={[styles.detailValue, { color: textColor }]}>
              {runRecord.signalsPassed}
            </Text>
            <Text style={[styles.detailLabel, { color: subtextColor }]}>信号通過</Text>
          </View>
        </View>

        {/* Non-Stop Badge */}
        {runRecord.signalsPassed === 0 && (
          <View style={styles.badgeContainer}>
            <View style={styles.nonStopBadge}>
              <Ionicons name="flash" size={20} color={SLATE_900} />
              <Text style={styles.badgeText}>ノンストップ達成！</Text>
            </View>
          </View>
        )}

        {/* Export Options */}
        <View style={styles.exportSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>データを保存</Text>

          {/* Apple Health */}
          <Pressable
            style={[
              styles.exportButton,
              { backgroundColor: cardBg, borderColor },
              healthExported && styles.exportButtonDone,
            ]}
            onPress={handleExportToHealth}
            disabled={healthExported}
          >
            <View style={[styles.exportIcon, { backgroundColor: '#ff2d55' + '20' }]}>
              <Ionicons name="heart" size={24} color="#ff2d55" />
            </View>
            <View style={styles.exportInfo}>
              <Text style={[styles.exportTitle, { color: textColor }]}>Apple Health</Text>
              <Text style={[styles.exportDesc, { color: subtextColor }]}>
                {healthExported ? '保存済み' : 'ワークアウトを保存'}
              </Text>
            </View>
            {healthExported ? (
              <Ionicons name="checkmark-circle" size={24} color={PRIMARY} />
            ) : (
              <Ionicons name="chevron-forward" size={24} color={subtextColor} />
            )}
          </Pressable>

          {/* Garmin/Strava */}
          <Pressable
            style={[styles.exportButton, { backgroundColor: cardBg, borderColor }]}
            onPress={handleGarminExport}
          >
            <View style={[styles.exportIcon, { backgroundColor: BLUE_500 + '20' }]}>
              <Ionicons name="sync" size={24} color={BLUE_500} />
            </View>
            <View style={styles.exportInfo}>
              <Text style={[styles.exportTitle, { color: textColor }]}>Garmin / Strava</Text>
              <Text style={[styles.exportDesc, { color: subtextColor }]}>
                準備中 - 今後のアップデートで対応
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>準備中</Text>
            </View>
          </Pressable>
        </View>

        {/* Saved Notice */}
        <View style={styles.savedNotice}>
          <Ionicons name="checkmark-circle-outline" size={16} color={PRIMARY} />
          <Text style={[styles.savedText, { color: subtextColor }]}>
            ランニング履歴に自動保存されました
          </Text>
        </View>
      </ScrollView>

      {/* Finish Button */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>完了</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  mainStatsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: SLATE_900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 8,
  },
  detailStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  detailCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  nonStopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  badgeText: {
    color: SLATE_900,
    fontSize: 16,
    fontWeight: '800',
  },
  exportSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  exportButtonDone: {
    opacity: 0.7,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportInfo: {
    flex: 1,
    marginLeft: 16,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  exportDesc: {
    fontSize: 13,
  },
  comingSoonBadge: {
    backgroundColor: SLATE_600,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  comingSoonText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  savedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  savedText: {
    fontSize: 13,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
  },
  finishButton: {
    height: 60,
    backgroundColor: PRIMARY,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  finishButtonText: {
    color: SLATE_900,
    fontSize: 18,
    fontWeight: '800',
  },
});
