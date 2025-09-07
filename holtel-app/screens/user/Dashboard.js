import React, { useEffect, useState } from 'react';

import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Dashboard สามารถเข้าถึงได้โดยไม่ต้องเข้าสู่ระบบ
const Dashboard = () => {
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState(1);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/rooms');
        // map id ให้ FlatList มี key ที่ unique
        const mappedRooms = res.data.map(r => ({ ...r, id: r._id || r.id }));
        setRooms(mappedRooms);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const floors = [1, 2, 3];
  const roomsByFloor = floors.map(floor => ({
    floor,
    rooms: rooms.filter(r => r.floor === floor)
  }));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏢 ห้องพักทั้งหมด</Text>
      <View style={styles.tabRow}>
        <View style={styles.tabBtnRow}>
          {floors.map(floor => (
            <Pressable
              key={floor}
              style={[styles.tabBtn, activeFloor === floor && styles.tabBtnActive]}
              onPress={() => setActiveFloor(floor)}
            >
              <Text style={activeFloor === floor ? styles.tabTextActive : styles.tabText}>ชั้น {floor}</Text>
            </Pressable>
          ))}
        </View>
        <FlatList
          data={roomsByFloor.find(r => r.floor === activeFloor)?.rooms || []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() => navigation.navigate('RoomDetailScreen', { room: item })}
            >
              <View style={styles.roomHeader}>
                <Text style={styles.roomIcon}>🚪</Text>
                <Text style={styles.roomNumber}>ห้อง {item.room_number}</Text>
              </View>
              <Text style={styles.facilityText}>
                <Text style={{ fontWeight: 'bold' }}>อุปกรณ์:</Text> {item.facilities && item.facilities.length > 0 ? item.facilities.join(', ') : 'ไม่มีข้อมูล'}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีห้องในชั้นนี้</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f7faff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#1976d2',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tabRow: {
    marginTop: 8,
  },
  tabBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#e3f2fd',
    marginHorizontal: 6,
  },
  tabBtnActive: {
    backgroundColor: '#1976d2',
  },
  tabText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roomCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'column',
    // ใช้ boxShadow สำหรับ web แทน shadow*
    // boxShadow ไม่ error ใน RN Web, แต่ RN Mobile จะไม่เห็น effect
    // elevation เฉพาะ Android
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    elevation: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  facilityText: {
    fontSize: 15,
    color: '#333',
  },
  emptyText: {
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default Dashboard;