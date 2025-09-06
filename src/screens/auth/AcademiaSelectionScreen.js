import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  List, 
  Divider,
  ActivityIndicator,
  Chip,
  FAB
} from 'react-native-paper';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function AcademiaSelectionScreen({ navigation }) {
  const { user, userProfile, updateAcademiaAssociation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [academias, setAcademias] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAcademiaData, setNewAcademiaData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    plano: 'free'
  });

  useEffect(() => {
    // Se o usuário já tem academia associada, redirecionar
    if (userProfile?.academiaId) {
      navigation.replace('Main');
    }
  }, [userProfile, navigation]);

  const searchAcademiaByCode = async () => {
    if (!searchCode.trim()) {
      Alert.alert('Erro', 'Digite o código da academia');
      return;
    }

    setSearchLoading(true);
    try {
      const academiaDoc = await getDoc(doc(db, 'academias', searchCode.trim()));
      
      if (academiaDoc.exists()) {
        const academiaData = academiaDoc.data();
        setAcademias([{
          id: academiaDoc.id,
          ...academiaData
        }]);
      } else {
        Alert.alert('Academia não encontrada', 'Verifique o código e tente novamente');
        setAcademias([]);
      }
    } catch (error) {
      console.error('Erro ao buscar academia:', error);
      Alert.alert('Erro', 'Erro ao buscar academia');
    } finally {
      setSearchLoading(false);
    }
  };

  const joinAcademia = async (academiaId) => {
    setLoading(true);
    try {
      await updateAcademiaAssociation(academiaId);
      Alert.alert(
        'Sucesso!', 
        'Você foi associado à academia com sucesso!',
        [{ text: 'OK', onPress: () => navigation.replace('Main') }]
      );
    } catch (error) {
      console.error('Erro ao associar à academia:', error);
      Alert.alert('Erro', 'Erro ao associar à academia');
    } finally {
      setLoading(false);
    }
  };

  const createNewAcademia = async () => {
    // Verificar se o usuário tem permissão para criar academia
    if (userProfile?.tipo !== 'admin') {
      Alert.alert(
        'Permissão Negada', 
        'Apenas usuários com perfil de administrador podem criar uma nova academia.'
      );
      return;
    }

    if (!newAcademiaData.nome.trim()) {
      Alert.alert('Erro', 'Nome da academia é obrigatório');
      return;
    }

    setLoading(true);
    try {
      // Criar nova academia
      const academiaRef = await addDoc(collection(db, 'academias'), {
        ...newAcademiaData,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: user.uid,
        status: 'ativa'
      });

      // Associar usuário à academia
      await updateAcademiaAssociation(academiaRef.id);

      Alert.alert(
        'Academia Criada!', 
        'Sua academia foi criada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.replace('Main') }]
      );
    } catch (error) {
      console.error('Erro ao criar academia:', error);
      Alert.alert('Erro', 'Erro ao criar academia');
    } finally {
      setLoading(false);
    }
  };

  const renderAcademiaCard = (academia) => (
    <Card key={academia.id} style={styles.academiaCard}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.academiaName}>
          {academia.nome}
        </Text>
        <Text variant="bodyMedium" style={styles.academiaAddress}>
          📍 {academia.endereco}
        </Text>
        {academia.telefone && (
          <Text variant="bodySmall" style={styles.academiaContact}>
            📞 {academia.telefone}
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
        <Text variant="headlineMedium" style={styles.title}>
          Selecionar Academia
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Para continuar, você precisa se associar a uma academia
        </Text>
      </View>

      {/* Buscar Academia por Código */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Buscar Academia
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
      {userProfile?.tipo === 'admin' && (
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
                label="Endereço"
                value={newAcademiaData.endereco}
                onChangeText={(text) => setNewAcademiaData(prev => ({ ...prev, endereco: text }))}
                mode="outlined"
                style={styles.input}
                multiline
              />
              
              <TextInput
                label="Telefone"
                value={newAcademiaData.telefone}
                onChangeText={(text) => setNewAcademiaData(prev => ({ ...prev, telefone: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
              />
              
              <TextInput
                label="Email"
                value={newAcademiaData.email}
                onChangeText={(text) => setNewAcademiaData(prev => ({ ...prev, email: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
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
      {userProfile?.tipo !== 'admin' && (
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
};
