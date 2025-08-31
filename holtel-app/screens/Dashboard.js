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
        setRooms(res.data);
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
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
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
              onPress={() => navigation.navigate('RoomDetail', { room: item })}
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
    padding: 16,
    backgroundColor: '#f7faff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#1976d2',
    textAlign: 'center',
    letterSpacing: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  switchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    marginHorizontal: 6,
  },
  switchBtnActive: {
    backgroundColor: '#1976d2',
  },
  switchText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  floorSection: {
    marginBottom: 28,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  floorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  tabRow: {
    marginTop: 10,
  },
  tabBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
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
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  roomNumber: {
    fontSize: 18,
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
    marginTop: 8,
  },
});

export default Dashboard;
