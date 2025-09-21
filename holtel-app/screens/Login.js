import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import theme from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from './AuthContext';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('เข้าสู่ระบบไม่สำเร็จ');
      const data = await res.json();
      // เก็บ token และ user ใน AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      // อัปเดต context เพื่อให้ App.js เปลี่ยนไปหน้าหลัก
      setAuth({ user: data.user, token: data.token, role: data.user.role });
    } catch (err) {
      // สามารถแจ้งเตือนผู้ใช้ได้
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เข้าสู่ระบบ</Text>
      <TextInput placeholder="อีเมล" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <View style={styles.buttonWrap}>
        <Button title="เข้าสู่ระบบ" onPress={handleLogin} color={theme.primary} />
      </View>
      <View style={styles.buttonWrap}>
        <Button title="สมัครสมาชิก" onPress={() => navigation.navigate('Register')} color={theme.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: theme.background, alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: theme.primary, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 12, borderRadius: 10, width: '100%', maxWidth: 360, backgroundColor: theme.white, fontSize: 16 },
  buttonWrap: { width: '100%', maxWidth: 360, alignSelf: 'center', marginTop: 10 },
});

export default Login;
