import { 
  collection, 
  doc, 
  getDocs,
  getDoc,
  addDoc, 
  updateDoc,
  deleteDoc,
  writeBatch,
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Service para migrar dados de coleções globais para coleções específicas de academia
 * Garante isolamento completo de dados entre academias
 */
class MigrationService {

  /**
   * Configuração de mapeamento das coleções a serem migradas
   */
  static COLLECTION_MAPPING = {
    'classes': {
      target: 'classes',
      academyField: 'academiaId', // campo que identifica a academia no documento
      requiredFields: ['name', 'instructorId'],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_classes'
      })
    },
    'payments': {
      target: 'payments', 
      academyField: 'academiaId',
      requiredFields: ['studentId', 'amount', 'dueDate'],
      dependentFields: [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' }
      ],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_payments'
      })
    },
    'checkins': {
      target: 'checkins',
      academyField: 'academiaId',
      requiredFields: ['studentId', 'classId', 'date'],
      dependentFields: [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' },
        { field: 'classId', referencesCollection: 'classes', referenceField: 'id' }
      ],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_checkins'
      })
    },
    'graduations': {
      target: 'graduations',
      academyField: 'academiaId',
      requiredFields: ['studentId', 'modalityId'],
      dependentFields: [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' }
      ],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_graduations'
      })
    },
    'evaluations': {
      target: 'evaluations',
      academyField: 'academiaId',
      requiredFields: ['studentId', 'instructorId'],
      dependentFields: [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' },
        { field: 'instructorId', referencesCollection: 'users', referenceField: 'id' }
      ],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_evaluations'
      })
    },
    'evaluation_schedules': {
      target: 'evaluation_schedules',
      academyField: 'academiaId',
      requiredFields: ['studentId', 'instructorId'],
      dependentFields: [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' },
        { field: 'instructorId', referencesCollection: 'users', referenceField: 'id' }
      ],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_evaluation_schedules'
      })
    },
    'notifications': {
      target: 'notifications',
      academyField: 'academiaId',
      requiredFields: ['title', 'message'],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_notifications'
      })
    },
    'injuries': {
      target: 'injuries',
      academyField: 'academiaId',
      requiredFields: ['studentId', 'bodyPart', 'injuryType'],
      dependentFields: [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' }
      ],
      transformData: (data) => ({
        ...data,
        migratedAt: new Date(),
        migrationSource: 'global_injuries'
      })
    }
  };

  /**
   * Migrar uma coleção global específica para coleções de academia
   */
  static async migrateCollection(collectionName, options = {}) {
    const config = this.COLLECTION_MAPPING[collectionName];
    if (!config) {
      throw new Error(`Collection ${collectionName} not configured for migration`);
    }

    console.log(`🔄 Iniciando migração da coleção: ${collectionName}`);
    
    const results = {
      processed: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: []
    };

    try {
      // Buscar todos os documentos da coleção global
      const globalCollection = collection(db, collectionName);
      const querySnapshot = await getDocs(globalCollection);
      
      console.log(`📊 Encontrados ${querySnapshot.docs.length} documentos para migrar`);

      // Agrupar documentos por academia
      const documentsByAcademy = new Map();
      
      for (const docSnapshot of querySnapshot.docs) {
        results.processed++;
        
        const data = docSnapshot.data();
        const academyId = data[config.academyField];
        
        // Validar se o documento tem academia associada
        if (!academyId) {
          results.skipped++;
          console.warn(`⚠️ Documento ${docSnapshot.id} não tem ${config.academyField} definido`);
          continue;
        }

        // Validar campos obrigatórios
        const missingFields = config.requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
          results.skipped++;
          console.warn(`⚠️ Documento ${docSnapshot.id} tem campos obrigatórios faltando: ${missingFields.join(', ')}`);
          continue;
        }

        // Validar integridade referencial se configurado
        if (config.dependentFields && options.checkReferentialIntegrity !== false) {
          const referenceErrors = await this.validateReferences(data, config.dependentFields, academyId);
          if (referenceErrors.length > 0) {
            results.skipped++;
            console.warn(`⚠️ Documento ${docSnapshot.id} tem referências inválidas: ${referenceErrors.join(', ')}`);
            continue;
          }
        }

        // Agrupar por academia
        if (!documentsByAcademy.has(academyId)) {
          documentsByAcademy.set(academyId, []);
        }
        
        documentsByAcademy.get(academyId).push({
          id: docSnapshot.id,
          data: config.transformData(data)
        });
      }

      console.log(`🏢 Dados agrupados em ${documentsByAcademy.size} academias`);

      // Migrar dados por academia usando batch writes
      for (const [academyId, documents] of documentsByAcademy) {
        try {
          await this.migrateAcademyDocuments(academyId, config.target, documents, options);
          results.migrated += documents.length;
          console.log(`✅ Academia ${academyId}: ${documents.length} documentos migrados`);
        } catch (error) {
          results.errors += documents.length;
          results.errorDetails.push({
            academyId,
            error: error.message,
            documentsCount: documents.length
          });
          console.error(`❌ Erro ao migrar academia ${academyId}:`, error);
        }
      }

      // Relatório final
      console.log(`📋 Migração completa para ${collectionName}:`);
      console.log(`   - Processados: ${results.processed}`);
      console.log(`   - Migrados: ${results.migrated}`);
      console.log(`   - Ignorados: ${results.skipped}`);
      console.log(`   - Erros: ${results.errors}`);

      return results;

    } catch (error) {
      console.error(`💥 Erro fatal na migração de ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Migrar documentos de uma academia específica usando batch writes
   */
  static async migrateAcademyDocuments(academyId, targetCollection, documents, options = {}) {
    const batchSize = options.batchSize || 450; // Firestore limit is 500, usando 450 para segurança
    
    // Processar em lotes
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocuments = documents.slice(i, i + batchSize);
      
      for (const document of batchDocuments) {
        // Criar referência na subcoleção da academia
        const academyDocRef = doc(db, 'gyms', academyId, targetCollection, document.id);
        
        // Adicionar ao batch
        batch.set(academyDocRef, document.data);
      }
      
      // Executar batch
      await batch.commit();
      console.log(`📦 Batch ${Math.floor(i / batchSize) + 1} processado: ${batchDocuments.length} documentos`);
    }
  }

  /**
   * Migrar todas as coleções configuradas
   */
  static async migrateAllCollections(options = {}) {
    console.log('🚀 Iniciando migração completa de todas as coleções...');
    
    const results = {};
    const collections = Object.keys(this.COLLECTION_MAPPING);
    
    for (const collectionName of collections) {
      try {
        console.log(`\n==== Migrando ${collectionName.toUpperCase()} ====`);
        results[collectionName] = await this.migrateCollection(collectionName, options);
      } catch (error) {
        console.error(`💥 Falha na migração de ${collectionName}:`, error);
        results[collectionName] = {
          error: error.message,
          processed: 0,
          migrated: 0,
          skipped: 0,
          errors: 1
        };
      }
    }

    // Relatório consolidado
    console.log('\n📊 RELATÓRIO FINAL DE MIGRAÇÃO:');
    console.log('=====================================');
    
    let totalProcessed = 0;
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    Object.entries(results).forEach(([collection, result]) => {
      console.log(`\n${collection.toUpperCase()}:`);
      console.log(`  Processados: ${result.processed || 0}`);
      console.log(`  Migrados: ${result.migrated || 0}`);  
      console.log(`  Ignorados: ${result.skipped || 0}`);
      console.log(`  Erros: ${result.errors || 0}`);
      
      if (result.errorDetails?.length > 0) {
        console.log('  Detalhes dos erros:');
        result.errorDetails.forEach(detail => {
          console.log(`    - Academia ${detail.academyId}: ${detail.error}`);
        });
      }

      totalProcessed += result.processed || 0;
      totalMigrated += result.migrated || 0;
      totalSkipped += result.skipped || 0;
      totalErrors += result.errors || 0;
    });

    console.log('\n🎯 TOTAIS GERAIS:');
    console.log(`  Processados: ${totalProcessed}`);
    console.log(`  Migrados: ${totalMigrated}`);
    console.log(`  Ignorados: ${totalSkipped}`);
    console.log(`  Erros: ${totalErrors}`);

    return results;
  }

  /**
   * Verificar integridade dos dados migrados
   */
  static async verifyMigration(collectionName, academyId) {
    console.log(`🔍 Verificando migração de ${collectionName} para academia ${academyId}`);
    
    try {
      // Contar documentos na coleção global que pertencem à academia
      const globalQuery = query(
        collection(db, collectionName),
        where(this.COLLECTION_MAPPING[collectionName].academyField, '==', academyId)
      );
      const globalSnapshot = await getDocs(globalQuery);
      const globalCount = globalSnapshot.docs.length;

      // Contar documentos na subcoleção da academia
      const academyCollection = collection(db, 'gyms', academyId, this.COLLECTION_MAPPING[collectionName].target);
      const academySnapshot = await getDocs(academyCollection);
      const academyCount = academySnapshot.docs.length;

      const isValid = globalCount === academyCount;
      
      console.log(`📊 Verificação ${collectionName} - Academia ${academyId}:`);
      console.log(`   Global: ${globalCount} documentos`);
      console.log(`   Academy: ${academyCount} documentos`);
      console.log(`   Status: ${isValid ? '✅ Válido' : '❌ Inconsistente'}`);

      return {
        collectionName,
        academyId,
        globalCount,
        academyCount,
        isValid,
        difference: Math.abs(globalCount - academyCount)
      };

    } catch (error) {
      console.error(`💥 Erro na verificação de ${collectionName}:`, error);
      return {
        collectionName,
        academyId,
        error: error.message,
        isValid: false
      };
    }
  }

  /**
   * Limpar dados globais após confirmação da migração
   * ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL!
   */
  static async cleanupGlobalCollection(collectionName, options = {}) {
    if (!options.confirmCleanup) {
      throw new Error('Cleanup requer confirmação explícita: { confirmCleanup: true }');
    }

    console.log(`🧹 Iniciando limpeza da coleção global: ${collectionName}`);
    console.log('⚠️ Esta operação é IRREVERSÍVEL!');

    const config = this.COLLECTION_MAPPING[collectionName];
    if (!config) {
      throw new Error(`Collection ${collectionName} not configured for cleanup`);
    }

    try {
      const globalCollection = collection(db, collectionName);
      const querySnapshot = await getDocs(globalCollection);
      
      console.log(`📊 Encontrados ${querySnapshot.docs.length} documentos para deletar`);

      let deleted = 0;
      let errors = 0;
      const batchSize = 450;

      // Processar em lotes
      for (let i = 0; i < querySnapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = querySnapshot.docs.slice(i, i + batchSize);
        
        for (const docSnapshot of batchDocs) {
          batch.delete(docSnapshot.ref);
        }
        
        try {
          await batch.commit();
          deleted += batchDocs.length;
          console.log(`🗑️ Batch ${Math.floor(i / batchSize) + 1}: ${batchDocs.length} documentos deletados`);
        } catch (error) {
          errors += batchDocs.length;
          console.error(`❌ Erro no batch ${Math.floor(i / batchSize) + 1}:`, error);
        }
      }

      console.log(`✅ Limpeza completa de ${collectionName}:`);
      console.log(`   - Deletados: ${deleted}`);
      console.log(`   - Erros: ${errors}`);

      return { deleted, errors };

    } catch (error) {
      console.error(`💥 Erro fatal na limpeza de ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Rollback de migração - move dados de volta para coleções globais
   * ⚠️ Usar apenas em casos de emergência
   */
  static async rollbackMigration(collectionName, academyId, options = {}) {
    if (!options.confirmRollback) {
      throw new Error('Rollback requer confirmação explícita: { confirmRollback: true }');
    }

    console.log(`🔄 Iniciando rollback de ${collectionName} para academia ${academyId}`);
    console.log('⚠️ Esta operação pode causar conflitos de dados!');

    const config = this.COLLECTION_MAPPING[collectionName];
    if (!config) {
      throw new Error(`Collection ${collectionName} not configured for rollback`);
    }

    try {
      // Buscar documentos na subcoleção da academia
      const academyCollection = collection(db, 'gyms', academyId, config.target);
      const academySnapshot = await getDocs(academyCollection);
      
      console.log(`📊 Encontrados ${academySnapshot.docs.length} documentos para rollback`);

      let restored = 0;
      let errors = 0;
      const batchSize = 450;

      // Processar em lotes
      for (let i = 0; i < academySnapshot.docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = academySnapshot.docs.slice(i, i + batchSize);
        
        for (const docSnapshot of batchDocs) {
          const data = docSnapshot.data();
          
          // Remove campos de migração
          delete data.migratedAt;
          delete data.migrationSource;
          
          // Cria referência na coleção global
          const globalDocRef = doc(db, collectionName, docSnapshot.id);
          batch.set(globalDocRef, data);
        }
        
        try {
          await batch.commit();
          restored += batchDocs.length;
          console.log(`↩️ Batch ${Math.floor(i / batchSize) + 1}: ${batchDocs.length} documentos restaurados`);
        } catch (error) {
          errors += batchDocs.length;
          console.error(`❌ Erro no batch ${Math.floor(i / batchSize) + 1}:`, error);
        }
      }

      console.log(`✅ Rollback completo de ${collectionName} - Academia ${academyId}:`);
      console.log(`   - Restaurados: ${restored}`);
      console.log(`   - Erros: ${errors}`);

      return { restored, errors };

    } catch (error) {
      console.error(`💥 Erro fatal no rollback de ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Validar integridade referencial dos campos dependentes
   * @param {Object} data - Dados do documento
   * @param {Array} dependentFields - Array de campos que referenciam outras coleções  
   * @param {string} academyId - ID da academia
   * @returns {Array} Array de erros de referência
   */
  static async validateReferences(data, dependentFields, academyId) {
    const errors = [];
    
    for (const dependentField of dependentFields) {
      const { field, referencesCollection, referenceField } = dependentField;
      const referenceId = data[field];
      
      if (!referenceId) continue; // Campo não obrigatório ou já validado em requiredFields
      
      try {
        // Para coleções globais como 'users', buscar diretamente
        if (referencesCollection === 'users') {
          const userRef = doc(db, 'users', referenceId);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            errors.push(`${field}=${referenceId} não encontrado em ${referencesCollection}`);
          } else {
            // Verificar se o usuário pertence à mesma academia
            const userData = userSnap.data();
            if (userData.academiaId !== academyId) {
              errors.push(`${field}=${referenceId} pertence a academia diferente (${userData.academiaId} != ${academyId})`);
            }
          }
        } else {
          // Para coleções específicas da academia, buscar na subcoleção
          const refRef = doc(db, 'gyms', academyId, referencesCollection, referenceId);
          const refSnap = await getDoc(refRef);
          if (!refSnap.exists()) {
            errors.push(`${field}=${referenceId} não encontrado em ${referencesCollection}`);
          }
        }
      } catch (error) {
        errors.push(`Erro ao validar ${field}=${referenceId}: ${error.message}`);
      }
    }
    
    return errors;
  }

  /**
   * Obter estatísticas de uma coleção antes da migração
   */
  static async getCollectionStats(collectionName) {
    try {
      const globalCollection = collection(db, collectionName);
      const querySnapshot = await getDocs(globalCollection);
      
      const stats = {
        totalDocuments: querySnapshot.docs.length,
        byAcademy: new Map(),
        documentsWithoutAcademy: 0
      };

      const academyField = this.COLLECTION_MAPPING[collectionName]?.academyField;
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const academyId = data[academyField];
        
        if (!academyId) {
          stats.documentsWithoutAcademy++;
        } else {
          if (!stats.byAcademy.has(academyId)) {
            stats.byAcademy.set(academyId, 0);
          }
          stats.byAcademy.set(academyId, stats.byAcademy.get(academyId) + 1);
        }
      });

      return stats;
    } catch (error) {
      console.error(`Erro ao obter estatísticas de ${collectionName}:`, error);
      throw error;
    }
  }
}

export default MigrationService;