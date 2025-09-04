
import React from 'react';
import { Animated, Easing, Platform, Dimensions } from 'react-native';

// Configurações de animação otimizadas para web e mobile
export const AnimationConfig = {
  // Para web, usamos animações mais suaves
  timing: {
    duration: Platform.OS === 'web' ? 300 : 250,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false, // Mudado para false para compatibilidade web
  },
  spring: {
    tension: Platform.OS === 'web' ? 100 : 120,
    friction: Platform.OS === 'web' ? 8 : 7,
    useNativeDriver: false, // Mudado para false para compatibilidade web
  },
  fade: {
    duration: Platform.OS === 'web' ? 400 : 300,
    useNativeDriver: true,
  }
};

// Utilitários responsivos - definindo antes de usar
const { width, height } = Dimensions.get('window');
export const ResponsiveUtils = {
  isTablet: width >= 768,
  isMobile: width < 768,
  isSmallScreen: width < 480,
  screenWidth: width,
  screenHeight: height,
  
  // Função para obter tamanho responsivo
  scale: (size) => {
    const baseWidth = 375; // iPhone X width
    return (width / baseWidth) * size;
  },
  
  // Função para padding responsivo
  padding: (basePadding) => {
    if (width >= 768) return basePadding * 1.5; // tablet/desktop
    if (width >= 480) return basePadding * 1.2; // phone landscape
    return basePadding; // phone portrait
  },
  
  // Espaçamentos responsivos
  spacing: {
    xs: width >= 768 ? 4 : 2,
    sm: width >= 768 ? 8 : 4,
    md: width >= 768 ? 16 : 8,
    lg: width >= 768 ? 24 : 12,
    xl: width >= 768 ? 32 : 16,
  },
  
  // Tamanhos de fonte responsivos
  fontSize: {
    small: width >= 768 ? 14 : 12,
    medium: width >= 768 ? 18 : 16,
    large: width >= 768 ? 24 : 20,
    extraLarge: width >= 768 ? 32 : 28,
  },
  
  // Elevação/sombra responsiva
  elevation: Platform.OS === 'android' ? {
    elevation: width >= 768 ? 8 : 4,
  } : {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: width >= 768 ? 4 : 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: width >= 768 ? 8 : 4,
  },
  
  // Border radius responsivo
  borderRadius: {
    small: width >= 768 ? 6 : 4,
    medium: width >= 768 ? 12 : 8,
    large: width >= 768 ? 20 : 16,
    extraLarge: width >= 768 ? 32 : 24,
  },
  
  // Função para verificar se é tablet (compatibilidade)
  isTablet: () => width >= 768,
};

// Utilitários de sombra para AnimatedCard
export const ShadowUtils = {
  none: {},
  light: Platform.OS === 'android' ? {
    elevation: 2,
  } : {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  medium: Platform.OS === 'android' ? {
    elevation: 4,
  } : {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heavy: Platform.OS === 'android' ? {
    elevation: 8,
  } : {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
};

// Animações pré-definidas
export const createFadeInAnimation = (
  animatedValue, 
  duration = AnimationConfig.fade.duration
) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.quad),
    useNativeDriver: Platform.OS !== 'web',
  });
};

export const createSlideInAnimation = (
  animatedValue, 
  fromValue = 50, 
  toValue = 0,
  duration = AnimationConfig.timing.duration
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: AnimationConfig.timing.easing,
    useNativeDriver: Platform.OS !== 'web',
  });
};

export const createScaleAnimation = (
  animatedValue, 
  toValue = 1,
  duration = AnimationConfig.timing.duration
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: AnimationConfig.timing.easing,
    useNativeDriver: Platform.OS !== 'web',
  });
};

export const createSpringAnimation = (animatedValue, toValue = 1) => {
  return Animated.spring(animatedValue, {
    toValue,
    ...AnimationConfig.spring,
  });
};

// Animação de entrada para cards
export const createCardEntranceAnimation = (fadeAnim, slideAnim, scaleAnim) => {
  return Animated.parallel([
    createFadeInAnimation(fadeAnim),
    createSlideInAnimation(slideAnim),
    createScaleAnimation(scaleAnim),
  ]);
};

// Animação de pressionar botão
export const createButtonPressAnimation = (scaleAnim) => {
  return Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: Platform.OS !== 'web',
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: Platform.OS !== 'web',
    }),
  ]);
};

// Animação de shake para erros
export const createShakeAnimation = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, { toValue: -10, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
    Animated.timing(animatedValue, { toValue: 10, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
    Animated.timing(animatedValue, { toValue: -5, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
    Animated.timing(animatedValue, { toValue: 0, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
  ]);
};

// Animação de pulse
export const createPulseAnimation = (scaleAnim) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ])
  );
};

// Animação de rotação contínua
export const createRotationAnimation = (rotateAnim) => {
  return Animated.loop(
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    })
  );
};

// Função para interpolar rotação
export const interpolateRotation = (animatedValue) => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

// Hook personalizado para animações
export const useAnimation = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  const animations = {
    fadeAnim,
    slideAnim,
    scaleAnim,
  };

  const startEntryAnimation = () => {
    Animated.parallel([
      createFadeInAnimation(fadeAnim),
      createSlideInAnimation(slideAnim),
      createScaleAnimation(scaleAnim),
    ]).start();
  };

  return {
    animations,
    startEntryAnimation,
  };
};

// Configurações de animação para diferentes elementos
export const ElementAnimations = {
  card: {
    entrance: {
      opacity: { from: 0, to: 1, duration: 600 },
      scale: { from: 0.9, to: 1, duration: 600 },
      translateY: { from: 30, to: 0, duration: 600 }
    }
  },
  button: {
    press: {
      scale: { from: 1, to: 0.95, duration: 100 }
    },
    hover: {
      scale: { from: 1, to: 1.02, duration: 200 }
    }
  },
  text: {
    fadeIn: {
      opacity: { from: 0, to: 1, duration: 800 }
    }
  }
};
