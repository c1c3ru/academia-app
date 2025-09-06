import React, { useState } from 'react';
import { View, Alert, TextInput } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

export default function QRCodeScanner({ onScan, onCancel }) {
  const [manualCode, setManualCode] = useState('');

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert('Erro', 'Digite um código válido');
      return;
    }
    
    try {
      // Simular dados do QR Code - formato esperado: https://academia-app.com/join/{academiaId}
      const qrData = manualCode.includes('academia-app.com') 
        ? manualCode 
        : `https://academia-app.com/join/${manualCode.trim()}`;
      
      onScan?.(qrData);
    } catch (error) {
      console.error('Erro ao processar código:', error);
      Alert.alert('Erro', 'Não foi possível processar o código');
    }
  };

  return (
    <Card style={styles.container}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          Scanner QR Code Temporariamente Indisponível
        </Text>
        
        <Text variant="bodyMedium" style={styles.description}>
          Digite manualmente o código da academia ou o link completo:
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Código da academia ou link completo"
          value={manualCode}
          onChangeText={setManualCode}
          multiline
        />
        
        <View style={styles.actions}>
          <Button 
            mode="outlined" 
            onPress={onCancel}
            style={styles.actionButton}
          >
            Cancelar
          </Button>
          
          <Button 
            mode="contained" 
            onPress={handleManualSubmit}
            style={styles.actionButton}
            disabled={!manualCode.trim()}
          >
            Confirmar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = {
  container: {
    margin: 20,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#d32f2f',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 50,
    width: '100%',
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
};
