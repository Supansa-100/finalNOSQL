import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import theme from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from './AuthContext';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ข้อมูลผู้ใช้</Text>
      <Text style={styles.label}>ชื่อ: <Text style={styles.value}>{user.name}</Text></Text>
      <Text style={styles.label}>เบอร์: <Text style={styles.value}>{user.phone}</Text></Text>
      <Text style={styles.label}>อีเมล: <Text style={styles.value}>{user.email}</Text></Text>
      <View style={styles.buttonWrap}>
        <Button title="Logout" onPress={handleLogout} color={theme.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.background },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: theme.primary, fontWeight: 'bold' },
  label: { fontSize: 18, color: theme.text, marginBottom: 8 },
  value: { fontWeight: 'bold', color: theme.text },
  buttonWrap: { marginTop: 20, alignSelf: 'center', width: '60%' },
});

export default Profile;
