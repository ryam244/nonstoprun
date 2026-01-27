import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#13ec49';
const PRIMARY_LIGHT = 'rgba(19, 236, 73, 0.1)';
const BG_LIGHT = '#f6f8f6';
const BG_DARK = '#102215';
const WHITE = '#ffffff';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_900 = '#0f172a';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? BG_DARK : BG_LIGHT;
  const textColor = isDark ? WHITE : SLATE_900;
  const subtextColor = isDark ? SLATE_400 : SLATE_500;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={48} color={PRIMARY} />
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
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subdescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
