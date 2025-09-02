
import React from 'react';
import { Animated, TouchableOpacity, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { ShadowUtils } from '../utils/animations';

const AnimatedButton = ({ 
  children, 
  style, 
  onPress,
  mode = 'contained',
  disabled = false,
  loading = false,
  elevation = 'light',
  ...props 
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const fadeValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: Platform.OS !== 'web',
        tension: 300,
        friction: 10,
      }),
      Animated.timing(fadeValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        tension: 300,
        friction: 10,
      }),
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const shadowStyle = ShadowUtils[elevation] || ShadowUtils.light;

  return (
    <Animated.View 
      style={[
        {
          transform: [{ scale: scaleValue }],
          opacity: fadeValue,
        },
        mode === 'contained' ? shadowStyle : {},
      ]}
    >
      <Button
        mode={mode}
        onPress={onPress}
        disabled={disabled}
        loading={loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          {
            borderRadius: 8,
            marginVertical: 4,
            ...(Platform.OS === 'web' && { pointerEvents: disabled ? 'none' : 'auto' }),
          },
          style
        ]}
        {...props}
      >
        {children}
      </Button>
    </Animated.View>
  );
};

export default AnimatedButton;
