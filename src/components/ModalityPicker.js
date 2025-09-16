import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Chip, Card, ActivityIndicator } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ModalityPicker({ 
  selectedModalities = [], 
  onModalitiesChange,
  label = "Modalidades Oferecidas"
}) {
  const [availableModalities, setAvailableModalities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModalities();
  }, []);

  const loadModalities = async () => {
    console.time('ModalityPicker.loadModalities');
    console.log('🔄 ModalityPicker: Iniciando carregamento de modalidades');
    
    try {
      setLoading(true);
      
      // Verificar se o Firestore está inicializado
      if (!db) {
        console.error('❌ Firestore não inicializado, usando fallback');
        throw new Error('Firestore não inicializado');
      }
      
      console.log('🔄 ModalityPicker: Buscando modalidades do Firestore');
      
      // Buscar modalidades da coleção global com timeout de 8 segundos
      const modalitiesRef = collection(db, 'modalities');
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar modalidades')), 8000)
      );
      
      const snapshot = await Promise.race([getDocs(modalitiesRef), timeout]);
      console.log('✅ ModalityPicker: Dados recebidos do Firestore:', snapshot.docs.length, 'documentos');
      
      const modalities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Remover duplicatas baseado no ID e nome
      const uniqueModalities = modalities.filter((modality, index, self) => 
        index === self.findIndex(m => m.id === modality.id || m.name === modality.name)
      );
      
      // Se não conseguiu carregar nenhuma modalidade, usar fallback
      if (uniqueModalities.length === 0) {
        setAvailableModalities([
          { id: 'bjj', name: 'Jiu-Jitsu Brasileiro', description: 'Arte marcial brasileira' },
          { id: 'muaythai', name: 'Muay Thai', description: 'Arte marcial tailandesa' },
          { id: 'boxe', name: 'Boxe', description: 'Esporte de combate' },
          { id: 'mma', name: 'MMA', description: 'Artes marciais mistas' },
          { id: 'judo', name: 'Judô', description: 'Arte marcial japonesa' },
          { id: 'karate', name: 'Karatê', description: 'Arte marcial japonesa' },
          { id: 'taekwondo', name: 'Taekwondo', description: 'Arte marcial coreana' },
          { id: 'capoeira', name: 'Capoeira', description: 'Arte marcial brasileira' }
        ]);
      } else {
        setAvailableModalities(uniqueModalities);
      }
    } catch (error) {
      console.error('❌ ModalityPicker: Erro ao carregar modalidades:', error.message);
      // Modalidades padrão caso não consiga carregar do banco
      setAvailableModalities([
        { id: 'bjj', name: 'Jiu-Jitsu Brasileiro', description: 'Arte marcial brasileira' },
        { id: 'muaythai', name: 'Muay Thai', description: 'Arte marcial tailandesa' },
        { id: 'boxe', name: 'Boxe', description: 'Esporte de combate' },
        { id: 'mma', name: 'MMA', description: 'Artes marciais mistas' },
        { id: 'judo', name: 'Judô', description: 'Arte marcial japonesa' },
        { id: 'karate', name: 'Karatê', description: 'Arte marcial japonesa' },
        { id: 'taekwondo', name: 'Taekwondo', description: 'Arte marcial coreana' },
        { id: 'capoeira', name: 'Capoeira', description: 'Arte marcial brasileira' }
      ]);
    } finally {
      console.timeEnd('ModalityPicker.loadModalities');
      console.log('✅ ModalityPicker: Carregamento finalizado, definindo loading=false');
      setLoading(false);
    }
  };

  const handleModalityToggle = (modalityId) => {
    const isSelected = selectedModalities.includes(modalityId);
    let newSelection;
    
    if (isSelected) {
      // Remover modalidade
      newSelection = selectedModalities.filter(id => id !== modalityId);
    } else {
      // Adicionar modalidade
      newSelection = [...selectedModalities, modalityId];
    }
    
    onModalitiesChange(newSelection);
  };

  const getModalityName = (modalityId) => {
    const modality = availableModalities.find(m => m.id === modalityId);
    return modality ? modality.name : modalityId;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Carregando modalidades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        {label}
      </Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            decelerationRate="fast"
            snapToInterval={120}
            snapToAlignment="start"
          >
            <View style={styles.chipsContainer}>
              {availableModalities.map((modality, index) => (
                <Chip
                  key={modality.id}
                  mode={selectedModalities.includes(modality.id) ? 'flat' : 'outlined'}
                  selected={selectedModalities.includes(modality.id)}
                  onPress={() => handleModalityToggle(modality.id)}
                  style={[
                    styles.chip,
                    selectedModalities.includes(modality.id) && styles.selectedChip,
                    index === availableModalities.length - 1 && styles.lastChip
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedModalities.includes(modality.id) && styles.selectedChipText
                  ]}
                >
                  {modality.name}
                </Chip>
              ))}
            </View>
          </ScrollView>
          
          {selectedModalities.length > 0 && (
            <View style={styles.selectedContainer}>
              <Text variant="bodySmall" style={styles.selectedLabel}>
                Selecionadas ({selectedModalities.length}):
              </Text>
              <View style={styles.selectedChips}>
                {selectedModalities.map((modalityId) => (
                  <Chip
                    key={modalityId}
                    mode="flat"
                    selected
                    onClose={() => handleModalityToggle(modalityId)}
                    style={styles.selectedChip}
                    textStyle={styles.selectedChipText}
                  >
                    {getModalityName(modalityId)}
                  </Chip>
                ))}
              </View>
            </View>
          )}
          
          {selectedModalities.length === 0 && (
            <Text variant="bodySmall" style={styles.emptyText}>
              Selecione as modalidades que sua academia oferece
            </Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = {
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  scrollView: {
    marginBottom: 12,
    maxHeight: 60,
  },
  scrollContent: {
    paddingRight: 20,
    paddingLeft: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
  },
  chip: {
    marginRight: 10,
    backgroundColor: '#fff',
    minWidth: 100,
    justifyContent: 'center',
  },
  lastChip: {
    marginRight: 20,
  },
  selectedChip: {
    backgroundColor: '#4CAF50',
  },
  chipText: {
    fontSize: 14,
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedLabel: {
    marginBottom: 8,
    color: '#666',
    fontWeight: '600',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
};
