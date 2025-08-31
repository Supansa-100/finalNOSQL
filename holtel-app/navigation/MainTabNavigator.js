import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from '../screens/Dashboard';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import ReportScreen from '../screens/ReportScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();


const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') {
          iconName = 'home-outline';
        } else if (route.name === 'RoomDetail') {
          iconName = 'bed-outline';
        } else if (route.name === 'Report') {
          iconName = 'document-text-outline';
        } else if (route.name === 'MyReports') {
          iconName = 'list-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
    <Tab.Screen name="RoomDetail" component={RoomDetailScreen} options={{ title: 'Room Detail' }} />
    <Tab.Screen name="Report" component={ReportScreen} options={{ title: 'Report' }} />
    <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'My Reports' }} />
  </Tab.Navigator>
);

export default MainTabNavigator;
