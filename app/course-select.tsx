import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 100;

interface CourseData {
  id: string;
  name: string;
  description: string;
  distance: string;
  time: string;
  signals: number;
  elevation: string;
  color: string;
  badgeText: string;
  badgeColor: string;
  icon: 'notifications-off' | 'leaf' | 'speedometer';
}

const mockCourses: CourseData[] = [
  {
    id: '1',
    name: 'コースA: 信号ゼロ！公園メイン',
    description: 'おすすめ',
    distance: '5.2 km',
    time: '28 分',
    signals: 0,
    elevation: '平坦',
    color: colors.primary,
    badgeText: 'おすすめ',
    badgeColor: colors.primary,
    icon: 'notifications-off',
  },
  {
    id: '2',
    name: 'コースB: 緑道80%の木陰ルート',
    description: '景色が良い',
    distance: '6.5 km',
    time: '35 分',
    signals: 2,
    elevation: 'アップダウン',
    color: colors.blue500,
    badgeText: '景色が良い',
    badgeColor: colors.blue500,
    icon: 'leaf',
  },
  {
    id: '3',
    name: 'コースC: 平坦で走りやすい',
    description: '最速',
    distance: '4.0 km',
    time: '18 分',
    signals: 1,
    elevation: '平坦',
    color: colors.purple500,
    badgeText: '最速',
    badgeColor: colors.purple500,
    icon: 'speedometer',
  },
];

export default function CourseSelectScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ distance: string }>();

  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const textColor = isDark ? colors.white : colors.slate900;
  const subtextColor = isDark ? colors.slate400 : colors.slate500;
  const cardBg = isDark ? colors.slate900 : colors.white;

  const handleStartRun = () => {
    router.push('/navigation');
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={[styles.header, { backgroundColor: isDark ? 'rgba(16, 34, 21, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: textColor }]}>コース選択</Text>
          <Pressable style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={textColor} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? colors.slate800 : colors.slate200 }]}>
          <Ionicons name="map" size={64} color={subtextColor} />
          <Text style={[styles.mapPlaceholderText, { color: subtextColor }]}>
            地図表示エリア
          </Text>
          <Text style={[styles.mapPlaceholderSubtext, { color: subtextColor }]}>
            (API選択後に実装)
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
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
          <View style={[styles.zoomControls, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}>
            <Pressable style={[styles.zoomButton, { borderBottomWidth: 1, borderBottomColor: isDark ? colors.slate800 : colors.slate200 }]}>
              <Ionicons name="add" size={24} color={isDark ? colors.slate300 : colors.slate700} />
            </Pressable>
            <Pressable style={styles.zoomButton}>
              <Ionicons name="remove" size={24} color={isDark ? colors.slate300 : colors.slate700} />
            </Pressable>
          </View>
          <Pressable style={[styles.locationButton, { backgroundColor: cardBg }, shadows.xl]}>
            <Ionicons name="navigate" size={24} color={isDark ? colors.slate300 : colors.slate700} />
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
          {mockCourses.map((course, index) => (
            <View
              key={course.id}
              style={[
                styles.courseCard,
                { backgroundColor: cardBg, width: CARD_WIDTH },
                index === 0 && { borderWidth: 2, borderColor: colors.primary },
                shadows.lg,
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <View style={[styles.badge, { backgroundColor: `${course.badgeColor}20` }]}>
                    <Text style={[styles.badgeText, { color: course.badgeColor }]}>
                      {course.badgeText}
                    </Text>
                  </View>
                  <Text style={[styles.courseName, { color: textColor }]} numberOfLines={1}>
                    {course.name}
                  </Text>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: `${course.color}20` }]}>
                  <Ionicons name={course.icon} size={24} color={course.color} />
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: colors.slate400 }]}>距離</Text>
                  <View style={styles.statValue}>
                    <Ionicons name="map-outline" size={14} color={subtextColor} />
                    <Text style={[styles.statText, { color: textColor }]}>{course.distance}</Text>
                  </View>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: colors.slate400 }]}>予想時間</Text>
                  <View style={styles.statValue}>
                    <Ionicons name="time-outline" size={14} color={subtextColor} />
                    <Text style={[styles.statText, { color: textColor }]}>{course.time}</Text>
                  </View>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statLabel, { color: colors.slate400 }]}>信号</Text>
                  <View style={styles.statValue}>
                    <Text style={[styles.statText, course.signals === 0 && { color: colors.primary, fontWeight: '700' }]}>
                      {course.signals} 基
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.elevationRow}>
                <View style={[styles.elevationChart, { borderColor: course.color }]} />
                <View style={styles.elevationLabel}>
                  <Text style={[styles.statLabel, { color: colors.slate400 }]}>高低差</Text>
                  <Text style={[styles.elevationText, { color: colors.slate400 }]}>{course.elevation}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Start Button */}
        <Pressable
          style={[styles.startButton, shadows.primary]}
          onPress={handleStartRun}
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
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.md,
  },
  mapPlaceholderSubtext: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
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
  startButtonText: {
    color: colors.slate900,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
});
