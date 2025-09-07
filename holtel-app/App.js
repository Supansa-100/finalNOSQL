import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './screens/AuthContext';
import AuthScreen from './screens/AuthScreen';
import MainTabNavigator from './navigation/MainTabNavigator';
import AdminDashboard from './screens/Admin/Dashboard';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { auth } = React.useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!auth.user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : auth.role === 'admin' ? (
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      ) : (
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}