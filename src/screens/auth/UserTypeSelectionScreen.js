import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Avatar,
  Icon
} from 'react-native-elements';
import { useAuth } from '../../contexts/AuthContext';

const UserTypeSelectionScreen = ({ navigation, route }) => {
  const { user, updateUserProfile } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const userTypes = [
    {
      id: 'student',
      tipo: 'aluno',
      title: 'Aluno',
      description: 'Sou um praticante que quer treinar e acompanhar meu progresso',
      icon: 'school',
      color: '#2196F3',
      features: [
        'Acompanhar treinos e frequência',
        'Ver evolução e graduações',
        'Receber notificações de aulas',
        'Gerenciar pagamentos'
      ]
    },
    {
      id: 'instructor',
      tipo: 'instrutor',
      title: 'Instrutor',
      description: 'Sou um instrutor que ministra aulas e acompanha alunos',
      icon: 'fitness-center',
      color: '#FF9800',
      features: [
        'Gerenciar turmas e horários',
        'Acompanhar progresso dos alunos',
        'Aplicar graduações',
        'Enviar notificações'
      ]
    },
    {
      id: 'admin',
      tipo: 'administrador',
      title: 'Administrador',
      description: 'Sou responsável pela gestão completa da academia',
      icon: 'business',
      color: '#4CAF50',
      features: [
        'Gestão completa da academia',
        'Gerenciar instrutores e alunos',
        'Controle financeiro',
        'Relatórios e estatísticas'
      ]
    }
  ];

  const handleSelectType = async () => {
    if (!selectedType) {
      Alert.alert('Seleção Obrigatória', 'Por favor, selecione o tipo de usuário.');
      return;
    }

    setLoading(true);
    try {
      const selectedUserType = userTypes.find(type => type.id === selectedType);
      
      await updateUserProfile({
        tipo: selectedUserType.tipo,
        userType: selectedUserType.id,
        profileCompleted: true,
        updatedAt: new Date()
      });

      // Navegar para seleção de academia
      navigation.replace('AcademiaSelection');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o tipo de usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeCard = (userType) => (
    <Card
      key={userType.id}
      containerStyle={[
        styles.typeCard,
        selectedType === userType.id && { 
          borderColor: userType.color, 
          borderWidth: 3,
          backgroundColor: `${userType.color}10`
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: userType.color }]}>
          <Icon
            name={userType.icon}
            type="material"
            color="white"
            size={32}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.typeTitle}>{userType.title}</Text>
          <Text style={styles.typeDescription}>{userType.description}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {userType.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Icon
              name="check-circle"
              type="material"
              color={userType.color}
              size={16}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Button
        title={selectedType === userType.id ? "Selecionado" : "Selecionar"}
        buttonStyle={[
          styles.selectButton,
          selectedType === userType.id 
            ? { backgroundColor: userType.color }
            : { backgroundColor: '#E0E0E0' }
        ]}
        titleStyle={[
          styles.selectButtonText,
          selectedType === userType.id 
            ? { color: 'white' }
            : { color: '#666' }
        ]}
        onPress={() => setSelectedType(userType.id)}
      />
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          rounded
          size="large"
          source={user?.photoURL ? { uri: user.photoURL } : null}
          title={user?.displayName?.charAt(0) || user?.email?.charAt(0)}
          containerStyle={styles.avatar}
        />
        <Text style={styles.welcomeText}>
          Olá, {user?.displayName || user?.email}!
        </Text>
        <Text style={styles.subtitle}>
          Para continuar, selecione como você vai usar o app:
        </Text>
      </View>

      <View style={styles.typesContainer}>
        {userTypes.map(renderUserTypeCard)}
      </View>

      <View style={styles.footer}>
        <Button
          title="Continuar"
          buttonStyle={[
            styles.continueButton,
            !selectedType && styles.continueButtonDisabled
          ]}
          titleStyle={styles.continueButtonText}
          onPress={handleSelectType}
          loading={loading}
          disabled={!selectedType || loading}
        />
        
        <Text style={styles.footerNote}>
          Você poderá alterar essas configurações depois nas configurações do app.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  avatar: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  typesContainer: {
    paddingHorizontal: 16,
  },
  typeCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  selectButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UserTypeSelectionScreen;
