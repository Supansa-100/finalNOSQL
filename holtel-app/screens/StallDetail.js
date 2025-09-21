import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const StallDetail = ({ route, navigation }) => {
  const { stallId } = route.params;
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStall = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/stalls/${stallId}`);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลแผง');
        const data = await res.json();
        setStall(data);
      } catch (err) {
        setStall(null);
      }
      setLoading(false);
    };
    fetchStall();
  }, [stallId]);

  if (loading) return <View style={styles.center}><Text style={styles.loading}>กำลังโหลดข้อมูล...</Text></View>;
  if (!stall) return <View style={styles.center}><Text style={styles.error}>ไม่พบข้อมูลแผงนี้</Text></View>;

  const STATUS_COLOR = {
    Available: '#7FC6A5',
    Booked: '#F6C36B',
    Occupied: '#C36B6B',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายละเอียดแผงตลาด</Text>
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {stall.image ? (
            <Image source={{ uri: stall.image }} style={styles.image} />
          ) : (
            <View style={styles.noImage}><Text style={{color:'#aaa'}}>ไม่มีรูป</Text></View>
          )}
        </View>
        <View style={styles.infoWrap}>
          <Text style={styles.name}>แผง {stall.stall_number}</Text>
          <Text style={styles.detail}>ขนาด: {stall.size}</Text>
          <Text style={styles.detail}>ราคา/วัน: <Text style={{color:'#00B5C0',fontWeight:'bold'}}>{stall.price_per_day} บาท</Text></Text>
          <Text style={[styles.statusTag, { backgroundColor: STATUS_COLOR[stall.status] || '#ccc' }]}>สถานะ: {stall.status}</Text>
          {stall.status === 'Available' ? (
            <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('Checkout', { stallId })}>
              <Text style={styles.bookBtnText}>จองแผงนี้</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.unavailable}>แผงนี้ไม่ว่าง</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAE3D9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { fontSize: 18, color: '#00B5C0' },
  error: { fontSize: 18, color: 'red' },
  title: { fontSize: 28, marginBottom: 24, textAlign: 'center', color: '#00B5C0', fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageWrap: {
    marginRight: 18,
    borderRadius: 10,
    overflow: 'hidden',
    width: 120,
    height: 120,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImage: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  infoWrap: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  detail: { fontSize: 16, color: '#555', marginBottom: 6 },
  statusTag: {
    color: '#fff',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  bookBtn: {
    marginTop: 16,
    backgroundColor: '#00B5C0',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  unavailable: {
    marginTop: 16,
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StallDetail;
