import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon } from 'react-native-elements';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card containerStyle={styles.card}>
            <View style={styles.content}>
              <Icon name="error-outline" type="material" size={64} color="#F44336" />
              <Text h3 style={styles.title}>Ops! Algo deu errado</Text>
              <Text style={styles.message}>
                Ocorreu um erro inesperado. Tente novamente ou reinicie o aplicativo.
              </Text>
              <Button 
                title="Tentar Novamente"
                onPress={this.handleRetry}
                buttonStyle={styles.button}
                icon={<Icon name="refresh" type="material" size={20} color="white" />}
              />
            </View>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 12,
  },
});

export default ErrorBoundary;
