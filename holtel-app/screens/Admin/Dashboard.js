// Dashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const cardColors = {
  new: '#3B82F6', // blue
  inProgress: '#FACC15', // yellow
  done: '#22C55E', // green
};

const Dashboard = () => {
  const [summary, setSummary] = useState({ new: 0, inProgress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get('http://localhost:5001/api/reports/summary')
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'แจ้งใหม่วันนี้', key: 'new', color: cardColors.new },
    { label: 'กำลังดำเนินการ', key: 'inProgress', color: cardColors.inProgress },
    { label: 'เสร็จสิ้นแล้ว', key: 'done', color: cardColors.done },
  ];

  const isMobile = Dimensions.get('window').width < 600;

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#F3F4F6' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Admin Dashboard</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
          {cards.map(card => (
            <View
              key={card.key}
              style={{
                flex: 1,
                backgroundColor: card.color,
                borderRadius: 12,
                padding: 24,
                marginBottom: isMobile ? 16 : 0,
                marginRight: isMobile ? 0 : 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{card.label}</Text>
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>{summary[card.key]}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={{
          marginTop: 32,
          backgroundColor: '#3B82F6',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => navigation.navigate('AdminReportList')}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>ไปยัง Report List</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Dashboard;
