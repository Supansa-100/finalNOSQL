import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from './AuthContext';

const ProfileScreen = () => {
  const { auth } = useContext(AuthContext);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>ชื่อ: {auth.user?.name}</Text>
      <Text>Username: {auth.user?.username}</Text>
      <Text>Role: {auth.user?.role}</Text>
    </View>
  );
};

export default ProfileScreen;