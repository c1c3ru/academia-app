import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const ActionButton = ({ 
  mode = 'outlined', 
  icon, 
  children, 
  onPress, 
  style, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  ...props 
}) => {
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          contained: ['#2196F3', '#1976D2'],
          outlined: '#2196F3',
          text: mode === 'contained' ? '#ffffff' : '#2196F3'
        };
      case 'success':
        return {
          contained: ['#4CAF50', '#388E3C'],
          outlined: '#4CAF50',
          text: mode === 'contained' ? '#ffffff' : '#4CAF50'
        };
      case 'warning':
        return {
          contained: ['#FF9800', '#F57C00'],
          outlined: '#FF9800',
          text: mode === 'contained' ? '#ffffff' : '#FF9800'
        };
      case 'danger':
        return {
          contained: ['#F44336', '#D32F2F'],
          outlined: '#F44336',
          text: mode === 'contained' ? '#ffffff' : '#F44336'
        };
      case 'secondary':
        return {
          contained: ['#9C27B0', '#7B1FA2'],
          outlined: '#9C27B0',
          text: mode === 'contained' ? '#ffffff' : '#9C27B0'
        };
      default:
        return {
          contained: ['#2196F3', '#1976D2'],
          outlined: '#2196F3',
          text: mode === 'contained' ? '#ffffff' : '#2196F3'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          minHeight: 32,
          paddingHorizontal: 12,
          fontSize: 12
        };
      case 'large':
        return {
          minHeight: 48,
          paddingHorizontal: 24,
          fontSize: 16
        };
      default: // medium
        return {
          minHeight: 40,
          paddingHorizontal: 16,
          fontSize: 14
        };
    }
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  if (mode === 'contained') {
    return (
      <View style={[styles.gradientContainer, style, { minHeight: sizeStyles.minHeight }]}>
        <LinearGradient
          colors={disabled ? ['#E0E0E0', '#BDBDBD'] : colors.contained}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Button
            mode="text"
            icon={icon}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            labelStyle={[
              styles.gradientButtonText, 
              { fontSize: sizeStyles.fontSize }
            ]}
            contentStyle={[
              styles.gradientButtonContent,
              { paddingHorizontal: sizeStyles.paddingHorizontal }
            ]}
            style={styles.gradientButton}
            {...props}
          >
            {children}
          </Button>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Button
      mode={mode}
      icon={icon}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      buttonColor={mode === 'outlined' ? 'transparent' : undefined}
      textColor={disabled ? '#BDBDBD' : colors.text}
      style={[
        styles.button,
        mode === 'outlined' && {
          borderColor: disabled ? '#E0E0E0' : colors.outlined,
          borderWidth: 1.5
        },
        { minHeight: sizeStyles.minHeight },
        style
      ]}
      labelStyle={[
        styles.buttonText,
        { fontSize: sizeStyles.fontSize }
      ]}
      contentStyle={[
        styles.buttonContent,
        { paddingHorizontal: sizeStyles.paddingHorizontal }
      ]}
      {...props}
    >
      {children}
    </Button>
  );
};

// Componente para grupo de botões de ação
export const ActionButtonGroup = ({ children, style, direction = 'row' }) => {
  return (
    <View style={[
      styles.buttonGroup,
      direction === 'column' ? styles.buttonGroupColumn : styles.buttonGroupRow,
      style
    ]}>
      {children}
    </View>
  );
};

// Componente para botão de ação flutuante melhorado
export const FloatingActionButton = ({ icon, label, onPress, variant = 'primary', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'success': return ['#4CAF50', '#388E3C'];
      case 'warning': return ['#FF9800', '#F57C00'];
      case 'danger': return ['#F44336', '#D32F2F'];
      default: return ['#2196F3', '#1976D2'];
    }
  };

  return (
    <View style={[styles.fabContainer, style]}>
      <LinearGradient
        colors={getColors()}
        style={styles.fabGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Button
          mode="text"
          icon={icon}
          onPress={onPress}
          labelStyle={styles.fabText}
          contentStyle={styles.fabContent}
          style={styles.fab}
        >
          {label}
        </Button>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonContent: {
    height: '100%',
  },
  gradientContainer: {
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  gradient: {
    borderRadius: 8,
    flex: 1,
  },
  gradientButton: {
    borderRadius: 8,
    backgroundColor: 'transparent',
    margin: 0,
  },
  gradientButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  gradientButtonContent: {
    height: '100%',
  },
  buttonGroup: {
    gap: 8,
  },
  buttonGroupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonGroupColumn: {
    flexDirection: 'column',
  },
  fabContainer: {
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    borderRadius: 28,
    minHeight: 56,
  },
  fab: {
    borderRadius: 28,
    backgroundColor: 'transparent',
    margin: 0,
  },
  fabText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  fabContent: {
    height: 56,
    paddingHorizontal: 16,
  },
});

export default ActionButton;