import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import axios from 'axios';

const FACILITIES = ['fan', 'wardrobe', 'bed', 'vanity', 'fridge', 'aircon'];

const RoomManagement = () => {
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
			const res = await axios.get('http://localhost:5001/api/rooms');
			setRooms(res.data);
		} catch (err) {
			setRooms([]);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchRooms();
	}, []);

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
				await axios.put(`http://localhost:5001/api/rooms/${editRoom.id}`, payload);
			} else {
				await axios.post('http://localhost:5001/api/rooms', payload);
			}
			setModalVisible(false);
			fetchRooms();
		} catch (err) {
			alert('เกิดข้อผิดพลาด');
		}
	};

	return (
		<View style={{ flex: 1, padding: 16, backgroundColor: '#F3F4F6' }}>
			<Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Room Management</Text>
			<Button title="เพิ่มห้องใหม่" onPress={() => openModal()} />
			<FlatList
				data={rooms}
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginVertical: 8 }}
						onPress={() => openModal(item)}
					>
						<Text style={{ fontWeight: 'bold' }}>ห้อง {item.room_number} (ชั้น {item.floor})</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
							{item.facilities.map(f => (
								<View key={f} style={{ backgroundColor: '#3B82F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 }}>
									<Text style={{ color: '#fff' }}>{f}</Text>
								</View>
							))}
						</ScrollView>
					</TouchableOpacity>
				)}
			/>
			<Modal visible={modalVisible} animationType="slide">
				<View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
					<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{editRoom ? 'แก้ไขห้อง' : 'เพิ่มห้องใหม่'}</Text>
					<TextInput
						placeholder="เลขห้อง"
						value={roomNumber}
						onChangeText={setRoomNumber}
						style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
					/>
					<TextInput
						placeholder="ชั้น"
						value={floor}
						onChangeText={setFloor}
						keyboardType="numeric"
						style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
					/>
					<Text style={{ marginBottom: 8 }}>สิ่งอำนวยความสะดวก</Text>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
						{FACILITIES.map(f => (
							<TouchableOpacity
								key={f}
								style={{ backgroundColor: facilities.includes(f) ? '#22C55E' : '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, margin: 4 }}
								onPress={() => handleFacilityToggle(f)}
							>
								<Text style={{ color: facilities.includes(f) ? '#fff' : '#333' }}>{f}</Text>
							</TouchableOpacity>
						))}
					</View>
					<Button title="บันทึก" onPress={handleSave} />
					<Button title="ยกเลิก" color="#EF4444" onPress={() => setModalVisible(false)} style={{ marginTop: 8 }} />
				</View>
			</Modal>
		</View>
	);
};

export default RoomManagement;
