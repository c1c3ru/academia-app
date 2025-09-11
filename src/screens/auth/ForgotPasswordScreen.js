
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { 
  TextInput, 
  Card, 
  Title, 
  Paragraph,
  Button,
  ActivityIndicator,
  Snackbar,
  HelperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import AnimatedCard from '../../components/AnimatedCard';
import AnimatedButton from '../../components/AnimatedButton';
import { ResponsiveUtils } from '../../utils/animations';
import { useTheme } from '../../contexts/ThemeContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { getString } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Feedback states
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' // 'success', 'error', 'info'
  });
  const [errors, setErrors] = useState({});

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

  const validateEmail = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = getString('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = getString('invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) {
      showSnackbar(getString('pleaseValidEmail'), 'error');
      return;
    }

    setLoading(true);
    console.log('🔄 Iniciando processo de recuperação de senha...');
    console.log('📧 Email:', email.trim());
    console.log('🔥 Auth object:', auth);
    
    try {
      console.log('📤 Enviando email de recuperação...');
      await sendPasswordResetEmail(auth, email.trim());
      console.log('✅ Email de recuperação enviado com sucesso!');
      
      setEmailSent(true);
      showSnackbar(getString('emailSentSuccess'), 'success');
      
      // Auto-voltar após 5 segundos para dar tempo de ler
      setTimeout(() => {
        navigation.goBack();
      }, 5000);
    } catch (error) {
      console.error('❌ Erro detalhado ao enviar email:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = getString('resetPasswordError');
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = getString('emailNotFound');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = getString('invalidEmailFormat');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = getString('tooManyRequests');
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = getString('networkError');
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = getString('configurationNotFound');
      } else if (error.message) {
        errorMessage = `${getString('error')}: ${error.message}`;
      }
      
      showSnackbar(errorMessage, 'error');
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
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <MaterialCommunityIcons 
                name="lock-reset" 
                size={ResponsiveUtils?.isTablet?.() ? 80 : 60} 
                color="white" 
                style={styles.headerIcon}
              />
              <Title style={styles.headerTitle}>{getString('recoverPassword')}</Title>
              <Paragraph style={styles.headerSubtitle}>
                {getString('enterEmailForInstructions')}
              </Paragraph>
            </View>

            <View style={styles.content}>
              <AnimatedCard elevation="medium" animationType="fadeIn">
                <Card.Content style={styles.cardContent}>
              {!emailSent ? (
                <>
                  <TextInput
                    label={getString('email')}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: null }));
                      }
                    }}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    disabled={loading}
                    left={<TextInput.Icon icon="email" />}
                    error={!!errors.email}
                  />
                  {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

                  <AnimatedButton
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.resetButton}
                    loading={loading}
                    disabled={loading}
                    icon="email-send"
                  >
                    {getString('sendEmail')}
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
                  <Title style={styles.successTitle}>{getString('emailSent')}</Title>
                  <Paragraph style={styles.successText}>
                    {getString('checkInboxInstructions')}
                  </Paragraph>
                  <Paragraph style={styles.spamWarning}>
                    {getString('spamFolderWarning')}
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
                  {getString('backToLogin')}
                </Button>
              </View>
            </Card.Content>
          </AnimatedCard>
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Snackbar para feedback */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={snackbar.type === 'success' ? 4000 : 6000}
          style={[
            styles.snackbar,
            snackbar.type === 'success' && styles.snackbarSuccess,
            snackbar.type === 'error' && styles.snackbarError
          ]}
          action={{
            label: getString('close'),
            onPress: hideSnackbar,
            textColor: 'white'
          }}
        >
          {snackbar.message}
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
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: ResponsiveUtils?.spacing?.xl || 32,
  },
  header: {
    alignItems: 'center',
    padding: ResponsiveUtils?.spacing?.xl || 32,
    paddingBottom: ResponsiveUtils?.spacing?.md || 16,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: ResponsiveUtils?.fontSize?.xlarge || 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: ResponsiveUtils?.spacing?.md || 16,
    maxWidth: ResponsiveUtils?.isTablet?.() ? 500 : 400,
    alignSelf: 'center',
    width: '100%',
  },
  cardContent: {
    padding: ResponsiveUtils?.spacing?.lg || 24,
  },
  input: {
    marginBottom: ResponsiveUtils?.spacing?.md || 16,
    backgroundColor: 'white',
  },
  resetButton: {
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
    paddingVertical: ResponsiveUtils?.spacing?.sm || 8,
    borderRadius: ResponsiveUtils?.borderRadius?.large || 25,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: ResponsiveUtils?.spacing?.md || 16,
  },
  successIcon: {
    marginBottom: ResponsiveUtils?.spacing?.md || 16,
  },
  successTitle: {
    color: '#4CAF50',
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    color: '#666',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: ResponsiveUtils?.spacing?.md || 16,
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
  spamWarning: {
    textAlign: 'center',
    color: '#FF9800',
    marginTop: 12,
    fontSize: 14,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  spamWarningBold: {
    fontWeight: 'bold',
    color: '#F57C00',
  },
});
