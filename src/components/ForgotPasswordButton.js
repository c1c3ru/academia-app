
import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ForgotPasswordButton = ({ onPress, disabled = false, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[{ alignSelf: 'flex-end' }, style]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      >
        <MaterialCommunityIcons 
          name="lock-question" 
          size={16} 
          color="#667eea"
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: disabled ? '#ccc' : '#667eea',
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          Esqueceu sua senha?
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ForgotPasswordButton;
