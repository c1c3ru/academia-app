import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Animated, Easing } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Title, 
  Paragraph,
  Divider,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;

  const { signIn, signInWithGoogle } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      })
    ]).start();
  }, [headerOpacity, headerTranslate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setSnackbarMsg('Por favor, preencha todos os campos');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Erro no login:', error);
      setSnackbarMsg('Email ou senha incorretos');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Para implementação completa, seria necessário:
      // 1. Instalar @expo/google-app-auth ou expo-auth-session
      // 2. Configurar credenciais OAuth no Google Console
      // 3. Adicionar configurações no app.json
      
      // Simulação da implementação:
      /*
      import * as Google from 'expo-auth-session/providers/google';
      
      const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: 'YOUR_EXPO_CLIENT_ID',
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        webClientId: 'YOUR_WEB_CLIENT_ID',
      });
      
      if (response?.type === 'success') {
        const { authentication } = response;
        await signInWithGoogle(authentication.accessToken);
      }
      */
      
      setSnackbarMsg('Login com Google requer configuração OAuth (ver instruções)');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Erro no login com Google:', error);
      Alert.alert('Erro', 'Falha no login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#111827"]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}>
            <Title style={styles.title}>Academia App</Title>
            <Paragraph style={styles.subtitle}>
              Gerencie sua academia de lutas
            </Paragraph>
          </Animated.View>

          <Animated.View style={{ width: '100%', opacity: headerOpacity }}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Entrar</Title>
                
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" />}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  left={<TextInput.Icon icon="lock-outline" />}
                  style={styles.input}
                  disabled={loading}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.button}
                  buttonColor="#2563eb"
                  textColor="#fff"
                  icon={loading ? undefined : 'login'}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="white" /> : 'Entrar'}
                </Button>

                <Divider style={styles.divider} />

                <Button
                  mode="outlined"
                  onPress={handleGoogleLogin}
                  style={styles.googleButton}
                  icon="google"
                  disabled={loading}
                >
                  Entrar com Google
                </Button>

                <View style={styles.registerContainer}>
                  <Text style={{ color: '#6b7280' }}>Não tem uma conta? </Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Register')}
                    disabled={loading}
                  >
                    Cadastre-se
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        </ScrollView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
        >
          {snackbarMsg}
        </Snackbar>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  card: {
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111827',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#e5e7eb',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#1f2937',
  },
  googleButton: {
    marginBottom: 16,
    borderRadius: 12,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  snackbar: {
    backgroundColor: '#111827',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1f2937',
  },
});

export default LoginScreen;

