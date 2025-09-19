import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Text,
  Button,
  List,
  Chip,
  Surface,
  Divider,
  FAB,
  Modal,
  Portal,
  TextInput,
  Searchbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthProvider';
import { academyFirestoreService, academyClassService } from '../../services/academyFirestoreService';
import { ResponsiveUtils } from '../../utils/animations';

const CheckIn = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [manualCheckInVisible, setManualCheckInVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Auto-refresh quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [userProfile?.academiaId])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        return;
      }

      console.log('🔄 CheckIn: Carregando dados para instrutor:', user.uid, 'academia:', userProfile.academiaId);

      // Carregar turmas do instrutor
      const instructorClasses = await academyClassService.getClassesByInstructor(
        user.uid, 
        userProfile.academiaId, 
        user.email
      );
      setClasses(instructorClasses);
      console.log('📚 CheckIn: Turmas do instrutor carregadas:', instructorClasses.length);

      // Carregar check-ins ativos (sessões de check-in abertas)
      await loadActiveCheckIns();

      // Carregar check-ins recentes
      await loadRecentCheckIns();

      // Carregar alunos para check-in manual
      await loadStudents();

    } catch (error) {
      console.error('❌ CheckIn: Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadActiveCheckIns = async () => {
    try {
      // Buscar sessões de check-in ativas
      const activeSessions = await academyFirestoreService.getWhere(
        'checkInSessions', 
        'instructorId', 
        '==', 
        user.uid, 
        userProfile.academiaId
      );
      
      const activeSessionsWithDetails = activeSessions.map(session => {
        const classInfo = classes.find(c => c.id === session.classId);
        return {
          ...session,
          className: classInfo?.name || 'Turma não encontrada',
          classSchedule: classInfo?.scheduleText || '',
          maxStudents: classInfo?.maxStudents || 0
        };
      });

      setActiveCheckIns(activeSessionsWithDetails);
      console.log('✅ Check-ins ativos carregados:', activeSessionsWithDetails.length);
    } catch (error) {
      console.error('❌ Erro ao carregar check-ins ativos:', error);
      setActiveCheckIns([]);
    }
  };

  const loadRecentCheckIns = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCheckIns = await academyFirestoreService.getDocuments(
        'checkIns',
        userProfile.academiaId,
        [
          { field: 'date', operator: '>=', value: today },
          { field: 'instructorId', operator: '==', value: user.uid }
        ],
        { field: 'createdAt', direction: 'desc' }
      );

      setRecentCheckIns(todayCheckIns.slice(0, 10)); // Últimos 10
      console.log('📋 Check-ins recentes carregados:', todayCheckIns.length);
    } catch (error) {
      console.error('❌ Erro ao carregar check-ins recentes:', error);
      setRecentCheckIns([]);
    }
  };

  const loadStudents = async () => {
    try {
      console.log('📚 Carregando alunos da academia:', userProfile.academiaId);
      
      // Buscar alunos na subcoleção da academia
      const allStudents = await academyFirestoreService.getAll('students', userProfile.academiaId);
      console.log('👥 Alunos encontrados:', allStudents.length);
      
      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (error) {
      console.error('❌ Erro ao carregar alunos:', error);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const handleStartCheckIn = async (classId) => {
    try {
      console.log('🚀 Iniciando check-in para aula:', classId);
      
      const classInfo = classes.find(c => c.id === classId);
      if (!classInfo) {
        Alert.alert('Erro', 'Turma não encontrada');
        return;
      }

      // Verificar se já existe uma sessão ativa para esta turma
      const existingSession = activeCheckIns.find(session => session.classId === classId);
      if (existingSession) {
        Alert.alert('Aviso', 'Já existe uma sessão de check-in ativa para esta turma');
        return;
      }

      // Criar nova sessão de check-in
      const sessionData = {
        classId,
        className: classInfo.name,
        instructorId: user.uid,
        instructorName: userProfile?.name || user.email,
        academiaId: userProfile.academiaId,
        startTime: new Date(),
        status: 'active',
        checkInCount: 0,
        createdAt: new Date()
      };

      const sessionId = await academyFirestoreService.create('checkInSessions', sessionData, userProfile.academiaId);
      console.log('✅ Sessão de check-in criada:', sessionId);

      // Recarregar dados
      await loadActiveCheckIns();
      
      Alert.alert('Sucesso', `Check-in iniciado para ${classInfo.name}`);
    } catch (error) {
      console.error('❌ Erro ao iniciar check-in:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o check-in. Tente novamente.');
    }
  };

  const handleStopCheckIn = async (sessionId) => {
    try {
      console.log('⏹️ Parando check-in para sessão:', sessionId);
      
      Alert.alert(
        'Confirmar',
        'Deseja realmente parar esta sessão de check-in?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Parar', 
            style: 'destructive',
            onPress: async () => {
              try {
                // Atualizar status da sessão
                await academyFirestoreService.update('checkInSessions', sessionId, {
                  status: 'completed',
                  endTime: new Date(),
                  updatedAt: new Date()
                }, userProfile.academiaId);

                // Recarregar dados
                await loadActiveCheckIns();
                
                Alert.alert('Sucesso', 'Sessão de check-in finalizada');
              } catch (error) {
                console.error('❌ Erro ao parar check-in:', error);
                Alert.alert('Erro', 'Não foi possível parar o check-in');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao parar check-in:', error);
    }
  };

  const handleManualCheckIn = async (studentId, studentName) => {
    try {
      if (!selectedClass) {
        Alert.alert('Erro', 'Selecione uma turma primeiro');
        return;
      }

      const checkInData = {
        studentId,
        studentName,
        classId: selectedClass.id,
        className: selectedClass.name,
        instructorId: user.uid,
        instructorName: userProfile?.name || user.email,
        academiaId: userProfile.academiaId,
        type: 'manual',
        date: new Date(),
        createdAt: new Date()
      };

      await academyFirestoreService.create('checkIns', checkInData, userProfile.academiaId);
      
      // Atualizar contador da sessão se existir
      const activeSession = activeCheckIns.find(session => session.classId === selectedClass.id);
      if (activeSession) {
        await academyFirestoreService.update('checkInSessions', activeSession.id, {
          checkInCount: (activeSession.checkInCount || 0) + 1,
          updatedAt: new Date()
        }, userProfile.academiaId);
      }

      setManualCheckInVisible(false);
      setSelectedClass(null);
      await loadRecentCheckIns();
      await loadActiveCheckIns();
      
      Alert.alert('Sucesso', `Check-in realizado para ${studentName}`);
    } catch (error) {
      console.error('❌ Erro no check-in manual:', error);
      Alert.alert('Erro', 'Não foi possível realizar o check-in');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const filterStudents = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name?.toLowerCase().includes(query.toLowerCase()) ||
        student.email?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Minhas Turmas - Para iniciar check-in */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="school" size={32} color="#4CAF50" />
              <Title style={styles.title}>Minhas Turmas</Title>
            </View>
            
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <Surface key={classItem.id} style={styles.checkInItem}>
                  <View style={styles.checkInHeader}>
                    <Text style={styles.aulaName}>{classItem.name}</Text>
                    <Chip 
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: '#2196F3' }
                      ]}
                      textStyle={{ color: 'white' }}
                    >
                      {classItem.modality}
                    </Chip>
                  </View>
                  
                  <View style={styles.checkInDetails}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="clock" size={16} color="#666" />
                      <Text style={styles.detailText}>{classItem.schedule || 'Horário não definido'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="account-group" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {classItem.currentStudents || 0}/{classItem.maxStudents} alunos
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={() => handleStartCheckIn(classItem.id)}
                      buttonColor="#4CAF50"
                      compact
                    >
                      Iniciar Check-in
                    </Button>
                  </View>
                </Surface>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="school-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma turma encontrada</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Check-ins Ativos */}
        {activeCheckIns.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <MaterialCommunityIcons name="qrcode-scan" size={32} color="#2196F3" />
                <Title style={styles.title}>Sessões Ativas</Title>
              </View>
              
              {activeCheckIns.map((session) => (
                <Surface key={session.id} style={styles.checkInItem}>
                  <View style={styles.checkInHeader}>
                    <Text style={styles.aulaName}>{session.className}</Text>
                    <Chip 
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: '#4CAF50' }
                      ]}
                      textStyle={{ color: 'white' }}
                    >
                      Ativo
                    </Chip>
                  </View>
                  
                  <View style={styles.checkInDetails}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="clock" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Iniciado: {session.startTime?.toDate?.()?.toLocaleTimeString() || 'Agora'}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="check-circle" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {session.checkInCount || 0} check-ins
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => handleStopCheckIn(session.id)}
                      buttonColor="#FFEBEE"
                      textColor="#F44336"
                      compact
                    >
                      Parar Check-in
                    </Button>
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Check-ins Recentes */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="history" size={32} color="#FF9800" />
              <Title style={styles.title}>Check-ins de Hoje</Title>
            </View>
            
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((checkIn) => (
                <List.Item
                  key={checkIn.id}
                  title={checkIn.studentName}
                  description={`${checkIn.className} • ${checkIn.date?.toDate?.()?.toLocaleTimeString() || 'Agora'}`}
                  left={() => (
                    <List.Icon 
                      icon="check-circle" 
                      color="#4CAF50" 
                    />
                  )}
                  right={() => (
                    <Chip 
                      mode="outlined" 
                      compact
                      style={{ marginTop: 8 }}
                    >
                      {checkIn.type === 'manual' ? 'Manual' : 'QR Code'}
                    </Chip>
                  )}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="history" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum check-in hoje</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal para Check-in Manual */}
      <Portal>
        <Modal
          visible={manualCheckInVisible}
          onDismiss={() => setManualCheckInVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Check-in Manual</Title>
          
          {/* Seleção de Turma */}
          <Text style={styles.modalSubtitle}>Selecione a turma:</Text>
          <ScrollView style={styles.classSelection} horizontal showsHorizontalScrollIndicator={false}>
            {classes.map((classItem) => (
              <Chip
                key={classItem.id}
                selected={selectedClass?.id === classItem.id}
                onPress={() => setSelectedClass(classItem)}
                style={styles.classChip}
                mode={selectedClass?.id === classItem.id ? 'flat' : 'outlined'}
              >
                {classItem.name}
              </Chip>
            ))}
          </ScrollView>

          {/* Busca de Alunos */}
          <Searchbar
            placeholder="Buscar aluno..."
            onChangeText={filterStudents}
            value={searchQuery}
            style={styles.searchbar}
          />

          {/* Lista de Alunos */}
          <ScrollView style={styles.studentsList}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <List.Item
                  key={student.id}
                  title={student.name || 'Nome não informado'}
                  description={student.email || 'Email não informado'}
                  left={() => (
                    <List.Icon icon="account" color="#2196F3" />
                  )}
                  right={() => (
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleManualCheckIn(student.id, student.name)}
                      disabled={!selectedClass}
                    >
                      Check-in
                    </Button>
                  )}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nenhum aluno encontrado na busca' : 'Nenhum aluno cadastrado'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Total de alunos: {students.length}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setManualCheckInVisible(false)}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="qrcode-plus"
        style={styles.fab}
        onPress={() => {
          if (classes.length === 0) {
            Alert.alert('Aviso', 'Você precisa ter pelo menos uma turma para fazer check-in manual');
            return;
          }
          setManualCheckInVisible(true);
        }}
        label="Check-in Manual"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.lg,
  },
  title: {
    marginLeft: ResponsiveUtils.spacing.md,
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: 'bold',
    color: '#333',
  },
  checkInItem: {
    padding: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    backgroundColor: '#f8f9fa',
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  aulaName: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusChip: {
    borderRadius: 12,
  },
  checkInDetails: {
    flexDirection: 'row',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: ResponsiveUtils.spacing.lg,
  },
  detailText: {
    marginLeft: 4,
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#666',
  },
  actionButtons: {
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.xl,
  },
  emptyText: {
    fontSize: ResponsiveUtils.fontSize.medium,
    color: '#666',
    marginTop: ResponsiveUtils.spacing.sm,
  },
  emptySubtext: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#999',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  // Modal styles
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  classSelection: {
    maxHeight: 60,
    marginBottom: 16,
  },
  classChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 16,
  },
  studentsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    minWidth: 120,
  },
});

export default CheckIn;
