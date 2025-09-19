import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView
} from 'react-native';
import {
  Button,
  TextInput,
  Card,
  Portal,
  Dialog,
  Snackbar,
  IconButton,
  Chip,
  Surface,
  Divider,
  RadioButton
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import academyCollectionsService from '../../services/academyCollectionsService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AddGraduationScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();

  const [formData, setFormData] = useState({
    graduation: '',
    modality: '',
    modalityId: '',
    date: new Date(),
    instructor: '',
    instructorId: '',
    notes: '',
    certificate: '',
    previousGraduation: ''
  });

  const [modalities, setModalities] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [graduationLevels, setGraduationLevels] = useState([]);
  const [modalityDialogVisible, setModalityDialogVisible] = useState(false);
  const [graduationDialogVisible, setGraduationDialogVisible] = useState(false);
  const [instructorDialogVisible, setInstructorDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const defaultGraduationLevels = [
    { id: 'white', name: 'Faixa Branca', color: '#FFFFFF', order: 1 },
    { id: 'yellow', name: 'Faixa Amarela', color: '#FFEB3B', order: 2 },
    { id: 'orange', name: 'Faixa Laranja', color: '#FF9800', order: 3 },
    { id: 'green', name: 'Faixa Verde', color: '#4CAF50', order: 4 },
    { id: 'blue', name: 'Faixa Azul', color: '#2196F3', order: 5 },
    { id: 'purple', name: 'Faixa Roxa', color: '#9C27B0', order: 6 },
    { id: 'brown', name: 'Faixa Marrom', color: '#795548', order: 7 },
    { id: 'black-1', name: 'Faixa Preta 1º Dan', color: '#000000', order: 8 },
    { id: 'black-2', name: 'Faixa Preta 2º Dan', color: '#000000', order: 9 },
    { id: 'black-3', name: 'Faixa Preta 3º Dan', color: '#000000', order: 10 },
    { id: 'black-4', name: 'Faixa Preta 4º Dan', color: '#000000', order: 11 },
    { id: 'black-5', name: 'Faixa Preta 5º Dan', color: '#000000', order: 12 },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }

      const modalitiesData = await academyCollectionsService.getModalities(academiaId);
      setModalities(modalitiesData || []);

      // Carregar instrutores da academia
      const instructorsData = await academyCollectionsService.getCollection(academiaId, 'instructors');
      setInstructors(instructorsData || []);

      setGraduationLevels(defaultGraduationLevels);

      try {
        const studentData = await academyCollectionsService.getCollection(academiaId, 'students');
        const student = studentData.find(user => user.id === studentId);
        if (student?.currentGraduation) {
          setFormData(prev => ({
            ...prev,
            previousGraduation: student.currentGraduation
          }));
        }
      } catch (error) {
        console.warn('Não foi possível carregar dados do aluno:', error.message);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários');
    }
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const validateForm = () => {
    if (!formData.graduation) {
      showSnackbar('Por favor, selecione uma graduação', 'error');
      return false;
    }
    if (!formData.modality) {
      showSnackbar('Por favor, selecione uma modalidade', 'error');
      return false;
    }
    if (!formData.instructor || !formData.instructorId) {
      showSnackbar('Por favor, selecione um instrutor responsável', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        showSnackbar('Academia não encontrada. Faça login novamente.', 'error');
        return;
      }

      const graduationData = {
        ...formData,
        studentId,
        studentName,
        createdAt: new Date(),
        createdBy: user.uid,
        status: 'active'
      };

      // Salvar graduação usando academyCollectionsService
      await academyCollectionsService.createDocument(academiaId, 'graduations', graduationData);

      // Atualizar perfil do aluno
      await academyCollectionsService.updateDocument(academiaId, 'students', studentId, {
        currentGraduation: formData.graduation,
        lastGraduationDate: formData.date,
        updatedAt: new Date()
      });

      showSnackbar('Graduação adicionada com sucesso!', 'success');

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar graduação:', error);
      let errorMessage = 'Não foi possível salvar a graduação. Tente novamente.';

      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para adicionar graduações. Contate o administrador.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectModality = (modality) => {
    setFormData(prev => ({
      ...prev,
      modality: modality.name,
      modalityId: modality.id,
      graduation: ''
    }));

    if (modality.graduationLevels && modality.graduationLevels.length > 0) {
      setGraduationLevels(modality.graduationLevels);
    } else {
      setGraduationLevels(defaultGraduationLevels);
    }

    setModalityDialogVisible(false);
  };

  const selectGraduation = (graduation) => {
    setFormData(prev => ({
      ...prev,
      graduation: graduation.name || graduation,
      graduationId: graduation.id || graduation
    }));
    setGraduationDialogVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#1976D2', '#1565C0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Nova Graduação</Text>
            <Text style={styles.headerSubtitle}>{studentName}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Card de graduação atual */}
        {formData.previousGraduation && (
          <Surface style={styles.currentGraduationCard} elevation={2}>
            <View style={styles.currentGraduationContent}>
              <IconButton icon="medal" size={24} iconColor="#FF9800" />
              <View style={styles.currentGraduationText}>
                <Text style={styles.currentGraduationLabel}>Graduação Atual</Text>
                <Text style={styles.currentGraduationValue}>{formData.previousGraduation}</Text>
              </View>
            </View>
          </Surface>
        )}

        {/* Seção de seleções */}
        <Card style={styles.selectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Informações da Graduação</Text>

            {/* Modalidade */}
            <View style={styles.selectionItem}>
              <Text style={styles.selectionLabel}>Modalidade *</Text>
              <TouchableOpacity
                style={[styles.selectionButton, formData.modality && styles.selectionButtonSelected]}
                onPress={() => setModalityDialogVisible(true)}
              >
                <View style={styles.selectionButtonContent}>
                  <IconButton
                    icon={formData.modality ? "karate" : "plus"}
                    size={20}
                    iconColor={formData.modality ? "#1976D2" : "#666"}
                  />
                  <Text style={[styles.selectionButtonText, formData.modality && styles.selectionButtonTextSelected]}>
                    {formData.modality || 'Selecionar Modalidade'}
                  </Text>
                  <IconButton icon="chevron-right" size={16} iconColor="#999" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Instrutor */}
            <View style={styles.selectionItem}>
              <Text style={styles.selectionLabel}>Instrutor Responsável *</Text>
              <TouchableOpacity
                style={[styles.selectionButton, formData.instructor && styles.selectionButtonSelected]}
                onPress={() => setInstructorDialogVisible(true)}
              >
                <View style={styles.selectionButtonContent}>
                  <IconButton
                    icon={formData.instructor ? "account-check" : "plus"}
                    size={20}
                    iconColor={formData.instructor ? "#1976D2" : "#666"}
                  />
                  <Text style={[styles.selectionButtonText, formData.instructor && styles.selectionButtonTextSelected]}>
                    {formData.instructor || 'Selecionar Instrutor'}
                  </Text>
                  <IconButton icon="chevron-right" size={16} iconColor="#999" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Nova Graduação */}
            <View style={styles.selectionItem}>
              <Text style={styles.selectionLabel}>Nova Graduação *</Text>
              <TouchableOpacity
                style={[
                  styles.selectionButton,
                  formData.graduation && styles.selectionButtonSelected,
                  !formData.modalityId && styles.selectionButtonDisabled
                ]}
                onPress={() => setGraduationDialogVisible(true)}
                disabled={!formData.modalityId}
              >
                <View style={styles.selectionButtonContent}>
                  <IconButton
                    icon={formData.graduation ? "trophy" : "plus"}
                    size={20}
                    iconColor={formData.graduation ? "#1976D2" : "#666"}
                  />
                  <Text style={[
                    styles.selectionButtonText,
                    formData.graduation && styles.selectionButtonTextSelected,
                    !formData.modalityId && styles.selectionButtonTextDisabled
                  ]}>
                    {formData.graduation || 'Selecionar Graduação'}
                  </Text>
                  <IconButton icon="chevron-right" size={16} iconColor="#999" />
                </View>
              </TouchableOpacity>
              {!formData.modalityId && (
                <Text style={styles.helperText}>Selecione uma modalidade primeiro</Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Data e observações */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Detalhes Adicionais</Text>
            
            {/* Data */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data da Graduação *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconButton icon="calendar" size={20} iconColor="#1976D2" />
                <Text style={styles.dateButtonText}>
                  {formData.date ? formData.date.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Selecionar data'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Observações */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observações</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Adicione observações sobre a graduação..."
                style={styles.notesInput}
                outlineColor="#E0E0E0"
                activeOutlineColor="#1976D2"
              />
            </View>

            {/* Certificado */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número do Certificado (Opcional)</Text>
              <TextInput
                mode="outlined"
                value={formData.certificate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, certificate: text }))}
                placeholder="Ex: CERT-2024-001"
                style={styles.certificateInput}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF9800"
                left={<TextInput.Icon icon="certificate" />}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Botões de ação */}
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonLabel}
          >
            {loading ? 'Salvando...' : 'Salvar Graduação'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
            contentStyle={styles.cancelButtonContent}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, date: selectedDate }));
            }
          }}
        />
      )}

      <Portal>
        <Dialog visible={modalityDialogVisible} onDismiss={() => setModalityDialogVisible(false)}>
          <View style={styles.dialogTitleContainer}>
            <Text style={styles.dialogTitle}>Selecionar Modalidade</Text>
          </View>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              {modalities.map((modality) => (
                <View key={modality.id}>
                  <RadioButton.Item
                    label={modality.name}
                    value={modality.id}
                    status={formData.modalityId === modality.id ? 'checked' : 'unchecked'}
                    onPress={() => selectModality(modality)}
                  />
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalityDialogVisible(false)}>
              Cancelar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={graduationDialogVisible} onDismiss={() => setGraduationDialogVisible(false)}>
          <Dialog.Title>Selecionar Graduação</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              {graduationLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={styles.dialogItem}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      graduation: level.name
                    }));
                    setGraduationDialogVisible(false);
                  }}
                >
                  <View style={styles.graduationItem}>
                    <View style={[styles.colorIndicator, { backgroundColor: level.color }]} />
                    <Text style={styles.dialogItemText}>{level.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGraduationDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={instructorDialogVisible} onDismiss={() => setInstructorDialogVisible(false)}>
          <Dialog.Title>Selecionar Instrutor</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              {instructors.map((instructor, index) => (
                <TouchableOpacity
                  key={instructor.id || `instructor-${index}`}
                  style={styles.dialogItem}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      instructor: instructor.name || instructor.displayName || instructor.email || 'Instrutor',
                      instructorId: instructor.id
                    }));
                    setInstructorDialogVisible(false);
                  }}
                >
                  <Text style={styles.dialogItemText}>
                    {instructor.name || instructor.displayName || instructor.email || 'Instrutor sem nome'}
                  </Text>
                </TouchableOpacity>
              ))}
              {instructors.length === 0 && (
                <Text style={styles.emptyText}>Nenhum instrutor encontrado</Text>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInstructorDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={snackbarType === 'success' ? 2000 : 4000}
        style={{
          backgroundColor: snackbarType === 'success' ? '#4CAF50' : '#F44336'
        }}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: 'white' }}>{snackbarMessage}</Text>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  currentGraduationCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  currentGraduationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  currentGraduationText: {
    flex: 1,
    marginLeft: 8,
  },
  currentGraduationLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  currentGraduationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  selectionCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  selectionItem: {
    marginBottom: 16,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  selectionButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectionButtonSelected: {
    borderColor: '#1976D2',
    backgroundColor: '#F3F8FF',
  },
  selectionButtonDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  selectionButtonTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  selectionButtonTextDisabled: {
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  detailsCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  notesInput: {
    backgroundColor: 'white',
  },
  certificateCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificateInput: {
    backgroundColor: 'white',
  },
  actionContainer: {
    marginTop: 8,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
  },
  submitButtonContent: {
    height: 48,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderColor: '#999',
    borderRadius: 8,
  },
  cancelButtonContent: {
    height: 48,
  },
  cancelButtonLabel: {
    fontSize: 16,
    color: '#666',
  },
  dialogTitleContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dialogContent: {
    maxHeight: 300,
  },
  dialogItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dialogItemText: {
    fontSize: 16,
    color: '#333',
  },
  graduationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  scrollView: { flex: 1 },
  headerCard: { margin: 16, marginBottom: 8, elevation: 4 },
  card: { margin: 16, marginTop: 8, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: 16, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, marginBottom: 16, color: '#333' },
  previousGraduation: { marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  chipContainer: { alignSelf: 'flex-start', backgroundColor: '#E8F5E8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ddd' },
  chipText: { fontSize: 14, color: '#333' },
  inputGroup: { marginBottom: 16 },
  selectButton: { justifyContent: 'flex-start', borderColor: '#ddd' },
  selectButtonContent: { justifyContent: 'flex-start', paddingVertical: 8 },
  input: { marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', margin: 16, gap: 12 },
  button: { flex: 1 },
  submitButton: { backgroundColor: '#4CAF50' },
  dialogScroll: { maxHeight: 300 },
  dialogTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
});

export default AddGraduationScreen;
