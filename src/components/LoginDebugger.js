import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Button, TextInput, Card, Title } from 'react-native-paper';
import { useAuth } from '../contexts/AuthProvider';

const LoginDebugger = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const { signIn } = useAuth();

  const testLogin = async () => {
    setLoading(true);
    setDebugInfo('Iniciando teste de login...\n');
    
    try {
      // Log das credenciais
      setDebugInfo(prev => prev + `Email: ${email}\n`);
      setDebugInfo(prev => prev + `Senha: ${password ? '***' : 'undefined'}\n`);
      setDebugInfo(prev => prev + `Email válido: ${email && email.includes('@')}\n`);
      
      // Tentar login
      setDebugInfo(prev => prev + 'Tentando login...\n');
      await signIn(email, password);
      
      setDebugInfo(prev => prev + '✅ Login bem-sucedido!\n');
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Erro: ${error.code}\n`);
      setDebugInfo(prev => prev + `Mensagem: ${error.message}\n`);
      
      // Análise do erro
      if (error.code === 'auth/invalid-credential') {
        setDebugInfo(prev => prev + '💡 Possíveis causas:\n');
        setDebugInfo(prev => prev + '- Usuário não existe\n');
        setDebugInfo(prev => prev + '- Senha incorreta\n');
        setDebugInfo(prev => prev + '- Email mal formatado\n');
      } else if (error.code === 'auth/user-not-found') {
        setDebugInfo(prev => prev + '💡 Usuário não encontrado\n');
      } else if (error.code === 'auth/wrong-password') {
        setDebugInfo(prev => prev + '💡 Senha incorreta\n');
      } else if (error.code === 'auth/invalid-email') {
        setDebugInfo(prev => prev + '💡 Email inválido\n');
      }
      
      Alert.alert('Erro', `Erro no login: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDebug = () => {
    setDebugInfo('');
  };

  return (
    <Card style={{ margin: 20 }}>
      <Card.Content>
        <Title>Debug de Login</Title>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={{ marginVertical: 10 }}
        />
        
        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={{ marginVertical: 10 }}
        />
        
        <Button
          mode="contained"
          onPress={testLogin}
          loading={loading}
          style={{ marginVertical: 10 }}
        >
          Testar Login
        </Button>
        
        <Button
          mode="outlined"
          onPress={clearDebug}
          style={{ marginVertical: 5 }}
        >
          Limpar Debug
        </Button>
        
        {debugInfo ? (
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {debugInfo}
            </Text>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
};

export default LoginDebugger; 