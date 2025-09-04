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
  Input
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Picker } from '@react-native-picker/picker'; // Removido - dependência não disponível
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const AddStudentScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
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
    return Object.keys(newErrors).length === 0;
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

      await firestoreService.create('users', studentData);

      Alert.alert(
        'Sucesso',
        'Aluno cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o aluno. Tente novamente.');
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              label="Nome Completo"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!errors.email}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}

            <TextInput
              label="Telefone"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.phone}
            />
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

            <TextInput
              label="Data de Nascimento (DD/MM/AAAA)"
              value={formData.birthDate}
              onChangeText={(value) => updateFormData('birthDate', value)}
              mode="outlined"
              placeholder="01/01/1990"
              style={styles.input}
              error={!!errors.birthDate}
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
            />

            {/* Contato de Emergência */}
            <Text style={styles.sectionTitle}>Contato de Emergência</Text>

            <TextInput
              label="Nome do Contato"
              value={formData.emergencyContact}
              onChangeText={(value) => updateFormData('emergencyContact', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.emergencyContact}
            />
            {errors.emergencyContact && <HelperText type="error">{errors.emergencyContact}</HelperText>}

            <TextInput
              label="Telefone de Emergência"
              value={formData.emergencyPhone}
              onChangeText={(value) => updateFormData('emergencyPhone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.emergencyPhone}
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
});

export default AddStudentScreen;
