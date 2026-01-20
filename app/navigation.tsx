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
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

export default function NavigationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const textColor = isDark ? colors.white : colors.slate900;
  const subtextColor = isDark ? colors.slate400 : colors.slate500;
  const cardBg = isDark ? colors.slate900 : colors.white;
  const borderColor = isDark ? colors.slate800 : colors.slate100;

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
        <View style={[styles.directionIcon, { backgroundColor: colors.primaryMedium }]}>
          <Ionicons name="arrow-forward" size={80} color={colors.primary} style={{ transform: [{ rotate: '45deg' }] }} />
        </View>
        <Text style={[styles.distanceText, { color: textColor }]}>300m</Text>
        <Text style={[styles.instructionText, { color: subtextColor }]}>
          次を<Text style={[styles.instructionBold, { color: textColor }]}>右方向へ</Text> (リバーサイド・パス)
        </Text>
      </View>

      {/* Map Area */}
      <View style={styles.mapArea}>
        <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? colors.slate800 : colors.slate200 }]}>
          <View style={[styles.currentPosition, shadows.primary]}>
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
          <Text style={[styles.statUnit, { color: colors.slate400 }]}>/km</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.statHeader}>
            <Ionicons name="timer-outline" size={16} color={subtextColor} />
            <Text style={[styles.statLabel, { color: subtextColor }]}>経過時間</Text>
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>24:12</Text>
          <Text style={[styles.statUnit, { color: colors.slate400 }]}>計測中</Text>
        </View>
      </View>

      {/* Transfer Button */}
      <View style={styles.buttonContainer}>
        <Pressable style={[styles.transferButton, shadows.primary]}>
          <Ionicons name="sync" size={24} color={colors.slate900} />
          <Text style={styles.transferButtonText}>Garmin/Stravaに転送</Text>
        </Pressable>

        {/* Status Indicators */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Ionicons name="cellular" size={16} color={colors.slate400} />
            <Text style={[styles.statusText, { color: colors.slate400 }]}>GPS 良好</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="notifications-off" size={16} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.slate400 }]}>前方の信号: 0</Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  headerSpacer: {
    width: 48,
  },
  directionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  directionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  distanceText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.black,
    letterSpacing: -1,
  },
  instructionText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  instructionBold: {
    fontWeight: typography.fontWeight.bold,
  },
  mapArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: borderRadius.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPosition: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.DEFAULT,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    letterSpacing: -1,
  },
  statUnit: {
    fontSize: typography.fontSize.xs,
  },
  buttonContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  transferButtonText: {
    color: colors.slate900,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.bold,
  },
});
