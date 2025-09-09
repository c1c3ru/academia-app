import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  FAB,
  Chip,
  Divider,
  Surface,
  List,
  Badge
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const InjuryHistoryScreen = ({ navigation }) => {
  const { user, academia } = useAuth();
  
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadInjuries();
  }, []);

  const loadInjuries = async () => {
    try {
      setLoading(true);
      
      const injuryData = await firestoreService.getDocuments(
        `academias/${academia.id}/injuries`,
        [{ field: 'userId', operator: '==', value: user.uid }],
        [{ field: 'dateOccurred', direction: 'desc' }]
      );
      
      setInjuries(injuryData);
    } catch (error) {
      console.error('Erro ao carregar lesões:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInjuries();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const injuryDate = date.toDate ? date.toDate() : new Date(date);
    return injuryDate.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return '#F44336';
      case 'recuperando': return '#FF9800';
      case 'recuperado': return '#4CAF50';
      case 'cronico': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'leve': return '#4CAF50';
      case 'moderada': return '#FF9800';
      case 'grave': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'recuperando': return 'Recuperando';
      case 'recuperado': return 'Recuperado';
      case 'cronico': return 'Crônico';
      default: return status;
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'leve': return 'Leve';
      case 'moderada': return 'Moderada';
      case 'grave': return 'Grave';
      default: return severity;
    }
  };

  const getFilteredInjuries = () => {
    if (selectedFilter === 'all') return injuries;
    return injuries.filter(injury => injury.status === selectedFilter);
  };

  const getInjuryIcon = (bodyPart) => {
    const iconMap = {
      'Cabeça': 'head-outline',
      'Pescoço': 'accessibility-outline',
      'Ombro': 'body-outline',
      'Braço': 'body-outline',
      'Cotovelo': 'body-outline',
      'Punho': 'hand-left-outline',
      'Mão': 'hand-left-outline',
      'Tórax': 'body-outline',
      'Coluna': 'body-outline',
      'Quadril': 'body-outline',
      'Coxa': 'body-outline',
      'Joelho': 'body-outline',
      'Canela': 'body-outline',
      'Tornozelo': 'body-outline',
      'Pé': 'footsteps-outline'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (bodyPart.includes(key)) {
        return icon;
      }
    }
    
    return 'bandage-outline';
  };

  const getStats = () => {
    const activeInjuries = injuries.filter(injury => injury.status === 'ativo').length;
    const recoveringInjuries = injuries.filter(injury => injury.status === 'recuperando').length;
    const recoveredInjuries = injuries.filter(injury => injury.status === 'recuperado').length;
    const chronicInjuries = injuries.filter(injury => injury.status === 'cronico').length;

    return {
      total: injuries.length,
      active: activeInjuries,
      recovering: recoveringInjuries,
      recovered: recoveredInjuries,
      chronic: chronicInjuries
    };
  };

  const filteredInjuries = getFilteredInjuries();
  const stats = getStats();

  const filters = [
    { key: 'all', label: 'Todas', count: stats.total },
    { key: 'ativo', label: 'Ativas', count: stats.active },
    { key: 'recuperando', label: 'Recuperando', count: stats.recovering },
    { key: 'recuperado', label: 'Recuperadas', count: stats.recovered },
    { key: 'cronico', label: 'Crônicas', count: stats.chronic }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart-outline" size={24} color="#2196F3" />
              <Text style={styles.cardTitle}>Resumo de Lesões</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </Surface>
              
              <Surface style={[styles.statItem, { backgroundColor: '#FFEBEE' }]}>
                <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.active}</Text>
                <Text style={styles.statLabel}>Ativas</Text>
              </Surface>
              
              <Surface style={[styles.statItem, { backgroundColor: '#FFF3E0' }]}>
                <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.recovering}</Text>
                <Text style={styles.statLabel}>Recuperando</Text>
              </Surface>
              
              <Surface style={[styles.statItem, { backgroundColor: '#E8F5E8' }]}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.recovered}</Text>
                <Text style={styles.statLabel}>Recuperadas</Text>
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* Filtros */}
        <Card style={styles.card}>
          <Card.Content>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
              {filters.map((filter) => (
                <Chip
                  key={filter.key}
                  mode={selectedFilter === filter.key ? 'flat' : 'outlined'}
                  selected={selectedFilter === filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  style={styles.filterChip}
                  icon={filter.key === 'all' ? 'format-list-bulleted' : 
                        filter.key === 'ativo' ? 'alert-circle' :
                        filter.key === 'recuperando' ? 'clock' :
                        filter.key === 'recuperado' ? 'check-circle' : 'refresh'}
                >
                  {filter.label} ({filter.count})
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Lista de Lesões */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="list-outline" size={24} color="#FF9800" />
              <Text style={styles.cardTitle}>
                {selectedFilter === 'all' ? 'Todas as Lesões' : 
                 `Lesões ${filters.find(f => f.key === selectedFilter)?.label}`}
              </Text>
            </View>
            
            {filteredInjuries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bandage-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {selectedFilter === 'all' ? 'Nenhuma lesão registrada' : 
                   `Nenhuma lesão ${filters.find(f => f.key === selectedFilter)?.label.toLowerCase()}`}
                </Text>
                <Text style={styles.emptySubtext}>
                  {selectedFilter === 'all' 
                    ? 'Registre lesões para acompanhar sua recuperação'
                    : 'Experimente outros filtros para ver mais lesões'
                  }
                </Text>
              </View>
            ) : (
              filteredInjuries.map((injury, index) => (
                <View key={injury.id || index}>
                  <List.Item
                    title={`${injury.bodyPart} • ${injury.injuryType}`}
                    description={
                      <View style={styles.injuryDescription}>
                        <Text numberOfLines={2} style={styles.descriptionText}>
                          {injury.description}
                        </Text>
                        <View style={styles.injuryMeta}>
                          <Text style={styles.dateText}>{formatDate(injury.dateOccurred)}</Text>
                          <View style={styles.chipContainer}>
                            <Chip
                              mode="flat"
                              compact
                              style={[styles.statusChip, { backgroundColor: getStatusColor(injury.status) }]}
                              textStyle={{ color: 'white', fontSize: 10 }}
                            >
                              {getStatusLabel(injury.status)}
                            </Chip>
                            <Chip
                              mode="flat"
                              compact
                              style={[styles.severityChip, { backgroundColor: getSeverityColor(injury.severity) }]}
                              textStyle={{ color: 'white', fontSize: 10 }}
                            >
                              {getSeverityLabel(injury.severity)}
                            </Chip>
                          </View>
                        </View>
                      </View>
                    }
                    left={() => (
                      <View style={styles.iconContainer}>
                        <Ionicons 
                          name={getInjuryIcon(injury.bodyPart)} 
                          size={24} 
                          color={getStatusColor(injury.status)} 
                        />
                        {injury.status === 'ativo' && (
                          <Badge size={8} style={[styles.activeBadge, { backgroundColor: '#F44336' }]} />
                        )}
                      </View>
                    )}
                    right={() => <List.Icon icon="chevron-right" />}
                    onPress={() => navigation.navigate('Injury', {
                      injury,
                      isEditing: true
                    })}
                    style={styles.listItem}
                  />
                  {index < filteredInjuries.length - 1 && <Divider />}
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Dicas de Prevenção */}
        {stats.active > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Dicas de Prevenção</Text>
              </View>
              
              <View style={styles.tipContainer}>
                <Text style={styles.tipText}>
                  • Sempre faça aquecimento antes dos treinos{'\n'}
                  • Mantenha uma boa hidratação{'\n'}
                  • Respeite os limites do seu corpo{'\n'}
                  • Use equipamentos de proteção adequados{'\n'}
                  • Procure orientação médica se sentir dor
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Injury')}
        label="Nova Lesão"
      />
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    backgroundColor: '#F5F5F5',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  injuryDescription: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  injuryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  statusChip: {
    height: 20,
  },
  severityChip: {
    height: 20,
  },
  iconContainer: {
    position: 'relative',
    marginLeft: 8,
  },
  activeBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  listItem: {
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipContainer: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 8,
    borderLeft: '4px solid #4CAF50',
  },
  tipText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#F44336',
  },
});

export default InjuryHistoryScreen;