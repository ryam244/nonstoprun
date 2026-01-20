import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? colors.backgroundDark : colors.backgroundLight;
  const textColor = isDark ? colors.white : colors.slate900;
  const subtextColor = isDark ? colors.slate400 : colors.slate500;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: textColor }]}>プロフィール</Text>
        <Text style={[styles.description, { color: subtextColor }]}>
          Coming Soon
        </Text>
        <Text style={[styles.subdescription, { color: subtextColor }]}>
          ランニング履歴や統計情報を{'\n'}確認できる機能を準備中です
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  subdescription: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
