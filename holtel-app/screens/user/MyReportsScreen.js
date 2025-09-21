import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { resetToAuth } from '../../navigation/RootNavigation';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';

const STATUS_LABEL = {
  pending: 'รออนุมัติ',
  confirmed: 'จองสำเร็จ',
  cancelled: 'ยกเลิก',
};
const STATUS_COLOR = {
  pending: '#F6C36B',
  confirmed: theme.primary,
  cancelled: '#C36B6B',
};

const MyReportsScreen = () => {
  const { auth } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.user || !auth?.token) {
      setLoading(false);
      return;
    }
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5001/api/bookings/me', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [auth?.user, auth?.token]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}> 
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!auth?.user || !auth?.token) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <Text style={styles.header}>ประวัติการเช่าที่ของฉัน</Text>
        <Text style={styles.emptyText}>ยังไม่มีข้อมูล — กรุณาเข้าสู่ระบบเพื่อดูรายการของคุณ</Text>
        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: theme.primary }]} onPress={() => resetToAuth()}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>ไปยังหน้าล็อกอิน</Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 12, color: 'gray' }}>Debug token: {String(auth?.token)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={styles.header}>ประวัติการเช่าที่ของฉัน</Text>
      <FlatList
        data={bookings}
        keyExtractor={item => item._id || item.id}
        renderItem={({ item }) => (
          <View style={[styles.reportCard, { backgroundColor: theme.card }] }>
            <Text style={styles.label}><Text style={{fontWeight:'bold'}}>เลขที่แผง:</Text> {item.stall?.stall_number || '-'}</Text>
            <Text style={styles.label}><Text style={{fontWeight:'bold'}}>ขนาด:</Text> {item.stall?.size || '-'}</Text>
            <Text style={styles.label}><Text style={{fontWeight:'bold'}}>ราคา/วัน:</Text> {item.stall?.price_per_day || '-'} บาท</Text>
            <Text style={styles.label}><Text style={{fontWeight:'bold'}}>วันที่เช่า:</Text> {item.start_date} - {item.end_date}</Text>
            <Text style={[styles.statusTag, { backgroundColor: STATUS_COLOR[item.status] || '#ccc' }]}>สถานะ: {STATUS_LABEL[item.status] || item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>ยังไม่มีประวัติการเช่าที่</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  reportCard: {
    borderRadius: 10,
    marginBottom: 12,
    padding: 14,
    // boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  label: {
    fontSize: 15,
    marginBottom: 2,
  },
  statusTag: {
    color: '#fff',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  emptyText: {
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default MyReportsScreen;