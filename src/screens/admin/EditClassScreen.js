import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Platform
} from 'react-native';
import { 
  Card, 
  Title, 
  TextInput, 
  Button, 
  Text, 
  Chip, 
  HelperText,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService, classService } from '../../services/firestoreService';

const EditClassScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { classId } = route.params;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [instructors, setInstructors] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    modality: '',
    description: '',
    maxStudents: '',
    instructorId: '',
    instructorName: '',
    schedule: '',
    price: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const modalities = [
    'Musculação',
    'CrossFit',
    'Pilates',
    'Yoga',
    'Natação',
    'Dança',
    'Artes Marciais',
    'Funcional'
  ];

  useEffect(() => {
    loadClassData();
    loadInstructors();
  }, []);

  const loadClassData = async () => {
    try {
      setLoadingData(true);
      const classData = await firestoreService.getById('classes', classId);
      
      if (classData) {
        setFormData({
          name: classData.name || '',
          modality: classData.modality || '',
          description: classData.description || '',
          maxStudents: classData.maxStudents?.toString() || '',
          instructorId: classData.instructorId || '',
          instructorName: classData.instructorName || '',
          schedule: typeof classData.schedule === 'object' 
            ? `${classData.schedule.dayOfWeek} ${classData.schedule.startTime}-${classData.schedule.endTime}`
            : classData.schedule || '',
          price: classData.price?.toString() || '',
          status: classData.status || 'active'
        });
      } else {
        Alert.alert('Erro', 'Turma não encontrada');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao carregar turma:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da turma');
    } finally {
      setLoadingData(false);
    }
  };

  const loadInstructors = async () => {
    try {
      const users = await firestoreService.getAll('users');
      const instructorsList = users.filter(user => user.userType === 'instructor');
      setInstructors(instructorsList);
    } catch (error) {
      console.error('Erro ao carregar instrutores:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da turma é obrigatório';
    }

    if (!formData.modality) {
      newErrors.modality = 'Modalidade é obrigatória';
    }

    if (!formData.maxStudents || isNaN(formData.maxStudents) || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = 'Número máximo de alunos deve ser um número positivo';
    }

    if (!formData.instructorId) {
      newErrors.instructorId = 'Instrutor é obrigatório';
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Horário é obrigatório';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Preço deve ser um número válido';
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

      const classData = {
        name: formData.name.trim(),
        modality: formData.modality,
        description: formData.description.trim(),
        maxStudents: parseInt(formData.maxStudents),
        instructorId: formData.instructorId,
        instructorName: formData.instructorName,
        schedule: formData.schedule.trim(),
        price: parseFloat(formData.price),
        status: formData.status,
        updatedAt: new Date(),
        updatedBy: user.uid
      };

      await firestoreService.update('classes', classId, classData);

      Alert.alert(
        'Sucesso',
        'Turma atualizada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a turma. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await firestoreService.delete('classes', classId);
              
              Alert.alert(
                'Sucesso',
                'Turma excluída com sucesso!',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              console.error('Erro ao excluir turma:', error);
              Alert.alert('Erro', 'Não foi possível excluir a turma.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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

  const handleInstructorChange = (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    updateFormData('instructorId', instructorId);
    updateFormData('instructorName', instructor ? instructor.name : '');
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando dados da turma...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Title style={styles.title}>Editar Turma</Title>

            {/* Nome da Turma */}
            <TextInput
              label="Nome da Turma"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            {/* Modalidade */}
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Modalidade</Text>
              <View style={styles.chipContainer}>
                {modalities.map((modality) => (
                  <Chip
                    key={modality}
                    selected={formData.modality === modality}
                    onPress={() => updateFormData('modality', modality)}
                    style={styles.chip}
                    mode={formData.modality === modality ? 'flat' : 'outlined'}
                  >
                    {modality}
                  </Chip>
                ))}
              </View>
              {errors.modality && <HelperText type="error">{errors.modality}</HelperText>}
            </View>

            {/* Descrição */}
            <TextInput
              label="Descrição (opcional)"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            {/* Máximo de Alunos */}
            <TextInput
              label="Máximo de Alunos"
              value={formData.maxStudents}
              onChangeText={(value) => updateFormData('maxStudents', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.maxStudents}
            />
            {errors.maxStudents && <HelperText type="error">{errors.maxStudents}</HelperText>}

            {/* Instrutor */}
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Instrutor</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.instructorId}
                  onValueChange={handleInstructorChange}
                  style={styles.pickerStyle}
                >
                  <Picker.Item label="Selecione um instrutor" value="" />
                  {instructors.map((instructor) => (
                    <Picker.Item
                      key={instructor.id}
                      label={instructor.name}
                      value={instructor.id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.instructorId && <HelperText type="error">{errors.instructorId}</HelperText>}
            </View>

            {/* Horário */}
            <TextInput
              label="Horário (ex: Segunda-feira 08:00-09:00)"
              value={formData.schedule}
              onChangeText={(value) => updateFormData('schedule', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.schedule}
            />
            {errors.schedule && <HelperText type="error">{errors.schedule}</HelperText>}

            {/* Preço */}
            <TextInput
              label="Preço Mensal (R$)"
              value={formData.price}
              onChangeText={(value) => updateFormData('price', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.price}
            />
            {errors.price && <HelperText type="error">{errors.price}</HelperText>}

            {/* Status */}
            <View style={styles.radioContainer}>
              <Text style={styles.label}>Status</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData('status', value)}
                value={formData.status}
              >
                <View style={styles.radioItem}>
                  <RadioButton value="active" />
                  <Text style={styles.radioLabel}>Ativa</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="inactive" />
                  <Text style={styles.radioLabel}>Inativa</Text>
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
                Salvar
              </Button>
            </View>

            {/* Botão Excluir */}
            <Button
              mode="outlined"
              onPress={handleDelete}
              style={[styles.deleteButton, { marginTop: 20 }]}
              buttonColor="#ffebee"
              textColor="#d32f2f"
              disabled={loading}
            >
              Excluir Turma
            </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  pickerStyle: {
    height: 50,
  },
  radioContainer: {
    marginBottom: 20,
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
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    borderColor: '#d32f2f',
  },
});

export default EditClassScreen;
