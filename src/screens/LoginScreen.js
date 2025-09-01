import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Animated, Easing } from 'react-native';
import { 
  Input,
  Button,
  Text,
  Card,
  Divider,
  Icon
} from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
// import { LinearGradient } from 'expo-linear-gradient'; // Removido - dependência não disponível

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;

  const { signIn, signInWithGoogle } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease)
      })
    ]).start();
  }, [headerOpacity, headerTranslate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Erro no login:', error);
      setErrorMessage('Email ou senha incorretos');
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
      
      setErrorMessage('Login com Google requer configuração OAuth (ver instruções)');
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
            <Text h1 style={styles.title}>Academia App</Text>
            <Text style={styles.subtitle}>
              Gerencie sua academia de lutas
            </Text>
          </Animated.View>

          <Animated.View style={{ width: '100%', opacity: headerOpacity }}>
            <Card containerStyle={styles.card}>
              <Text h3 style={styles.cardTitle}>Entrar</Text>
              
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
              
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Icon name="email" type="material" size={20} color="#666" />}
                containerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                disabled={loading}
              />

              <Input
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={
                  <Icon 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    type="material"
                    size={20} 
                    color="#666"
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                leftIcon={<Icon name="lock" type="material" size={20} color="#666" />}
                containerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                disabled={loading}
              />

              <Button
                title={loading ? "Entrando..." : "Entrar"}
                onPress={handleLogin}
                buttonStyle={styles.button}
                titleStyle={styles.buttonText}
                icon={!loading ? <Icon name="login" type="material" size={20} color="white" /> : undefined}
                disabled={loading}
                loading={loading}
              />

              <Divider style={styles.divider} />

              <Button
                title="Entrar com Google"
                onPress={handleGoogleLogin}
                buttonStyle={styles.googleButton}
                titleStyle={styles.googleButtonText}
                icon={<Icon name="google" type="font-awesome" size={16} color="#4285F4" />}
                disabled={loading}
                type="outline"
              />

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem uma conta? </Text>
                <Button
                  title="Cadastre-se"
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading}
                  type="clear"
                  titleStyle={styles.registerButtonText}
                />
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 0,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    fontSize: 24,
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputText: {
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
  },
  googleButton: {
    borderColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  googleButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registerButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;

