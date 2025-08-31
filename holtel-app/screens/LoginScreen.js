// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/api/login', { username, password });
      // นำผู้ใช้ไปหน้า Dashboard
      navigation.replace('Dashboard', { user: res.data.user, token: res.data.token });
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
      />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
        <Text style={{ color: 'blue' }}>สมัครสมาชิก (Register)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
