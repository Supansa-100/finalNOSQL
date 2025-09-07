import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const FACILITIES = ['fan', 'wardrobe', 'bed', 'vanity', 'fridge', 'aircon'];

const RoomManagement = () => {
  const { auth } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [facilities, setFacilities] = useState([]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/rooms', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setRooms(res.data);
    } catch (err) {
      setRooms([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [auth.token]);

  const openModal = (room = null) => {
    setEditRoom(room);
    setRoomNumber(room ? room.room_number : '');
    setFloor(room ? room.floor.toString() : '');
    setFacilities(room ? room.facilities : []);
    setModalVisible(true);
  };

  const handleFacilityToggle = (facility) => {
    setFacilities(facilities.includes(facility)
      ? facilities.filter(f => f !== facility)
      : [...facilities, facility]);
  };

  const handleSave = async () => {
    const payload = {
      room_number: roomNumber,
      floor: Number(floor),
      facilities,
    };
    try {
      if (editRoom) {
        await axios.put(`http://localhost:5001/api/rooms/${editRoom.id}`, payload, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
      } else {
        await axios.post('http://localhost:5001/api/rooms', payload, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
      }
      setModalVisible(false);
      fetchRooms();
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  // ... (remainder of file unchanged)
};

export default RoomManagement;