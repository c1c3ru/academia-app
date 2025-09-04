
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Divider,
  List,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { ResponsiveUtils } from '../../utils/animations';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [nextClasses, setNextClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Simular dados para demonstração
    setNextClasses([
      {
        id: 1,
        name: 'Karate Básico',
        time: '18:00',
        date: 'Hoje',
        instructor: 'Prof. João',
      },
      {
        id: 2,
        name: 'Jiu-Jitsu',
        time: '19:30',
        date: 'Amanhã',
        instructor: 'Prof. Maria',
      },
    ]);

    setAnnouncements([
      {
        id: 1,
        title: 'Nova modalidade disponível',
        message: 'Agora oferecemos aulas de Muay Thai!',
        date: 'Hoje',
      },
      {
        id: 2,
        title: 'Feriado na próxima semana',
        message: 'Não haverá aulas na terça-feira.',
        date: 'Ontem',
      },
    ]);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header de Boas-vindas */}
        <AnimatedCard style={styles.welcomeCard} animationType="fadeIn" delay={0}>
          <Card.Content style={styles.welcomeContent}>
            <Avatar.Icon 
              size={ResponsiveUtils?.isTablet?.() ? 80 : 60} 
              icon="account" 
              style={styles.avatar}
            />
            <View style={styles.welcomeText}>
              <Title style={styles.welcomeTitle}>
                Olá, {userProfile?.name || 'Aluno'}!
              </Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Bem-vindo de volta à academia
              </Paragraph>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Status da Graduação */}
        <AnimatedCard style={styles.card} animationType="slideInRight" delay={100}>
          <Card.Content>
            <Title style={styles.cardTitle}>Status da Graduação</Title>
            <View style={styles.graduationStatus}>
              <Chip 
                icon="trophy" 
                mode="outlined"
                style={styles.graduationChip}
              >
                Faixa Branca
              </Chip>
              <Paragraph style={styles.graduationText}>
                Próxima avaliação em 2 meses
              </Paragraph>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Próximas Aulas */}
        <AnimatedCard style={styles.card} animationType="fadeIn" delay={200}>
          <Card.Content>
            <Title style={styles.cardTitle}>Próximas Aulas</Title>
            {nextClasses.length > 0 ? (
              nextClasses.map((classItem, index) => (
                <List.Item
                  key={classItem.id}
                  title={classItem.name}
                  description={`${classItem.date} às ${classItem.time} - ${classItem.instructor}`}
                  left={props => <List.Icon {...props} icon="calendar" />}
                  style={styles.listItem}
                />
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma aula agendada
              </Paragraph>
            )}
            
            <AnimatedButton 
              mode="text" 
              onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}
              style={styles.viewAllButton}
            >
              Ver Calendário Completo
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Avisos e Comunicados */}
        <AnimatedCard style={styles.card} animationType="scaleIn" delay={300}>
          <Card.Content>
            <Title style={styles.cardTitle}>Avisos</Title>
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <View key={announcement.id} style={styles.announcementItem}>
                  <Paragraph style={styles.announcementTitle}>
                    {announcement.title}
                  </Paragraph>
                  <Paragraph style={styles.announcementMessage}>
                    {announcement.message}
                  </Paragraph>
                  <Paragraph style={styles.announcementDate}>
                    {announcement.date}
                  </Paragraph>
                  {index < announcements.length - 1 && <Divider style={styles.announcementDivider} />}
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhum aviso no momento
              </Paragraph>
            )}
          </Card.Content>
        </AnimatedCard>

        {/* Ações Rápidas */}
        <AnimatedCard style={styles.card} animationType="bounceIn" delay={400}>
          <Card.Content>
            <Title style={styles.cardTitle}>Ações Rápidas</Title>
            <View style={styles.quickActions}>
              <AnimatedButton
                mode="outlined"
                icon="calendar-check"
                onPress={() => Alert.alert('Info', 'Check-in em desenvolvimento')}
                style={styles.quickActionButton}
              >
                Check-in
              </AnimatedButton>
              
              <AnimatedButton
                mode="outlined"
                icon="credit-card"
                onPress={() => Alert.alert('Info', 'Pagamentos em desenvolvimento')}
                style={styles.quickActionButton}
              >
                Pagamentos
              </AnimatedButton>
            </View>
          </Card.Content>
        </AnimatedCard>

      </ScrollView>
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
  },
  scrollContent: {
    padding: ResponsiveUtils?.spacing?.sm || 8,
    paddingBottom: ResponsiveUtils?.spacing?.xl || 32,
  },
  welcomeCard: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
    backgroundColor: '#2196F3',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeText: {
    marginLeft: ResponsiveUtils?.spacing?.md || 16,
    flex: 1,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: ResponsiveUtils?.fontSize?.large || 20,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: ResponsiveUtils?.fontSize?.small || 14,
  },
  card: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
  cardTitle: {
    fontSize: ResponsiveUtils?.fontSize?.large || 18,
    fontWeight: '600',
    marginBottom: ResponsiveUtils?.spacing?.md || 12,
    color: '#2196F3',
  },
  graduationStatus: {
    alignItems: 'center',
  },
  graduationChip: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
  graduationText: {
    textAlign: 'center',
    color: '#666',
  },
  listItem: {
    paddingHorizontal: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: ResponsiveUtils?.spacing?.md || 16,
  },
  viewAllButton: {
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
  },
  announcementItem: {
    marginBottom: ResponsiveUtils?.spacing?.md || 12,
  },
  announcementTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: ResponsiveUtils?.spacing?.xs || 4,
  },
  announcementMessage: {
    color: '#666',
    marginBottom: ResponsiveUtils?.spacing?.xs || 4,
  },
  announcementDate: {
    color: '#999',
    fontSize: ResponsiveUtils?.fontSize?.small || 12,
  },
  announcementDivider: {
    marginTop: ResponsiveUtils?.spacing?.md || 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: ResponsiveUtils?.spacing?.xs || 4,
  },
});

export default StudentDashboard;
