import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  TextInput, 
  HelperText,
  Snackbar,
  Chip,
  Divider,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const PhysicalEvaluationScreen = ({ navigation, route }) => {
  const { user, academia } = useAuth();
  const { evaluation, isEditing = false } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });
  
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    bodyFat: '',
    muscleMass: '',
    boneMass: '',
    viscFat: '',
    basalMetabolism: '',
    bodyWater: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [calculatedIMC, setCalculatedIMC] = useState(null);
  const [imcClassification, setImcClassification] = useState('');

  useEffect(() => {
    if (isEditing && evaluation) {
      setFormData({
        weight: evaluation.weight?.toString() || '',
        height: evaluation.height?.toString() || '',
        age: evaluation.age?.toString() || '',
        bodyFat: evaluation.bodyFat?.toString() || '',
        muscleMass: evaluation.muscleMass?.toString() || '',
        boneMass: evaluation.boneMass?.toString() || '',
        viscFat: evaluation.viscFat?.toString() || '',
        basalMetabolism: evaluation.basalMetabolism?.toString() || '',
        bodyWater: evaluation.bodyWater?.toString() || '',
        notes: evaluation.notes || ''
      });
    }
  }, [isEditing, evaluation]);

  useEffect(() => {
    calculateIMC();
  }, [formData.weight, formData.height]);

  const calculateIMC = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    
    if (weight > 0 && height > 0) {
      // Assumir altura em centímetros, converter para metros
      const heightInMeters = height > 3 ? height / 100 : height;
      const imc = weight / (heightInMeters * heightInMeters);
      
      setCalculatedIMC(imc.toFixed(2));
      setImcClassification(getIMCClassification(imc));
    } else {
      setCalculatedIMC(null);
      setImcClassification('');
    }
  };

  const getIMCClassification = (imc) => {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade grau I';
    if (imc < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  };

  const getIMCColor = (classification) => {
    switch (classification) {
      case 'Abaixo do peso': return '#FF9800';
      case 'Peso normal': return '#4CAF50';
      case 'Sobrepeso': return '#FF9800';
      case 'Obesidade grau I': return '#FF5722';
      case 'Obesidade grau II': return '#F44336';
      case 'Obesidade grau III': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.weight.trim()) {
      newErrors.weight = 'Peso é obrigatório';
    } else if (isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Peso deve ser um número válido maior que 0';
    }

    if (!formData.height.trim()) {
      newErrors.height = 'Altura é obrigatória';
    } else if (isNaN(formData.height) || parseFloat(formData.height) <= 0) {
      newErrors.height = 'Altura deve ser um número válido maior que 0';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Idade é obrigatória';
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0 || parseInt(formData.age) > 120) {
      newErrors.age = 'Idade deve ser um número válido entre 1 e 120';
    }

    // Validações opcionais para bioimpedância
    if (formData.bodyFat && (isNaN(formData.bodyFat) || parseFloat(formData.bodyFat) < 0 || parseFloat(formData.bodyFat) > 100)) {
      newErrors.bodyFat = 'Percentual de gordura deve estar entre 0 e 100';
    }

    if (formData.muscleMass && (isNaN(formData.muscleMass) || parseFloat(formData.muscleMass) <= 0)) {
      newErrors.muscleMass = 'Massa muscular deve ser um número válido maior que 0';
    }

    if (formData.bodyWater && (isNaN(formData.bodyWater) || parseFloat(formData.bodyWater) < 0 || parseFloat(formData.bodyWater) > 100)) {
      newErrors.bodyWater = 'Percentual de água deve estar entre 0 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const evaluationData = {
        userId: user.uid,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : null,
        boneMass: formData.boneMass ? parseFloat(formData.boneMass) : null,
        viscFat: formData.viscFat ? parseFloat(formData.viscFat) : null,
        basalMetabolism: formData.basalMetabolism ? parseFloat(formData.basalMetabolism) : null,
        bodyWater: formData.bodyWater ? parseFloat(formData.bodyWater) : null,
        notes: formData.notes.trim(),
        imc: parseFloat(calculatedIMC),
        imcClassification,
        date: new Date(),
        createdBy: user.uid,
        updatedAt: new Date()
      };

      if (isEditing && evaluation) {
        await firestoreService.update(
          `academias/${academia.id}/physicalEvaluations`, 
          evaluation.id, 
          evaluationData
        );
        setSnackbar({
          visible: true,
          message: 'Avaliação física atualizada com sucesso! 🎉',
          type: 'success'
        });
      } else {
        evaluationData.createdAt = new Date();
        await firestoreService.create(
          `academias/${academia.id}/physicalEvaluations`, 
          evaluationData
        );
        setSnackbar({
          visible: true,
          message: 'Avaliação física salva com sucesso! 🎉',
          type: 'success'
        });
      }

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar avaliação física:', error);
      setSnackbar({
        visible: true,
        message: 'Erro ao salvar avaliação física. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começar a digitar
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerSection}>
              <Ionicons name="fitness-outline" size={32} color="#4CAF50" />
              <Text style={styles.title}>
                {isEditing ? 'Editar Avaliação Física' : 'Nova Avaliação Física'}
              </Text>
              <Text style={styles.subtitle}>
                Registre suas medidas e acompanhe sua evolução física
              </Text>
            </View>

            {/* Dados Básicos */}
            <Text style={styles.sectionTitle}>📏 Medidas Básicas</Text>
            
            <View style={styles.inputRow}>
              <TextInput
                label="Peso (kg)"
                value={formData.weight}
                onChangeText={(value) => updateFormData('weight', value)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
                error={!!errors.weight}
              />
              <TextInput
                label="Altura (cm)"
                value={formData.height}
                onChangeText={(value) => updateFormData('height', value)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
                error={!!errors.height}
              />
            </View>
            
            <View style={styles.errorContainer}>
              {errors.weight && <HelperText type="error">{errors.weight}</HelperText>}
              {errors.height && <HelperText type="error">{errors.height}</HelperText>}
            </View>

            <TextInput
              label="Idade (anos)"
              value={formData.age}
              onChangeText={(value) => updateFormData('age', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.age}
            />
            {errors.age && <HelperText type="error">{errors.age}</HelperText>}

            {/* Resultado IMC */}
            {calculatedIMC && (
              <Surface style={styles.imcContainer}>
                <View style={styles.imcHeader}>
                  <Ionicons name="calculator-outline" size={24} color="#2196F3" />
                  <Text style={styles.imcTitle}>Índice de Massa Corporal (IMC)</Text>
                </View>
                <View style={styles.imcResult}>
                  <Text style={styles.imcValue}>{calculatedIMC}</Text>
                  <Chip 
                    mode="flat"
                    style={[styles.imcChip, { backgroundColor: getIMCColor(imcClassification) }]}
                    textStyle={{ color: 'white', fontWeight: 'bold' }}
                  >
                    {imcClassification}
                  </Chip>
                </View>
              </Surface>
            )}

            <Divider style={styles.divider} />

            {/* Bioimpedância */}
            <Text style={styles.sectionTitle}>⚡ Bioimpedância (Opcional)</Text>
            
            <View style={styles.inputRow}>
              <TextInput
                label="Gordura Corporal (%)"
                value={formData.bodyFat}
                onChangeText={(value) => updateFormData('bodyFat', value)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
                error={!!errors.bodyFat}
              />
              <TextInput
                label="Massa Muscular (kg)"
                value={formData.muscleMass}
                onChangeText={(value) => updateFormData('muscleMass', value)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
                error={!!errors.muscleMass}
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                label="Massa Óssea (kg)"
                value={formData.boneMass}
                onChangeText={(value) => updateFormData('boneMass', value)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Gordura Visceral"
                value={formData.viscFat}
                onChangeText={(value) => updateFormData('viscFat', value)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                label="Metabolismo Basal (kcal)"
                value={formData.basalMetabolism}
                onChangeText={(value) => updateFormData('basalMetabolism', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Água Corporal (%)"
                value={formData.bodyWater}
                onChangeText={(value) => updateFormData('bodyWater', value)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
                error={!!errors.bodyWater}
              />
            </View>

            <View style={styles.errorContainer}>
              {errors.bodyFat && <HelperText type="error">{errors.bodyFat}</HelperText>}
              {errors.muscleMass && <HelperText type="error">{errors.muscleMass}</HelperText>}
              {errors.bodyWater && <HelperText type="error">{errors.bodyWater}</HelperText>}
            </View>

            {/* Observações */}
            <Text style={styles.sectionTitle}>📝 Observações</Text>
            <TextInput
              label="Observações (opcional)"
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Ex: Início de nova dieta, mudança no treino, etc."
            />

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
                onPress={handleSave}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={snackbar.type === 'success' ? 3000 : 5000}
        style={{
          backgroundColor: snackbar.type === 'success' ? '#4CAF50' : '#F44336'
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
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  input: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  errorContainer: {
    marginBottom: 8,
  },
  imcContainer: {
    padding: 16,
    marginVertical: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#E3F2FD',
  },
  imcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  imcTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1976D2',
  },
  imcResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imcValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  imcChip: {
    elevation: 2,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default PhysicalEvaluationScreen;