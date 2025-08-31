// ReportList.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Picker } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const statusColors = {
  new: '#3B82F6',
  'in-progress': '#FACC15',
  done: '#22C55E',
};

const floors = [1, 2, 3];
const rooms = [101,102,103,104,105,201,202,203,204,205,301,302,303,304,305];
const statuses = ['new', 'in-progress', 'done'];

const ReportList = () => {
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [status, setStatus] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (floor) params.floor = floor;
      if (room) params.room = room;
      if (status) params.status = status;
      const res = await axios.get('http://localhost:5001/api/reports', { params });
      setReports(res.data);
    } catch (err) {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [floor, room, status]);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#F3F4F6' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Report List</Text>
      {/* Filter Section */}
      <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text>ชั้น</Text>
          <Picker selectedValue={floor} onValueChange={setFloor}>
            <Picker.Item label="ทั้งหมด" value="" />
            {floors.map(f => (
              <Picker.Item key={f} label={f.toString()} value={f.toString()} />
            ))}
          </Picker>
        </View>
        <View style={{ flex: 1 }}>
          <Text>ห้อง</Text>
          <Picker selectedValue={room} onValueChange={setRoom}>
            <Picker.Item label="ทั้งหมด" value="" />
            {rooms.map(r => (
              <Picker.Item key={r} label={r.toString()} value={r.toString()} />
            ))}
          </Picker>
        </View>
        <View style={{ flex: 1 }}>
          <Text>สถานะ</Text>
          <Picker selectedValue={status} onValueChange={setStatus}>
            <Picker.Item label="ทั้งหมด" value="" />
            {statuses.map(s => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
      </View>
      {/* List Section */}
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => navigation.navigate('AdminReportDetail', { id: item.id })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                  ห้อง {item.room?.room_number || '-'}
                </Text>
                <Text style={{ marginLeft: 12 }}>{item.facility}</Text>
              </View>
              <Text>ผู้แจ้ง: {item.user?.name || '-'}</Text>
              <Text>วันที่แจ้ง: {new Date(item.created_at).toLocaleString()}</Text>
              <View style={{ marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: statusColors[item.status] || '#ccc' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default ReportList;
