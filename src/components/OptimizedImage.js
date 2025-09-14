import React from 'react';
import { Platform, Image } from 'react-native';

// Componente de imagem otimizado - usando Image padrão por compatibilidade
// TODO: Adicionar react-native-fast-image quando compatível com React 19
const OptimizedImage = ({ source, style, resizeMode = 'contain', ...props }) => {
  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      {...props}
    />
  );
};

export default OptimizedImage;
