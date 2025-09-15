import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { 
  TextInput, 
  Card, 
  Title, 
  Paragraph,
  Divider,
  ActivityIndicator,
  Button,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithMicrosoft, signInWithApple } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Verifique suas credenciais';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro no Login', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword');
    } else {
      Alert.alert(
        'Recuperar Senha',
        'Entre em contato com o suporte para recuperar sua senha.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else {
      Alert.alert('Cadastro', 'Funcionalidade de cadastro em desenvolvimento');
    }
  };

  const handleGoogleLogin = async () => {
    console.log('handleGoogleLogin chamado');
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Erro no login Google:', error);
      Alert.alert('Erro', 'Não foi possível fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    console.log(`handleSocialLogin chamado para ${provider}`);
    try {
      setLoading(true);
      
      switch (provider) {
        case 'Facebook':
          await signInWithFacebook();
          break;
        case 'Microsoft':
          await signInWithMicrosoft();
          break;
        case 'Apple':
          await signInWithApple();
          break;
        default:
          Alert.alert('Erro', 'Provedor não suportado');
      }
    } catch (error) {
      console.error(`Erro no login ${provider}:`, error);
      Alert.alert('Erro', `Não foi possível fazer login com ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = () => {
    console.log('handleThemeToggle chamado');
    Alert.alert(
      'Tema',
      'Escolha o tema do aplicativo:',
      [
        { text: 'Claro', onPress: () => console.log('Tema claro selecionado') },
        { text: 'Escuro', onPress: () => console.log('Tema escuro selecionado') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleLanguageToggle = () => {
    console.log('handleLanguageToggle chamado');
    Alert.alert(
      'Idioma',
      'Escolha o idioma do aplicativo:',
      [
        { text: 'Português (BR)', onPress: () => console.log('Português selecionado') },
        { text: 'English', onPress: () => console.log('Inglês selecionado') },
        { text: 'Español', onPress: () => console.log('Espanhol selecionado') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Fazendo login...</Paragraph>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="school" 
              size={60} 
              color="white" 
              style={styles.headerIcon}
            />
            <Title style={styles.headerTitle}>Academia App</Title>
            <Paragraph style={styles.headerSubtitle}>
              Bem-vindo de volta!
            </Paragraph>
          </View>

          <View style={styles.content}>
            <AnimatedCard elevation="medium" animationType="fadeIn">
              <Card.Content style={styles.cardContent}>
                <Title style={styles.title}>Entrar</Title>
                <Paragraph style={styles.subtitle}>
                  Faça login para continuar
                </Paragraph>

                <Divider style={styles.divider} />

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={loading}
                  left={<TextInput.Icon icon="email" />}
                />

                <TextInput
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  disabled={loading}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />

                <View style={styles.forgotPasswordContainer}>
                  <Button
                    mode="text"
                    onPress={handleForgotPassword}
                    disabled={loading}
                    style={styles.forgotPasswordButton}
                  >
                    Esqueci minha senha
                  </Button>
                </View>

                <AnimatedButton
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  loading={loading}
                  disabled={loading}
                  icon="login"
                >
                  Entrar
                </AnimatedButton>

                <Divider style={styles.dividerSocial} />

                {/* Login Social */}
                <View style={styles.socialContainer}>
                  <Text style={styles.socialText}>Ou entre com:</Text>
                  
                  <View style={styles.socialButtons}>
                    <Button
                      mode="outlined"
                      onPress={handleGoogleLogin}
                      style={[styles.socialButton, styles.googleButton]}
                      icon="google"
                      disabled={loading}
                    >
                      Google
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => handleSocialLogin('Facebook')}
                      style={[styles.socialButton, styles.facebookButton]}
                      icon="facebook"
                      disabled={loading}
                    >
                      Facebook
                    </Button>
                  </View>
                  
                  <View style={styles.socialButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => handleSocialLogin('Microsoft')}
                      style={[styles.socialButton, styles.microsoftButton]}
                      icon="microsoft"
                      disabled={loading}
                    >
                      Microsoft
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => handleSocialLogin('Apple')}
                      style={[styles.socialButton, styles.appleButton]}
                      icon="apple"
                      disabled={loading}
                    >
                      Apple
                    </Button>
                  </View>
                </View>

                <Divider style={styles.dividerRegister} />

                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
                  <Button
                    mode="outlined"
                    onPress={handleGoToRegister}
                    disabled={loading}
                    style={styles.registerButton}
                    icon="account-plus"
                  >
                    Criar Conta
                  </Button>
                </View>

                {/* Configurações */}
                <Divider style={styles.dividerSettings} />
                
                <View style={styles.settingsContainer}>
                  <View style={styles.settingsRow}>
                    <Button
                      mode="text"
                      onPress={handleThemeToggle}
                      style={styles.settingsButton}
                      icon="palette"
                      disabled={loading}
                    >
                      Tema
                    </Button>
                    
                    <Button
                      mode="text"
                      onPress={handleLanguageToggle}
                      style={styles.settingsButton}
                      icon="translate"
                      disabled={loading}
                    >
                      Idioma
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </AnimatedCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
    justifyContent: 'center',
    padding: 16,
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
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    ...(Platform.OS === 'web' ? {
      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
    } : {
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    }),
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    ...(Platform.OS === 'web' ? {
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    } : {
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    }),
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  cardContent: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordButton: {
    padding: 0,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 25,
  },
  dividerRegister: {
    marginVertical: 24,
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    marginBottom: 12,
    color: '#666',
    fontSize: 14,
  },
  registerButton: {
    borderColor: '#2196F3',
    borderRadius: 25,
  },
  dividerSocial: {
    marginVertical: 20,
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  socialText: {
    marginBottom: 12,
    color: '#666',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: '100%',
  },
  socialButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  googleButton: {
    borderColor: '#DB4437',
  },
  facebookButton: {
    borderColor: '#4267B2',
  },
  microsoftButton: {
    borderColor: '#00A1F1',
  },
  appleButton: {
    borderColor: '#000000',
  },
  dividerSettings: {
    marginVertical: 16,
  },
  settingsContainer: {
    alignItems: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  settingsButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});