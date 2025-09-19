import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  FAB,
  Searchbar,
  Menu,
  IconButton,
  TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { academyFirestoreService, academyStudentService } from '../../services/academyFirestoreService';

const InstructorStudents = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  // Advanced filters
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [modalityMenuVisible, setModalityMenuVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState(''); // 'male' | 'female' | ''
  const [selectedModalityId, setSelectedModalityId] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [enrollmentStart, setEnrollmentStart] = useState(''); // YYYY-MM-DD
  const [enrollmentEnd, setEnrollmentEnd] = useState(''); // YYYY-MM-DD
  const [classes, setClasses] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      loadInitialData();
    }, [userProfile?.academiaId])
  );

  useEffect(() => {
    filterStudents();
  }, [searchQuery, selectedFilter, students, selectedGender, selectedModalityId, ageMin, ageMax, enrollmentStart, enrollmentEnd]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log(getString('loadingStudentsInstructor'), user.uid);
      
      // Verificar se o usuário tem academiaId
      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        setStudents([]);
        setClasses([]);
        setModalities([]);
        return;
      }
      
      // Load students with error handling
      let instructorStudents = [];
      try {
        // Buscar alunos do instrutor usando o service academy-scoped
        instructorStudents = await academyStudentService.getStudentsByInstructor(user.uid, userProfile.academiaId);
        console.log(`✅ ${instructorStudents.length} alunos encontrados via service`);
      } catch (studentError) {
        console.warn(getString('errorSearchingStudentsService'), studentError);
        instructorStudents = [];
      }
      setStudents(instructorStudents);
      
      // Load classes for this instructor with error handling
      let instructorClasses = [];
      try {
        instructorClasses = await academyFirestoreService.getWhere('classes', 'instructorId', '==', user.uid, userProfile.academiaId);
        console.log(getString('classesFound').replace('{count}', instructorClasses.length));
      } catch (classError) {
        console.warn(getString('errorSearchingClasses'), classError);
        instructorClasses = [];
      }
      setClasses(instructorClasses || []);
      
      // Load modalities (for filter options) with error handling
      let allModalities = [];
      try {
        allModalities = await academyFirestoreService.getAll('modalities', userProfile.academiaId);
        console.log(getString('modalitiesLoaded').replace('{count}', allModalities.length));
      } catch (modalityError) {
        console.warn(getString('errorSearchingModalities'), modalityError);
        allModalities = [];
      }
      setModalities(allModalities || []);
      
      console.log(getString('instructorDataLoaded'));
    } catch (error) {
      console.error(getString('generalErrorLoadingInstructorData'), error);
      // Em caso de erro total, definir arrays vazios para evitar crash
      setStudents([]);
      setClasses([]);
      setModalities([]);
      Alert.alert(getString('warning'), getString('limitedInfoWarning'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toDate = (val) => {
    if (!val) return null;
    // Firestore Timestamp
    if (val.seconds) return new Date(val.seconds * 1000);
    // ISO string or Date
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const calcAge = (birthDate) => {
    const d = toDate(birthDate);
    if (!d) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const classIdToModalityId = () => {
    const map = {};
    (classes || []).forEach(c => { if (c.id && c.modalityId) map[c.id] = c.modalityId; });
    return map;
  };

  const studentHasModality = (student, modalityId) => {
    if (!modalityId) return true;
    const idMap = classIdToModalityId();
    const classIds = student.classIds || [];
    for (const cid of classIds) {
      if (idMap[cid] === modalityId) return true;
    }
    // Fallback: check graduations modality if available (may store name or id)
    if (student.graduations && student.graduations.length > 0) {
      return student.graduations.some(g => g.modalityId === modalityId || g.modality === getModalityNameById(modalityId));
    }
    return false;
  };

  const getModalityNameById = (id) => (modalities.find(m => m.id === id)?.name || '');

  const filterStudents = () => {
    let filtered = students;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.currentGraduation && student.currentGraduation.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtro por status
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(s => s.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(s => s.isActive === false);
        break;
      case 'payment_pending':
        filtered = filtered.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'overdue');
        break;
      default:
        break;
    }

    // Filtro por gênero
    if (selectedGender) {
      filtered = filtered.filter(s => (s.gender || '').toLowerCase() === selectedGender);
    }

    // Filtro por faixa etária
    if (ageMin || ageMax) {
      const min = ageMin ? parseInt(ageMin, 10) : null;
      const max = ageMax ? parseInt(ageMax, 10) : null;
      filtered = filtered.filter(s => {
        const age = calcAge(s.birthDate);
        if (age === null) return false;
        if (min !== null && age < min) return false;
        if (max !== null && age > max) return false;
        return true;
      });
    }

    // Filtro por período de matrícula (createdAt)
    if (enrollmentStart || enrollmentEnd) {
      const start = enrollmentStart ? new Date(`${enrollmentStart}T00:00:00`) : null;
      const end = enrollmentEnd ? new Date(`${enrollmentEnd}T23:59:59`) : null;
      filtered = filtered.filter(s => {
        const created = toDate(s.createdAt);
        if (!created) return false;
        if (start && created < start) return false;
        if (end && created > end) return false;
        return true;
      });
    }

    // Filtro por modalidade
    if (selectedModalityId) {
      filtered = filtered.filter(s => studentHasModality(s, selectedModalityId));
    }

    setFilteredStudents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInitialData();
  };

  const handleStudentPress = (student) => {
    navigation.navigate('StudentProfile', { studentId: student.id, studentData: student });
  };

  const handleAddGraduation = (student) => {
    navigation.navigate('AddGraduation', { studentId: student.id, studentName: student.name });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return getString('paymentUpToDate');
      case 'pending': return getString('paymentPending');
      case 'overdue': return getString('paymentOverdue');
      default: return getString('paymentNA');
    }
  };

  const getFilterText = (filter) => {
    switch (filter) {
      case 'all': return getString('allStudents');
      case 'active': return getString('activeStudents');
      case 'inactive': return getString('inactiveStudents');
      case 'payment_pending': return getString('paymentPendingStudents');
      default: return getString('allStudents');
    }
  };

  const genderLabel = (g) => {
    if (!g) return getString('allGenders');
    if (g === 'male') return getString('male');
    if (g === 'female') return getString('female');
    return getString('other');
  };

  const clearFilters = () => {
    setSelectedFilter('all');
    setSelectedGender('');
    setSelectedModalityId('');
    setAgeMin('');
    setAgeMax('');
    setEnrollmentStart('');
    setEnrollmentEnd('');
  };

  const applyFilters = () => {
    // Os filtros são aplicados automaticamente via useEffect
    // Esta função pode ser usada para fechar menus ou mostrar feedback
    setGenderMenuVisible(false);
    setModalityMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder={getString('searchStudents')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filterRow}>
          <Menu
            visible={filterVisible}
            onDismiss={() => setFilterVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setFilterVisible(true)}
                icon="filter"
                style={styles.filterButton}
              >
                {getFilterText(selectedFilter)}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title={getString('allStudents')} />
            <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title={getString('activeStudents')} />
            <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title={getString('inactiveStudents')} />
            <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title={getString('paymentPendingStudents')} />
          </Menu>

          <Menu
            visible={genderMenuVisible}
            onDismiss={() => setGenderMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setGenderMenuVisible(true)}
                icon="account"
                style={styles.filterButton}
              >
                {genderLabel(selectedGender)}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSelectedGender(''); setGenderMenuVisible(false); }} title={getString('allGenders')} />
            <Menu.Item onPress={() => { setSelectedGender('male'); setGenderMenuVisible(false); }} title={getString('male')} />
            <Menu.Item onPress={() => { setSelectedGender('female'); setGenderMenuVisible(false); }} title={getString('female')} />
          </Menu>

          <Menu
            visible={modalityMenuVisible}
            onDismiss={() => setModalityMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setModalityMenuVisible(true)}
                icon="dumbbell"
                style={styles.filterButton}
              >
                {getModalityNameById(selectedModalityId) || getString('modality')}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSelectedModalityId(''); setModalityMenuVisible(false); }} title={getString('allModalities')} />
            {modalities.map(m => (
              <Menu.Item key={m.id} onPress={() => { setSelectedModalityId(m.id); setModalityMenuVisible(false); }} title={m.name} />
            ))}
          </Menu>
        </View>

        <View style={styles.filterActionsRow}>
          <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
            {getString('clearFilters')}
          </Button>
          <Button mode="contained" onPress={applyFilters} style={styles.applyButton}>
            {getString('applyFilters')}
          </Button>
        </View>

        <View style={styles.advancedFiltersRow}>
          <TextInput
            placeholder={getString('minAge')}
            value={ageMin}
            onChangeText={setAgeMin}
            mode="outlined"
            keyboardType="numeric"
            style={styles.advancedFilterInput}
          />
          <TextInput
            placeholder={getString('maxAge')}
            value={ageMax}
            onChangeText={setAgeMax}
            mode="outlined"
            keyboardType="numeric"
            style={styles.advancedFilterInput}
          />
          <TextInput
            label="Desde (AAAA-MM-DD)"
            value={enrollmentStart}
            onChangeText={setEnrollmentStart}
            mode="outlined"
            style={styles.advancedFilterLong}
          />
          <TextInput
            placeholder={getString('enrollmentEnd')}
            value={enrollmentEnd}
            onChangeText={setEnrollmentEnd}
            mode="outlined"
            style={styles.advancedFilterLong}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <Card key={student.id || index} style={styles.studentCard}>
              <Card.Content>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Avatar.Text 
                      size={50} 
                      label={student.name?.charAt(0) || 'A'} 
                      style={styles.avatar}
                    />
                    <View style={styles.studentDetails}>
                      <Title style={styles.studentName}>{student.name}</Title>
                      <Text style={styles.studentEmail}>{student.email}</Text>
                      {student.currentGraduation && (
                        <Chip 
                          mode="outlined" 
                          style={styles.graduationChip}
                          textStyle={styles.graduationText}
                        >
                          {student.currentGraduation}
                        </Chip>
                      )}
                    </View>
                  </View>
                  
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => handleStudentPress(student)}
                  />
                </View>

                <View style={styles.studentStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Status</Text>
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: student.isActive !== false ? '#4CAF50' : '#F44336' }
                      ]}
                      textStyle={{ 
                        color: student.isActive !== false ? '#4CAF50' : '#F44336',
                        fontSize: 12
                      }}
                    >
                      {student.isActive !== false ? 'Ativo' : 'Inativo'}
                    </Chip>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pagamento</Text>
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: getPaymentStatusColor(student.paymentStatus) }
                      ]}
                      textStyle={{ 
                        color: getPaymentStatusColor(student.paymentStatus),
                        fontSize: 12
                      }}
                    >
                      {getPaymentStatusText(student.paymentStatus)}
                    </Chip>
                  </View>
                </View>

                {student.graduations && student.graduations.length > 0 && (
                  <View style={styles.graduationsInfo}>
                    <Text style={styles.graduationsTitle}>Última graduação:</Text>
                    <Text style={styles.lastGraduation}>
                      {student.graduations[0]?.graduation} - {student.graduations[0]?.modality}
                    </Text>
                    <Text style={styles.graduationDate}>
                      {new Date(student.graduations[0]?.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                <View style={styles.studentActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleStudentPress(student)}
                    style={styles.actionButton}
                  >
                    {getString('viewProfile')}
                  </Button>

                  <Button 
                    mode="contained" 
                    onPress={() => handleAddGraduation(student)}
                    style={styles.actionButton}
                  >
                    {getString('graduation')}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.noStudentsText}>{getString('noStudentsFound')}</Text>
              <Text style={styles.noStudentsSubtext}>
                {getString('noStudentsMessage')}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {students.length > 0 && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>Resumo dos Alunos</Title>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{students.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.isActive !== false).length}
                  </Text>
                  <Text style={styles.statLabel}>Ativos</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.paymentStatus === 'paid').length}
                  </Text>
                  <Text style={styles.statLabel}>Em Dia</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.graduations && s.graduations.length > 0).length}
                  </Text>
                  <Text style={styles.statLabel}>Com Graduação</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="account-plus"
        label="Novo Aluno"
        onPress={() => navigation.navigate('AddStudent')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    borderColor: '#4CAF50',
  },
  advancedFilterRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterActionsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  advancedFilterInput: {
    flexGrow: 1,
    minWidth: 110,
    marginRight: 8,
    marginBottom: 8,
  },
  advancedFilterLong: {
    flexGrow: 2,
    minWidth: 160,
    marginRight: 8,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  studentCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#4CAF50',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  graduationChip: {
    alignSelf: 'flex-start',
  },
  graduationText: {
    fontSize: 10,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusChip: {
    borderWidth: 1,
  },
  graduationsInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  graduationsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  lastGraduation: {
    fontSize: 14,
    marginBottom: 2,
  },
  graduationDate: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    margin: 16,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
    backgroundColor: '#E8F5E8',
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default InstructorStudents;
