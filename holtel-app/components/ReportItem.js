// ReportItem.js
import React from 'react';
import { View, Text } from 'react-native';

const ReportItem = ({ report }) => (
  <View>
    <Text>{report.facility} - {report.status}</Text>
    <Text>{report.description}</Text>
  </View>
);

export default ReportItem;
