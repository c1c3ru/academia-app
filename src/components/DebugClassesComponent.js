import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text, Card, TextInput } from 'react-native-paper';
import { useAuth } from '../contexts/AuthProvider';
import { academyFirestoreService, academyClassService } from '../services/academyFirestoreService';

const DebugClassesComponent = () => {
  const { user, userProfile } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');
  const [testInstructorId, setTestInstructorId] = useState('');

  const debugClasses = async () => {
    try {
      let info = '🔍 DEBUG CLASSES\n\n';
      
      info += `👤 Usuário atual:\n`;
      info += `- UID: ${user?.uid}\n`;
      info += `- Email: ${user?.email}\n`;
      info += `- Academia ID: ${userProfile?.academiaId}\n\n`;

      if (!userProfile?.academiaId) {
        info += '❌ ERRO: Usuário sem academiaId definido\n';
        setDebugInfo(info);
        return;
      }

      // 1. Buscar todas as turmas da academia
      info += '📋 1. TODAS AS TURMAS DA ACADEMIA:\n';
      const allClasses = await academyFirestoreService.getAll('classes', userProfile.academiaId);
      info += `Total: ${allClasses.length}\n`;
      
      allClasses.forEach((cls, index) => {
        info += `${index + 1}. ${cls.name}\n`;
        info += `   - ID: ${cls.id}\n`;
        info += `   - Instrutor ID: ${cls.instructorId}\n`;
        info += `   - Instrutor Nome: ${cls.instructorName}\n`;
        info += `   - Status: ${cls.status}\n`;
        info += `   - Criado por: ${cls.createdBy}\n\n`;
      });

      // 2. Buscar turmas do usuário atual
      info += '📋 2. TURMAS DO USUÁRIO ATUAL:\n';
      const userClasses = await academyClassService.getClassesByInstructor(
        user.uid, 
        userProfile.academiaId, 
        user.email
      );
      info += `Total: ${userClasses.length}\n`;
      
      userClasses.forEach((cls, index) => {
        info += `${index + 1}. ${cls.name} (ID: ${cls.id})\n`;
      });

      // 3. Verificar se há turmas com instructorId igual ao user.uid
      info += '\n📋 3. ANÁLISE DE CORRESPONDÊNCIA:\n';
      const matchingClasses = allClasses.filter(cls => cls.instructorId === user.uid);
      info += `Turmas com instructorId = ${user.uid}: ${matchingClasses.length}\n`;
      
      if (matchingClasses.length === 0) {
        info += '\n❌ PROBLEMA IDENTIFICADO:\n';
        info += 'Nenhuma turma tem instructorId igual ao UID do usuário atual.\n';
        info += 'Isso significa que:\n';
        info += '1. As turmas foram criadas com instructorId diferente, OU\n';
        info += '2. O usuário atual não é o mesmo que criou as turmas, OU\n';
        info += '3. Há um problema na criação das turmas\n\n';
        
        info += 'INSTRUCTORS IDs ENCONTRADOS:\n';
        const instructorIds = [...new Set(allClasses.map(c => c.instructorId).filter(Boolean))];
        instructorIds.forEach(id => {
          info += `- ${id}\n`;
        });
      }

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo(`❌ Erro no debug: ${error.message}\n${error.stack}`);
    }
  };

  const testSpecificInstructor = async () => {
    if (!testInstructorId.trim()) {
      setDebugInfo('❌ Por favor, insira um ID de instrutor para testar');
      return;
    }

    try {
      let info = `🔍 TESTE PARA INSTRUTOR: ${testInstructorId}\n\n`;
      
      const classes = await academyClassService.getClassesByInstructor(
        testInstructorId, 
        userProfile.academiaId
      );
      
      info += `Turmas encontradas: ${classes.length}\n\n`;
      
      classes.forEach((cls, index) => {
        info += `${index + 1}. ${cls.name}\n`;
        info += `   - ID: ${cls.id}\n`;
        info += `   - Instrutor ID: ${cls.instructorId}\n`;
        info += `   - Instrutor Nome: ${cls.instructorName}\n\n`;
      });

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo(`❌ Erro no teste: ${error.message}`);
    }
  };

  return (
    <Card style={{ margin: 16, padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        🔧 Debug Classes
      </Text>
      
      <Button mode="contained" onPress={debugClasses} style={{ marginBottom: 8 }}>
        Executar Debug Completo
      </Button>
      
      <Button mode="outlined" onPress={() => setDebugInfo('')} style={{ marginBottom: 8 }}>
        Limpar Debug
      </Button>
      
      <Button 
        mode="contained" 
        onPress={() => {
          setDebugInfo('🔄 Recarregando...');
          setTimeout(debugClasses, 500);
        }} 
        style={{ marginBottom: 16, backgroundColor: '#FF9800' }}
      >
        🔄 Recarregar Agora
      </Button>

      <TextInput
        label="ID do Instrutor para Teste"
        value={testInstructorId}
        onChangeText={setTestInstructorId}
        mode="outlined"
        style={{ marginBottom: 8 }}
      />
      
      <Button mode="outlined" onPress={testSpecificInstructor} style={{ marginBottom: 16 }}>
        Testar Instrutor Específico
      </Button>

      {debugInfo ? (
        <ScrollView style={{ maxHeight: 400, backgroundColor: '#f5f5f5', padding: 10 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {debugInfo}
          </Text>
        </ScrollView>
      ) : null}
    </Card>
  );
};

export default DebugClassesComponent;
