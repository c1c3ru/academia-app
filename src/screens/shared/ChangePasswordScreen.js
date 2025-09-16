import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  TextInput, 
  HelperText,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthProvider';
import SafeCardContent from '../../components/SafeCardContent';

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Nova senha deve ser diferente da senha atual';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Primeiro, reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Se a reautenticação foi bem-sucedida, atualizar a senha
      await updatePassword(user, formData.newPassword);

      setSnackbar({
        visible: true,
        message: 'Senha alterada com sucesso! 🎉',
        type: 'success'
      });

      // Limpar o formulário
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Voltar à tela anterior após um breve delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      let errorMessage = 'Erro ao alterar senha. Tente novamente.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha atual incorreta';
        setErrors({ currentPassword: errorMessage });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Nova senha é muito fraca';
        setErrors({ newPassword: errorMessage });
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por segurança, faça login novamente e tente alterar a senha';
      }

      setSnackbar({
        visible: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Alterar Senha</Text>
            <Text style={styles.subtitle}>
              Para sua segurança, informe sua senha atual e defina uma nova senha
            </Text>

            {/* Senha Atual */}
            <TextInput
              label="Senha Atual"
              value={formData.currentPassword}
              onChangeText={(value) => updateFormData('currentPassword', value)}
              mode="outlined"
              secureTextEntry={!showPasswords.current}
              style={styles.input}
              error={!!errors.currentPassword}
              right={
                <TextInput.Icon
                  icon={showPasswords.current ? 'eye-off' : 'eye'}
                  onPress={() => toggleShowPassword('current')}
                />
              }
            />
            {errors.currentPassword && (
              <HelperText type="error">{errors.currentPassword}</HelperText>
            )}

            {/* Nova Senha */}
            <TextInput
              label="Nova Senha"
              value={formData.newPassword}
              onChangeText={(value) => updateFormData('newPassword', value)}
              mode="outlined"
              secureTextEntry={!showPasswords.new}
              style={styles.input}
              error={!!errors.newPassword}
              right={
                <TextInput.Icon
                  icon={showPasswords.new ? 'eye-off' : 'eye'}
                  onPress={() => toggleShowPassword('new')}
                />
              }
            />
            {errors.newPassword && (
              <HelperText type="error">{errors.newPassword}</HelperText>
            )}
            {!errors.newPassword && formData.newPassword && (
              <HelperText type="info">
                A senha deve ter pelo menos 6 caracteres
              </HelperText>
            )}

            {/* Confirmar Nova Senha */}
            <TextInput
              label="Confirmar Nova Senha"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showPasswords.confirm}
              style={styles.input}
              error={!!errors.confirmPassword}
              right={
                <TextInput.Icon
                  icon={showPasswords.confirm ? 'eye-off' : 'eye'}
                  onPress={() => toggleShowPassword('confirm')}
                />
              }
            />
            {errors.confirmPassword && (
              <HelperText type="error">{errors.confirmPassword}</HelperText>
            )}

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePassword}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Alterar Senha
              </Button>
            </View>

            {/* Dicas de Segurança */}
            <Card style={styles.tipsCard}>
              <Card.Content>
                <Text style={styles.tipsTitle}>💡 Dicas de Segurança</Text>
                <Text style={styles.tipsText}>
                  • Use uma senha com pelo menos 8 caracteres{'\n'}
                  • Combine letras maiúsculas, minúsculas e números{'\n'}
                  • Evite informações pessoais óbvias{'\n'}
                  • Não reutilize senhas de outras contas{'\n'}
                  • Considere usar um gerenciador de senhas
                </Text>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={snackbar.type === 'success' ? 3000 : 5000}
        style={{
          backgroundColor: snackbar.type === 'success' ? '#4CAF50' : '#F44336'
        }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  tipsCard: {
    marginTop: 24,
    backgroundColor: '#E8F5E8',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32',
  },
  tipsText: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
});

export default ChangePasswordScreen;