import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView
} from 'react-native';
import { Card, Text, Button, TextInput, HelperText, Chip, RadioButton, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// import * as FileSystem from 'expo-file-system'; // Removido - dependência não disponível
import { useAuth } from '../../contexts/AuthProvider';
import { firestoreService, classService } from '../../services/firestoreService';

const AddClassScreen = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });
  
  // Age categories for classes
  const ageCategories = [
    { id: 'kids1', label: 'Kids 1 (4-6 anos)', value: 'kids1', minAge: 4, maxAge: 6 },
    { id: 'kids2', label: 'Kids 2 (7-9 anos)', value: 'kids2', minAge: 7, maxAge: 9 },
    { id: 'kids3', label: 'Kids 3 (10-13 anos)', value: 'kids3', minAge: 10, maxAge: 13 },
    { id: 'juvenil', label: 'Juvenil (14-17 anos)', value: 'juvenil', minAge: 14, maxAge: 17 },
    { id: 'adulto', label: 'Adulto (18+ anos)', value: 'adulto', minAge: 18, maxAge: null }
  ];

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
    status: 'active',
    ageCategory: ''
  });

  const [errors, setErrors] = useState({});

  // Utilitário: converte texto de horário em array estruturado [{ dayOfWeek, hour, minute }]
  const parseScheduleTextToArray = (text) => {
    if (!text || typeof text !== 'string') return [];
    const dayMap = {
      'domingo': 0, 'dom': 0,
      'segunda': 1, 'segunda-feira': 1, 'seg': 1,
      'terca': 2, 'terça': 2, 'terça-feira': 2, 'ter': 2,
      'quarta': 3, 'quarta-feira': 3, 'qua': 3,
      'quinta': 4, 'quinta-feira': 4, 'qui': 4,
      'sexta': 5, 'sexta-feira': 5, 'sex': 5,
      'sabado': 6, 'sábado': 6, 'sab': 6, 'sáb': 6
    };
    // Suporta múltiplos horários separados por "," ou "\n"
    const parts = text.split(/[\,\n]+/).map(p => p.trim()).filter(Boolean);
    const items = [];
    for (const part of parts) {
      // Ex: "Seg 08:00-09:00" ou "Segunda-feira 08:00"
      const m = part.match(/^(\D+?)\s+(\d{1,2}):(\d{2})/i);
      if (!m) continue;
      const dayRaw = m[1].trim().toLowerCase();
      const hour = parseInt(m[2], 10);
      const minute = parseInt(m[3], 10) || 0;
      const dayOfWeek = dayMap[dayRaw];
      if (typeof dayOfWeek === 'number' && !isNaN(hour)) {
        items.push({ dayOfWeek, hour, minute });
      }
    }
    return items;
  };

  useEffect(() => {
    loadInstructors();
    loadModalities();
    
    // Se for um instrutor, pré-selecionar ele mesmo como instrutor da turma
    if (userProfile?.userType === 'instructor' || userProfile?.tipo === 'instrutor') {
      setFormData(prev => ({
        ...prev,
        instructorId: user.uid,
        instructorName: userProfile.name || user.displayName || user.email
      }));
    }
  }, [user, userProfile]);

  const loadInstructors = async () => {
    let userInstructors = [];
    let subInstructors = [];

    // Obter ID da academia
    const academiaId = userProfile?.academiaId || academia?.id;
    if (!academiaId) {
      console.error('Academia ID não encontrado');
      return;
    }

    // 1) Buscar instrutores na subcoleção da academia
    try {
      const instructorsData = await firestoreService.getAll(`gyms/${academiaId}/instructors`);
      userInstructors = instructorsData
        .map(u => ({
          id: u.id,
          name: u.name || u.displayName || u.fullName || u.email || 'Instrutor',
          email: u.email || null,
          academiaId: u.academiaId || null
        }));
    } catch (error) {
      console.warn('Aviso: falha ao buscar instrutores em users (permissões?):', error?.message || error);
    }

    // 2) Fallback: buscar na coleção global users APENAS se não encontrou instrutores na subcoleção
    if (userInstructors.length === 0) {
      try {
        const users = await firestoreService.getAll('users');
        const globalInstructors = users
          .filter(u => (
            u?.userType === 'instructor' ||
            u?.tipo === 'instrutor' ||
            u?.tipo === 'instructor'
          ))
          .filter(u => {
            if (!userProfile?.academiaId) return true;
            return !u?.academiaId || u.academiaId === userProfile.academiaId;
          })
          .map(u => ({
            id: u.id,
            name: u.name || u.displayName || u.fullName || u.email || 'Instrutor',
            email: u.email || null,
            academiaId: u.academiaId || null
          }));
        
        userInstructors = globalInstructors;
        console.log('⚠️ Usando fallback para coleção global users:', userInstructors.length, 'instrutores');
      } catch (e) {
        console.warn('Aviso: falha ao buscar instrutores na coleção users:', e?.message || e);
      }
    }

    // 3) Mesclar e remover duplicados por id
    const map = new Map();
    [...userInstructors].forEach((inst) => {
      if (!inst?.id) return;
      if (!map.has(inst.id)) {
        map.set(inst.id, inst);
      }
    });
    const merged = Array.from(map.values()).sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

    setInstructors(merged);
  };

  const loadModalities = async () => {
    try {
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }
      
      console.log('🔍 Carregando modalidades da coleção:', `gyms/${academiaId}/modalities`);
      const list = await firestoreService.getAll(`gyms/${academiaId}/modalities`);
      console.log('📋 Modalidades brutas encontradas:', list.length);
      
      // Normalizar e remover duplicatas
      const normalized = (list || []).map((m) => ({ 
        id: m.id || m.name, 
        name: m.name 
      }));
      
      // Remover duplicatas baseado no nome da modalidade
      const uniqueModalities = normalized.filter((modality, index, self) => 
        index === self.findIndex(m => m.name === modality.name)
      );
      
      console.log('✅ Modalidades únicas após deduplicação:', uniqueModalities.length);
      console.log('📝 Lista de modalidades:', uniqueModalities.map(m => m.name));
      
      setModalities(uniqueModalities);
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da turma é obrigatório';
    }

    // Bloquear quando não houver modalidades cadastradas no sistema
    if (!modalities || modalities.length === 0) {
      newErrors.modality = 'Nenhuma modalidade cadastrada. Vá em Admin > Modalidades para cadastrar antes de continuar.';
    }

    if (!formData.modality) {
      newErrors.modality = 'Modalidade é obrigatória';
    }

    if (!formData.maxStudents || isNaN(formData.maxStudents) || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = 'Número máximo de alunos deve ser um número positivo';
    }

    if (!formData.instructorId && !formData.instructorName?.trim()) {
      newErrors.instructorId = 'Instrutor é obrigatório (selecione da lista ou informe o nome)';
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Horário é obrigatório';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Preço deve ser um número válido';
    }

    if (!formData.ageCategory) {
      newErrors.ageCategory = 'Categoria de idade é obrigatória';
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
        currentStudents: 0,
        instructorId: formData.instructorId || user.uid, // Garantir instrutor
        instructorName: formData.instructorName || userProfile?.name || user.displayName || user.email,
        // Armazenar formato estruturado e manter texto para compatibilidade
        schedule: parseScheduleTextToArray(formData.schedule.trim()),
        scheduleText: formData.schedule.trim(),
        price: parseFloat(formData.price),
        status: formData.status,
        ageCategory: formData.ageCategory,
        academiaId: userProfile?.academiaId, // Associar à academia do instrutor
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Obter ID da academia para criar na subcoleção correta
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        throw new Error('Academia ID não encontrado');
      }

      console.log('✅ Criando turma na coleção:', `gyms/${academiaId}/classes`);
      console.log('✅ Dados da turma:', classData);
      const newClassId = await firestoreService.create(`gyms/${academiaId}/classes`, classData);
      console.log('✅ Turma criada com ID:', newClassId);
      
      setSnackbar({ 
        visible: true, 
        message: `Turma "${formData.name.trim()}" criada com sucesso!`, 
        type: 'success' 
      });
      
      // Voltar após pequeno atraso para permitir ver o feedback
      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error('Erro ao criar turma:', error);
      setSnackbar({ visible: true, message: 'Erro ao criar turma. Tente novamente.', type: 'error' });
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

  const handleInstructorChange = (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    updateFormData('instructorId', instructorId);
    updateFormData('instructorName', instructor ? instructor.name : '');
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
            <Text style={styles.title}>Nova Turma</Text>

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
                {modalities.length === 0 && (
                  <Text style={{ color: '#666' }}>Nenhuma modalidade cadastrada</Text>
                )}
                {modalities.map((m) => (
                  <Chip
                    key={m.id}
                    selected={formData.modality === m.name}
                    onPress={() => updateFormData('modality', m.name)}
                    style={styles.chip}
                    mode={formData.modality === m.name ? 'flat' : 'outlined'}
                  >
                    {m.name}
                  </Chip>
                ))}
              </View>
              {errors.modality && <HelperText type="error">{errors.modality}</HelperText>}
            </View>

            {/* Categoria por Idade */}
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Categoria por Idade</Text>
              <View style={styles.chipContainer}>
                {ageCategories.map((category) => (
                  <Chip
                    key={category.id}
                    selected={formData.ageCategory === category.value}
                    onPress={() => updateFormData('ageCategory', category.value)}
                    style={styles.chip}
                    mode={formData.ageCategory === category.value ? 'flat' : 'outlined'}
                  >
                    {category.label}
                  </Chip>
                ))}
              </View>
              {errors.ageCategory && <HelperText type="error">{errors.ageCategory}</HelperText>}
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
              <View style={styles.chipContainer}>
                {instructors.length === 0 && (
                  <Text style={{ color: '#666' }}>Nenhum instrutor encontrado</Text>
                )}
                {instructors.map((instructor) => (
                  <Chip
                    key={instructor.id}
                    selected={formData.instructorId === instructor.id}
                    onPress={() => handleInstructorChange(instructor.id)}
                    style={styles.chip}
                    mode={formData.instructorId === instructor.id ? 'flat' : 'outlined'}
                  >
                    {instructor.name}
                  </Chip>
                ))}
              </View>
              {errors.instructorId && <HelperText type="error">{errors.instructorId}</HelperText>}

              {/* Entrada manual do nome do instrutor como fallback */}
              <TextInput
                label="Nome do Instrutor (manual)"
                value={formData.instructorName}
                onChangeText={(value) => updateFormData('instructorName', value)}
                mode="outlined"
                placeholder={instructors.length === 0 ? 'Ex: Cícero Silva' : 'Opcional se já selecionou acima'}
                style={styles.input}
              />
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
            {!errors.schedule && (
              <Text style={styles.helperTip}>
                Dica: você pode informar vários horários separados por vírgula. Exemplos: "Seg 08:00, Qua 19:30" ou "Terça-feira 07:15".
              </Text>
            )}

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
                disabled={loading || modalities.length === 0}
              >
                Criar Turma
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
        duration={3000}
        style={{
          backgroundColor: snackbar.type === 'success' ? '#4CAF50' : 
                          snackbar.type === 'error' ? '#F44336' : '#2196F3'
        }}
        action={{
          label: 'OK',
          onPress: () => setSnackbar((s) => ({ ...s, visible: false })),
          labelStyle: { color: 'white' }
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
  helperTip: {
    marginTop: -4,
    marginBottom: 12,
    color: '#666',
    fontSize: 12,
  },
});

export default AddClassScreen;
