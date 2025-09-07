import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const STATUS_LABEL = {
  new: 'รอรับเรื่อง',
  'in-progress': 'กำลังดำเนินการ',
  done: 'สำเร็จแล้ว'
};
const STATUS_COLOR = {
  new: '#fbbc04',
  'in-progress': '#4285f4',
  done: '#34a853'
};

const FILTERS = ['new', 'in-progress', 'done'];

const AdminReportList = () => {
  const { auth } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('new');
  const [updating, setUpdating] = useState(false);
  const navigation = useNavigation();

  const fetchReports = async (status) => {
    setLoading(true);
    try {
      let url = `http://localhost:5001/api/admin/reports`;
      if (status) url += `?status=${status}`;
      const res = await fetch(url, {
        // headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'เกิดข้อผิดพลาด');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports(selectedFilter);
    // eslint-disable-next-line
  }, [selectedFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/reports/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('อัปเดตสถานะไม่สำเร็จ');
      const updated = await res.json();
      setReports(reports =>
        reports.map(r => (r._id === updated._id ? updated : r))
      );
      Alert.alert('Success', `อัปเดตสถานะเป็น "${STATUS_LABEL[newStatus]}" แล้ว`);
    } catch (err) {
      Alert.alert('Error', err.message || 'เกิดข้อผิดพลาด');
    }
    setUpdating(false);
  };

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('AdminReportDetail', { report: item })}
    >
      <View style={styles.rowSpace}>
        <Text style={styles.roomText}>ห้อง: <Text style={styles.bold}>{item.room_number || '-'}</Text></Text>
        <Text style={[styles.statusTag, { backgroundColor: STATUS_COLOR[item.status] || '#ccc' }]}>
          {STATUS_LABEL[item.status]}
        </Text>
      </View>
      <Text style={styles.label}>อุปกรณ์: <Text style={styles.bold}>{item.facility || '-'}</Text></Text>
      <Text numberOfLines={2} style={styles.label}>รายละเอียด: {item.description || '-'}</Text>
      <Text style={styles.dateText}>วันที่แจ้ง: {new Date(item.created_at).toLocaleString('th-TH')}</Text>
      <View style={styles.actionRow}>
        {item.status === 'new' && (
          <TouchableOpacity
            style={styles.actionBtn}
            disabled={updating}
            onPress={() => handleUpdateStatus(item._id, 'in-progress')}
          >
            <Text style={styles.actionBtnText}>รับงาน</Text>
          </TouchableOpacity>
        )}
        {item.status === 'in-progress' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: STATUS_COLOR.done }]}
            disabled={updating}
            onPress={() => handleUpdateStatus(item._id, 'done')}
          >
            <Text style={styles.actionBtnText}>เสร็จงาน</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>รายการรีพอร์ตทั้งหมด</Text>
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, selectedFilter === f && styles.filterBtnActive]}
            onPress={() => setSelectedFilter(f)}
          >
            <Text style={selectedFilter === f ? styles.filterTextActive : styles.filterText}>
              {STATUS_LABEL[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{marginTop: 40}} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item._id || item.id}
          renderItem={renderReport}
          ListEmptyComponent={
            <Text style={styles.emptyText}>ไม่มีรีพอร์ตสถานะนี้</Text>
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f8fafc',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#e3f2fd',
    marginHorizontal: 5,
  },
  filterBtnActive: {
    backgroundColor: '#1976d2',
  },
  filterText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  roomText: {
    color: '#1565c0',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statusTag: {
    color: '#fff',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  label: {
    fontSize: 15,
    color: '#222',
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  dateText: {
    color: '#555',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 18,
  }
});

export default AdminReportList;