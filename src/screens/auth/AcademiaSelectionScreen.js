import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Linking } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  List, 
  Divider,
  ActivityIndicator,
  Chip,
  FAB,
  Modal,
  Portal,
  Snackbar
} from 'react-native-paper';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { InviteService } from '../../services/inviteService';
import QRCodeScanner from '../../components/QRCodeScanner';
import CountryStatePicker from '../../components/CountryStatePicker';
import PhonePicker from '../../components/PhonePicker';
import ModalityPicker from '../../components/ModalityPicker';

export default function AcademiaSelectionScreen({ navigation }) {
  const { user, userProfile, updateAcademiaAssociation, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [academias, setAcademias] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAcademiaData, setNewAcademiaData] = useState({
    nome: '',
    email: '',
    plano: 'free',
    // Endereço completo
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      estadoNome: '',
      pais: 'BR',
      paisNome: 'Brasil'
    },
    // Telefone com código internacional
    telefone: {
      codigoPais: 'BR',
      numero: ''
    },
    // Modalidades oferecidas
    modalidades: []
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  
  // Estados para feedback visual
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' // 'success', 'error', 'info'
  });

  // Funções para controlar o Snackbar
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    // Se o usuário já tem academia associada, redirecionar
    if (userProfile?.academiaId) {
      navigation.replace('Main');
    }
  }, [userProfile, navigation]);

  const searchAcademiaByCode = async () => {
    if (!searchCode.trim()) {
      showSnackbar('Digite o código da academia', 'error');
      return;
    }

    setSearchLoading(true);
    try {
      // Buscar por campo 'codigo' em vez de usar como ID do documento
      const q = query(
        collection(db, 'academias'),
        where('codigo', '==', searchCode.trim().toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const academiaDoc = querySnapshot.docs[0];
        const academiaData = academiaDoc.data();
        setAcademias([{
          id: academiaDoc.id,
          ...academiaData
        }]);
        showSnackbar('Academia encontrada com sucesso!', 'success');
      } else {
        showSnackbar('Academia não encontrada. Verifique o código e tente novamente', 'error');
        setAcademias([]);
      }
    } catch (error) {
      console.error('Erro ao buscar academia:', error);
      showSnackbar('Erro ao buscar academia. Tente novamente', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const joinAcademia = async (academiaId, tipo = 'aluno') => {
    setLoading(true);
    try {
      await updateAcademiaAssociation(academiaId);
      showSnackbar('Você foi associado à academia com sucesso! Redirecionando para o dashboard...', 'success');
      setTimeout(() => {
        // Resetar a navegação para ir direto para o dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 2000);
    } catch (error) {
      console.error('Erro ao associar à academia:', error);
      showSnackbar('Erro ao associar à academia. Tente novamente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScan = async (data) => {
    try {
      const urlInfo = InviteService.parseInviteUrl(data);
      
      if (!urlInfo) {
        Alert.alert('Erro', 'QR Code inválido');
        return;
      }

      if (urlInfo.type === 'join') {
        // Link direto de associação
        await joinAcademia(urlInfo.academiaId);
      } else if (urlInfo.type === 'invite') {
        // Link de convite
        await processInviteLink(urlInfo.token);
      }
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      Alert.alert('Erro', 'Erro ao processar QR Code');
    } finally {
      setShowQRScanner(false);
    }
  };

  const processInviteLink = async (token) => {
    setLoading(true);
    try {
      const invite = await InviteService.getInviteByToken(token);
      
      if (!invite) {
        Alert.alert('Erro', 'Convite inválido ou expirado');
        return;
      }

      const result = await InviteService.acceptInvite(invite.id, user.uid);
      await joinAcademia(result.academiaId, result.tipo);
    } catch (error) {
      console.error('Erro ao processar convite:', error);
      Alert.alert('Erro', 'Erro ao processar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteLinkSubmit = async () => {
    if (!inviteLink.trim()) {
      Alert.alert('Erro', 'Digite o link do convite');
      return;
    }

    try {
      const urlInfo = InviteService.parseInviteUrl(inviteLink.trim());
      
      if (!urlInfo) {
        Alert.alert('Erro', 'Link inválido');
        return;
      }

      if (urlInfo.type === 'join') {
        await joinAcademia(urlInfo.academiaId);
      } else if (urlInfo.type === 'invite') {
        await processInviteLink(urlInfo.token);
      }
    } catch (error) {
      console.error('Erro ao processar link:', error);
      Alert.alert('Erro', 'Erro ao processar link do convite');
    } finally {
      setShowInviteLinkModal(false);
      setInviteLink('');
    }
  };

  const createNewAcademia = async () => {
    // Debug: verificar dados do usuário
    console.log('🔍 Debug - userProfile:', userProfile);
    console.log('🔍 Debug - userProfile.tipo:', userProfile?.tipo);
    console.log('🔍 Debug - userProfile.userType:', userProfile?.userType);
    
    // Verificar se o usuário tem permissão para criar academia
    // Aceitar tanto 'admin' quanto 'userType' === 'admin'
    const isAdmin = userProfile?.tipo === 'admin' || userProfile?.userType === 'admin';
    
    if (!isAdmin) {
      Alert.alert(
        'Permissão Negada', 
        `Apenas usuários com perfil de administrador podem criar uma nova academia.\n\nSeu perfil atual: ${userProfile?.tipo || userProfile?.userType || 'não definido'}`
      );
      return;
    }

    const createAcademia = async () => {
      // Validações obrigatórias
      if (!newAcademiaData.nome.trim()) {
        showSnackbar('Nome da academia é obrigatório', 'error');
        return;
      }

      if (!newAcademiaData.email.trim()) {
        showSnackbar('Email é obrigatório', 'error');
        return;
      }

      if (!newAcademiaData.endereco.cidade.trim()) {
        showSnackbar('Cidade é obrigatória', 'error');
        return;
      }

      if (!newAcademiaData.endereco.rua.trim()) {
        showSnackbar('Rua/Avenida é obrigatória', 'error');
        return;
      }

      if (!newAcademiaData.telefone.numero.trim()) {
        showSnackbar('Telefone é obrigatório', 'error');
        return;
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAcademiaData.email.trim())) {
        showSnackbar('Email inválido', 'error');
        return;
      }

      setLoading(true);
      try {
        // Gerar código único para a academia
        const codigoGerado = Math.random().toString(36).substr(2, 8).toUpperCase();
        
        // Criar nova academia no Firestore com estrutura completa
        const academiaRef = await addDoc(collection(db, 'academias'), {
          nome: newAcademiaData.nome.trim(),
          email: newAcademiaData.email.trim(),
          endereco: {
            cep: newAcademiaData.endereco.cep.trim(),
            rua: newAcademiaData.endereco.rua.trim(),
            numero: newAcademiaData.endereco.numero.trim(),
            complemento: newAcademiaData.endereco.complemento.trim(),
            bairro: newAcademiaData.endereco.bairro.trim(),
            cidade: newAcademiaData.endereco.cidade.trim(),
            estado: newAcademiaData.endereco.estado,
            estadoNome: newAcademiaData.endereco.estadoNome,
            pais: newAcademiaData.endereco.pais,
            paisNome: newAcademiaData.endereco.paisNome
          },
          telefone: {
            codigoPais: newAcademiaData.telefone.codigoPais,
            numero: newAcademiaData.telefone.numero.trim()
          },
          modalidades: newAcademiaData.modalidades,
          plano: newAcademiaData.plano,
          adminId: user.uid,
          criadoEm: new Date(),
          ativo: true,
          codigo: codigoGerado
        });
        
        // Associar usuário à academia criada
        await updateAcademiaAssociation(academiaRef.id);
        
        // Mostrar o código da academia criada
        Alert.alert(
          'Academia Criada com Sucesso! 🎉',
          `Sua academia foi criada!\n\n📋 CÓDIGO DA ACADEMIA: ${codigoGerado}\n\n⚠️ IMPORTANTE: Anote este código! Os usuários precisarão dele para se associar à sua academia.\n\nVocê será redirecionado para o dashboard em alguns segundos.`,
          [
            {
              text: 'Copiar Código',
              onPress: () => {
                // Para React Native, seria necessário usar Clipboard
                // Por enquanto, apenas mostra o código
                showSnackbar(`Código copiado: ${codigoGerado}`, 'success');
              }
            },
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            }
          ],
          { cancelable: false }
        );
      } catch (error) {
        console.error('Erro ao criar academia:', error);
        showSnackbar('Não foi possível criar a academia. Tente novamente', 'error');
      } finally {
        setLoading(false);
      }
    };

    createAcademia();
  };

  const renderAcademiaCard = (academia) => (
    <Card key={academia.id} style={styles.academiaCard}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.academiaName}>
          {academia.nome}
        </Text>
        <Text variant="bodyMedium" style={styles.academiaAddress}>
          📍 {typeof academia.endereco === 'object' 
            ? `${academia.endereco.rua}${academia.endereco.numero ? ', ' + academia.endereco.numero : ''}, ${academia.endereco.cidade} - ${academia.endereco.estadoNome || academia.endereco.estado}, ${academia.endereco.paisNome || academia.endereco.pais}`
            : academia.endereco || 'Endereço não informado'
          }
        </Text>
        {academia.telefone && (
          <Text variant="bodySmall" style={styles.academiaContact}>
            📞 {typeof academia.telefone === 'object' 
              ? `${academia.telefone.codigoPais === 'BR' ? '+55' : academia.telefone.codigoPais} ${academia.telefone.numero}`
              : academia.telefone
            }
          </Text>
        )}
        {academia.email && (
          <Text variant="bodySmall" style={styles.academiaContact}>
            ✉️ {academia.email}
          </Text>
        )}
        <View style={styles.planoContainer}>
          <Chip 
            mode="outlined" 
            style={[styles.planoChip, { backgroundColor: getPlanoColor(academia.plano) }]}
          >
            Plano {academia.plano?.toUpperCase()}
          </Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => joinAcademia(academia.id)}
          disabled={loading}
          style={styles.joinButton}
        >
          Entrar nesta Academia
        </Button>
      </Card.Actions>
    </Card>
  );

  const getPlanoColor = (plano) => {
    switch (plano) {
      case 'free': return '#e8f5e8';
      case 'premium': return '#fff3e0';
      case 'enterprise': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Processando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Button
            mode="text"
            onPress={async () => {
              try {
                console.log('🚪 Fazendo logout direto...');
                await logout();
              } catch (error) {
                console.error('Erro ao fazer logout:', error);
                showSnackbar('Erro ao sair. Tente novamente.', 'error');
              }
            }}
            icon="arrow-left"
            textColor="white"
            style={styles.backButton}
          >
            Voltar
          </Button>
          <View style={styles.headerTextContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Selecionar Academia
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Para continuar, você precisa se associar a uma academia
            </Text>
          </View>
        </View>
      </View>

      {/* Opções de Associação */}
      <Card style={styles.optionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Como você quer se associar?
          </Text>
          <Text variant="bodySmall" style={styles.sectionDescription}>
            Escolha uma das opções abaixo
          </Text>
          
          <View style={styles.optionButtons}>
            <Button 
              mode="contained" 
              onPress={() => setShowQRScanner(true)}
              icon="qrcode-scan"
              style={styles.optionButton}
            >
              Escanear QR Code
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowInviteLinkModal(true)}
              icon="link"
              style={styles.optionButton}
            >
              Link de Convite
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Buscar Academia por Código */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Buscar por Código
          </Text>
          <Text variant="bodySmall" style={styles.sectionDescription}>
            Digite o código fornecido pela academia
          </Text>
          
          <TextInput
            label="Código da Academia"
            value={searchCode}
            onChangeText={setSearchCode}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: ABC123"
          />
          
          <Button 
            mode="contained" 
            onPress={searchAcademiaByCode}
            loading={searchLoading}
            disabled={searchLoading}
            style={styles.searchButton}
          >
            Buscar Academia
          </Button>
        </Card.Content>
      </Card>

      {/* Resultados da Busca */}
      {academias.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text variant="titleMedium" style={styles.resultsTitle}>
            Academia Encontrada
          </Text>
          {academias.map(renderAcademiaCard)}
        </View>
      )}

      <Divider style={styles.divider} />

      {/* Criar Nova Academia - Apenas para Admins */}
      {(userProfile?.tipo === 'admin' || userProfile?.userType === 'admin') && (
        <Card style={styles.createCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Criar Nova Academia
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Como administrador, você pode criar sua própria academia
            </Text>

            {!showCreateForm ? (
              <Button 
                mode="outlined" 
                onPress={() => setShowCreateForm(true)}
                style={styles.showFormButton}
              >
                Criar Minha Academia
              </Button>
            ) : (
            <View style={styles.createForm}>
              <TextInput
                label="Nome da Academia *"
                value={newAcademiaData.nome}
                onChangeText={(text) => setNewAcademiaData(prev => ({ ...prev, nome: text }))}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Email *"
                value={newAcademiaData.email}
                onChangeText={(text) => setNewAcademiaData(prev => ({ ...prev, email: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
              />

              {/* Seleção de País e Estado */}
              <CountryStatePicker
                selectedCountry={newAcademiaData.endereco.pais}
                selectedState={newAcademiaData.endereco.estado}
                onCountryChange={(code, name) => 
                  setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, pais: code, paisNome: name, estado: '', estadoNome: '' }
                  }))
                }
                onStateChange={(code, name) => 
                  setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, estado: code, estadoNome: name }
                  }))
                }
              />

              {/* Campos de Endereço */}
              <View style={styles.addressRow}>
                <TextInput
                  label="CEP/Código Postal"
                  value={newAcademiaData.endereco.cep}
                  onChangeText={(text) => setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cep: text }
                  }))}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  keyboardType="numeric"
                />
                
                <TextInput
                  label="Cidade *"
                  value={newAcademiaData.endereco.cidade}
                  onChangeText={(text) => setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cidade: text }
                  }))}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              <TextInput
                label="Rua/Avenida *"
                value={newAcademiaData.endereco.rua}
                onChangeText={(text) => setNewAcademiaData(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, rua: text }
                }))}
                mode="outlined"
                style={styles.input}
              />

              <View style={styles.addressRow}>
                <TextInput
                  label="Número"
                  value={newAcademiaData.endereco.numero}
                  onChangeText={(text) => setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, numero: text }
                  }))}
                  mode="outlined"
                  style={[styles.input, styles.quarterInput]}
                  keyboardType="numeric"
                />
                
                <TextInput
                  label="Complemento"
                  value={newAcademiaData.endereco.complemento}
                  onChangeText={(text) => setNewAcademiaData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, complemento: text }
                  }))}
                  mode="outlined"
                  style={[styles.input, styles.threeQuarterInput]}
                />
              </View>

              <TextInput
                label="Bairro"
                value={newAcademiaData.endereco.bairro}
                onChangeText={(text) => setNewAcademiaData(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, bairro: text }
                }))}
                mode="outlined"
                style={styles.input}
              />

              {/* Campo de Telefone */}
              <PhonePicker
                selectedCountry={newAcademiaData.telefone.codigoPais}
                phoneNumber={newAcademiaData.telefone.numero}
                onPhoneChange={(countryCode, number) => 
                  setNewAcademiaData(prev => ({
                    ...prev,
                    telefone: { codigoPais: countryCode, numero: number }
                  }))
                }
                label="Telefone *"
                placeholder="Digite o número"
              />

              {/* Campo de Modalidades */}
              <ModalityPicker
                selectedModalities={newAcademiaData.modalidades}
                onModalitiesChange={(modalidades) => 
                  setNewAcademiaData(prev => ({
                    ...prev,
                    modalidades: modalidades
                  }))
                }
                label="Modalidades Oferecidas"
              />

              <View style={styles.buttonRow}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowCreateForm(false)}
                  style={styles.cancelButton}
                >
                  Cancelar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={createNewAcademia}
                  style={styles.createButton}
                >
                  Criar Academia
                </Button>
              </View>
            </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Mensagem para usuários não-admin */}
      {!(userProfile?.tipo === 'admin' || userProfile?.userType === 'admin') && (
        <Card style={styles.createCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Criar Nova Academia
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Apenas usuários com perfil de administrador podem criar uma nova academia.
            </Text>
            <Text variant="bodySmall" style={[styles.sectionDescription, { marginTop: 8, fontStyle: 'italic' }]}>
              Entre em contato com um administrador para obter acesso ou solicite que criem uma academia para você.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Modal QR Scanner */}
      <Portal>
        <Modal 
          visible={showQRScanner} 
          onDismiss={() => setShowQRScanner(false)}
          contentContainerStyle={styles.qrModal}
        >
          <QRCodeScanner 
            onScan={handleQRCodeScan}
            onCancel={() => setShowQRScanner(false)}
          />
        </Modal>
      </Portal>

      {/* Modal Link de Convite */}
      <Portal>
        <Modal 
          visible={showInviteLinkModal} 
          onDismiss={() => setShowInviteLinkModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Link de Convite
          </Text>
          
          <Text variant="bodyMedium" style={styles.modalDescription}>
            Cole aqui o link de convite que você recebeu
          </Text>
          
          <TextInput
            label="Link do Convite"
            value={inviteLink}
            onChangeText={setInviteLink}
            mode="outlined"
            style={styles.input}
            placeholder="https://academia-app.com/invite/..."
            multiline
          />
          
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setShowInviteLinkModal(false);
                setInviteLink('');
              }}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleInviteLinkSubmit}
              style={styles.modalButton}
            >
              Confirmar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar para feedback visual */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={4000}
        style={[
          styles.snackbar,
          snackbar.type === 'success' && styles.snackbarSuccess,
          snackbar.type === 'error' && styles.snackbarError,
          snackbar.type === 'info' && styles.snackbarInfo
        ]}
        action={{
          label: 'Fechar',
          onPress: hideSnackbar,
        }}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: '#6200ee',
  },
  headerContent: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: -16,
    top: -8,
    zIndex: 1,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  optionsCard: {
    margin: 16,
    marginBottom: 8,
  },
  searchCard: {
    margin: 16,
    marginBottom: 8,
  },
  createCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  quarterInput: {
    flex: 0.3,
    marginBottom: 0,
  },
  threeQuarterInput: {
    flex: 0.7,
    marginBottom: 0,
  },
  searchButton: {
    marginTop: 8,
  },
  showFormButton: {
    marginTop: 8,
  },
  createForm: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 0.45,
  },
  createButton: {
    flex: 0.45,
  },
  resultsContainer: {
    margin: 16,
    marginTop: 8,
  },
  resultsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  academiaCard: {
    marginBottom: 12,
  },
  academiaName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  academiaAddress: {
    marginBottom: 4,
  },
  academiaContact: {
    marginBottom: 4,
    opacity: 0.8,
  },
  planoContainer: {
    marginTop: 12,
  },
  planoChip: {
    alignSelf: 'flex-start',
  },
  joinButton: {
    marginLeft: 'auto',
  },
  divider: {
    marginVertical: 16,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  qrModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  modalDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
  snackbar: {
    marginBottom: 16,
  },
  snackbarSuccess: {
    backgroundColor: '#4caf50',
  },
  snackbarError: {
    backgroundColor: '#f44336',
  },
  snackbarInfo: {
    backgroundColor: '#2196f3',
  },
};
