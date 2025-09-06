import React, { useState } from 'react';
import { View, Share, Alert } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';

export default function QRCodeGenerator({ size = 200, showActions = true, academiaId, academiaNome }) {
  const authContext = useAuth();
  const [qrValue, setQrValue] = useState('');

  // Usar dados passados como props ou do contexto
  const academia = authContext?.academia;
  const finalAcademiaId = academiaId || academia?.id;
  const finalAcademiaNome = academiaNome || academia?.nome;

  React.useEffect(() => {
    if (finalAcademiaId) {
      // Criar URL de convite que será escaneada
      const inviteUrl = `https://academia-app.com/join/${finalAcademiaId}`;
      setQrValue(inviteUrl);
    }
  }, [finalAcademiaId]);

  const shareQRCode = async () => {
    try {
      const message = `Junte-se à ${finalAcademiaNome}!\n\nEscaneie o QR Code ou use este link:\nhttps://academia-app.com/join/${finalAcademiaId}`;
      
      await Share.share({
        message,
        title: `Convite - ${finalAcademiaNome}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const copyInviteLink = async () => {
    try {
      const inviteUrl = `https://academia-app.com/join/${finalAcademiaId}`;
      // Para React Native Web, usar navigator.clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
      }
      Alert.alert('Sucesso', 'Link de convite copiado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar o link');
    }
  };

  if (!academia || !qrValue) {
    return (
      <Card style={styles.container}>
        <Card.Content style={styles.content}>
          <Text variant="bodyMedium">Carregando QR Code...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          QR Code da Academia
        </Text>
        
        <Text variant="bodySmall" style={styles.subtitle}>
          {academia.nome}
        </Text>

        <View style={styles.qrContainer}>
          <QRCode
            value={qrValue}
            size={size}
            backgroundColor="white"
            color="black"
            logo={require('../../assets/icon.png')}
            logoSize={size * 0.15}
            logoBackgroundColor="white"
            logoMargin={2}
            logoBorderRadius={8}
          />
        </View>

        <Text variant="bodySmall" style={styles.instructions}>
          Alunos e instrutores podem escanear este código para se juntar à academia
        </Text>

        {showActions && (
          <View style={styles.actions}>
            <Button 
              mode="outlined" 
              onPress={shareQRCode}
              icon="share"
              style={styles.actionButton}
            >
              Compartilhar
            </Button>
            
            <Button 
              mode="contained" 
              onPress={copyInviteLink}
              icon="content-copy"
              style={styles.actionButton}
            >
              Copiar Link
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = {
  container: {
    margin: 16,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructions: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    maxWidth: 150,
  },
};
