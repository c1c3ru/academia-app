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
  Switch,
  Menu,
  TouchableRipple,
  Snackbar,
  HelperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthProvider';
import { useTheme } from '../contexts/ThemeContext';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  
  // Feedback states
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' // 'success', 'error', 'info'
  });
  const [errors, setErrors] = useState({});
  
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithMicrosoft, signInWithApple } = useAuth();
  const { isDarkMode, currentLanguage, languages, theme, toggleDarkMode, changeLanguage, getString } = useTheme();

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = getString('emailRequired') || 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = getString('invalidEmail') || 'Email inválido';
    }

    if (!password.trim()) {
      newErrors.password = getString('passwordRequired') || 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = getString('passwordTooShort') || 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      showSnackbar(getString('fillAllFields') || 'Preencha todos os campos corretamente', 'error');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      showSnackbar(getString('loginSuccess') || 'Login realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = getString('checkCredentials') || 'Verifique suas credenciais';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = getString('userNotFound') || 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = getString('wrongPassword') || 'Senha incorreta';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = getString('invalidCredentials') || 'Credenciais inválidas';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = getString('invalidEmail') || 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword');
    } else {
      Alert.alert(
        getString('recoverPassword'),
        getString('contactSupport'),
        [{ text: getString('ok') }]
      );
    }
  };

  const handleGoToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else {
      Alert.alert(getString('register'), getString('registrationDevelopment'));
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      showSnackbar('Login com Google realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no login Google:', error);
      showSnackbar(getString('googleLoginError') || 'Erro no login com Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithFacebook();
      showSnackbar('Login com Facebook realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no login Facebook:', error);
      showSnackbar(getString('facebookLoginError') || 'Erro no login com Facebook', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithMicrosoft();
      showSnackbar('Login com Microsoft realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no login Microsoft:', error);
      showSnackbar(getString('microsoftLoginError') || 'Erro no login com Microsoft', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithApple();
      showSnackbar('Login com Apple realizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro no login Apple:', error);
      showSnackbar(getString('appleLoginError') || 'Erro no login com Apple', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={[styles.loadingText, { color: theme.colors.text }]}>{getString('loggingIn')}</Paragraph>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode ? ['#1a1a1a', '#2d2d30'] : ['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Settings Row */}
          <View style={styles.settingsRow}>
            {/* Language Selector */}
            <View style={styles.settingItem}>
              <Menu
                visible={languageMenuVisible}
                onDismiss={() => setLanguageMenuVisible(false)}
                anchor={
                  <TouchableRipple 
                    style={styles.languageButton}
                    onPress={() => setLanguageMenuVisible(true)}
                    rippleColor="rgba(255,255,255,0.1)"
                  >
                    <View style={styles.languageButtonContent}>
                      <Text style={styles.flagEmoji}>{languages[currentLanguage].flag}</Text>
                      <Text style={styles.languageButtonText}>{languages[currentLanguage].name}</Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color="white" />
                    </View>
                  </TouchableRipple>
                }
              >
                {Object.keys(languages).map((langCode) => (
                  <Menu.Item
                    key={langCode}
                    onPress={() => {
                      changeLanguage(langCode);
                      setLanguageMenuVisible(false);
                    }}
                    title={`${languages[langCode].flag} ${languages[langCode].name}`}
                  />
                ))}
              </Menu>
            </View>
            
            {/* Dark Mode Toggle */}
            <View style={styles.settingItem}>
              <View style={styles.darkModeToggle}>
                <MaterialCommunityIcons 
                  name={isDarkMode ? "weather-night" : "weather-sunny"} 
                  size={20} 
                  color="white" 
                  style={styles.darkModeIcon}
                />
                <Text style={styles.darkModeText}>{getString('darkMode')}</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  thumbColor={isDarkMode ? theme.colors.primary : '#f4f3f4'}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                />
              </View>
            </View>
          </View>

          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="school" 
              size={60} 
              color="white" 
              style={styles.headerIcon}
            />
            <Title style={styles.headerTitle}>{getString('appName')}</Title>
            <Paragraph style={styles.headerSubtitle}>
              {getString('welcome')}
            </Paragraph>
          </View>

          <View style={styles.content}>
            <AnimatedCard style={[styles.loginCard, { backgroundColor: theme.colors.surface }]} delay={200}>
              <Card.Content>
                <TextInput
                  label={getString('email')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  left={<TextInput.Icon icon="email" />}
                  theme={theme}
                  error={!!errors.email}
                />
                {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

                <TextInput
                  label={getString('password')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  theme={theme}
                  error={!!errors.password}
                />
                {errors.password && <HelperText type="error" style={styles.errorText}>{errors.password}</HelperText>}

                <AnimatedButton
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  loading={loading}
                  disabled={loading}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  buttonColor={theme.colors.primary}
                  delay={400}
                >
                  {getString('login')}
                </AnimatedButton>

                <Divider style={styles.divider} />

                {/* Social Login Buttons */}
                <View style={styles.socialLoginContainer}>
                  <Text style={[styles.socialLoginTitle, { color: theme.colors.onSurface }]}>{getString('orLoginWith')}</Text>
                  
                  <View style={styles.socialButtonsRow}>
                    <Button
                      mode="outlined"
                      onPress={handleGoogleLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="google"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Google
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={handleFacebookLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="facebook"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Facebook
                    </Button>
                  </View>
                  
                  <View style={styles.socialButtonsRow}>
                    <Button
                      mode="outlined"
                      onPress={handleMicrosoftLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="microsoft"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Microsoft
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={handleAppleLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="apple"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Apple
                    </Button>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.linkContainer}>
                  <Button
                    mode="text"
                    onPress={handleForgotPassword}
                    textColor={theme.colors.primary}
                    style={styles.linkButton}
                  >
                    {getString('forgotPassword')}
                  </Button>

                  <Button
                    mode="text"
                    onPress={handleGoToRegister}
                    textColor={theme.colors.primary}
                    style={styles.linkButton}
                  >
                    {getString('register')}
                  </Button>
                </View>
              </Card.Content>
            </AnimatedCard>
          </View>
          
        </ScrollView>
        
        {/* Snackbar para feedback */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={snackbar.type === 'success' ? 3000 : 5000}
          style={[
            styles.snackbar,
            snackbar.type === 'success' && styles.snackbarSuccess,
            snackbar.type === 'error' && styles.snackbarError
          ]}
          action={{
            label: 'Fechar',
            onPress: hideSnackbar,
            textColor: 'white'
          }}
        >
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </Snackbar>
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
  },
  scrollContainer: {
    flexGrow: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 10,
  },
  settingItem: {
    alignItems: 'center',
  },
  languageButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  languageButtonText: {
    color: 'white',
    fontSize: 14,
    marginRight: 4,
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  darkModeIcon: {
    marginRight: 6,
  },
  darkModeText: {
    color: 'white',
    fontSize: 14,
    marginRight: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loginCard: {
    marginHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkButton: {
    flex: 1,
  },
  socialLoginContainer: {
    marginVertical: 16,
  },
  socialLoginTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.7,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  socialButton: {
    flex: 0.48,
    marginHorizontal: 2,
  },
  socialButtonContent: {
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginBottom: 8,
    marginTop: -8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 16,
  },
  snackbarSuccess: {
    backgroundColor: '#4caf50',
  },
  snackbarError: {
    backgroundColor: '#f44336',
  },
  snackbarText: {
    color: 'white',
    fontSize: 16,
  },
});