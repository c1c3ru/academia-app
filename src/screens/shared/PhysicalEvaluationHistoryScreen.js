import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  FAB,
  Chip,
  Divider,
  Surface,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

const PhysicalEvaluationHistoryScreen = ({ navigation }) => {
  const { user, academia } = useAuth();
  
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      
      const evaluationData = await firestoreService.getDocuments(
        `academias/${academia.id}/physicalEvaluations`,
        [{ field: 'userId', operator: '==', value: user.uid }],
        [{ field: 'date', direction: 'desc' }]
      );
      
      setEvaluations(evaluationData);
    } catch (error) {
      console.error('Erro ao carregar avaliações físicas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvaluations();
  };

  const getIMCColor = (classification) => {
    switch (classification) {
      case 'Abaixo do peso': return '#FF9800';
      case 'Peso normal': return '#4CAF50';
      case 'Sobrepeso': return '#FF9800';
      case 'Obesidade grau I': return '#FF5722';
      case 'Obesidade grau II': return '#F44336';
      case 'Obesidade grau III': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const evalDate = date.toDate ? date.toDate() : new Date(date);
    return evalDate.toLocaleDateString('pt-BR');
  };

  const getChartData = () => {
    if (evaluations.length === 0) return null;

    const sortedEvaluations = [...evaluations].reverse(); // Ordem cronológica
    const labels = sortedEvaluations.map(evaluation => {
      const date = evaluation.date.toDate ? evaluation.date.toDate() : new Date(evaluation.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    let data;
    let suffix = '';
    
    switch (selectedMetric) {
      case 'weight':
        data = sortedEvaluations.map(evaluation => evaluation.weight);
        suffix = ' kg';
        break;
      case 'imc':
        data = sortedEvaluations.map(evaluation => evaluation.imc);
        suffix = '';
        break;
      case 'bodyFat':
        data = sortedEvaluations.filter(evaluation => evaluation.bodyFat).map(evaluation => evaluation.bodyFat);
        suffix = '%';
        break;
      case 'muscleMass':
        data = sortedEvaluations.filter(evaluation => evaluation.muscleMass).map(evaluation => evaluation.muscleMass);
        suffix = ' kg';
        break;
      default:
        data = sortedEvaluations.map(evaluation => evaluation.weight);
        suffix = ' kg';
    }

    if (data.length === 0) return null;

    return {
      labels: labels.slice(-10), // Últimas 10 medições
      datasets: [
        {
          data: data.slice(-10),
          strokeWidth: 3,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        },
      ],
      suffix
    };
  };

  const getLatestEvaluation = () => {
    return evaluations.length > 0 ? evaluations[0] : null;
  };

  const getProgress = () => {
    if (evaluations.length < 2) return null;

    const latest = evaluations[0];
    const previous = evaluations[1];
    
    const weightDiff = latest.weight - previous.weight;
    const imcDiff = latest.imc - previous.imc;
    
    return {
      weight: weightDiff,
      imc: imcDiff,
      bodyFat: latest.bodyFat && previous.bodyFat ? latest.bodyFat - previous.bodyFat : null,
      muscleMass: latest.muscleMass && previous.muscleMass ? latest.muscleMass - previous.muscleMass : null
    };
  };

  const chartData = getChartData();
  const latestEvaluation = getLatestEvaluation();
  const progress = getProgress();

  const metrics = [
    { key: 'weight', label: 'Peso', icon: 'scale-outline' },
    { key: 'imc', label: 'IMC', icon: 'calculator-outline' },
    { key: 'bodyFat', label: 'Gordura', icon: 'body-outline' },
    { key: 'muscleMass', label: 'Músculo', icon: 'fitness-outline' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Resumo Atual */}
        {latestEvaluation && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="fitness-outline" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Avaliação Atual</Text>
                <Text style={styles.dateText}>{formatDate(latestEvaluation.date)}</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.weight} kg</Text>
                  <Text style={styles.statLabel}>Peso</Text>
                </Surface>
                
                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.imc}</Text>
                  <Text style={styles.statLabel}>IMC</Text>
                </Surface>
                
                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.height} cm</Text>
                  <Text style={styles.statLabel}>Altura</Text>
                </Surface>
                
                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.age} anos</Text>
                  <Text style={styles.statLabel}>Idade</Text>
                </Surface>
              </View>

              <View style={styles.imcContainer}>
                <Chip 
                  mode="flat"
                  style={[styles.imcChip, { backgroundColor: getIMCColor(latestEvaluation.imcClassification) }]}
                  textStyle={{ color: 'white', fontWeight: 'bold' }}
                >
                  {latestEvaluation.imcClassification}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Progresso */}
        {progress && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up-outline" size={24} color="#2196F3" />
                <Text style={styles.cardTitle}>Progresso</Text>
                <Text style={styles.subtitle}>vs. avaliação anterior</Text>
              </View>
              
              <View style={styles.progressGrid}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Peso</Text>
                  <Text style={[
                    styles.progressValue,
                    { color: progress.weight > 0 ? '#FF5722' : progress.weight < 0 ? '#4CAF50' : '#666' }
                  ]}>
                    {progress.weight > 0 ? '+' : ''}{progress.weight.toFixed(1)} kg
                  </Text>
                </View>
                
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>IMC</Text>
                  <Text style={[
                    styles.progressValue,
                    { color: progress.imc > 0 ? '#FF5722' : progress.imc < 0 ? '#4CAF50' : '#666' }
                  ]}>
                    {progress.imc > 0 ? '+' : ''}{progress.imc.toFixed(2)}
                  </Text>
                </View>
                
                {progress.bodyFat !== null && (
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Gordura</Text>
                    <Text style={[
                      styles.progressValue,
                      { color: progress.bodyFat > 0 ? '#FF5722' : progress.bodyFat < 0 ? '#4CAF50' : '#666' }
                    ]}>
                      {progress.bodyFat > 0 ? '+' : ''}{progress.bodyFat.toFixed(1)}%
                    </Text>
                  </View>
                )}
                
                {progress.muscleMass !== null && (
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Músculo</Text>
                    <Text style={[
                      styles.progressValue,
                      { color: progress.muscleMass > 0 ? '#4CAF50' : progress.muscleMass < 0 ? '#FF5722' : '#666' }
                    ]}>
                      {progress.muscleMass > 0 ? '+' : ''}{progress.muscleMass.toFixed(1)} kg
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Gráfico de Evolução */}
        {chartData && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="analytics-outline" size={24} color="#9C27B0" />
                <Text style={styles.cardTitle}>Evolução</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsContainer}>
                {metrics.map((metric) => (
                  <Chip
                    key={metric.key}
                    mode={selectedMetric === metric.key ? 'flat' : 'outlined'}
                    selected={selectedMetric === metric.key}
                    onPress={() => setSelectedMetric(metric.key)}
                    style={styles.metricChip}
                    icon={metric.icon}
                  >
                    {metric.label}
                  </Chip>
                ))}
              </ScrollView>

              <LineChart
                data={chartData}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: selectedMetric === 'imc' ? 2 : 1,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#2196F3',
                    fill: '#ffffff'
                  },
                  formatXLabel: (value) => value,
                  formatYLabel: (value) => `${value}${chartData.suffix}`,
                }}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        {/* Histórico */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color="#FF9800" />
              <Text style={styles.cardTitle}>Histórico de Avaliações</Text>
            </View>
            
            {evaluations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma avaliação física encontrada</Text>
                <Text style={styles.emptySubtext}>Faça sua primeira avaliação para começar a acompanhar sua evolução</Text>
              </View>
            ) : (
              evaluations.map((evaluation, index) => (
                <View key={evaluation.id || index}>
                  <List.Item
                    title={`${evaluation.weight} kg • IMC ${evaluation.imc}`}
                    description={`${formatDate(evaluation.date)} • ${evaluation.imcClassification}`}
                    left={() => <List.Icon icon="scale" />}
                    right={() => <List.Icon icon="chevron-right" />}
                    onPress={() => navigation.navigate('PhysicalEvaluation', {
                      evaluation,
                      isEditing: true
                    })}
                  />
                  {index < evaluations.length - 1 && <Divider />}
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('PhysicalEvaluation')}
        label="Nova Avaliação"
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
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  imcContainer: {
    alignItems: 'center',
  },
  imcChip: {
    elevation: 2,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricChip: {
    marginRight: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default PhysicalEvaluationHistoryScreen;