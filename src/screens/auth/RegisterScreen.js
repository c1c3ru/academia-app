import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Animated, 
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity 
} from 'react-native';
import { 
  Input,
  Button,
  Text,
  Card,
  CheckBox,
  Icon,
  Divider
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';

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
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
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
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
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
        Animated.timing(slideAnim, { toValue: -10, duration: 100, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: -5, duration: 100, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: false }),
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
      case 'instructor': return 'person';
      case 'admin': return 'admin-panel-settings';
      default: return 'account-circle';
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
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
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
            <Icon 
              name="person-add" 
              type="material"
              size={60} 
              color="white" 
              containerStyle={styles.headerIcon}
            />
            <Text h1 style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Preencha os dados para se cadastrar
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              { transform: [{ scale: scaleAnim }, { translateX: slideAnim }] }
            ]}
          >
            <Card containerStyle={styles.card}>
              <Text h3 style={styles.cardTitle}>Dados Pessoais</Text>
              
              <Input
                placeholder="Nome Completo *"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                containerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                disabled={loading}
                errorMessage={errors.name}
                leftIcon={<Icon name="person" type="material" size={20} color="#666" />}
              />

              <Input
                placeholder="Email *"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                disabled={loading}
                errorMessage={errors.email}
                leftIcon={<Icon name="email" type="material" size={20} color="#666" />}
              />

            <Input
              placeholder="Telefone/WhatsApp"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              keyboardType="phone-pad"
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              disabled={loading}
              leftIcon={<Icon name="phone" type="material" size={20} color="#666" />}
            />

            <Divider style={styles.divider} />

            <Text h4 style={styles.sectionTitle}>Tipo de Usuário</Text>
            <View style={styles.userTypeContainer}>
              {[
                { value: 'student', label: 'Aluno', description: 'Acesso às aulas e evolução' },
                { value: 'instructor', label: 'Professor', description: 'Gerenciar turmas e alunos' },
                { value: 'admin', label: 'Administrador', description: 'Controle total do sistema' }
              ].map((type) => (
                <TouchableOpacity 
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
                  <View style={styles.userTypeCardContent}>
                    <View style={styles.userTypeInfo}>
                      <Icon 
                        name={getUserTypeIcon(type.value)} 
                        type="material"
                        size={24} 
                        color={getUserTypeColor(type.value)}
                      />
                      <View style={styles.userTypeText}>
                        <Text style={styles.userTypeLabel}>{type.label}</Text>
                        <Text style={styles.userTypeDescription}>{type.description}</Text>
                      </View>
                    </View>
                    <CheckBox
                      checked={formData.userType === type.value}
                      onPress={() => updateFormData('userType', type.value)}
                      disabled={loading}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Divider style={styles.divider} />

            <Text h4 style={styles.sectionTitle}>Senha</Text>

            <Input
              placeholder="Senha *"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry={!showPassword}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              disabled={loading}
              errorMessage={errors.password}
              leftIcon={<Icon name="lock" type="material" size={20} color="#666" />}
              rightIcon={
                <Icon 
                  name={showPassword ? "visibility-off" : "visibility"} 
                  type="material"
                  size={20} 
                  color="#666"
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Input
              placeholder="Confirmar Senha *"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              secureTextEntry={!showConfirmPassword}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              disabled={loading}
              errorMessage={errors.confirmPassword}
              leftIcon={<Icon name="lock" type="material" size={20} color="#666" />}
              rightIcon={
                <Icon 
                  name={showConfirmPassword ? "visibility-off" : "visibility"} 
                  type="material"
                  size={20} 
                  color="#666"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <Text style={styles.passwordHint}>
              * Campos obrigatórios
            </Text>

            <Button
              title={loading ? "Criando conta..." : "Criar Conta"}
              onPress={handleRegister}
              buttonStyle={styles.button}
              titleStyle={styles.buttonText}
              disabled={loading}
              loading={loading}
              icon={!loading ? <Icon name="person-add" type="material" size={20} color="white" /> : undefined}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <Button
                title="Fazer Login"
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
                type="clear"
                titleStyle={styles.loginButtonText}
              />
            </View>
          </Card>
          </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {snackbar.visible && (
          <View style={[
            styles.snackbar,
            snackbar.type === 'success' ? styles.successSnackbar : styles.errorSnackbar
          ]}>
            <Text style={styles.snackbarText}>{snackbar.message}</Text>
            <Button
              title="OK"
              onPress={() => setSnackbar({ ...snackbar, visible: false })}
              type="clear"
              titleStyle={styles.snackbarButton}
            />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    marginBottom: 16,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',

      },

    }),
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  card: {
    borderRadius: 20,
    backgroundColor: 'white',
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0px 4px 4.65px rgba(0, 0, 0, 0.3)',

      },

    }),
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
    borderRadius: 12,
    backgroundColor: 'white',
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.1)',

      },

    }),
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
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.15)',

      },

    }),
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',

      },

    }),
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
  snackbarText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  snackbarButton: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
