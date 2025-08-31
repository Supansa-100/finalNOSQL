// ReportDetail.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, Picker, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const statuses = ['new', 'in-progress', 'done'];

const ReportDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState('new');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5001/api/reports/${id}`)
      .then(res => {
        setReport(res.data);
        setStatus(res.data.status);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`http://localhost:5001/api/reports/${id}`, { status });
      Alert.alert('Success', 'บันทึกสถานะเรียบร้อย', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
    setSaving(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 32 }} />;
  }
  if (!report) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>ไม่พบข้อมูล</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#F3F4F6' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Report Detail</Text>
      <Text style={{ fontWeight: 'bold' }}>ห้อง:</Text>
      <Text style={{ marginBottom: 8 }}>{report.room?.room_number || '-'}</Text>
      <Text style={{ fontWeight: 'bold' }}>ผู้แจ้ง:</Text>
      <Text style={{ marginBottom: 8 }}>{report.user?.name || '-'}</Text>
      <Text style={{ fontWeight: 'bold' }}>สิ่งที่ชำรุด:</Text>
      <Text style={{ marginBottom: 8 }}>{report.facility}</Text>
      <Text style={{ fontWeight: 'bold' }}>รายละเอียด:</Text>
      <Text style={{ marginBottom: 8 }}>{report.description}</Text>
      <Text style={{ fontWeight: 'bold' }}>วันที่แจ้ง:</Text>
      <Text style={{ marginBottom: 8 }}>{new Date(report.created_at).toLocaleString()}</Text>
      {report.image_url ? (
        <Image source={{ uri: report.image_url }} style={{ width: 200, height: 200, marginBottom: 16 }} />
      ) : null}
      <Text style={{ fontWeight: 'bold' }}>สถานะ:</Text>
      <Picker selectedValue={status} onValueChange={setStatus} style={{ marginBottom: 16 }}>
        {statuses.map(s => (
          <Picker.Item key={s} label={s} value={s} />
        ))}
      </Picker>
      <Button title={saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'} onPress={handleSave} disabled={saving} />
    </View>
  );
};

export default ReportDetail;
