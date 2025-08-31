import { firestoreService } from './firestoreService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BackupService {
  constructor() {
    this.backupCollections = [
      'users',
      'classes',
      'modalities',
      'payments',
      'checkins',
      'graduations',
      'announcements',
      'notifications',
      'evaluations'
    ];
    
    this.backupInterval = null;
    this.isBackupRunning = false;
  }

  // Inicializar backup automático
  async initializeAutoBackup(intervalHours = 24) {
    try {
      // Verificar se backup automático está habilitado
      const isEnabled = await AsyncStorage.getItem('autoBackupEnabled');
      if (isEnabled !== 'true') return;

      // Configurar intervalo de backup
      this.backupInterval = setInterval(async () => {
        await this.performAutoBackup();
      }, intervalHours * 60 * 60 * 1000);

      console.log(`Backup automático configurado para cada ${intervalHours} horas`);
      return true;
    } catch (error) {
      console.error('Erro ao inicializar backup automático:', error);
      return false;
    }
  }

  // Realizar backup automático
  async performAutoBackup() {
    if (this.isBackupRunning) {
      console.log('Backup já está em execução, pulando...');
      return;
    }

    try {
      this.isBackupRunning = true;
      console.log('Iniciando backup automático...');

      const backupData = await this.createFullBackup();
      await this.saveBackupLocally(backupData, 'auto');

      // Manter apenas os 5 backups mais recentes
      await this.cleanupOldBackups();

      console.log('Backup automático concluído com sucesso');
    } catch (error) {
      console.error('Erro no backup automático:', error);
    } finally {
      this.isBackupRunning = false;
    }
  }

  // Criar backup completo
  async createFullBackup() {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        collections: {}
      };

      // Fazer backup de cada coleção
      for (const collection of this.backupCollections) {
        try {
          const documents = await firestoreService.getCollection(collection);
          backupData.collections[collection] = documents.map(doc => ({
            id: doc.id,
            data: this.serializeDocumentData(doc)
          }));
          
          console.log(`Backup da coleção ${collection}: ${documents.length} documentos`);
        } catch (error) {
          console.error(`Erro ao fazer backup da coleção ${collection}:`, error);
          backupData.collections[collection] = [];
        }
      }

      return backupData;
    } catch (error) {
      console.error('Erro ao criar backup completo:', error);
      throw error;
    }
  }

  // Serializar dados do documento (converter Timestamps)
  serializeDocumentData(doc) {
    const serialized = { ...doc };
    
    // Converter Timestamps para strings ISO
    Object.keys(serialized).forEach(key => {
      if (serialized[key] && typeof serialized[key].toDate === 'function') {
        serialized[key] = serialized[key].toDate().toISOString();
      }
      
      // Tratar objetos aninhados
      if (typeof serialized[key] === 'object' && serialized[key] !== null) {
        serialized[key] = this.serializeNestedObject(serialized[key]);
      }
    });

    return serialized;
  }

  // Serializar objetos aninhados
  serializeNestedObject(obj) {
    const serialized = { ...obj };
    
    Object.keys(serialized).forEach(key => {
      if (serialized[key] && typeof serialized[key].toDate === 'function') {
        serialized[key] = serialized[key].toDate().toISOString();
      } else if (typeof serialized[key] === 'object' && serialized[key] !== null) {
        serialized[key] = this.serializeNestedObject(serialized[key]);
      }
    });

    return serialized;
  }

  // Salvar backup localmente
  async saveBackupLocally(backupData, type = 'manual') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${type}_${timestamp}.json`;
      const backupDir = `${FileSystem.documentDirectory}backups/`;
      
      // Criar diretório de backup se não existir
      const dirInfo = await FileSystem.getInfoAsync(backupDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
      }

      const filePath = `${backupDir}${filename}`;
      const jsonString = JSON.stringify(backupData, null, 2);
      
      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8
      });

      // Salvar informações do backup no AsyncStorage
      await this.saveBackupInfo({
        filename,
        filePath,
        timestamp: backupData.timestamp,
        type,
        size: jsonString.length,
        collections: Object.keys(backupData.collections).length
      });

      console.log(`Backup salvo: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('Erro ao salvar backup:', error);
      throw error;
    }
  }

  // Salvar informações do backup
  async saveBackupInfo(backupInfo) {
    try {
      const existingBackups = await this.getBackupList();
      existingBackups.push(backupInfo);
      
      await AsyncStorage.setItem('backupList', JSON.stringify(existingBackups));
    } catch (error) {
      console.error('Erro ao salvar informações do backup:', error);
    }
  }

  // Obter lista de backups
  async getBackupList() {
    try {
      const backupsJson = await AsyncStorage.getItem('backupList');
      return backupsJson ? JSON.parse(backupsJson) : [];
    } catch (error) {
      console.error('Erro ao obter lista de backups:', error);
      return [];
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups(maxBackups = 5) {
    try {
      const backups = await this.getBackupList();
      
      if (backups.length <= maxBackups) return;

      // Ordenar por timestamp (mais recente primeiro)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Remover backups excedentes
      const backupsToRemove = backups.slice(maxBackups);
      const backupsToKeep = backups.slice(0, maxBackups);

      // Deletar arquivos dos backups antigos
      for (const backup of backupsToRemove) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(backup.filePath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(backup.filePath);
            console.log(`Backup antigo removido: ${backup.filename}`);
          }
        } catch (error) {
          console.error(`Erro ao remover backup ${backup.filename}:`, error);
        }
      }

      // Atualizar lista de backups
      await AsyncStorage.setItem('backupList', JSON.stringify(backupsToKeep));
    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }

  // Exportar backup para compartilhamento
  async exportBackup(backupFilename) {
    try {
      const backups = await this.getBackupList();
      const backup = backups.find(b => b.filename === backupFilename);
      
      if (!backup) {
        throw new Error('Backup não encontrado');
      }

      const fileInfo = await FileSystem.getInfoAsync(backup.filePath);
      if (!fileInfo.exists) {
        throw new Error('Arquivo de backup não encontrado');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backup.filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar Backup da Academia'
        });
        return true;
      } else {
        throw new Error('Compartilhamento não disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      throw error;
    }
  }

  // Restaurar backup (apenas estrutura - implementação completa requer cuidado)
  async validateBackupFile(filePath) {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8
      });

      const backupData = JSON.parse(fileContent);
      
      // Validar estrutura do backup
      if (!backupData.timestamp || !backupData.collections) {
        throw new Error('Formato de backup inválido');
      }

      // Validar coleções
      const requiredCollections = ['users', 'classes', 'modalities'];
      for (const collection of requiredCollections) {
        if (!backupData.collections[collection]) {
          throw new Error(`Coleção obrigatória ${collection} não encontrada no backup`);
        }
      }

      return {
        valid: true,
        timestamp: backupData.timestamp,
        version: backupData.version,
        collections: Object.keys(backupData.collections),
        totalDocuments: Object.values(backupData.collections)
          .reduce((total, docs) => total + docs.length, 0)
      };
    } catch (error) {
      console.error('Erro ao validar backup:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Configurar backup automático
  async configureAutoBackup(enabled, intervalHours = 24) {
    try {
      await AsyncStorage.setItem('autoBackupEnabled', enabled.toString());
      await AsyncStorage.setItem('autoBackupInterval', intervalHours.toString());

      if (enabled) {
        await this.initializeAutoBackup(intervalHours);
      } else {
        this.stopAutoBackup();
      }

      return true;
    } catch (error) {
      console.error('Erro ao configurar backup automático:', error);
      return false;
    }
  }

  // Parar backup automático
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('Backup automático interrompido');
    }
  }

  // Obter estatísticas de backup
  async getBackupStats() {
    try {
      const backups = await this.getBackupList();
      const isAutoBackupEnabled = await AsyncStorage.getItem('autoBackupEnabled') === 'true';
      const autoBackupInterval = parseInt(await AsyncStorage.getItem('autoBackupInterval') || '24');

      const stats = {
        totalBackups: backups.length,
        autoBackupEnabled: isAutoBackupEnabled,
        autoBackupInterval,
        lastBackup: backups.length > 0 ? backups[backups.length - 1] : null,
        totalSize: backups.reduce((total, backup) => total + (backup.size || 0), 0),
        oldestBackup: backups.length > 0 ? backups[0] : null
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de backup:', error);
      return null;
    }
  }

  // Criar backup manual
  async createManualBackup() {
    try {
      if (this.isBackupRunning) {
        throw new Error('Backup já está em execução');
      }

      this.isBackupRunning = true;
      const backupData = await this.createFullBackup();
      const filePath = await this.saveBackupLocally(backupData, 'manual');
      
      return {
        success: true,
        filePath,
        timestamp: backupData.timestamp,
        collections: Object.keys(backupData.collections).length,
        totalDocuments: Object.values(backupData.collections)
          .reduce((total, docs) => total + docs.length, 0)
      };
    } catch (error) {
      console.error('Erro ao criar backup manual:', error);
      throw error;
    } finally {
      this.isBackupRunning = false;
    }
  }

  // Limpar todos os backups
  async clearAllBackups() {
    try {
      const backups = await this.getBackupList();
      
      for (const backup of backups) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(backup.filePath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(backup.filePath);
          }
        } catch (error) {
          console.error(`Erro ao remover backup ${backup.filename}:`, error);
        }
      }

      await AsyncStorage.removeItem('backupList');
      console.log('Todos os backups foram removidos');
      return true;
    } catch (error) {
      console.error('Erro ao limpar backups:', error);
      return false;
    }
  }
}

export default new BackupService();
