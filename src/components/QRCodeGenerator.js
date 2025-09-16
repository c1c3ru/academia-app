import React, { useState } from 'react';
import { View, Share, Alert, Platform } from 'react-native';
import { Card, Text, Button, IconButton, TextInput, Dialog, Portal } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthProvider';

export default function QRCodeGenerator({ size = 200, showActions = true, academiaId, academiaNome }) {
  // Verificar se está dentro do AuthProvider antes de usar o hook
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (error) {
    console.log('QRCodeGenerator usado fora do AuthProvider, usando apenas props');
  }
  
  const [qrValue, setQrValue] = useState('');
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  const [sharingQR, setSharingQR] = useState(false);

  // Usar dados passados como props ou do contexto (se disponível)
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

  // Função utilitária para mostrar notificações
  const showNotification = (message, type = 'success') => {
    if (Platform.OS === 'web') {
      // Adicionar animações CSS se não existirem
      if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      const notification = document.createElement('div');
      notification.innerHTML = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, type === 'success' ? 3000 : 4000);
    } else {
      Alert.alert(type === 'success' ? 'Sucesso' : 'Erro', message);
    }
  };

  const shareQRCode = async () => {
    setSharingQR(true);
    try {
      const message = `Junte-se à ${finalAcademiaNome}!\n\nEscaneie o QR Code ou use este link:\nhttps://academia-app.com/join/${finalAcademiaId}`;
      
      await Share.share({
        message,
        title: `Convite - ${finalAcademiaNome}`,
      });
      
      showNotification('✅ Convite compartilhado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      showNotification('❌ Erro ao compartilhar convite', 'error');
    } finally {
      setSharingQR(false);
    }
  };

  const copyInviteLink = async () => {
    setCopyingLink(true);
    try {
      const inviteUrl = `https://academia-app.com/join/${finalAcademiaId}`;
      // Para React Native Web, usar navigator.clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
      }
      showNotification('✅ Link de convite copiado!', 'success');
    } catch (error) {
      showNotification('❌ Não foi possível copiar o link', 'error');
    } finally {
      setCopyingLink(false);
    }
  };

  const sendEmailInvite = async () => {
    if (!recipientEmail.trim()) {
      showNotification('❌ Por favor, digite um email válido', 'error');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      showNotification('❌ Formato de email inválido', 'error');
      return;
    }

    setSendingEmail(true);
    try {
      const inviteUrl = `https://academia-app.com/join/${finalAcademiaId}`;
      const subject = `Convite para ${finalAcademiaNome}`;
      const body = `Olá!

Você foi convidado(a) para se juntar à academia ${finalAcademiaNome}.

Para aceitar o convite, clique no link abaixo ou escaneie o QR Code:
${inviteUrl}

Bem-vindo(a) à nossa comunidade!

---
Academia App`;

      // Para web, usar mailto
      if (Platform.OS === 'web') {
        const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, '_blank');
        showNotification('✅ Cliente de email aberto! Complete o envio.', 'success');
      } else {
        // Para mobile, usar Linking
        const { Linking } = require('react-native');
        const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        await Linking.openURL(mailtoUrl);
        showNotification('✅ Cliente de email aberto!', 'success');
      }

      setEmailDialogVisible(false);
      setRecipientEmail('');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      showNotification('❌ Erro ao abrir cliente de email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!finalAcademiaId || !qrValue) {
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
          {finalAcademiaNome}
        </Text>

        <Text variant="bodySmall" style={styles.academyCode}>
          Código da Academia: {finalAcademiaId}
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
              icon={sharingQR ? "loading" : "share"}
              style={styles.actionButton}
              loading={sharingQR}
              disabled={sharingQR}
            >
              {sharingQR ? 'Compartilhando...' : 'Compartilhar'}
            </Button>
            
            <Button 
              mode="contained" 
              onPress={copyInviteLink}
              icon={copyingLink ? "loading" : "content-copy"}
              style={styles.actionButton}
              loading={copyingLink}
              disabled={copyingLink}
            >
              {copyingLink ? 'Copiando...' : 'Copiar Link'}
            </Button>

            <Button 
              mode="outlined" 
              onPress={() => setEmailDialogVisible(true)}
              icon="email"
              style={styles.actionButton}
            >
              Enviar Email
            </Button>
          </View>
        )}

        <Portal>
          <Dialog visible={emailDialogVisible} onDismiss={() => setEmailDialogVisible(false)}>
            <Dialog.Title>Enviar Convite por Email</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                Digite o email da pessoa que você deseja convidar para a academia:
              </Text>
              <TextInput
                label="Email do destinatário"
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="exemplo@email.com"
                left={<TextInput.Icon icon="email" />}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setEmailDialogVisible(false)}>
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={sendEmailInvite}
                loading={sendingEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  academyCode: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  actionButton: {
    minWidth: 120,
    marginBottom: 8,
  },
};
