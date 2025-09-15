import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Divider,
  Badge
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreService } from '../../services/firestoreService';

const ClassDetailsScreen = ({ route, navigation }) => {
  const { classId, classData } = route.params || {};
  const [classInfo, setClassInfo] = useState(classData || null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(!classData);
  const [refreshing, setRefreshing] = useState(false);

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
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.delete('classes', classId);
              console.log('✅ Turma excluída:', classId);
              // Volta para a tela anterior
              navigation.goBack();
            } catch (error) {
              console.error('❌ Erro ao excluir turma:', error);
              Alert.alert('Erro', 'Não foi possível excluir a turma. Verifique suas permissões.');
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Informações da Turma */}
        <Card containerStyle={styles.card}>
          <View style={styles.classHeader}>
            <Text h3 style={styles.className}>{classInfo?.name || 'Turma'}</Text>
            <Badge 
              value={classInfo?.modality || 'Modalidade'} 
              badgeStyle={[styles.modalityBadge, { backgroundColor: getModalityColor(classInfo?.modality) }]}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#666" />
            <Text style={styles.infoText}>
              Instrutor: {classInfo?.instructor || 'Não definido'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#666" />
            <Text style={styles.infoText}>
              Horários: {formatSchedule(classInfo?.schedule)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color="#666" />
            <Text style={styles.infoText}>
              Alunos: {students.length} / {classInfo?.maxStudents || 'Ilimitado'}
            </Text>
          </View>
          
          {classInfo?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Descrição:</Text>
              <Text style={styles.descriptionText}>{classInfo.description}</Text>
            </View>
          )}
        </Card>

        {/* Lista de Alunos */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color="#2196F3" />
            <Text h4 style={styles.cardTitle}>Alunos Matriculados</Text>
          </View>
          
          {students.length > 0 ? (
            students.map((student, index) => (
              <List.Item
                key={student.id || index}
                title={student.name}
                description={student.email}
                left={(props) => <Ionicons name="person" size={20} color="#666" />}
                right={(props) => (
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => navigation.navigate('StudentProfile', { 
                      studentId: student.id, 
                      studentData: student 
                    })}
                  >
                    Ver Perfil
                  </Button>
                )}
              />
            ))
          ) : (
            <Text style={styles.noStudentsText}>
              Nenhum aluno matriculado nesta turma
            </Text>
          )}
        </Card>

        {/* Ações */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.cardTitle}>Ações</Text>
          
          <View style={styles.actionsContainer}>
            <Button
              title="Ver Check-ins"
              onPress={() => navigation.navigate('CheckIns', { 
                classId: classId, 
                className: classInfo?.name 
              })}
              buttonStyle={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              icon={<Ionicons name="checkmark-circle" size={20} color="white" />}
            />
            
            <Button
              title="Gerenciar Alunos"
              onPress={() => navigation.navigate('ClassStudents', { classId: classId })}
              buttonStyle={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              icon={<Ionicons name="person-add" size={20} color="white" />}
            />
            
            <Button
              title="Excluir Turma"
              onPress={handleDeleteClass}
              buttonStyle={[styles.actionButton, { backgroundColor: '#F44336' }]}
              icon={<Ionicons name="trash" size={20} color="white" />}
            />
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginTop: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',

      },

    }),
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  className: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
  noStudentsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
  },
});

export default ClassDetailsScreen;
