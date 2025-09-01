import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Platform, Dimensions } from 'react-native';
import { 
  Card, 
  Text, 
  Button,
  Badge,
  Avatar,
  Icon,
  ListItem,
  Divider
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

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
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Ionicons name="trophy" size={12} color="#fff" />
          <Text style={styles.headerTitle}>Minha Evolução</Text>
          <Text style={styles.headerSubtitle}>Acompanhe seu progresso nas artes marciais</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas Principais */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#ff6b6b', '#ee5a24']}
            style={styles.statCard}
          >
            <Ionicons name="medal" size={32} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalGraduations}</Text>
            <Text style={styles.statLabel}>Graduações</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#4834d4', '#686de0']}
            style={styles.statCard}
          >
            <Ionicons name="fitness" size={32} color="#fff" />
            <Text style={styles.statNumber}>{stats.modalities.length}</Text>
            <Text style={styles.statLabel}>Modalidades</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#00d2d3', '#54a0ff']}
            style={styles.statCard}
          >
            <Ionicons name="calendar" size={32} color="#fff" />
            <Text style={styles.statNumber}>{stats.timeInCurrentGraduation}</Text>
            <Text style={styles.statLabel}>Dias Atual</Text>
          </LinearGradient>
        </View>

        {/* Graduação Atual */}
        <Card containerStyle={styles.currentCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={26} color="#FFD700" />
            <Text style={styles.sectionTitle}>Graduação Atual</Text>
          </View>
          <View style={styles.currentGraduationContent}>
            <LinearGradient
              colors={[getGraduationColor(stats.currentGraduation), '#fff']}
              style={styles.graduationBadge}
            >
              <Text style={styles.graduationText}>
                {stats.currentGraduation}
              </Text>
            </LinearGradient>
            <Text style={styles.graduationDays}>
              {stats.timeInCurrentGraduation} dias nesta graduação
            </Text>
          </View>
        </Card>

        {/* Timeline de Graduações */}
        <Card containerStyle={styles.timelineCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon" size={24} color="#667eea" />
            <Text style={styles.sectionTitle}>Timeline de Graduações</Text>
          </View>
          
          {graduations.length > 0 ? (
            graduations.map((graduation, index) => (
              <View key={`${graduation.date}-${graduation.graduation}-${graduation.modality}`} style={styles.timelineItem}>
                <View style={styles.timelineDot}>
                  <LinearGradient
                    colors={[getGraduationColor(graduation.graduation), '#fff']}
                    style={styles.graduationDot}
                  >
                    <Ionicons 
                      name={getGraduationIcon(graduation.modality)} 
                      size={16} 
                      color="#fff"
                    />
                  </LinearGradient>
                </View>
                
                <View style={styles.timelineContent}>
                  <View style={styles.graduationCard}>
                    <View style={styles.graduationHeader}>
                      <Text style={styles.graduationTitle}>
                        {graduation.graduation}
                      </Text>
                      <Text style={styles.graduationDate}>
                        {formatDate(graduation.date)}
                      </Text>
                    </View>
                    
                    <Text style={styles.modalityText}>
                      {graduation.modality}
                    </Text>
                    
                    {graduation.instructor && (
                      <Text style={styles.instructorText}>
                        👨‍🏫 {graduation.instructor}
                      </Text>
                    )}
                    
                    {graduation.observations && (
                      <Text style={styles.observationsText}>
                        💭 {graduation.observations}
                      </Text>
                    )}
                  </View>
                </View>
                
                {index < graduations.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#f8f9fa', '#e9ecef']}
                style={styles.emptyContainer}
              >
                <Ionicons name="medal-outline" size={64} color="#adb5bd" />
                <Text style={styles.emptyText}>
                  Nenhuma graduação registrada
                </Text>
                <Text style={styles.emptySubtext}>
                  Suas conquistas aparecerão aqui
                </Text>
              </LinearGradient>
            </View>
          )}
        </Card>

        {/* Modalidades Praticadas */}
        {stats.modalities.length > 0 && (
          <Card containerStyle={styles.modalitiesCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Modalidades Praticadas</Text>
            </View>
            
            <View style={styles.modalitiesGrid}>
              {stats.modalities.map((modality) => (
                <LinearGradient
                  key={modality}
                  colors={['#4CAF50', '#81C784']}
                  style={styles.modalityChip}
                >
                  <Ionicons name={getGraduationIcon(modality)} size={20} color="#fff" />
                  <Text style={styles.modalityText}>{modality}</Text>
                </LinearGradient>
              ))}
            </View>
          </Card>
        )}

        {/* Próximos Objetivos */}
        <Card containerStyle={styles.objectivesCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>Próximos Objetivos</Text>
          </View>
          
          <View style={styles.objectivesList}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.objectiveItem}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <View style={styles.objectiveContent}>
                <Text style={styles.objectiveTitle}>Manter Frequência</Text>
                <Text style={styles.objectiveDescription}>Continue comparecendo às aulas regularmente</Text>
              </View>
            </LinearGradient>
            
            <LinearGradient
              colors={['#2196F3', '#42A5F5']}
              style={styles.objectiveItem}
            >
              <Ionicons name="trending-up" size={24} color="#fff" />
              <View style={styles.objectiveContent}>
                <Text style={styles.objectiveTitle}>Aperfeiçoar Técnicas</Text>
                <Text style={styles.objectiveDescription}>Foque no desenvolvimento técnico</Text>
              </View>
            </LinearGradient>
            
            <LinearGradient
              colors={['#FFD700', '#FFC107']}
              style={styles.objectiveItem}
            >
              <Ionicons name="trophy" size={24} color="#fff" />
              <View style={styles.objectiveContent}>
                <Text style={styles.objectiveTitle}>Próxima Graduação</Text>
                <Text style={styles.objectiveDescription}>Continue se dedicando para a próxima faixa</Text>
              </View>
            </LinearGradient>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 3,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.9,
    marginTop: 1,
    textAlign: 'center',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  currentCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  currentGraduationContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  graduationBadge: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  graduationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    letterSpacing: 0.5,
  },
  graduationDays: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  timelineCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineDot: {
    width: 48,
    alignItems: 'center',
    marginRight: 20,
  },
  graduationDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  timelineContent: {
    flex: 1,
  },
  graduationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  graduationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graduationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    letterSpacing: 0.3,
  },
  graduationDate: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modalityText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  instructorText: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 8,
    fontWeight: '500',
  },
  observationsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 23,
    top: 36,
    bottom: -24,
    width: 2,
    backgroundColor: '#e9ecef',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#adb5bd',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalitiesCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  modalitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modalityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: '47%',
    justifyContent: 'center',
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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalityText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 10,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  objectivesCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  objectivesList: {
    gap: 16,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  objectiveContent: {
    flex: 1,
    marginLeft: 16,
  },
  objectiveTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  objectiveDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.95,
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default StudentEvolution;
