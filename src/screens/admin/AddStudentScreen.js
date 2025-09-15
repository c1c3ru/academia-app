import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Card,
  Text,
  Button,
  Title,
  TextInput,
  HelperText,
  RadioButton,
  Snackbar,
  ActivityIndicator,
  Banner
} from 'react-native-paper';
// import { Picker } from '@react-native-picker/picker'; // Removido - dependência não disponível
import { useAuth } from '../../contexts/AuthProvider';
import { firestoreService } from '../../services/firestoreService';

const AddStudentScreen = ({ navigation, route }) => {
  const { user, userProfile, academia } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Feedback states
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' // 'success', 'error', 'info'
  });
  const [showValidationBanner, setShowValidationBanner] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    goals: '',
    status: 'active',
    userType: 'student'
  });

  const [errors, setErrors] = useState({});

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Contato de emergência é obrigatório';
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Telefone de emergência é obrigatório';
    }

    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    
    if (hasErrors) {
      setShowValidationBanner(true);
      showSnackbar('Por favor, preencha todos os campos obrigatórios', 'error');
    } else {
      setShowValidationBanner(false);
    }
    
    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const studentData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate.trim(),
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        medicalConditions: formData.medicalConditions.trim(),
        goals: formData.goals.trim(),
        status: formData.status,
        userType: 'student',
        isActive: true,
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        graduations: [],
        currentGraduation: null
      };

      // Garantir associação com a academia do instrutor/admin
      studentData.academiaId = userProfile?.academiaId || academia?.id || null;
      
      console.log('✅ Criando aluno:', studentData);
      const newStudentId = await firestoreService.create('users', studentData);
      console.log('✅ Aluno criado com ID:', newStudentId);

      showSnackbar(`Aluno "${formData.name.trim()}" cadastrado com sucesso!`, 'success');
      
      // Limpar formulário após sucesso
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          birthDate: '',
          address: '',
          emergencyContact: '',
          emergencyPhone: '',
          medicalConditions: '',
          goals: '',
          status: 'active',
          userType: 'student'
        });
        setErrors({});
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao cadastrar aluno:', error);
      
      let errorMessage = 'Não foi possível cadastrar o aluno. Tente novamente.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para cadastrar alunos. Verifique suas credenciais.';
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message?.includes('email')) {
        errorMessage = 'Este email já está em uso. Tente outro email.';
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
      
      // Hide validation banner if no more errors
      const remainingErrors = Object.keys(errors).filter(key => key !== field && errors[key]);
      if (remainingErrors.length === 0) {
        setShowValidationBanner(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner de validação */}
      <Banner
        visible={showValidationBanner}
        actions={[
          {
            label: 'OK',
            onPress: () => setShowValidationBanner(false),
          },
        ]}
        icon="alert-circle"
        style={styles.validationBanner}
      >
        Preencha todos os campos obrigatórios marcados com *
      </Banner>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Cadastrando aluno...</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Novo Aluno</Title>

            {/* Dados Pessoais */}
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>

            <TextInput
              label="Nome Completo *"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!errors.email}
              left={<TextInput.Icon icon="email" />}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}

            <TextInput
              label="Telefone *"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.phone}
              left={<TextInput.Icon icon="phone" />}
            />
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

            <TextInput
              label="Data de Nascimento (DD/MM/AAAA) *"
              value={formData.birthDate}
              onChangeText={(value) => updateFormData('birthDate', value)}
              mode="outlined"
              placeholder="01/01/1990"
              style={styles.input}
              error={!!errors.birthDate}
              left={<TextInput.Icon icon="calendar" />}
            />
            {errors.birthDate && <HelperText type="error">{errors.birthDate}</HelperText>}

            <TextInput
              label="Endereço (opcional)"
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              left={<TextInput.Icon icon="home" />}
            />

            {/* Contato de Emergência */}
            <Text style={styles.sectionTitle}>Contato de Emergência</Text>

            <TextInput
              label="Nome do Contato *"
              value={formData.emergencyContact}
              onChangeText={(value) => updateFormData('emergencyContact', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.emergencyContact}
              left={<TextInput.Icon icon="account-heart" />}
            />
            {errors.emergencyContact && <HelperText type="error">{errors.emergencyContact}</HelperText>}

            <TextInput
              label="Telefone de Emergência *"
              value={formData.emergencyPhone}
              onChangeText={(value) => updateFormData('emergencyPhone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.emergencyPhone}
              left={<TextInput.Icon icon="phone-alert" />}
            />
            {errors.emergencyPhone && <HelperText type="error">{errors.emergencyPhone}</HelperText>}

            {/* Informações Médicas */}
            <Text style={styles.sectionTitle}>Informações Médicas</Text>

            <TextInput
              label="Condições Médicas (opcional)"
              value={formData.medicalConditions}
              onChangeText={(value) => updateFormData('medicalConditions', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Informe alergias, lesões, medicamentos, etc."
              style={styles.input}
              left={<TextInput.Icon icon="medical-bag" />}
            />

            <TextInput
              label="Objetivos (opcional)"
              value={formData.goals}
              onChangeText={(value) => updateFormData('goals', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              placeholder="Perda de peso, ganho de massa, condicionamento..."
              style={styles.input}
              left={<TextInput.Icon icon="target" />}
            />

            {/* Status */}
            <View style={styles.radioContainer}>
              <Text style={styles.label}>Status</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData('status', value)}
                value={formData.status}
              >
                <View style={styles.radioItem}>
                  <RadioButton value="active" />
                  <Text style={styles.radioLabel}>Ativo</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="inactive" />
                  <Text style={styles.radioLabel}>Inativo</Text>
                </View>
              </RadioButton.Group>
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Cadastrar Aluno
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Snackbar para feedback */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={snackbar.type === 'success' ? 2000 : 4000}
        style={[
          styles.snackbar,
          snackbar.type === 'success' && styles.snackbarSuccess,
          snackbar.type === 'error' && styles.snackbarError
        ]}
        action={{
          label: 'Fechar',
          onPress: hideSnackbar,
        }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  radioContainer: {
    marginBottom: 20,
    marginTop: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  validationBanner: {
    backgroundColor: '#ffebee',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
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
});

export default AddStudentScreen;
