// RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [room_number, setRoomNumber] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:5001/api/register', {
        username,
        password,
        name,
        role: 'user',
        room_id: room_number
      });
      Alert.alert('Register Success', 'สมัครสมาชิกสำเร็จ!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Register Failed', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Register</Text>
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
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Room Number"
        value={room_number}
        onChangeText={setRoomNumber}
        style={{ borderWidth: 1, width: '100%', marginBottom: 10, padding: 8 }}
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
