// FacilityList.js
import React from 'react';
import { View, Text } from 'react-native';

const FacilityList = ({ facilities }) => (
  <View>
    {facilities.map((f, idx) => (
      <Text key={idx}>{f}</Text>
    ))}
  </View>
);

export default FacilityList;
