import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
  constructor() {
    this.academyLocation = {
      latitude: -23.5505, // Coordenadas da academia (exemplo: São Paulo)
      longitude: -46.6333,
      radius: 100 // Raio em metros para check-in válido
    };
  }

  // Solicitar permissão de localização
  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'É necessário permitir acesso à localização para fazer check-in nas aulas.'
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      return false;
    }
  }

  // Obter localização atual do usuário
  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 60000
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro de Localização',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado.'
      );
      return null;
    }
  }

  // Calcular distância entre duas coordenadas (fórmula de Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  }

  // Verificar se o usuário está dentro do raio da academia
  async isWithinAcademyRadius() {
    try {
      const userLocation = await this.getCurrentLocation();
      if (!userLocation) return { valid: false, reason: 'Localização não disponível' };

      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        this.academyLocation.latitude,
        this.academyLocation.longitude
      );

      const isValid = distance <= this.academyLocation.radius;

      return {
        valid: isValid,
        distance: Math.round(distance),
        userLocation,
        academyLocation: this.academyLocation,
        reason: isValid ? 'Localização válida' : `Você está a ${Math.round(distance)}m da academia`
      };
    } catch (error) {
      console.error('Erro ao verificar localização:', error);
      return { valid: false, reason: 'Erro ao verificar localização' };
    }
  }

  // Configurar localização da academia (para admins)
  setAcademyLocation(latitude, longitude, radius = 100) {
    this.academyLocation = {
      latitude,
      longitude,
      radius
    };
  }

  // Obter endereço a partir de coordenadas
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: `${address.street}, ${address.city} - ${address.region}`
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      return null;
    }
  }

  // Validar check-in com localização
  async validateCheckIn(classId) {
    try {
      const locationCheck = await this.isWithinAcademyRadius();
      
      if (!locationCheck.valid) {
        Alert.alert(
          'Check-in Inválido',
          locationCheck.reason + '\n\nVocê precisa estar na academia para fazer check-in.'
        );
        return {
          success: false,
          reason: locationCheck.reason,
          location: locationCheck.userLocation
        };
      }

      return {
        success: true,
        location: locationCheck.userLocation,
        distance: locationCheck.distance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro na validação do check-in:', error);
      return {
        success: false,
        reason: 'Erro interno na validação',
        location: null
      };
    }
  }
}

export default new LocationService();
