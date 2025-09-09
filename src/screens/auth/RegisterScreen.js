import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  Paragraph,
  Divider,
  ActivityIndicator,
  RadioButton,
  Chip,
  Snackbar,
  HelperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' });
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const { signUp } = useAuth();

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSnackbar = (message, type = 'error') => {
    setSnackbar({ visible: true, message, type });
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        userType: formData.userType,
        isActive: true,
        currentGraduation: formData.userType === 'student' ? 'Iniciante' : null,
        graduations: [],
        classIds: []
      };

      await signUp(formData.email, formData.password, userData);
      showSnackbar('Conta criada com sucesso! 🎉', 'success');
      
      // Animação de sucesso
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } catch (error) {
      console.error('Erro no cadastro:', error);
      let errorMessage = 'Erro ao criar conta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      showSnackbar(errorMessage, 'error');
      
      // Animação de erro (shake)
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -10, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: -5, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'student': return 'school';
      case 'instructor': return 'account-tie';
      case 'admin': return 'shield-account';
      default: return 'account';
    }
  };

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'student': return '#4CAF50';
      case 'instructor': return '#FF9800';
      case 'admin': return '#F44336';
      default: return '#2196F3';
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          horizontal={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <MaterialCommunityIcons 
              name="account-plus" 
              size={60} 
              color="white" 
              style={styles.headerIcon}
            />
            <Title style={styles.title}>Criar Conta</Title>
            <Paragraph style={styles.subtitle}>
              Preencha os dados para se cadastrar
            </Paragraph>
          </Animated.View>

          <Animated.View
            style={[
              { transform: [{ scale: scaleAnim }, { translateX: slideAnim }] }
            ]}
          >
            <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Dados Pessoais</Title>
            
            <TextInput
              label="Nome Completo *"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              mode="outlined"
              style={styles.input}
              disabled={loading}
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
            />
            {errors.name && (
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>
            )}

            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              disabled={loading}
              error={!!errors.email}
              left={<TextInput.Icon icon="email" />}
            />
            {errors.email && (
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            )}

            <TextInput
              label="Telefone/WhatsApp"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              disabled={loading}
              left={<TextInput.Icon icon="phone" />}
            />

            <Divider style={styles.divider} />

            <Title style={styles.sectionTitle}>Tipo de Usuário</Title>
            <View style={styles.userTypeContainer}>
              {[
                { value: 'student', label: 'Aluno', description: 'Acesso às aulas e evolução' },
                { value: 'instructor', label: 'Professor', description: 'Gerenciar turmas e alunos' },
                { value: 'admin', label: 'Administrador', description: 'Controle total do sistema' }
              ].map((type) => (
                <Card 
                  key={type.value}
                  style={[
                    styles.userTypeCard,
                    formData.userType === type.value && {
                      borderColor: getUserTypeColor(type.value),
                      borderWidth: 2,
                      backgroundColor: getUserTypeColor(type.value) + '10'
                    }
                  ]}
                  onPress={() => updateFormData('userType', type.value)}
                >
                  <Card.Content style={styles.userTypeCardContent}>
                    <View style={styles.userTypeInfo}>
                      <MaterialCommunityIcons 
                        name={getUserTypeIcon(type.value)} 
                        size={24} 
                        color={getUserTypeColor(type.value)}
                      />
                      <View style={styles.userTypeText}>
                        <Text style={styles.userTypeLabel}>{type.label}</Text>
                        <Text style={styles.userTypeDescription}>{type.description}</Text>
                      </View>
                    </View>
                    <RadioButton
                      value={type.value}
                      status={formData.userType === type.value ? 'checked' : 'unchecked'}
                      onPress={() => updateFormData('userType', type.value)}
                      disabled={loading}
                    />
                  </Card.Content>
                </Card>
              ))}
            </View>

            <Divider style={styles.divider} />

            <Title style={styles.sectionTitle}>Senha</Title>

            <TextInput
              label="Senha *"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              disabled={loading}
              error={!!errors.password}
            />
            {errors.password && (
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>
            )}

            <TextInput
              label="Confirmar Senha *"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
              disabled={loading}
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
            )}

            <Text style={styles.passwordHint}>
              * A senha deve ter pelo menos 6 caracteres
            </Text>

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              disabled={loading}
              icon={loading ? undefined : "account-plus"}
              contentStyle={styles.buttonContent}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.loadingText}>Criando conta...</Text>
                </View>
              ) : (
                'Criar Conta'
              )}
            </Button>

            <View style={styles.loginContainer}>
              <Text>Já tem uma conta? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                Fazer Login
              </Button>
            </View>
          </Card.Content>
            </Card>
          </Animated.View>
        </ScrollView>
        
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={4000}
          style={[
            styles.snackbar,
            snackbar.type === 'success' ? styles.successSnackbar : styles.errorSnackbar
          ]}
          action={{
            label: 'OK',
            onPress: () => setSnackbar({ ...snackbar, visible: false }),
          }}
        >
          {snackbar.message}
        </Snackbar>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  scroll: {
    flex: 1,
    ...(Platform.OS === 'web' ? { maxHeight: '100vh', overflowY: 'auto' } : {}),
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    ...Platform.select({
      web: {
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      }
    }),
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }
    }),
  },
  card: {
    elevation: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  divider: {
    marginVertical: 24,
    backgroundColor: '#E0E0E0',
  },
  userTypeContainer: {
    marginBottom: 16,
  },
  userTypeCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  userTypeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  userTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTypeText: {
    marginLeft: 12,
    flex: 1,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userTypeDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingVertical: 4,
    borderRadius: 25,
    elevation: 3,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  snackbar: {
    borderRadius: 8,
    marginBottom: 20,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
});

export default RegisterScreen;
