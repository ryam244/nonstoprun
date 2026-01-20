import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows, distancePresets } from '@/theme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [distance, setDistance] = useState(5.0);

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const textColor = isDark ? colors.white : colors.slate900;
  const subtextColor = isDark ? colors.slate400 : colors.slate500;
  const cardBg = isDark ? colors.slate800 : colors.white;
  const borderColor = isDark ? colors.slate700 : colors.slate200;

  const handleGenerateCourse = () => {
    router.push({
      pathname: '/course-select',
      params: { distance: distance.toString() },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={[styles.locationText, { color: subtextColor }]}>
            現在地: 東京都渋谷区
          </Text>
        </View>
        <Text style={[styles.headerTitle, { color: textColor }]}>コース作成</Text>
        <Pressable style={[styles.settingsButton, { backgroundColor: isDark ? colors.slate800 : colors.slate100 }]}>
          <Ionicons name="settings-outline" size={24} color={textColor} />
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Section Title */}
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionLabel}>目標を設定する</Text>
          <Text style={[styles.sectionDescription, { color: subtextColor }]}>
            信号待ちの少ないルートを自動生成します
          </Text>
        </View>

        {/* Distance Wheel */}
        <View style={styles.wheelContainer}>
          <View style={[styles.wheelOuter, { borderColor: isDark ? colors.slate800 : colors.slate200 }]}>
            <View style={styles.wheelProgress} />
          </View>
          <View style={[styles.wheelInner, { backgroundColor: cardBg }, shadows.xl]}>
            <Text style={[styles.distanceValue, { color: textColor }]}>
              {distance.toFixed(1)}
            </Text>
            <Text style={styles.distanceLabel}>走行距離 (km)</Text>
          </View>
        </View>

        {/* Distance Presets */}
        <View style={styles.presetContainer}>
          {distancePresets.map((preset) => (
            <Pressable
              key={preset}
              style={[
                styles.presetButton,
                preset === distance
                  ? styles.presetButtonActive
                  : { backgroundColor: isDark ? colors.primaryMedium : colors.primaryLight, borderColor: 'rgba(19, 236, 73, 0.2)' },
              ]}
              onPress={() => setDistance(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  preset === distance ? styles.presetTextActive : { color: colors.primary },
                ]}
              >
                {preset}km
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <Pressable style={[styles.optionButton, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="trending-down-outline" size={20} color={isDark ? colors.slate300 : colors.slate600} />
            <Text style={[styles.optionText, { color: textColor }]}>坂道を避ける</Text>
          </Pressable>
          <Pressable style={[styles.optionButton, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="sunny-outline" size={20} color={isDark ? colors.slate300 : colors.slate600} />
            <Text style={[styles.optionText, { color: textColor }]}>明るい道優先</Text>
          </Pressable>
          <Pressable style={[styles.optionButton, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="options-outline" size={20} color={isDark ? colors.slate300 : colors.slate600} />
            <Text style={[styles.optionText, { color: textColor }]}>詳細設定</Text>
          </Pressable>
        </View>
      </View>

      {/* Generate Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.generateButton, shadows.primary]}
          onPress={handleGenerateCourse}
        >
          <Text style={styles.generateButtonText}>ノンストップコースを探す</Text>
          <Ionicons name="arrow-forward" size={24} color={colors.slate900} />
        </Pressable>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.extrabold,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  wheelContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 12,
  },
  wheelProgress: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 12,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  wheelInner: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceValue: {
    fontSize: 56,
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: 56,
  },
  distanceLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  presetContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  presetButton: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.extrabold,
  },
  presetTextActive: {
    color: colors.white,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  optionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  buttonContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  generateButtonText: {
    color: colors.slate900,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.5,
  },
});
