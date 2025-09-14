import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

// Componente de loading para telas lazy
const LazyLoadingFallback = ({ message = 'Carregando...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.text}>{message}</Text>
  </View>
);

// HOC para criar telas lazy com fallback
const withLazyLoading = (Component, loadingMessage) => {
  return React.forwardRef((props, ref) => (
    <Suspense fallback={<LazyLoadingFallback message={loadingMessage} />}>
      <Component {...props} ref={ref} />
    </Suspense>
  ));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export { LazyLoadingFallback, withLazyLoading };
export default LazyLoadingFallback;
