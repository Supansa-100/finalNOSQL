import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import StallDetail from '../screens/StallDetail';
import MyBookings from '../screens/MyBookings';
import Profile from '../screens/Profile';
import theme from '../utils/theme';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: theme.background, shadowColor: 'transparent' },
      headerTitleStyle: { color: theme.primary, fontWeight: '700' },
      tabBarShowLabel: true,
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 14,
        elevation: 6,
        borderRadius: 14,
        height: 64,
        backgroundColor: theme.card,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      tabBarIcon: ({ color }) => {
        let icon = '•';
        if (route.name === 'Dashboard') icon = '🏠';
        else if (route.name === 'Reports') icon = '📝';
        else if (route.name === 'MyReports') icon = '📂';
        else if (route.name === 'Profile') icon = '👤';
        return (
          <View style={{ width: 36, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color }}>{icon}</Text>
          </View>
        );
      },
    })}
  >
  <Tab.Screen name="Home" component={Home} options={{ title: 'หน้าหลัก' }} />
  <Tab.Screen name="MyBookings" component={MyBookings} options={{ title: 'การจองของฉัน' }} />
  <Tab.Screen name="Profile" component={Profile} options={{ title: 'โปรไฟล์' }} />
  </Tab.Navigator>
);

export default MainTabNavigator;