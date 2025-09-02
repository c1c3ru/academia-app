
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Card, 
  Title, 
  Paragraph,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erro', 'Por favor, digite um email válido');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setEmailSent(true);
      Alert.alert(
        'Email Enviado!',
        'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      let errorMessage = 'Erro ao enviar email de recuperação';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email não encontrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="lock-reset" 
            size={60} 
            color="white" 
            style={styles.headerIcon}
          />
          <Title style={styles.headerTitle}>Recuperar Senha</Title>
          <Paragraph style={styles.headerSubtitle}>
            Digite seu email para receber instruções
          </Paragraph>
        </View>

        <View style={styles.content}>
          <AnimatedCard elevation="medium" animationType="fadeIn">
            <Card.Content style={styles.cardContent}>
              {!emailSent ? (
                <>
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

                  <AnimatedButton
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.resetButton}
                    loading={loading}
                    disabled={loading}
                    icon="email-send"
                  >
                    Enviar Email
                  </AnimatedButton>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <MaterialCommunityIcons 
                    name="email-check" 
                    size={48} 
                    color="#4CAF50" 
                    style={styles.successIcon}
                  />
                  <Title style={styles.successTitle}>Email Enviado!</Title>
                  <Paragraph style={styles.successText}>
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </Paragraph>
                </View>
              )}

              <View style={styles.backContainer}>
                <Button
                  mode="text"
                  onPress={() => navigation.goBack()}
                  disabled={loading}
                  icon="arrow-left"
                >
                  Voltar ao Login
                </Button>
              </View>
            </Card.Content>
          </AnimatedCard>
        </View>
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
  header: {
    alignItems: 'center',
    padding: 32,
    paddingBottom: 16,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  resetButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 25,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    color: '#666',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
});
