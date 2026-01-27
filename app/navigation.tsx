import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Colors
const PRIMARY = '#13ec49';
const PRIMARY_MEDIUM = 'rgba(19, 236, 73, 0.2)';
const BG_LIGHT = '#f6f8f6';
const BG_DARK = '#102215';
const WHITE = '#ffffff';
const SLATE_100 = '#f1f5f9';
const SLATE_200 = '#e2e8f0';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_800 = '#1e293b';
const SLATE_900 = '#0f172a';

export default function NavigationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? BG_DARK : BG_LIGHT;
  const textColor = isDark ? WHITE : SLATE_900;
  const subtextColor = isDark ? SLATE_400 : SLATE_500;
  const cardBg = isDark ? SLATE_900 : WHITE;
  const borderColor = isDark ? SLATE_800 : SLATE_100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>ランニング中</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Direction Indicator */}
      <View style={styles.directionContainer}>
        <View style={[styles.directionIcon, { backgroundColor: PRIMARY_MEDIUM }]}>
          <Ionicons name="arrow-forward" size={80} color={PRIMARY} style={{ transform: [{ rotate: '45deg' }] }} />
        </View>
        <Text style={[styles.distanceText, { color: textColor }]}>300m</Text>
        <Text style={[styles.instructionText, { color: subtextColor }]}>
          次を<Text style={[styles.instructionBold, { color: textColor }]}>右方向へ</Text> (リバーサイド・パス)
        </Text>
      </View>

      {/* Map Area */}
      <View style={styles.mapArea}>
        <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? SLATE_800 : SLATE_200 }]}>
          <View style={styles.currentPosition}>
            <View style={styles.positionDot} />
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.statHeader}>
            <Ionicons name="speedometer-outline" size={16} color={subtextColor} />
            <Text style={[styles.statLabel, { color: subtextColor }]}>現在のペース</Text>
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>4'35"</Text>
          <Text style={[styles.statUnit, { color: SLATE_400 }]}>/km</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.statHeader}>
            <Ionicons name="timer-outline" size={16} color={subtextColor} />
            <Text style={[styles.statLabel, { color: subtextColor }]}>経過時間</Text>
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>24:12</Text>
          <Text style={[styles.statUnit, { color: SLATE_400 }]}>計測中</Text>
        </View>
      </View>

      {/* Transfer Button */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.transferButton}>
          <Ionicons name="sync" size={24} color={SLATE_900} />
          <Text style={styles.transferButtonText}>Garmin/Stravaに転送</Text>
        </Pressable>

        {/* Status Indicators */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Ionicons name="cellular" size={16} color={SLATE_400} />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 48,
  },
  directionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  directionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  distanceText: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  instructionBold: {
    fontWeight: '700',
  },
  mapArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  positionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 30,
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
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: PRIMARY,
    borderRadius: 9999,
    gap: 12,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  transferButtonText: {
    color: SLATE_900,
    fontSize: 18,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
