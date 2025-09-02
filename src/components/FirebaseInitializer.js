import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { auth, db } from '../services/firebase';

const FirebaseInitializer = ({ children }) => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Aguardar um pouco para garantir que o Firebase esteja pronto
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o Firebase foi inicializado corretamente
        if (auth && db) {
          console.log('Firebase inicializado com sucesso');
          setIsFirebaseReady(true);
        } else {
          throw new Error('Firebase não foi inicializado corretamente');
        }
      } catch (err) {
        console.error('Erro ao inicializar Firebase:', err);
        setError(err.message);
      }
    };

    initializeFirebase();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 }}>
          Erro ao inicializar o Firebase
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {error}
        </Text>
        <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 20 }}>
          Verifique sua conexão com a internet e tente novamente
        </Text>
      </View>
    );
  }

  if (!isFirebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>
          Inicializando...
        </Text>
      </View>
    );
  }

  return children;
};

export default FirebaseInitializer; 