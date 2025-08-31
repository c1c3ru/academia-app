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
import { firestoreService, classService } from '../../services/firestoreService';

const AdminClasses = ({ navigation }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classesData = await classService.getAllClasses();
      setClasses(classesData || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as turmas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  const handleAddClass = () => {
    navigation.navigate('AddClass');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ea" />
          <Text style={styles.loadingText}>Carregando turmas...</Text>
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
          <Title style={styles.title}>Gerenciar Turmas</Title>
          <Paragraph style={styles.subtitle}>
            Total de {classes.length} turmas
          </Paragraph>
        </View>

        {classes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <Ionicons name="school-outline" size={64} color="#ccc" />
                <Title style={styles.emptyTitle}>Nenhuma turma encontrada</Title>
                <Paragraph style={styles.emptyText}>
                  Comece criando sua primeira turma
                </Paragraph>
                <Button 
                  mode="contained" 
                  onPress={handleAddClass}
                  style={styles.emptyButton}
                >
                  Criar Primeira Turma
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
                      {classes.filter(c => c.status === 'active').length}
                    </Text>
                    <Text style={styles.statLabel}>Ativas</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
                    </Text>
                    <Text style={styles.statLabel}>Total Alunos</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {[...new Set(classes.map(c => c.modality))].length}
                    </Text>
                    <Text style={styles.statLabel}>Modalidades</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Lista de Turmas */}
            {classes.map((classItem, index) => (
              <Card key={classItem.id} style={styles.classCard}>
                <Card.Content>
                  <View style={styles.classHeader}>
                    <View style={styles.classInfo}>
                      <Title style={styles.className}>{classItem.name}</Title>
                      <Paragraph style={styles.classModality}>
                        {classItem.modality}
                      </Paragraph>
                    </View>
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        classItem.status === 'active' ? styles.activeChip : styles.inactiveChip
                      ]}
                    >
                      {classItem.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Chip>
                  </View>

                  <View style={styles.classDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="people-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {classItem.currentStudents || 0}/{classItem.maxStudents || 0} alunos
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {typeof classItem.schedule === 'object' && classItem.schedule
                          ? `${classItem.schedule.dayOfWeek} ${classItem.schedule.startTime}-${classItem.schedule.endTime}`
                          : classItem.schedule || 'Horário não definido'
                        }
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="person-outline" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {classItem.instructorName || 'Instrutor não definido'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.classActions}>
                    <Button 
                      mode="outlined" 
                      onPress={() => navigation.navigate('ClassDetails', { classId: classItem.id })}
                      style={styles.actionButton}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => navigation.navigate('EditClass', { classId: classItem.id })}
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
        label="Nova Turma"
        onPress={handleAddClass}
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
  classCard: {
    marginBottom: 16,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  classModality: {
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 12,
  },
  activeChip: {
    backgroundColor: '#e8f5e8',
  },
  inactiveChip: {
    backgroundColor: '#ffeaea',
  },
  classDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  classActions: {
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

export default AdminClasses;
