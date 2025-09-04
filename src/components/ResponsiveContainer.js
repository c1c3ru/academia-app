
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

const ResponsiveContainer = ({ 
  children, 
  scrollable = false,
  style = {},
  contentContainerStyle = {},
  padding = true,
  ...props 
}) => {
  const { isMobile, isTablet, breakpoint } = useResponsive();

  const getContainerStyle = () => {
    const baseStyle = {
      flex: 1,
      backgroundColor: '#f5f5f5',
    };

    if (padding) {
      baseStyle.paddingHorizontal = isMobile ? 16 : isTablet ? 24 : 32;
      baseStyle.paddingVertical = isMobile ? 16 : 20;
    }

    return [baseStyle, style];
  };

  const getContentStyle = () => {
    const baseContentStyle = {
      maxWidth: isMobile ? '100%' : isTablet ? 768 : 1024,
      alignSelf: 'center',
      width: '100%',
    };

    return [baseContentStyle, contentContainerStyle];
  };

  if (scrollable) {
    return (
      <ScrollView
        style={getContainerStyle()}
        contentContainerStyle={getContentStyle()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={getContainerStyle()} {...props}>
      <View style={getContentStyle()}>
        {children}
      </View>
    </View>
  );
};

export default ResponsiveContainer;
