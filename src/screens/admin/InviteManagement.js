import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Share } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  List, 
  Chip,
  FAB,
  Modal,
  Portal,
  Divider
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { InviteService } from '../../services/inviteService';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import ActionButton, { ActionButtonGroup } from '../../components/ActionButton';

export default function InviteManagement({ navigation }) {
  const { user, userProfile, academia } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: '',
    tipo: 'aluno'
  });

  useEffect(() => {
    if (academia?.id) {
      loadInvites();
    }
  }, [academia]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      // Usar a nova função que já filtra convites ativos (pendentes e expirados)
      const activeInvites = await InviteService.getActiveInvites(academia.id);
      setInvites(activeInvites);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      Alert.alert('Erro', 'Não foi possível carregar os convites');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!newInvite.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }

    try {
      setLoading(true);
      
      // Criar convite
      const inviteId = await InviteService.createInvite(
        academia.id,
        newInvite.email,
        newInvite.tipo,
        user.uid
      );

      // Buscar dados do convite criado para obter o token
      const inviteDoc = await InviteService.getInviteByToken(
        InviteService.generateInviteToken()
      );

      // Gerar link do convite
      const inviteLink = InviteService.generateInviteLink(inviteDoc?.inviteToken || 'token');

      // Enviar email
      const emailSent = await InviteService.sendInviteEmail(
        newInvite.email,
        academia.nome,
        inviteLink,
        userProfile.name || 'Administrador',
        newInvite.tipo
      );
      
      if (!emailSent) {
        Alert.alert('Aviso', 'Convite criado, mas houve problema no envio do email. O convite ainda é válido.');
      }

      Alert.alert(
        'Convite Enviado!',
        `Convite enviado para ${newInvite.email}`,
        [{ text: 'OK', onPress: () => {
          setShowInviteModal(false);
          setNewInvite({ email: '', tipo: 'aluno' });
          loadInvites();
        }}]
      );
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      Alert.alert('Erro', 'Não foi possível enviar o convite');
    } finally {
      setLoading(false);
    }
  };

  const shareQRCode = async () => {
    try {
      const joinLink = InviteService.generateJoinLink(academia.id);
      const message = `Junte-se à ${academia.nome}!\n\nEscaneie o QR Code ou use este link:\n${joinLink}`;
      
      await Share.share({
        message,
        title: `Convite - ${academia.nome}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const cleanupAcceptedInvites = async () => {
    try {
      setLoading(true);
      const cleanedCount = await InviteService.cleanupAcceptedInvites(academia.id);
      
      if (cleanedCount > 0) {
        Alert.alert(
          'Limpeza Concluída',
          `${cleanedCount} convite(s) aceito(s) foram removidos do mural.`,
          [{ text: 'OK', onPress: loadInvites }]
        );
      } else {
        Alert.alert('Info', 'Nenhum convite aceito encontrado para remover.');
      }
    } catch (error) {
      console.error('Erro ao limpar convites:', error);
      Alert.alert('Erro', 'Não foi possível limpar os convites aceitos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'expired': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceito';
      case 'expired': return 'Expirado';
      default: return 'Desconhecido';
    }
  };

  const renderInviteItem = (invite) => (
    <Card key={invite.id} style={styles.inviteCard}>
      <Card.Content>
        <View style={styles.inviteHeader}>
          <View style={styles.inviteInfo}>
            <Text variant="titleMedium" style={styles.inviteEmail}>
              {invite.email}
            </Text>
            <Text variant="bodySmall" style={styles.inviteType}>
              {invite.tipo === 'aluno' ? 'Aluno' : 'Instrutor'}
            </Text>
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(invite.status) }]}
            textStyle={{ color: 'white' }}
          >
            {getStatusText(invite.status)}
          </Chip>
        </View>
        
        <Text variant="bodySmall" style={styles.inviteDate}>
          Enviado em: {invite.createdAt?.toDate?.()?.toLocaleDateString() || 'Data não disponível'}
        </Text>
        
        {invite.status === 'pending' && (
          <Text variant="bodySmall" style={styles.expiryDate}>
            Expira em: {invite.expiresAt?.toDate?.()?.toLocaleDateString() || 'Data não disponível'}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Gerenciar Convites
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Convide alunos e instrutores para sua academia
            </Text>
          </Card.Content>
        </Card>

        {/* Opções de Convite */}
        <Card style={styles.optionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Formas de Convite
            </Text>
            
            <ActionButtonGroup style={styles.optionButtons}>
              <ActionButton 
                mode="contained" 
                onPress={() => setShowInviteModal(true)}
                icon="email"
                style={styles.optionButton}
                variant="primary"
                size="medium"
              >
                Convite por Email
              </ActionButton>
              
              <ActionButton 
                mode="outlined" 
                onPress={() => setShowQRModal(true)}
                icon="qrcode"
                style={styles.optionButton}
                variant="secondary"
                size="medium"
              >
                QR Code
              </ActionButton>
            </ActionButtonGroup>
          </Card.Content>
        </Card>

        {/* Lista de Convites */}
        <Card style={styles.listCard}>
          <Card.Content>
            <View style={styles.listHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Convites Enviados ({invites.length})
              </Text>
              <ActionButton
                mode="text"
                onPress={cleanupAcceptedInvites}
                loading={loading}
                icon="broom"
                size="small"
                variant="secondary"
                style={styles.cleanupButton}
              >
                Limpar Aceitos
              </ActionButton>
            </View>
            
            {invites.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                Nenhum convite enviado ainda
              </Text>
            ) : (
              invites.map(renderInviteItem)
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal de Convite por Email */}
      <Portal>
        <Modal 
          visible={showInviteModal} 
          onDismiss={() => setShowInviteModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Enviar Convite por Email
          </Text>
          
          <TextInput
            label="Email do convidado"
            value={newInvite.email}
            onChangeText={(text) => setNewInvite(prev => ({ ...prev, email: text }))}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
          />
          
          <Text variant="bodyMedium" style={styles.typeLabel}>
            Tipo de usuário:
          </Text>
          
          <ActionButtonGroup style={styles.typeButtons}>
            <ActionButton 
              mode={newInvite.tipo === 'aluno' ? 'contained' : 'outlined'}
              onPress={() => setNewInvite(prev => ({ ...prev, tipo: 'aluno' }))}
              style={styles.typeButton}
              variant="primary"
              size="small"
            >
              Aluno
            </ActionButton>
            <ActionButton 
              mode={newInvite.tipo === 'instrutor' ? 'contained' : 'outlined'}
              onPress={() => setNewInvite(prev => ({ ...prev, tipo: 'instrutor' }))}
              style={styles.typeButton}
              variant="success"
              size="small"
            >
              Instrutor
            </ActionButton>
          </ActionButtonGroup>
          
          <ActionButtonGroup style={styles.modalActions}>
            <ActionButton 
              mode="outlined" 
              onPress={() => setShowInviteModal(false)}
              style={styles.modalButton}
              variant="secondary"
            >
              Cancelar
            </ActionButton>
            <ActionButton 
              mode="contained" 
              onPress={sendInvite}
              loading={loading}
              disabled={loading}
              style={styles.modalButton}
              variant="success"
            >
              Enviar Convite
            </ActionButton>
          </ActionButtonGroup>
        </Modal>
      </Portal>

      {/* Modal de QR Code */}
      <Portal>
        <Modal 
          visible={showQRModal} 
          onDismiss={() => setShowQRModal(false)}
          contentContainerStyle={styles.qrModal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            QR Code da Academia
          </Text>
          
          <QRCodeGenerator 
            size={250} 
            showActions={false} 
            academiaId={academia?.id}
            academiaNome={academia?.nome}
          />
          
          <Text variant="bodySmall" style={styles.qrInstructions}>
            Compartilhe este QR Code para que alunos e instrutores possam se juntar à academia instantaneamente
          </Text>
          
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setShowQRModal(false)}
              style={styles.modalButton}
            >
              Fechar
            </Button>
            <Button 
              mode="contained" 
              onPress={shareQRCode}
              icon="share"
              style={styles.modalButton}
            >
              Compartilhar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  optionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  listCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cleanupButton: {
    marginLeft: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
  },
  inviteCard: {
    marginBottom: 12,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteEmail: {
    fontWeight: 'bold',
  },
  inviteType: {
    opacity: 0.7,
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 12,
  },
  inviteDate: {
    opacity: 0.6,
    marginTop: 4,
  },
  expiryDate: {
    opacity: 0.6,
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    marginVertical: 20,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  qrModal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  typeLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
  qrInstructions: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 16,
    paddingHorizontal: 20,
  },
};
