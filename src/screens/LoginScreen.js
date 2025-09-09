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
  TouchableRipple
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  
  const { signIn } = useAuth();
  const { isDarkMode, currentLanguage, languages, theme, toggleDarkMode, changeLanguage, getString } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(getString('error'), getString('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = getString('checkCredentials');
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = getString('userNotFound');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = getString('wrongPassword');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = getString('invalidEmail');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(getString('loginError'), errorMessage);
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
                  onChangeText={setEmail}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  left={<TextInput.Icon icon="email" />}
                  theme={theme}
                />

                <TextInput
                  label={getString('password')}
                  value={password}
                  onChangeText={setPassword}
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
                />

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});