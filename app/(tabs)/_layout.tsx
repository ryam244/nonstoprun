import { Tabs } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/theme';

type TabIconName = 'compass' | 'people' | 'barbell' | 'calendar' | 'person';
type TabIconOutlineName = 'compass-outline' | 'people-outline' | 'barbell-outline' | 'calendar-outline' | 'person-outline';

interface TabBarIconProps {
  focused: boolean;
  iconName: TabIconName;
  outlineIconName: TabIconOutlineName;
  label: string;
  isDark: boolean;
}

function TabBarIcon({ focused, iconName, outlineIconName, label, isDark }: TabBarIconProps) {
  const activeColor = colors.primary;
  const inactiveColor = isDark ? colors.slate500 : colors.slate400;
  const color = focused ? activeColor : inactiveColor;

  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? iconName : outlineIconName}
        size={26}
        color={color}
      />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabBarStyle = {
    backgroundColor: isDark
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    borderTopColor: isDark ? colors.slate800 : colors.slate200,
    borderTopWidth: 1,
    height: 85,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="compass"
              outlineIconName="compass-outline"
              label="ホーム"
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'コミュニティ',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="people"
              outlineIconName="people-outline"
              label="コミュニティ"
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: 'トレーニング',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="barbell"
              outlineIconName="barbell-outline"
              label="トレーニング"
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'イベント',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="calendar"
              outlineIconName="calendar-outline"
              label="イベント"
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="person"
              outlineIconName="person-outline"
              label="プロフィール"
              isDark={isDark}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.medium,
  },
});
