import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const AuthScreen = () => {
  const { setAuth } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [room_id, setRoomId] = useState('');

  const handleSubmit = async () => {
    if (!username || !password || (mode === 'register' && (!confirm || !name || !room_id))) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (mode === 'register' && password !== confirm) {
      Alert.alert('รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      if (mode === 'login') {
        const res = await axios.post('http://localhost:5001/api/login', { username, password });
        setAuth({
          user: res.data.user,
          token: res.data.token,
          role: res.data.user.role,
        });
      } else {
        await axios.post('http://localhost:5001/api/register', { username, password, name, room_id });
        Alert.alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setMode('login');
        setUsername('');
        setPassword('');
        setConfirm('');
        setName('');
        setRoomId('');
      }
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <Text style={{ fontSize: 32, marginBottom: 24 }}>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={{ width: 250, borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ width: 250, borderWidth: 1, marginBottom: 8, padding: 8 }} />
      {mode === 'register' && (
        <>
          <TextInput placeholder="ยืนยันรหัสผ่าน" value={confirm} onChangeText={setConfirm} secureTextEntry style={{ width: 250, borderWidth: 1, marginBottom: 8, padding: 8 }} />
          <TextInput placeholder="ชื่อ-นามสกุล" value={name} onChangeText={setName} style={{ width: 250, borderWidth: 1, marginBottom: 8, padding: 8 }} />
          <TextInput placeholder="หมายเลขห้อง" value={room_id} onChangeText={setRoomId} style={{ width: 250, borderWidth: 1, marginBottom: 8, padding: 8 }} />
        </>
      )}
      <Button title={mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'} onPress={handleSubmit} />
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={{ marginTop: 16, color: 'blue' }}>
          {mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;