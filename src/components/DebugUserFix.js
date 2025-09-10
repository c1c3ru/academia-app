import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import { fixUsersInFirestore, listAllUsers } from '../utils/fixUsers';

const DebugUserFix = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleFixUsers = async () => {
    try {
      setLoading(true);
      setResult('Corrigindo usuários...');
      
      const success = await fixUsersInFirestore();
      
      if (success) {
        setResult('✅ Usuários corrigidos com sucesso! Recarregue a página.');
        Alert.alert('Sucesso', 'Usuários corrigidos! Recarregue a página para ver as mudanças.');
      } else {
        setResult('❌ Erro ao corrigir usuários. Verifique o console.');
        Alert.alert('Erro', 'Erro ao corrigir usuários. Verifique o console.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setResult(`❌ Erro: ${error.message}`);
      Alert.alert('Erro', `Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleListUsers = async () => {
    try {
      setLoading(true);
      setResult('Listando usuários... (verifique o console)');
      
      await listAllUsers();
      setResult('✅ Usuários listados no console');
    } catch (error) {
      console.error('Erro:', error);
      setResult(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>🔧 Debug - Correção de Usuários</Text>
        <Text style={styles.subtitle}>
          Use estes botões para corrigir os usuários sem academiaId
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleFixUsers}
            disabled={loading}
            style={[styles.button, styles.fixButton]}
            icon="account-wrench"
          >
            Corrigir Usuários IFCE
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleListUsers}
            disabled={loading}
            style={styles.button}
            icon="account-group"
          >
            Listar Todos os Usuários
          </Button>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Processando...</Text>
          </View>
        )}
        
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        )}
        
        <Text style={styles.warning}>
          ⚠️ Este componente é apenas para debug. Remova após a correção.
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#E65100',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    marginVertical: 4,
  },
  fixButton: {
    backgroundColor: '#4CAF50',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  warning: {
    fontSize: 12,
    color: '#F44336',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default DebugUserFix;
