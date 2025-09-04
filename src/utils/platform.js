
import { Platform, Dimensions } from 'react-native';

// Detectar plataforma
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Utilitários de responsividade
export const ResponsiveUtils = {
  // Obter dimensões da tela
  getScreenDimensions: () => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  },

  // Verificar se é dispositivo móvel (baseado na largura)
  isMobile: () => {
    const { width } = Dimensions.get('window');
    return width < 768;
  },

  // Verificar se é tablet
  isTablet: () => {
    const { width } = Dimensions.get('window');
    return width >= 768 && width < 1024;
  },

  // Verificar se é desktop
  isDesktop: () => {
    const { width } = Dimensions.get('window');
    return width >= 1024;
  },

  // Obter breakpoint atual
  getCurrentBreakpoint: () => {
    const { width } = Dimensions.get('window');
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
};

// Configurações específicas da plataforma
export const PlatformConfig = {
  web: {
    enableGestures: false,
    headerHeight: 56,
    tabBarHeight: 50,
    statusBarHeight: 0,
  },
  ios: {
    enableGestures: true,
    headerHeight: 88,
    tabBarHeight: 83,
    statusBarHeight: 44,
  },
  android: {
    enableGestures: true,
    headerHeight: 56,
    tabBarHeight: 56,
    statusBarHeight: 24,
  }
};

// Obter configuração da plataforma atual
export const getCurrentPlatformConfig = () => {
  return PlatformConfig[Platform.OS] || PlatformConfig.web;
};

// Utilitários para APK/AAB
export const BuildUtils = {
  // Verificar se está em modo de produção
  isProduction: () => {
    return !__DEV__;
  },

  // Obter informações da build
  getBuildInfo: () => {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isProduction: !__DEV__,
      buildType: isAndroid ? 'apk' : 'ipa'
    };
  }
};

export default {
  isWeb,
  isIOS,
  isAndroid,
  ResponsiveUtils,
  PlatformConfig,
  getCurrentPlatformConfig,
  BuildUtils
};
