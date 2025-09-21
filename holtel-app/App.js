import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './screens/AuthContext';
import Login from './screens/Login';
import Register from './screens/Register';
import MainTabNavigator from './navigation/MainTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { auth } = React.useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!auth.user ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      ) : (
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Simple development ErrorBoundary to capture stack traces for runtime errors in web
class DevErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    // Log full error and component stack to console for debugging
    console.error('DevErrorBoundary caught:', error);
    console.error('Component stack:', info.componentStack);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      // Non-intrusive fallback showing error details in dev
      return (
        <div style={{ padding: 20 }}>
          <h2 style={{ color: 'red' }}>An error occurred (dev)</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const rootNav = require('./navigation/RootNavigation');

  return (
    <AuthProvider>
      <DevErrorBoundary>
        <NavigationContainer ref={rootNav.navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </DevErrorBoundary>
    </AuthProvider>
  );
}