// AuthScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [room_id, setRoomId] = useState('');
  const navigation = useNavigation();

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setRoomId('');
  };

  const handleSubmit = async () => {
    if (!username || !password || (mode === 'register' && (!confirmPassword || !name || !room_id))) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Error', 'รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      if (mode === 'login') {
        const res = await axios.post('http://localhost:5001/api/login', { username, password });
        // นำผู้ใช้ไปหน้า Dashboard
        navigation.replace('Dashboard', { user: res.data.user, token: res.data.token });
      } else {
        const res = await axios.post('http://localhost:5001/api/register', {
          username,
          password,
          name,
          role: 'user',
          room_id
        });
        Alert.alert('Register Success', 'สมัครสมาชิกสำเร็จ!');
        navigation.replace('Dashboard', { user: res.data.user });
      }
    } catch (err) {
      Alert.alert(mode === 'login' ? 'Login Failed' : 'Register Failed', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>{mode === 'login' ? 'Login' : 'Register'}</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
      />
      {mode === 'register' && (
        <>
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
          />
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
          />
          <TextInput
            placeholder="Room ID"
            value={room_id}
            onChangeText={setRoomId}
            style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
          />
        </>
      )}
      <Button title={mode === 'login' ? 'Login' : 'Register'} onPress={handleSubmit} />
      <TouchableOpacity
        onPress={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          resetFields();
        }}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: 'blue' }}>
          {mode === 'login' ? 'สมัครสมาชิก (Register)' : 'เข้าสู่ระบบ (Login)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;
