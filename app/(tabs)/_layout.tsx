import { Tabs } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#13ec49';
const SLATE_400 = '#94a3b8';
const SLATE_500 = '#64748b';
const SLATE_200 = '#e2e8f0';
const SLATE_800 = '#1e293b';

type IconName = 'compass' | 'compass-outline' | 'people' | 'people-outline' |
  'barbell' | 'barbell-outline' | 'calendar' | 'calendar-outline' |
  'person' | 'person-outline';

interface TabIconProps {
  focused: boolean;
  iconName: IconName;
  outlineIconName: IconName;
  label: string;
  isDark: boolean;
}

function TabIcon({ focused, iconName, outlineIconName, label, isDark }: TabIconProps) {
  const activeColor = PRIMARY_COLOR;
  const inactiveColor = isDark ? SLATE_500 : SLATE_400;
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: isDark ? SLATE_800 : SLATE_200,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }) => (
            <TabIcon
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
            <TabIcon
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
            <TabIcon
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
            <TabIcon
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
            <TabIcon
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
    fontSize: 10,
    fontWeight: '500',
  },
});
