import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Button, Text, Card, Icon } from 'react-native-elements';
import { ActivityIndicator } from 'react-native';
import locationService from '../services/locationService';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

const CheckInButton = ({ classId, className, onCheckInSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const { user } = useAuth();

  const handleCheckIn = async () => {
    if (!user || !classId) {
      Alert.alert('Erro', 'Dados de usuário ou aula não encontrados');
      return;
    }

    setLoading(true);
    setLocationStatus('Verificando localização...');

    try {
      // Validar localização
      const locationValidation = await locationService.validateCheckIn(classId);
      
      if (!locationValidation.success) {
        setLocationStatus('Localização inválida');
        Alert.alert(
          'Check-in Negado',
          locationValidation.reason,
          [{ text: 'OK', onPress: () => setLocationStatus(null) }]
        );
        return;
      }

      setLocationStatus('Registrando presença...');

      // Criar registro de check-in
      const checkInData = {
        studentId: user.uid,
        classId: classId,
        date: new Date(),
        status: 'present',
        location: {
          latitude: locationValidation.location.latitude,
          longitude: locationValidation.location.longitude,
          accuracy: locationValidation.location.accuracy,
          distance: locationValidation.distance
        },
        timestamp: locationValidation.timestamp,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await firestoreService.addDocument('checkins', checkInData);

      setLocationStatus('Check-in realizado!');
      
      Alert.alert(
        'Sucesso! ✅',
        `Check-in realizado na aula de ${className}!\n\nDistância da academia: ${locationValidation.distance}m`,
        [
          {
            text: 'OK',
            onPress: () => {
              setLocationStatus(null);
              if (onCheckInSuccess) {
                onCheckInSuccess(checkInData);
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Erro no check-in:', error);
      setLocationStatus('Erro no check-in');
      
      Alert.alert(
        'Erro',
        'Não foi possível realizar o check-in. Tente novamente.',
        [{ text: 'OK', onPress: () => setLocationStatus(null) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (locationStatus?.includes('inválida')) return '#F44336';
    if (locationStatus?.includes('realizado')) return '#4CAF50';
    return '#FF9800';
  };

  return (
    <Card containerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon 
            name="location-on" 
            type="material"
            size={24} 
            color="#2196F3" 
          />
          <Text h4 style={styles.title}>Check-in com Localização</Text>
        </View>

        {locationStatus && (
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Icon 
              name="info" 
              type="material"
              size={16} 
              color={getStatusColor()} 
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {locationStatus}
            </Text>
          </View>
        )}

        <Text style={styles.description}>
          Você precisa estar na academia para fazer check-in
        </Text>

        <Button
          title={loading ? "Verificando..." : "Fazer Check-in"}
          onPress={handleCheckIn}
          disabled={loading}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          loading={loading}
          icon={!loading ? <Icon name="location-on" type="material" size={20} color="white" /> : undefined}
        />

        <Text style={styles.hint}>
          💡 Certifique-se de estar dentro da academia
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',

      },

    }),
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    borderRadius: 25,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default CheckInButton;
