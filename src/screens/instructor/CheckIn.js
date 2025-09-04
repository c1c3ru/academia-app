import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Title, 
  Text,
  Button,
  List,
  Chip,
  Surface,
  Divider,
  FAB
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResponsiveUtils } from '../../utils/animations';

const CheckIn = ({ navigation }) => {
  const [activeCheckIns, setActiveCheckIns] = useState([
    {
      id: 1,
      aula: 'Karatê Iniciante',
      horario: '19:00',
      alunos: 12,
      capacidade: 20,
      status: 'ativo'
    },
    {
      id: 2,
      aula: 'Muay Thai Avançado',
      horario: '20:30',
      alunos: 8,
      capacidade: 15,
      status: 'aguardando'
    }
  ]);

  const [recentCheckIns, setRecentCheckIns] = useState([
    { id: 1, aluno: 'João Silva', aula: 'Karatê', horario: '18:45' },
    { id: 2, aluno: 'Maria Santos', aula: 'Karatê', horario: '18:47' },
    { id: 3, aluno: 'Pedro Costa', aula: 'Karatê', horario: '18:50' }
  ]);

  const handleStartCheckIn = (aulaId) => {
    console.log('Iniciando check-in para aula:', aulaId);
  };

  const handleStopCheckIn = (aulaId) => {
    console.log('Parando check-in para aula:', aulaId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Check-ins Ativos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="qrcode-scan" size={32} color="#2196F3" />
              <Title style={styles.title}>Check-ins Ativos</Title>
            </View>
            
            {activeCheckIns.length > 0 ? (
              activeCheckIns.map((checkIn) => (
                <Surface key={checkIn.id} style={styles.checkInItem}>
                  <View style={styles.checkInHeader}>
                    <Text style={styles.aulaName}>{checkIn.aula}</Text>
                    <Chip 
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: checkIn.status === 'ativo' ? '#4CAF50' : '#FF9800' }
                      ]}
                      textStyle={{ color: 'white' }}
                    >
                      {checkIn.status === 'ativo' ? 'Ativo' : 'Aguardando'}
                    </Chip>
                  </View>
                  
                  <View style={styles.checkInDetails}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="clock" size={16} color="#666" />
                      <Text style={styles.detailText}>{checkIn.horario}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="account-group" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {checkIn.alunos}/{checkIn.capacidade} alunos
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    {checkIn.status === 'ativo' ? (
                      <Button
                        mode="outlined"
                        onPress={() => handleStopCheckIn(checkIn.id)}
                        buttonColor="#FFEBEE"
                        textColor="#F44336"
                        compact
                      >
                        Parar Check-in
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        onPress={() => handleStartCheckIn(checkIn.id)}
                        buttonColor="#4CAF50"
                        compact
                      >
                        Iniciar Check-in
                      </Button>
                    )}
                  </View>
                </Surface>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="qrcode-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum check-in ativo</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Check-ins Recentes */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="history" size={32} color="#FF9800" />
              <Title style={styles.title}>Check-ins Recentes</Title>
            </View>
            
            {recentCheckIns.map((checkIn) => (
              <List.Item
                key={checkIn.id}
                title={checkIn.aluno}
                description={`${checkIn.aula} • ${checkIn.horario}`}
                left={() => (
                  <List.Icon 
                    icon="check-circle" 
                    color="#4CAF50" 
                  />
                )}
              />
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="qrcode-plus"
        style={styles.fab}
        onPress={() => console.log('Novo check-in manual')}
        label="Novo Check-in"
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default CheckIn;
