import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from './AuthContext';

const AdminStatistic = () => {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [topRooms, setTopRooms] = useState([]);
  const [topFacilities, setTopFacilities] = useState([]);
  const [avgTime, setAvgTime] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5001/api/admin/reports/advance-statistics', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลสถิติ');
        const data = await res.json();
        setMonthlyStats(data.monthlyStats || []);
        setTopRooms(data.topRooms || []);
        setTopFacilities(data.topFacilities || []);
        setAvgTime(data.avgTime || null);
      } catch (err) {
        Alert.alert('Error', err.message || 'เกิดข้อผิดพลาด');
      }
      setLoading(false);
    };
    fetchStats();
  }, [auth.token]);

  // ... (remainder of file unchanged)
};

export default AdminStatistic;