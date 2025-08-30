import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  Chip,
  Divider,
  Text,
  List,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const StudentEvolution = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [graduations, setGraduations] = useState([]);
  const [stats, setStats] = useState({
    totalGraduations: 0,
    currentGraduation: '',
    timeInCurrentGraduation: 0,
    modalities: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvolutionData();
  }, []);

  const loadEvolutionData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do usuário com graduações
      const userData = await firestoreService.getById('users', user.uid);
      const userGraduations = userData?.graduations || [];
      
      // Ordenar graduações por data (mais recente primeiro)
      const sortedGraduations = userGraduations.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setGraduations(sortedGraduations);
      
      // Calcular estatísticas
      const currentGrad = sortedGraduations[0];
      const timeInCurrent = currentGrad ? 
        Math.floor((new Date() - new Date(currentGrad.date)) / (1000 * 60 * 60 * 24)) : 0;
      
      const modalities = [...new Set(userGraduations.map(g => g.modality))];
      
      setStats({
        totalGraduations: userGraduations.length,
        currentGraduation: currentGrad?.graduation || 'Iniciante',
        timeInCurrentGraduation: timeInCurrent,
        modalities
      });
      
    } catch (error) {
      console.error('Erro ao carregar evolução:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvolutionData();
  };

  const formatDate = (date) => {
    if (!date) return 'Data não informada';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getGraduationColor = (graduation) => {
    const colors = {
      'Branca': '#FFFFFF',
      'Cinza': '#9E9E9E',
      'Amarela': '#FFEB3B',
      'Laranja': '#FF9800',
      'Verde': '#4CAF50',
      'Azul': '#2196F3',
      'Roxa': '#9C27B0',
      'Marrom': '#795548',
      'Preta': '#424242',
      'Coral': '#FF7043',
      'Vermelha': '#F44336'
    };
    return colors[graduation] || '#2196F3';
  };

  const getGraduationIcon = (modality) => {
    const icons = {
      'Jiu-Jitsu': 'fitness',
      'Muay Thai': 'hand-left',
      'Boxe': 'hand-right',
      'MMA': 'shield',
      'Karatê': 'body',
      'Judô': 'account'
    };
    return icons[modality] || 'medal';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas Gerais */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
              <Title style={styles.cardTitle}>Minha Evolução</Title>
            </View>
            
            <View style={styles.statsGrid}>
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalGraduations}</Text>
                <Text style={styles.statLabel}>Graduações</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.modalities.length}</Text>
                <Text style={styles.statLabel}>Modalidades</Text>
              </Surface>
              
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.timeInCurrentGraduation}</Text>
                <Text style={styles.statLabel}>Dias na Atual</Text>
              </Surface>
            </View>
            
            <View style={styles.currentGraduation}>
              <Text style={styles.currentLabel}>Graduação Atual:</Text>
              <Chip 
                mode="outlined"
                style={[
                  styles.graduationChip, 
                  { borderColor: getGraduationColor(stats.currentGraduation) }
                ]}
                textStyle={{ 
                  color: getGraduationColor(stats.currentGraduation),
                  fontWeight: 'bold'
                }}
              >
                {stats.currentGraduation}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Timeline de Graduações */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="timeline-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>Timeline de Graduações</Title>
            </View>
            
            {graduations.length > 0 ? (
              graduations.map((graduation, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <View style={styles.graduationInfo}>
                        <Ionicons 
                          name={getGraduationIcon(graduation.modality)} 
                          size={20} 
                          color={getGraduationColor(graduation.graduation)}
                        />
                        <Text style={styles.graduationTitle}>
                          {graduation.graduation} - {graduation.modality}
                        </Text>
                      </View>
                      <Text style={styles.graduationDate}>
                        {formatDate(graduation.date)}
                      </Text>
                    </View>
                    
                    {graduation.instructor && (
                      <Text style={styles.instructorText}>
                        Professor: {graduation.instructor}
                      </Text>
                    )}
                    
                    {graduation.observations && (
                      <Text style={styles.observationsText}>
                        {graduation.observations}
                      </Text>
                    )}
                  </View>
                  
                  {index < graduations.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="medal-outline" size={48} color="#ccc" />
                <Paragraph style={styles.emptyText}>
                  Nenhuma graduação registrada ainda
                </Paragraph>
                <Paragraph style={styles.emptySubtext}>
                  Suas graduações aparecerão aqui conforme você evolui
                </Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Modalidades Praticadas */}
        {stats.modalities.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="fitness-outline" size={24} color="#4CAF50" />
                <Title style={styles.cardTitle}>Modalidades Praticadas</Title>
              </View>
              
              <View style={styles.modalitiesContainer}>
                {stats.modalities.map((modality, index) => (
                  <Chip 
                    key={index}
                    mode="outlined"
                    style={styles.modalityChip}
                    icon={getGraduationIcon(modality)}
                  >
                    {modality}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Próximos Objetivos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="target-outline" size={24} color="#FF9800" />
              <Title style={styles.cardTitle}>Próximos Objetivos</Title>
            </View>
            
            <List.Item
              title="Manter frequência nas aulas"
              description="Continue participando regularmente das aulas"
              left={() => <List.Icon icon="check-circle-outline" color="#4CAF50" />}
            />
            
            <List.Item
              title="Aperfeiçoar técnicas"
              description="Foque no desenvolvimento técnico"
              left={() => <List.Icon icon="trending-up" color="#2196F3" />}
            />
            
            <List.Item
              title="Próxima graduação"
              description="Continue se dedicando para a próxima faixa"
              left={() => <List.Icon icon="trophy" color="#FFD700" />}
            />
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
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
    backgroundColor: '#E8F5E8',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: '#fff',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  currentGraduation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  graduationChip: {
    borderWidth: 2,
  },
  timelineItem: {
    marginBottom: 16,
  },
  timelineContent: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  graduationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  graduationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  graduationDate: {
    fontSize: 14,
    color: '#666',
  },
  instructorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: '#ddd',
    marginLeft: 20,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalityChip: {
    marginBottom: 8,
  },
});

export default StudentEvolution;
