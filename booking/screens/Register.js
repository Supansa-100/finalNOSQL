import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import theme from '../utils/theme';

const Register = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !phone || !email || !password) {
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    if (password !== confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'สมัครสมาชิกไม่สำเร็จ');
      alert(data.message || 'สมัครสมาชิกสำเร็จ!');
      navigation.replace('Login');
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
        <Text style={styles.title}>สมัครสมาชิก</Text>
        <TextInput placeholder="ชื่อ-นามสกุล" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="เบอร์โทรศัพท์" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
        <TextInput placeholder="อีเมล" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
        <TextInput placeholder="รหัสผ่าน" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TextInput placeholder="ยืนยันรหัสผ่าน" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} />
        <View style={styles.buttonWrap}>
          <Button title="สมัครสมาชิก" onPress={handleRegister} color="#00C9C9" />
        </View>
        <View style={styles.buttonWrap}>
          <Button title="เข้าสู่ระบบ" onPress={() => navigation.navigate('Login')} color="#00B5C0" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    padding: 20,
  },
  formBox: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    color: theme.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    width: '100%',
    backgroundColor: theme.white,
    fontSize: 16,
  },
});

export default Register;
