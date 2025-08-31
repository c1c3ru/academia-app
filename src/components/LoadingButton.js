import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';

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
      type={mode === 'outlined' ? 'outline' : 'solid'}
      onPress={onPress}
      disabled={loading || disabled}
      buttonStyle={[{ paddingVertical: 8 }, style]}
      title={loading ? '' : children}
      loading={loading}
      {...props}
    />
  );
};

export default LoadingButton;
