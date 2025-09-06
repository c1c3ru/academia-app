import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function QRCodeScanner({ onScan, onCancel }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    
    try {
      // Chamar callback com os dados escaneados
      onScan?.(data);
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      Alert.alert(
        'Erro',
        'Não foi possível processar o QR Code',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <Card style={styles.container}>
        <Card.Content style={styles.content}>
          <Text variant="bodyMedium">Solicitando permissão da câmera...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card style={styles.container}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium" style={styles.errorTitle}>
            Permissão da Câmera Negada
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            Para escanear QR Codes, é necessário permitir o acesso à câmera.
          </Text>
          <Button 
            mode="outlined" 
            onPress={onCancel}
            style={styles.cancelButton}
          >
            Voltar
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Escanear QR Code
        </Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          Aponte a câmera para o QR Code da academia
        </Text>
      </View>

      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.actions}>
        {scanned && (
          <Button 
            mode="outlined" 
            onPress={() => setScanned(false)}
            style={styles.actionButton}
          >
            Escanear Novamente
          </Button>
        )}
        
        <Button 
          mode="contained" 
          onPress={onCancel}
          style={styles.actionButton}
        >
          Cancelar
        </Button>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 16,
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#6200ee',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  actions: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    maxWidth: 150,
  },
};
