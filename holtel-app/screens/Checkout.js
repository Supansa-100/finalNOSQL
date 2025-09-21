import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

const Checkout = ({ route, navigation }) => {
  const { stallId } = route.params;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleBooking = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stall_id: stallId,
          start_date: startDate,
          end_date: endDate
        })
      });
      if (!res.ok) throw new Error('จองแผงไม่สำเร็จ');
      // สามารถแจ้งเตือนหรือกลับไปหน้า MyBookings
      navigation.navigate('MyBookings');
    } catch (err) {
      // สามารถแจ้งเตือนผู้ใช้ได้
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ยืนยันการจอง</Text>
      <Text>เลือกวันที่เช่า</Text>
      <TextInput placeholder="Check-in" value={startDate} onChangeText={setStartDate} style={styles.input} />
      <TextInput placeholder="Check-out" value={endDate} onChangeText={setEndDate} style={styles.input} />
      <Button title="ยืนยันการจอง" onPress={handleBooking} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default Checkout;
