import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Card, Title, Paragraph, IconButton, Button, Chip, FAB, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const AdminStudents = ({ navigation }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const users = await firestoreService.getAll('users');
      const studentsList = users.filter(user => user.userType === 'student');
      setStudents(studentsList || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleAddStudent = () => {
    navigation.navigate('AddStudent');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#F44336';
      case 'suspended': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      default: return 'Indefinido';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ea" />
          <Text style={styles.loadingText}>Carregando alunos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.title}>Gerenciar Alunos</Title>
          <Paragraph style={styles.subtitle}>
            Total de {students.length} alunos
          </Paragraph>
        </View>

        {students.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Title style={styles.emptyTitle}>Nenhum aluno encontrado</Title>
                <Paragraph style={styles.emptyText}>
                  Comece adicionando seu primeiro aluno
                </Paragraph>
                <Button 
                  mode="contained" 
                  onPress={handleAddStudent}
                  style={styles.emptyButton}
                >
                  Adicionar Primeiro Aluno
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Estatísticas */}
            <Card style={styles.statsCard}>
              <Card.Content>
                <Title style={styles.statsTitle}>Estatísticas</Title>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {students.filter(s => s.status === 'active' || !s.status).length}
                    </Text>
                    <Text style={styles.statLabel}>Ativos</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {students.filter(s => s.status === 'inactive').length}
                    </Text>
                    <Text style={styles.statLabel}>Inativos</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {students.filter(s => s.status === 'suspended').length}
                    </Text>
                    <Text style={styles.statLabel}>Suspensos</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Lista de Alunos */}
            {students.map((student, index) => (
              <Card key={student.id || index} style={styles.studentCard}>
                <Card.Content>
                  <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                      <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {student.name?.charAt(0)?.toUpperCase() || 'A'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.studentDetails}>
                        <Title style={styles.studentName}>{student.name || 'Nome não informado'}</Title>
                        <Text style={styles.studentEmail}>{student.email || 'Email não informado'}</Text>
                        <Text style={styles.studentPhone}>{student.phone || 'Telefone não informado'}</Text>
                      </View>
                    </View>
                    
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(student.status || 'active') + '20' }
                      ]}
                      textStyle={{ color: getStatusColor(student.status || 'active') }}
                    >
                      {getStatusText(student.status || 'active')}
                    </Chip>
                  </View>

                  <View style={styles.studentMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.metaText}>
                        Cadastrado em: {student.createdAt ? 
                          new Date(student.createdAt.seconds * 1000).toLocaleDateString() : 
                          'Data não disponível'
                        }
                      </Text>
                    </View>
                    
                    {student.graduations && student.graduations.length > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons name="ribbon-outline" size={16} color="#666" />
                        <Text style={styles.metaText}>
                          Graduação: {student.currentGraduation || 'Não definida'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.studentActions}>
                    <Button 
                      mode="outlined" 
                      onPress={() => navigation.navigate('StudentDetails', { studentId: student.id })}
                      style={styles.actionButton}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => navigation.navigate('EditStudent', { studentId: student.id })}
                      style={styles.actionButton}
                    >
                      Editar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Novo Aluno"
        onPress={handleAddStudent}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emptyCard: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 16,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  studentCard: {
    marginBottom: 16,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentEmail: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  studentPhone: {
    color: '#666',
    fontSize: 14,
  },
  statusChip: {
    marginLeft: 12,
  },
  studentMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default AdminStudents;
