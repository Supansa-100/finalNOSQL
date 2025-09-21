import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import theme from '../utils/theme';

const MyBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/bookings/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลการจอง');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setBookings([]);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/bookings/${id}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('ยกเลิกการจองไม่สำเร็จ');
      alert('ยกเลิกการจองสำเร็จ!');
      // รีเฟรชข้อมูลจองใหม่
      const fetchBookings = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const res = await fetch('http://localhost:5001/api/bookings/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลการจอง');
          const data = await res.json();
          setBookings(data);
        } catch (err) {
          setBookings([]);
        }
      };
      fetchBookings();
      // รีเฟรชหน้า Home ด้วย navigation
      navigation.navigate('MainTab', { screen: 'Home', params: { refresh: true } });
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.stall}>แผง: {item.stall_number}</Text>
      <Text style={styles.date}>วันที่: {item.start_date} - {item.end_date}</Text>
      <Text style={styles.status}>สถานะ: {item.status}</Text>
      <View style={styles.buttonWrap}>
        <Button title="ยกเลิกการจอง" onPress={() => handleCancel(item.id || item._id)} color={theme.accent} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>การจองของฉัน</Text>
  <FlatList data={bookings} renderItem={renderItem} keyExtractor={item => item.id || item._id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.background },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: theme.primary, fontWeight: 'bold' },
  card: { backgroundColor: theme.card, padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
  stall: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  date: { fontSize: 16, color: theme.text },
  status: { fontSize: 16, color: theme.accent, marginBottom: 8 },
  buttonWrap: { marginTop: 8, alignSelf: 'flex-start', width: '60%' },
});

export default MyBookings;
