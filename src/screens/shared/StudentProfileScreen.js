import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Platform, Dimensions } from 'react-native';
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
  IconButton,
  ProgressBar,
  Badge
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService } from '../../services/firestoreService';
import SafeCardContent from '../../components/SafeCardContent';

const { width } = Dimensions.get('window');

const StudentProfileScreen = ({ route, navigation }) => {
  const { studentId } = route.params;
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [graduations, setGraduations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentDetails();
    }
  }, [studentId]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do aluno se não foram passados
      if (!studentData) {
        const details = await firestoreService.getById('users', studentId);
        setStudentInfo(details);
      }
      
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }
      
      // Buscar turmas do aluno na academia
      const allClasses = await firestoreService.getAll(`gyms/${academiaId}/classes`);
      const userClasses = allClasses.filter(cls => 
        studentInfo?.classIds && studentInfo.classIds.includes(cls.id)
      );
      setStudentClasses(userClasses);
      
      // Buscar pagamentos do aluno na academia
      const allPayments = await firestoreService.getAll(`gyms/${academiaId}/payments`);
      const userPayments = allPayments.filter(payment => 
        payment.userId === studentId
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPayments(userPayments);
      
      // Buscar graduações com tratamento robusto de erros
      try {
        const allGraduations = await firestoreService.getAll(`gyms/${academiaId}/graduations`);
        const userGraduations = allGraduations.filter(graduation => 
          graduation.studentId === studentId
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
        setGraduations(userGraduations);
      } catch (graduationError) {
        console.warn('Não foi possível carregar graduações:', graduationError.message);
        // Se for erro de permissão, não mostrar erro ao usuário, apenas log
        if (graduationError.code !== 'permission-denied') {
          console.error('Erro inesperado ao carregar graduações:', graduationError);
        }
        setGraduations([]);
      }
      
    } catch (error) {
      console.error('Erro ao carregar detalhes do aluno:', error);
      let errorMessage = 'Não foi possível carregar os detalhes do aluno';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para visualizar este perfil.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudentDetails();
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'paid': '#4CAF50',
      'pending': '#FF9800',
      'overdue': '#F44336'
    };
    return colors[status] || '#666';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      'paid': 'Pago',
      'pending': 'Pendente',
      'overdue': 'Atrasado'
    };
    return texts[status] || status;
  };

  const formatDate = (date, format = 'long') => {
    if (!date) return 'Data não disponível';
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    
    if (format === 'short') {
      return dateObj.toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    return dateObj.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = birthDate.seconds ? new Date(birthDate.seconds * 1000) : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddGraduation = () => {
    navigation.navigate('AddGraduation', { 
      studentId: studentId, 
      studentName: studentInfo?.name || 'Aluno' 
    });
  };

  if (loading && !studentInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando perfil do aluno...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header do Perfil com Gradiente */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileHeaderContent}>
              <View style={styles.avatarContainer}>
                <Avatar.Text 
                  size={100} 
                  label={studentInfo?.name?.charAt(0) || 'A'} 
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
                {studentInfo?.isActive !== false && (
                  <Badge style={styles.activeBadge} size={20}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </Badge>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Title style={styles.studentName}>{studentInfo?.name || 'Aluno'}</Title>
                <Text style={styles.studentEmail}>{studentInfo?.email}</Text>
                
                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statusText}>
                      {calculateAge(studentInfo?.birthDate) || '--'} anos
                    </Text>
                  </View>
                  
                  <View style={styles.statusItem}>
                    <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.statusText}>
                      Desde {formatDate(studentInfo?.createdAt, 'short')}
                    </Text>
                  </View>
                </View>
                
                {studentInfo?.currentGraduation && (
                  <View style={styles.graduationContainer}>
                    <Ionicons name="trophy" size={16} color="#FFD700" />
                    <Text style={styles.graduationText}>
                      {studentInfo.currentGraduation}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Cards de Estatísticas Rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="school-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{studentClasses.length}</Text>
            <Text style={styles.statLabel}>Turmas</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
            </View>
            <Text style={styles.statNumber}>{graduations.length}</Text>
            <Text style={styles.statLabel}>Graduações</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="card-outline" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>{payments.filter(p => p.status === 'paid').length}</Text>
            <Text style={styles.statLabel}>Pagos</Text>
          </View>
        </View>

        {/* Informações Pessoais Modernizadas */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/personalInfo">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="person-outline" size={24} color="#667eea" />
              </View>
              <Title style={styles.modernCardTitle}>Informações Pessoais</Title>
            </View>
            
            <View style={styles.modernInfoGrid}>
              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call-outline" size={20} color="#667eea" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Telefone</Text>
                  <Text style={styles.modernInfoValue}>
                    {studentInfo?.phone || 'Não informado'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location-outline" size={20} color="#667eea" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Endereço</Text>
                  <Text style={styles.modernInfoValue}>
                    {studentInfo?.address || 'Não informado'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#667eea" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Data de Nascimento</Text>
                  <Text style={styles.modernInfoValue}>
                    {formatDate(studentInfo?.birthDate) || 'Não informado'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#667eea" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Membro desde</Text>
                  <Text style={styles.modernInfoValue}>
                    {formatDate(studentInfo?.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          </SafeCardContent>
        </Card>

        {/* Turmas Matriculadas Modernizadas */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/classes">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="school-outline" size={24} color="#4CAF50" />
              </View>
              <Title style={styles.modernCardTitle}>Turmas Matriculadas</Title>
              <Badge style={styles.countBadge}>{studentClasses.length}</Badge>
            </View>
            
            {studentClasses.length > 0 ? (
              <View style={styles.classesGrid}>
                {studentClasses.map((classItem, index) => (
                  <View key={classItem.id || index} style={styles.classCard}>
                    <View style={styles.classCardHeader}>
                      <View style={styles.classIconContainer}>
                        <Ionicons name="fitness-outline" size={20} color="#4CAF50" />
                      </View>
                      <Text style={styles.className}>{classItem.name}</Text>
                    </View>
                    
                    <Text style={styles.classModality}>{classItem.modality}</Text>
                    
                    <View style={styles.classFooter}>
                      <View style={styles.scheduleInfo}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.scheduleText}>
                          {classItem.schedule?.length || 0} horários
                        </Text>
                      </View>
                      
                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor="#667eea"
                        onPress={() => navigation.navigate('ClassDetails', { 
                          classId: classItem.id, 
                          classData: classItem 
                        })}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Nenhuma turma matriculada
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  O aluno ainda não foi matriculado em nenhuma turma
                </Text>
              </View>
            )}
          </SafeCardContent>
        </Card>

        {/* Timeline de Graduações */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/graduations">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="trophy-outline" size={24} color="#FFD700" />
              </View>
              <Title style={styles.modernCardTitle}>Timeline de Graduações</Title>
              <Badge style={styles.countBadge}>{graduations.length}</Badge>
            </View>
            
            {graduations.length > 0 ? (
              <View style={styles.timelineContainer}>
                {graduations.map((graduation, index) => (
                  <View key={graduation.id || index} style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                      <Ionicons name="trophy" size={16} color="#FFD700" />
                    </View>
                    
                    <View style={styles.timelineContent}>
                      <View style={styles.graduationCard}>
                        <Text style={styles.graduationTitle}>{graduation.graduation}</Text>
                        <Text style={styles.graduationModality}>{graduation.modality}</Text>
                        <View style={styles.graduationDate}>
                          <Ionicons name="calendar-outline" size={14} color="#666" />
                          <Text style={styles.graduationDateText}>
                            {formatDate(graduation.date)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    {index < graduations.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Nenhuma graduação registrada
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Adicione a primeira graduação do aluno
                </Text>
              </View>
            )}
            
            <Button
              mode="contained"
              onPress={handleAddGraduation}
              style={styles.modernAddButton}
              icon="plus"
              buttonColor="#FFD700"
              textColor="#333"
            >
              Nova Graduação
            </Button>
          </SafeCardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/payments">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="card-outline" size={24} color="#2196F3" />
              </View>
              <Title style={styles.modernCardTitle}>Resumo Financeiro</Title>
            </View>
            
            {/* Indicadores Financeiros */}
            <View style={styles.financialIndicators}>
              <View style={styles.financialCard}>
                <Text style={styles.financialValue}>
                  {formatCurrency(payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0))}
                </Text>
                <Text style={styles.financialLabel}>Total Pago</Text>
                <View style={styles.financialIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              </View>
              
              <View style={styles.financialCard}>
                <Text style={styles.financialValue}>
                  {formatCurrency(payments.reduce((sum, p) => p.status === 'pending' ? sum + p.amount : sum, 0))}
                </Text>
                <Text style={styles.financialLabel}>Pendente</Text>
                <View style={styles.financialIcon}>
                  <Ionicons name="time-outline" size={20} color="#FF9800" />
                </View>
              </View>
            </View>
            
            {/* Últimos Pagamentos */}
            {payments.length > 0 ? (
              <View style={styles.paymentsSection}>
                <Text style={styles.sectionTitle}>Últimos Pagamentos</Text>
                {payments.slice(0, 3).map((payment, index) => (
                  <View key={payment.id || index} style={styles.paymentItem}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {formatDate(payment.createdAt)}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.paymentStatus,
                      { backgroundColor: getPaymentStatusColor(payment.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.paymentStatusText,
                        { color: getPaymentStatusColor(payment.status) }
                      ]}>
                        {getPaymentStatusText(payment.status)}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {payments.length > 3 && (
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('StudentPayments', { studentId })}
                    style={styles.viewAllPaymentsButton}
                    textColor="#667eea"
                  >
                    Ver Todos os Pagamentos ({payments.length})
                  </Button>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Nenhum pagamento registrado
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Histórico de pagamentos aparecerá aqui
                </Text>
              </View>
            )}
          </SafeCardContent>
        </Card>

        {/* Ações Rápidas */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.actionCard}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditStudent', { 
                studentId, 
                studentData: studentInfo 
              })}
              style={styles.primaryActionButton}
              icon="pencil"
              buttonColor="#667eea"
            >
              Editar Perfil
            </Button>
          </View>
          
          <View style={styles.actionCard}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AddGraduation', { 
                studentId, 
                studentName: studentInfo?.name 
              })}
              style={styles.primaryActionButton}
              icon="trophy"
              buttonColor="#FFD700"
              textColor="#333"
            >
              Nova Graduação
            </Button>
          </View>
        </View>
        
        {/* Espaçamento final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header com gradiente
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      },
    }),
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  activeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  studentEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  graduationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  graduationText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },

  // Cards de estatísticas
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Cards modernos
  modernCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      },
    }),
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#667eea',
  },

  // Informações pessoais
  modernInfoGrid: {
    gap: 16,
  },
  modernInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  modernInfoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernInfoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },

  // Turmas
  classesGrid: {
    gap: 12,
  },
  classCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  className: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  classModality: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Timeline de graduações
  timelineContainer: {
    paddingLeft: 20,
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: 20,
  },
  timelineDot: {
    position: 'absolute',
    left: -28,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5e6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  timelineContent: {
    marginLeft: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: -12,
    top: 40,
    bottom: -20,
    width: 2,
    backgroundColor: '#f0f0f0',
  },
  graduationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  graduationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  graduationModality: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  graduationDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  graduationDateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Resumo financeiro
  financialIndicators: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  financialCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  financialLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  financialIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  paymentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  paymentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllPaymentsButton: {
    marginTop: 12,
  },

  // Estados vazios
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Botões modernos
  modernAddButton: {
    marginTop: 20,
    borderRadius: 12,
  },

  // Ações rápidas
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
  },
  primaryActionButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },

  // Espaçamento
  bottomSpacing: {
    height: 20,
  },
});

export default StudentProfileScreen;
