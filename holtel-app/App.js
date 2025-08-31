import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './navigation/MainTabNavigator';
import AuthScreen from './screens/AuthScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import ReportScreen from './screens/ReportScreen';
import MyReportsScreen from './screens/MyReportsScreen';
import Dashboard from './screens/Dashboard';
import AdminDashboard from './screens/Admin/Dashboard';

const Stack = createNativeStackNavigator();

// Auth Context
const AuthContext = createContext();

const App = () => {
	return (
		<NavigationContainer>
			<MainTabNavigator />
		</NavigationContainer>
	);
};

export default App;
