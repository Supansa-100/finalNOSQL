import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import theme from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({ navigation }) => {
  const [stalls, setStalls] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  // รูปตัวอย่างแผงตลาด
  const sampleImages = [
  require('../assets/icon.png'),
  require('../assets/adaptive-icon.png'),
  require('../assets/splash-icon.png'),
  require('../assets/favicon.png'),
  require('../assets/icon.png'),
  ];

  const fetchStalls = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/stalls', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลแผงตลาด');
      let data = await res.json();
      // ถ้า image เป็น path uploads ให้แสดงรูปจาก backend
      data = data.map((stall, idx) => {
        let imgSrc = stall.image;
        if (imgSrc && imgSrc.startsWith('/uploads')) {
          imgSrc = `http://localhost:5001${imgSrc}`;
        }
        if (!imgSrc) {
          imgSrc = sampleImages[idx % sampleImages.length];
        }
        return {
          ...stall,
          image: imgSrc,
        };
      });
      setStalls(data);
      setFiltered(data);
    } catch (err) {
      setStalls([]);
      setFiltered([]);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(stalls);
    } else {
      setFiltered(stalls.filter(s =>
        (s.stall_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.size || '').toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, stalls]);

  const STATUS_COLOR = {
    Available: theme.success,
    Booked: theme.accent,
    Occupied: theme.danger,
  };

  const handleBooking = async (stallId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      // ใช้วันที่ปัจจุบันและ +1 วัน
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 1);
      const start_date = start.toISOString().slice(0,10);
      const end_date = end.toISOString().slice(0,10);
      const res = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stall_id: stallId, start_date, end_date })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'จองไม่สำเร็จ');
      alert('จองแผงสำเร็จ!');
      // รีเฟรชสถานะแผงหลังจอง
      await fetchStalls();
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, { borderColor: STATUS_COLOR[item.status] || '#ccc', borderWidth: 2 }]} onPress={() => navigation.navigate('StallDetail', { stallId: item.id || item._id })}>
      <View style={styles.imageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.noImage}><Text style={{color:'#aaa'}}>ไม่มีรูป</Text></View>
        )}
      </View>
      <View style={styles.infoWrap}>
        <Text style={styles.name}>แผง {item.stall_number}</Text>
        <Text style={styles.detail}>ขนาด: {item.size}</Text>
        <Text style={styles.detail}>ราคา/วัน: <Text style={{color:'#00B5C0',fontWeight:'bold'}}>{item.price_per_day} บาท</Text></Text>
        <Text style={[styles.statusTag, { backgroundColor: STATUS_COLOR[item.status] || '#ccc' }]}>สถานะ: {item.status}</Text>
        {item.status === 'Available' && (
          <TouchableOpacity style={styles.bookBtn} onPress={() => handleBooking(item.id || item._id)}>
            <Text style={styles.bookBtnText}>จองแผงนี้</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ตลาดเช่าที่ - เลือกแผงที่ต้องการ</Text>
      <TextInput
        style={styles.search}
        placeholder="ค้นหาเลขแผงหรือขนาด..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.id || item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบแผงที่ตรงกับเงื่อนไข</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.background },
  title: { fontSize: 26, marginBottom: 20, textAlign: 'center', color: theme.primary, fontWeight: 'bold' },
  card: {
    backgroundColor: theme.card,
    padding: 18,
    marginBottom: 18,
    borderRadius: 14,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    borderWidth: 2,
    borderColor: theme.border,
  },
  imageWrap: {
    marginRight: 18,
    borderRadius: 10,
    overflow: 'hidden',
    width: 90,
    height: 90,
    backgroundColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImage: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.muted,
    borderRadius: 10,
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  infoWrap: {
    flex: 1,
    minHeight: 90,
    justifyContent: 'center',
  },
  name: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginBottom: 6 },
  detail: { fontSize: 16, color: theme.text, marginBottom: 4 },
  statusTag: {
    color: theme.white,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  bookBtn: {
    marginTop: 12,
    backgroundColor: theme.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookBtnText: {
    color: theme.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  search: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    backgroundColor: theme.white,
    fontSize: 16,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  emptyText: {
    color: theme.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 18,
  },
});

export default Home;
