
import React from 'react';
import { Animated, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { ShadowUtils } from '../utils/animations';

const AnimatedCard = ({
  children,
  style,
  elevation = 'light',
  animationType = 'fadeIn',
  delay = 0,
  ...props
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [delay]);

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        };
      case 'scaleIn':
        return {
          opacity: animatedValue,
          transform: [{
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          }],
        };
      case 'slideInRight':
        return {
          opacity: animatedValue,
          transform: [{
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          }],
        };
      default:
        return { opacity: animatedValue };
    }
  };

  const shadowStyle = ShadowUtils[elevation] || ShadowUtils.light;

  return (
    <Animated.View style={[getAnimationStyle()]}>
      <Card
        style={[
          shadowStyle,
          {
            margin: 8,
            borderRadius: 12,
          },
          style
        ]}
        {...props}
      >
        {children}
      </Card>
    </Animated.View>
  );
};

export default AnimatedCard;
