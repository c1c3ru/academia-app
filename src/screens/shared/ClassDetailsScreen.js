import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Alert, Dimensions } from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Divider,
  Badge,
  FAB,
  Surface,
  Avatar,
  Chip,
  Snackbar
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreService } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

const ClassDetailsScreen = ({ route, navigation }) => {
  const { classId, classData } = route.params || {};
  const [classInfo, setClassInfo] = useState(classData || null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(!classData);
  const [refreshing, setRefreshing] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    }
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      
      if (!classData) {
        const classDetails = await firestoreService.getById('classes', classId);
        setClassInfo(classDetails);
      }
      
      // Buscar alunos da turma
      const allStudents = await firestoreService.getAll('users');
      const classStudents = allStudents.filter(student => 
        student.userType === 'student' && 
        student.classIds && 
        student.classIds.includes(classId)
      );
      setStudents(classStudents);
      
    } catch (error) {
      console.error('Erro ao carregar detalhes da turma:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClassDetails();
  };

  const handleDeleteClass = () => {
    if (!classId) return;
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      'Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita e todos os alunos serão desvinculados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.delete('classes', classId);
              setSnackbar({
                visible: true,
                message: '✅ Turma excluída com sucesso!',
                type: 'success'
              });
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (error) {
              console.error('❌ Erro ao excluir turma:', error);
              setSnackbar({
                visible: true,
                message: '❌ Erro ao excluir turma. Tente novamente.',
                type: 'error'
              });
            }
          }
        }
      ]
    );
  };

  const formatSchedule = (schedule) => {
    if (!schedule || !Array.isArray(schedule)) return 'Não definido';
    return schedule.map(s => `${s.day} - ${s.time}`).join(', ');
  };

  const getModalityColor = (modality) => {
    const colors = {
      'Jiu-Jitsu': '#2196F3',
      'Muay Thai': '#F44336',
      'MMA': '#FF9800',
      'Boxe': '#4CAF50'
    };
    return colors[modality] || '#666';
  };

  if (loading && !classInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando detalhes da turma...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header da Turma */}
        <Surface style={styles.headerCard} elevation={4}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classInfo?.name || 'Turma'}</Text>
                <Chip 
                  mode="flat"
                  style={[styles.modalityChip, { backgroundColor: getModalityColor(classInfo?.modality) }]}
                  textStyle={styles.modalityText}
                >
                  {classInfo?.modality || 'Modalidade'}
                </Chip>
              </View>
              <Avatar.Icon 
                size={60} 
                icon="school" 
                style={[styles.classAvatar, { backgroundColor: getModalityColor(classInfo?.modality) }]}
              />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color="#2196F3" />
                <Text style={styles.statNumber}>{students.length}</Text>
                <Text style={styles.statLabel}>Alunos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time" size={24} color="#4CAF50" />
                <Text style={styles.statNumber}>{classInfo?.schedule?.length || 0}</Text>
                <Text style={styles.statLabel}>Horários</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={24} color="#FF9800" />
                <Text style={styles.statNumber}>{classInfo?.level || 'Todos'}</Text>
                <Text style={styles.statLabel}>Nível</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Informações Detalhadas */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📋 Informações</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={24} color="#2196F3" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Instrutor</Text>
                <Text style={styles.infoValue}>{classInfo?.instructor || 'Não definido'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={24} color="#4CAF50" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Horários</Text>
                <Text style={styles.infoValue}>{formatSchedule(classInfo?.schedule)}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={24} color="#FF9800" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Capacidade</Text>
                <Text style={styles.infoValue}>
                  {students.length} / {classInfo?.maxStudents || '∞'} alunos
                </Text>
              </View>
            </View>
            
            {classInfo?.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.infoLabel}>Descrição</Text>
                <Text style={styles.descriptionText}>{classInfo.description}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Botão Alunos */}
        <Card style={styles.studentsCard}>
          <Card.Content>
            <View style={styles.studentsHeader}>
              <View style={styles.studentsInfo}>
                <Text style={styles.sectionTitle}>👥 Alunos Matriculados</Text>
                <Text style={styles.studentsCount}>{students.length} aluno{students.length !== 1 ? 's' : ''}</Text>
              </View>
              <Button
                mode={showStudents ? "contained" : "outlined"}
                onPress={() => setShowStudents(!showStudents)}
                icon={showStudents ? "chevron-up" : "chevron-down"}
                style={styles.toggleButton}
              >
                {showStudents ? 'Ocultar' : 'Ver Alunos'}
              </Button>
            </View>
            
            {showStudents && (
              <View style={styles.studentsList}>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <Surface key={student.id || index} style={styles.studentItem} elevation={1}>
                      <View style={styles.studentInfo}>
                        <Avatar.Text 
                          size={40} 
                          label={student.name?.charAt(0)?.toUpperCase() || 'A'}
                          style={styles.studentAvatar}
                        />
                        <View style={styles.studentDetails}>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.studentEmail}>{student.email}</Text>
                        </View>
                      </View>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => navigation.navigate('StudentDetails', { 
                          studentId: student.id, 
                          studentData: student 
                        })}
                        style={styles.studentButton}
                      >
                        Ver Perfil
                      </Button>
                    </Surface>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>Nenhum aluno matriculado</Text>
                    <Text style={styles.emptySubtext}>Os alunos aparecerão aqui quando se matricularem</Text>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Ações Rápidas */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
            
            <View style={styles.actionsGrid}>
              <Surface style={styles.actionItem} elevation={2}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('CheckIns', { 
                    classId: classId, 
                    className: classInfo?.name 
                  })}
                  style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  {"\n"}Check-ins
                </Button>
              </Surface>
              
              <Surface style={styles.actionItem} elevation={2}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('ClassStudents', { classId: classId })}
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  <Ionicons name="person-add" size={20} color="white" />
                  {"\n"}Gerenciar
                </Button>
              </Surface>
            </View>
            
            <Divider style={styles.actionDivider} />
            
            <Button
              mode="contained"
              onPress={handleDeleteClass}
              style={styles.deleteButton}
              contentStyle={styles.deleteButtonContent}
              icon="delete"
            >
              Excluir Turma
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
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
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header Card Styles
  headerCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  classInfo: {
    flex: 1,
    marginRight: 16,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalityChip: {
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
  modalityText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  classAvatar: {
    backgroundColor: '#2196F3',
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  
  // Details Card
  detailsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
  },
  
  // Students Card
  studentsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentsInfo: {
    flex: 1,
  },
  studentsCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  toggleButton: {
    borderRadius: 8,
  },
  studentsList: {
    marginTop: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    backgroundColor: '#2196F3',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  studentButton: {
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Actions Card
  actionsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionItem: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  actionButton: {
    borderRadius: 8,
    minHeight: 60,
  },
  actionButtonContent: {
    height: 60,
    flexDirection: 'column',
  },
  actionButtonLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionDivider: {
    marginVertical: 16,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
  },
  deleteButtonContent: {
    height: 48,
  },
});

export default ClassDetailsScreen;
