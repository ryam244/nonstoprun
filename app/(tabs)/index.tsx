import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Colors
const PRIMARY = '#13ec49';
const PRIMARY_LIGHT = 'rgba(19, 236, 73, 0.1)';
const PRIMARY_MEDIUM = 'rgba(19, 236, 73, 0.2)';
const BG_LIGHT = '#f6f8f6';
const BG_DARK = '#102215';
const WHITE = '#ffffff';
const SLATE_100 = '#f1f5f9';
const SLATE_200 = '#e2e8f0';
const SLATE_300 = '#cbd5e1';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_600 = '#475569';
const SLATE_700 = '#334155';
const SLATE_800 = '#1e293b';
const SLATE_900 = '#0f172a';

const DISTANCE_PRESETS = [3, 5, 10, 21];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [distance, setDistance] = useState(5.0);

  const bgColor = isDark ? BG_DARK : BG_LIGHT;
  const textColor = isDark ? WHITE : SLATE_900;
  const subtextColor = isDark ? SLATE_400 : SLATE_500;
  const cardBg = isDark ? SLATE_800 : WHITE;
  const borderColor = isDark ? SLATE_700 : SLATE_200;

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
          <Ionicons name="location" size={20} color={PRIMARY} />
          <Text style={[styles.locationText, { color: subtextColor }]}>
            現在地: 東京都渋谷区
          </Text>
        </View>
        <Text style={[styles.headerTitle, { color: textColor }]}>コース作成</Text>
        <Pressable style={[styles.settingsButton, { backgroundColor: isDark ? SLATE_800 : SLATE_100 }]}>
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
          <View style={[styles.wheelOuter, { borderColor: isDark ? SLATE_800 : SLATE_200 }]}>
            <View style={styles.wheelProgress} />
          </View>
          <View style={[styles.wheelInner, { backgroundColor: cardBg }]}>
            <Text style={[styles.distanceValue, { color: textColor }]}>
              {distance.toFixed(1)}
            </Text>
            <Text style={styles.distanceLabel}>走行距離 (km)</Text>
          </View>
        </View>

        {/* Distance Presets */}
        <View style={styles.presetContainer}>
          {DISTANCE_PRESETS.map((preset) => (
            <Pressable
              key={preset}
              style={[
                styles.presetButton,
                preset === distance
                  ? styles.presetButtonActive
                  : { backgroundColor: isDark ? PRIMARY_MEDIUM : PRIMARY_LIGHT, borderColor: 'rgba(19, 236, 73, 0.2)' },
              ]}
              onPress={() => setDistance(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  preset === distance ? styles.presetTextActive : { color: PRIMARY },
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
            <Ionicons name="trending-down-outline" size={20} color={isDark ? SLATE_300 : SLATE_600} />
            <Text style={[styles.optionText, { color: textColor }]}>坂道を避ける</Text>
          </Pressable>
          <Pressable style={[styles.optionButton, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="sunny-outline" size={20} color={isDark ? SLATE_300 : SLATE_600} />
            <Text style={[styles.optionText, { color: textColor }]}>明るい道優先</Text>
          </Pressable>
          <Pressable style={[styles.optionButton, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="options-outline" size={20} color={isDark ? SLATE_300 : SLATE_600} />
            <Text style={[styles.optionText, { color: textColor }]}>詳細設定</Text>
          </Pressable>
        </View>
      </View>

      {/* Generate Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.generateButton}
          onPress={handleGenerateCourse}
        >
          <Text style={styles.generateButtonText}>ノンストップコースを探す</Text>
          <Ionicons name="arrow-forward" size={24} color={SLATE_900} />
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sectionTitle: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionLabel: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    fontWeight: '500',
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
    borderColor: PRIMARY,
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
    shadowColor: SLATE_900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  distanceValue: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 56,
  },
  distanceLabel: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  presetContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 40,
    marginBottom: 32,
  },
  presetButton: {
    height: 40,
    paddingHorizontal: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  presetButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '800',
  },
  presetTextActive: {
    color: WHITE,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    backgroundColor: PRIMARY,
    borderRadius: 9999,
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  generateButtonText: {
    color: SLATE_900,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
