import React from 'react';
import { TextInput, StyleSheet, View, Platform } from 'react-native';
import theme from '../utils/theme';

const Input = ({ style, placeholderTextColor = '#333', ...props }) => {
  return (
    <View style={styles.wrapper}>
      <TextInput
        {...props}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, style]}
        underlineColorAndroid="transparent"
        autoCapitalize={props.autoCapitalize ?? 'none'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  input: {
    // remove heavy grid/border lines to match the new soft UI
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 12,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    // ensure padding/border are included in width on web
    boxSizing: 'border-box',
    marginBottom: 12,
    height: 56,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 14, android: 12, default: 14 }),
    backgroundColor: '#fff',
    color: theme.text,
    textAlignVertical: 'center',
  },

});

export default Input;
