import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  TextInput,
  Divider,
  Text,
  Chip,
  List,
  Modal,
  Portal,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { firestoreService } from '../../services/firestoreService';
import PaymentDueDateEditor from '../../components/PaymentDueDateEditor';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, userProfile, updateUserProfile, logout, academia } = useAuth();
  const { getString } = useTheme();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    emergencyContact: '',
    medicalInfo: ''
  });
  
  // Estados para as novas funcionalidades
  const [trainingData, setTrainingData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearModal, setShowYearModal] = useState(false);
  const [physicalEvaluations, setPhysicalEvaluations] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [checkInStats, setCheckInStats] = useState({
    thisWeek: 0,
    total: 14,
    nextPayment: '03/10/2025'
  });
  
  // Estados para pagamentos
  const [currentPayment, setCurrentPayment] = useState(null);
  const [showPaymentEditor, setShowPaymentEditor] = useState(false);
  const [paymentDueNotification, setPaymentDueNotification] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        emergencyContact: userProfile.emergencyContact || '',
        medicalInfo: userProfile.medicalInfo || ''
      });
      
      // Carregar dados do aluno se for estudante
      if (userProfile.role === 'student') {
        loadStudentData();
        loadCurrentPayment();
        checkPaymentDueNotification();
      }
    }
  }, [userProfile]);
  
  const loadStudentData = async () => {
    if (!user || !academia) return;
    
    try {
      // Carregar dados de treino
      const trainingHistory = await firestoreService.getDocuments(
        `academias/${academia.id}/checkins`,
        [{ field: 'userId', operator: '==', value: user.uid }]
      );
      
      // Processar dados por ano/mês
      const processedData = processTrainingData(trainingHistory);
      setTrainingData(processedData);
      
      // Carregar avaliações físicas
      const evaluations = await firestoreService.getDocuments(
        `academias/${academia.id}/physicalEvaluations`,
        [{ field: 'userId', operator: '==', value: user.uid }]
      );
      setPhysicalEvaluations(evaluations);
      
      // Carregar lesões
      const userInjuries = await firestoreService.getDocuments(
        `academias/${academia.id}/injuries`,
        [{ field: 'userId', operator: '==', value: user.uid }]
      );
      setInjuries(userInjuries);
      
    } catch (error) {
      console.error(getString('loadingStudentData'), error);
    }
  };
  
  const processTrainingData = (trainingHistory) => {
    const data = {};
    
    trainingHistory.forEach(training => {
      const date = training.date.toDate ? training.date.toDate() : new Date(training.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      if (!data[year]) data[year] = {};
      if (!data[year][month]) data[year][month] = {};
      data[year][month][day] = true;
    });
    
    return data;
  };

  const loadCurrentPayment = async () => {
    if (!user || !academia) return;
    
    try {
      const payments = await firestoreService.getDocuments(
        `academias/${academia.id}/payments`,
        [{ field: 'userId', operator: '==', value: user.uid }]
      );
      
      // Encontrar pagamento atual (pendente ou mais recente)
      const current = payments.find(p => p.status === 'pending') || payments[0];
      setCurrentPayment(current);
      
    } catch (error) {
      console.error(getString('loadingPaymentData'), error);
    }
  };

  const checkPaymentDueNotification = async () => {
    if (!user || !academia || !currentPayment) return;
    
    try {
      const today = new Date();
      const dueDate = currentPayment.dueDate.toDate ? currentPayment.dueDate.toDate() : new Date(currentPayment.dueDate);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      // Mostrar notificação se vencer em 3 dias ou menos
      if (daysUntilDue <= 3 && daysUntilDue >= 0 && currentPayment.status === 'pending') {
        setPaymentDueNotification({
          daysUntilDue,
          dueDate: dueDate.toLocaleDateString('pt-BR'),
          amount: currentPayment.amount,
          planName: currentPayment.planName || getString('monthlyPayment')
        });
      }
      
    } catch (error) {
      console.error(getString('checkingPaymentDue'), error);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      setEditing(false);
      Alert.alert(getString('success'), getString('profileUpdatedSuccess'));
    } catch (error) {
      Alert.alert(getString('error'), getString('cannotUpdateProfile'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      getString('logout'),
      getString('confirmLogout'),
      [
        { text: getString('cancel'), style: 'cancel' },
        { 
          text: getString('logout'), 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const getUserTypeText = (userType) => {
    switch (userType) {
      case 'student': return getString('student');
      case 'instructor': return getString('instructor');
      case 'admin': return getString('administrator');
      default: return getString('user');
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'student': return '#2196F3';
      case 'instructor': return '#4CAF50';
      case 'admin': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header do Perfil */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text 
              size={80} 
              label={userProfile?.name?.charAt(0) || 'U'} 
              style={[styles.avatar, { backgroundColor: getUserTypeColor(userProfile?.userType) }]}
            />
            <View style={styles.headerText}>
              <Title style={styles.userName}>{userProfile?.name || getString('user')}</Title>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Chip 
                mode="outlined"
                style={[styles.userTypeChip, { borderColor: getUserTypeColor(userProfile?.userType) }]}
                textStyle={{ color: getUserTypeColor(userProfile?.userType) }}
              >
                {getUserTypeText(userProfile?.userType)}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Notificação de Vencimento */}
        {paymentDueNotification && (
          <Card style={[styles.card, styles.warningCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="warning-outline" size={24} color="#FF9800" />
                <Title style={[styles.cardTitle, { color: '#FF9800' }]}>{getString('paymentNearDue')}</Title>
              </View>
              
              <View style={styles.paymentWarning}>
                <Text style={styles.warningText}>
                  {getString('paymentDueText').replace('{planName}', paymentDueNotification.planName).replace('{days}', 
                    paymentDueNotification.daysUntilDue === 0 ? getString('paymentDueToday') : 
                    paymentDueNotification.daysUntilDue === 1 ? getString('paymentDueTomorrow') : 
                    `${paymentDueNotification.daysUntilDue} ${getString('paymentDueInDays')}`
                  )}
                </Text>
                <Text style={styles.warningDetails}>
                  {getString('dateLabel')}: {paymentDueNotification.dueDate} | {getString('valueLabel')}: R$ {paymentDueNotification.amount?.toFixed(2)}
                </Text>
                
                <View style={styles.warningButtons}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setShowPaymentEditor(true)}
                    style={styles.editDateButton}
                    icon="calendar-edit"
                  >
                    {getString('changeDate')}
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate('StudentPayments')}
                    style={styles.payNowButton}
                    icon="credit-card"
                  >
                    {getString('payNow')}
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Informações Pessoais */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="person-outline" size={24} color="#2196F3" />
              <Title style={styles.cardTitle}>{getString('personalInformation')}</Title>
              <Button 
                mode="text" 
                onPress={() => setEditing(!editing)}
                icon={editing ? "close" : "pencil"}
              >
                {editing ? getString('cancel') : getString('edit')}
              </Button>
            </View>

            {editing ? (
              <View>
                <TextInput
                  label={getString('fullName')}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label={getString('phoneWhatsApp')}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                
                <TextInput
                  label={getString('address')}
                  value={formData.address}
                  onChangeText={(text) => setFormData({...formData, address: text})}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                />
                
                <TextInput
                  label={getString('emergencyContact')}
                  value={formData.emergencyContact}
                  onChangeText={(text) => setFormData({...formData, emergencyContact: text})}
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label={getString('medicalInformation')}
                  value={formData.medicalInfo}
                  onChangeText={(text) => setFormData({...formData, medicalInfo: text})}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  placeholder={getString('allergiesMedicationsConditions')}
                />

                <Button 
                  mode="contained" 
                  onPress={handleSave}
                  style={styles.saveButton}
                  icon="check"
                >
                  {getString('saveChanges')}
                </Button>
              </View>
            ) : (
              <View>
                <List.Item
                  title={getString('name')}
                  description={userProfile?.name || getString('notInformed')}
                  left={() => <List.Icon icon="account" />}
                />
                <Divider />
                
                <List.Item
                  title={getString('phone')}
                  description={userProfile?.phone || getString('notInformed')}
                  left={() => <List.Icon icon="phone" />}
                />
                <Divider />
                
                <List.Item
                  title={getString('address')}
                  description={userProfile?.address || getString('notInformed')}
                  left={() => <List.Icon icon="map-marker" />}
                />
                <Divider />
                
                <List.Item
                  title={getString('emergencyContact')}
                  description={userProfile?.emergencyContact || getString('notInformed')}
                  left={() => <List.Icon icon="phone-alert" />}
                />
                <Divider />
                
                <List.Item
                  title={getString('medicalInformation')}
                  description={userProfile?.medicalInfo || getString('notInformed')}
                  left={() => <List.Icon icon="medical-bag" />}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Informações da Academia (apenas para alunos) */}
        {userProfile?.userType === 'student' && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name="school-outline" size={24} color="#4CAF50" />
                  <Title style={styles.cardTitle}>{getString('academyInformation')}</Title>
                </View>

                <List.Item
                  title={getString('currentGraduation')}
                  description={userProfile?.currentGraduation || getString('beginner')}
                  left={() => <List.Icon icon="trophy" color="#FFD700" />}
                />
                <Divider />
                
                <List.Item
                  title={getString('currentPlan')}
                  description={userProfile?.currentPlan || getString('notDefined')}
                  left={() => <List.Icon icon="card" />}
                />
                <Divider />
                
                <List.Item
                  title={getString('startDate')}
                  description={userProfile?.startDate ? 
                    new Date(userProfile.startDate).toLocaleDateString('pt-BR') : 
                    getString('notInformed')
                  }
                  left={() => <List.Icon icon="calendar-start" />}
                />
              </Card.Content>
            </Card>
            
            {/* Treinos esta semana */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar-outline" size={24} color="#2196F3" />
                  <Title style={styles.cardTitle}>Treinos esta semana</Title>
                  <Button 
                    mode="text" 
                    onPress={() => setShowYearModal(true)}
                    icon="plus"
                  >
                    + detalhes
                  </Button>
                </View>
                
                <View style={styles.weekDays}>
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                    <View key={index} style={styles.dayCircle}>
                      <Text style={styles.dayText}>{day}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.noTrainingText}>{getString('noTrainingThisWeek')}</Text>
              </Card.Content>
            </Card>
            
            {/* Contratos */}
            <Card style={styles.card}>
              <Card.Content>
                <List.Item
                  title={getString('contracts')}
                  description={`${getString('nextDueDate')}: ${checkInStats.nextPayment}`}
                  left={() => <List.Icon icon="file-document-outline" />}
                  right={() => <List.Icon icon="chevron-right" />}
                />
              </Card.Content>
            </Card>
            
            {/* Check-ins */}
            <Card style={styles.card}>
              <Card.Content>
                <List.Item
                  title={getString('checkIns')}
                  description={`${getString('checkInsThisWeek')}: ${checkInStats.thisWeek}/${checkInStats.total}`}
                  left={() => <List.Icon icon="check-circle-outline" />}
                  right={() => <List.Icon icon="chevron-right" />}
                />
              </Card.Content>
            </Card>
            
            {/* Avaliações físicas */}
            <Card style={styles.card}>
              <Card.Content>
                <List.Item
                  title={getString('physicalEvaluations')}
                  description={physicalEvaluations.length > 0 ? 
                    `${physicalEvaluations.length} ${getString('evaluationsRegistered')}` : 
                    getString('noEvaluationsRegistered')
                  }
                  left={() => <List.Icon icon="clipboard-pulse-outline" />}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => navigation.navigate('PhysicalEvaluationHistory')}
                />
              </Card.Content>
            </Card>
            
            {/* Minhas Lesões */}
            <Card style={styles.card}>
              <Card.Content>
                <List.Item
                  title={getString('myInjuries')}
                  description={injuries.length > 0 ? 
                    `${injuries.length} ${getString('injuriesRegistered')}` : 
                    getString('noInjuriesRegistered')
                  }
                  left={() => <List.Icon icon="bandage" />}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => navigation.navigate('InjuryHistory')}
                />
              </Card.Content>
            </Card>
          </>
        )}

        {/* Configurações da Conta */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="settings-outline" size={24} color="#666" />
              <Title style={styles.cardTitle}>Configurações da Conta</Title>
            </View>

            <List.Item
              title="Alterar Senha"
              description="Clique para alterar sua senha"
              left={() => <List.Icon icon="lock" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('ChangePassword')}
            />
            <Divider />
            
            <List.Item
              title="Avaliações Físicas"
              description="Acompanhe sua evolução física e IMC"
              left={() => <List.Icon icon="scale" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('PhysicalEvaluationHistory')}
            />
            <Divider />
            
            <List.Item
              title="Notificações"
              description="Configurar notificações do app"
              left={() => <List.Icon icon="bell" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <Divider />
            
            <List.Item
              title="Privacidade"
              description="Configurações de privacidade e LGPD"
              left={() => <List.Icon icon="shield" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('PrivacySettings')}
            />
          </Card.Content>
        </Card>

        {/* Ações da Conta */}
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              mode="outlined" 
              onPress={handleLogout}
              style={styles.logoutButton}
              icon="logout"
              textColor="#F44336"
            >
              Sair da Conta
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Modal Treinos no Ano */}
      <Portal>
        <Modal
          visible={showYearModal}
          onDismiss={() => setShowYearModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title
              title="Treinos no ano"
              left={() => <Ionicons name="calendar" size={24} color="#2196F3" />}
              right={() => (
                <Button onPress={() => setShowYearModal(false)} icon="close">
                  Fechar
                </Button>
              )}
            />
            
            <Card.Content>
              <View style={styles.yearSelector}>
                <Button 
                  mode="outlined" 
                  onPress={() => setSelectedYear(selectedYear - 1)}
                >
                  {selectedYear - 1}
                </Button>
                <Text style={styles.selectedYear}>{selectedYear}</Text>
              </View>
              
              <ScrollView style={styles.monthsContainer}>
                {renderMonthsGrid()}
              </ScrollView>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
      
      {/* Modal Editor de Data de Vencimento */}
      <PaymentDueDateEditor
        visible={showPaymentEditor}
        onDismiss={() => setShowPaymentEditor(false)}
        currentPayment={currentPayment}
        onUpdate={() => {
          loadCurrentPayment();
          checkPaymentDueNotification();
        }}
      />
    </SafeAreaView>
  );
  
  function renderMonthsGrid() {
    const months = [
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
    ];
    
    return (
      <View style={styles.monthsGrid}>
        {months.map((month, monthIndex) => {
          const monthData = trainingData[selectedYear]?.[monthIndex] || {};
          const trainingCount = Object.keys(monthData).length;
          
          return (
            <View key={monthIndex} style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthName}>{month}</Text>
                <Chip style={styles.monthChip} textStyle={styles.monthChipText}>
                  {trainingCount}
                </Chip>
              </View>
              
              <View style={styles.monthDays}>
                {renderMonthDays(monthIndex, monthData)}
              </View>
            </View>
          );
        })}
      </View>
    );
  }
  
  function renderMonthDays(monthIndex, monthData) {
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const hasTraining = monthData[day];
      days.push(
        <View
          key={day}
          style={[
            styles.dayDot,
            hasTraining ? styles.trainingDay : styles.noTrainingDay
          ]}
        />
      );
    }
    
    return days;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userTypeChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  paymentWarning: {
    marginTop: 8,
  },
  warningText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  warningDays: {
    fontWeight: 'bold',
    color: '#FF9800',
  },
  warningDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  warningButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editDateButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#FF9800',
  },
  payNowButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#4CAF50',
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
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    borderColor: '#F44336',
    marginTop: 8,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  noTrainingText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
  },
  modalCard: {
    maxHeight: '80%',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  selectedYear: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#2196F3',
  },
  monthsContainer: {
    maxHeight: 400,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  monthChip: {
    backgroundColor: '#2196F3',
    height: 24,
  },
  monthChipText: {
    color: 'white',
    fontSize: 12,
  },
  monthDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 1,
  },
  trainingDay: {
    backgroundColor: '#4CAF50',
  },
  noTrainingDay: {
    backgroundColor: '#e0e0e0',
  },
});

export default ProfileScreen;
