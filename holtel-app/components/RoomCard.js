// RoomCard.js
import React from 'react';
import { View, Text } from 'react-native';

const RoomCard = ({ room }) => (
  <View>
    <Text>Room {room.room_number} - Floor {room.floor}</Text>
  </View>
);

export default RoomCard;
