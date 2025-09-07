import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../screens/user/Dashboard';
import ProfileScreen from '../screens/ProfileScreen';
import ReportsScreen from '../screens/user/ReportScreen';
import MyReportsScreen from '../screens/user/MyReportsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'หน้าหลัก' }} />
    <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'แจ้งซ่อม' }} />
    <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'รายการแจ้งซ่อม' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'โปรไฟล์' }} />
  </Tab.Navigator>
);

export default MainTabNavigator;