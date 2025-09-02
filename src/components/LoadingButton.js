import React from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';

const LoadingButton = ({ 
  loading, 
  children, 
  onPress, 
  disabled,
  mode = 'contained',
  style,
  ...props 
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={loading || disabled}
      style={[{ paddingVertical: 8 }, style]}
      {...props}
    >
      {loading ? <ActivityIndicator color="white" size="small" /> : children}
    </Button>
  );
};

export default LoadingButton;
