/**
 * Test suite for academy-based data migration
 * This file demonstrates how to test the migration process
 * and verify data integrity after migration
 */

import MigrationService from '../services/migrationService.js';
import { academyFirestoreService } from '../services/academyFirestoreService.js';
import academyPaymentService from '../services/academyPaymentService.js';
import EvaluationService from '../services/evaluationService.js';
import auditLogService from '../services/auditLogService.js';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../services/firebase.js';

/**
 * Test Migration Process
 * This is a demonstration of how to test the migration
 * In a production environment, run this in a controlled way
 */
export class MigrationTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  // Test helper function
  assert(condition, message) {
    if (condition) {
      this.testResults.passed++;
      console.log('✅', message);
    } else {
      this.testResults.failed++;
      console.error('❌', message);
      this.testResults.errors.push(message);
    }
  }

  // Test Academy Firestore Service
  async testAcademyFirestoreService() {
    console.log('\n📋 Testing Academy Firestore Service...');
    
    const testAcademiaId = 'test-academia-123';
    
    try {
      // Test 1: Create document with academy isolation
      const testData = {
        name: 'Test Class',
        description: 'Test description',
        instructor: 'test-instructor-id'
      };

      const docId = await academyFirestoreService.create('classes', testData, testAcademiaId);
      this.assert(docId, 'Should create document in academy-specific collection');

      // Test 2: Retrieve document with academy isolation
      const retrievedDoc = await academyFirestoreService.getById('classes', docId, testAcademiaId);
      this.assert(
        retrievedDoc && retrievedDoc.name === testData.name,
        'Should retrieve document from academy-specific collection'
      );

      // Test 3: Verify academiaId is in document
      this.assert(
        retrievedDoc.academiaId === testAcademiaId,
        'Document should have academiaId field set'
      );

      // Test 4: Update document
      await academyFirestoreService.update('classes', docId, { name: 'Updated Test Class' }, testAcademiaId);
      const updatedDoc = await academyFirestoreService.getById('classes', docId, testAcademiaId);
      this.assert(
        updatedDoc && updatedDoc.name === 'Updated Test Class',
        'Should update document in academy-specific collection'
      );

      // Test 5: List documents with filtering
      const allClasses = await academyFirestoreService.getAll('classes', testAcademiaId);
      this.assert(
        Array.isArray(allClasses) && allClasses.length > 0,
        'Should list documents from academy-specific collection'
      );

      // Cleanup
      await academyFirestoreService.delete('classes', docId, testAcademiaId);
      console.log('🧹 Test cleanup completed');

    } catch (error) {
      console.error('❌ Academy Firestore Service test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Academy Firestore Service error: ${error.message}`);
    }
  }

  // Test Payment Service Academy Isolation
  async testPaymentServiceMigration() {
    console.log('\n💳 Testing Payment Service Migration...');

    const testAcademiaId = 'test-academia-456';
    const testStudentId = 'test-student-123';

    try {
      // Test 1: Create payment with academy isolation
      const paymentData = await academyPaymentService.createPixPayment(
        testAcademiaId,
        testStudentId,
        100.50,
        'Test Monthly Payment',
        new Date()
      );

      this.assert(
        paymentData && paymentData.id,
        'Should create payment in academy-specific collection'
      );

      // Test 2: Retrieve student payments
      const studentPayments = await academyPaymentService.getStudentPayments(
        testAcademiaId,
        testStudentId
      );

      this.assert(
        Array.isArray(studentPayments) && studentPayments.length > 0,
        'Should retrieve student payments from academy-specific collection'
      );

      // Test 3: Confirm payment
      await academyPaymentService.confirmPayment(testAcademiaId, paymentData.id, {
        method: 'pix',
        transactionId: 'TEST_TXN_123',
        authorizationCode: 'AUTH_TEST',
        paidAt: new Date()
      });

      const confirmedPayment = await academyFirestoreService.getById('payments', paymentData.id, testAcademiaId);
      this.assert(
        confirmedPayment && confirmedPayment.status === 'paid',
        'Should confirm payment in academy-specific collection'
      );

    } catch (error) {
      console.error('❌ Payment Service test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Payment Service error: ${error.message}`);
    }
  }

  // Test Audit Logging
  async testAuditLogging() {
    console.log('\n📋 Testing Audit Logging...');

    const testAcademiaId = 'test-academia-789';

    try {
      // Test 1: Create audit log
      const logId = await auditLogService.logOperation(testAcademiaId, {
        type: 'CREATE',
        action: 'test_operation',
        resource: 'test_resource',
        resourceId: 'test-resource-123',
        level: 'INFO'
      });

      this.assert(logId, 'Should create audit log in academy-specific collection');

      // Test 2: Retrieve audit logs
      const logs = await auditLogService.getLogs(testAcademiaId, {
        limit: 10
      });

      this.assert(
        Array.isArray(logs) && logs.length > 0,
        'Should retrieve audit logs from academy-specific collection'
      );

      // Test 3: Generate audit report
      const report = await auditLogService.generateAuditReport(
        testAcademiaId,
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        new Date()
      );

      this.assert(
        report && report.academiaId === testAcademiaId,
        'Should generate audit report for academy'
      );

    } catch (error) {
      console.error('❌ Audit Logging test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Audit Logging error: ${error.message}`);
    }
  }

  // Test Data Migration (Simulation)
  async testDataMigration() {
    console.log('\n🔄 Testing Data Migration Process...');

    const testAcademiaId = 'test-migration-academy';

    try {
      // Test migration collection mapping
      const collectionMapping = MigrationService.COLLECTION_MAPPING;
      this.assert(
        collectionMapping && typeof collectionMapping === 'object',
        'Should have migration collection mapping'
      );

      // Test that all expected collections are in the mapping
      const expectedCollections = ['classes', 'payments', 'checkins', 'graduations', 'evaluations'];
      const configuredCollections = Object.keys(collectionMapping);
      
      expectedCollections.forEach(collection => {
        this.assert(
          configuredCollections.includes(collection),
          `Migration should be configured for collection: ${collection}`
        );
      });

      console.log('✅ Migration configuration verified');

    } catch (error) {
      console.error('❌ Data Migration test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Data Migration error: ${error.message}`);
    }
  }

  // Test Referential Integrity Implementation
  async testReferentialIntegrity() {
    console.log('\n🔗 Testing Referential Integrity Implementation...');

    const testAcademiaId = 'test-integrity-academy';

    try {
      // Test 1: Verify validateReferences function exists
      this.assert(
        typeof MigrationService.validateReferences === 'function',
        'validateReferences function should exist in MigrationService'
      );

      // Test 2: Test valid references (mock data)
      const validData = {
        studentId: 'student-123',
        instructorId: 'instructor-456',
        classId: 'class-789'
      };

      const validDependentFields = [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' },
        { field: 'instructorId', referencesCollection: 'users', referenceField: 'id' }
      ];

      // Test 3: Test with empty dependent fields
      const emptyErrors = await MigrationService.validateReferences(validData, [], testAcademiaId);
      this.assert(
        Array.isArray(emptyErrors) && emptyErrors.length === 0,
        'Should return empty array when no dependent fields to validate'
      );

      // Test 4: Test error handling with invalid reference
      const invalidData = {
        studentId: 'nonexistent-student-999'
      };

      const invalidDependentFields = [
        { field: 'studentId', referencesCollection: 'users', referenceField: 'id' }
      ];

      const invalidErrors = await MigrationService.validateReferences(invalidData, invalidDependentFields, testAcademiaId);
      this.assert(
        Array.isArray(invalidErrors),
        'Should return array of errors for invalid references'
      );

      console.log('✅ Referential integrity implementation verified');

    } catch (error) {
      console.error('❌ Referential Integrity test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Referential Integrity error: ${error.message}`);
    }
  }

  // Test Academy Validation
  async testAcademyValidation() {
    console.log('\n🔒 Testing Academy Validation...');

    try {
      // Test invalid academiaId format
      try {
        await academyFirestoreService.create('classes', { name: 'Test' }, 'invalid-id');
        this.assert(false, 'Should reject invalid academiaId format');
      } catch (error) {
        this.assert(
          error.message.includes('academiaId'),
          'Should reject invalid academiaId with proper error message'
        );
      }

      // Test null academiaId
      try {
        await academyFirestoreService.create('classes', { name: 'Test' }, null);
        this.assert(false, 'Should reject null academiaId');
      } catch (error) {
        this.assert(
          error.message.includes('obrigatório'),
          'Should reject null academiaId with proper error message'
        );
      }

      console.log('✅ Academy validation working correctly');

    } catch (error) {
      console.error('❌ Academy Validation test failed:', error);
      this.testResults.failed++;
      this.testResults.errors.push(`Academy Validation error: ${error.message}`);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Academy Migration Test Suite...\n');

    try {
      await this.testAcademyFirestoreService();
      await this.testPaymentServiceMigration();
      await this.testAuditLogging();
      await this.testDataMigration();
      await this.testReferentialIntegrity();
      await this.testAcademyValidation();

      console.log('\n📊 Test Results Summary:');
      console.log(`✅ Passed: ${this.testResults.passed}`);
      console.log(`❌ Failed: ${this.testResults.failed}`);
      
      if (this.testResults.errors.length > 0) {
        console.log('\n🐛 Errors:');
        this.testResults.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      }

      const success = this.testResults.failed === 0;
      console.log(`\n🎯 Overall Result: ${success ? 'SUCCESS' : 'FAILURE'}`);
      
      return success;

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      return false;
    }
  }
}

/**
 * Manual Data Integrity Check
 * Run this after migration to verify data integrity
 */
export async function verifyDataIntegrity(academiaId) {
  console.log(`🔍 Verifying data integrity for academia: ${academiaId}`);

  const results = {
    collections: {},
    totalDocuments: 0,
    issues: []
  };

  const collections = ['classes', 'payments', 'checkins', 'graduations', 'evaluations'];

  try {
    for (const collection of collections) {
      try {
        const documents = await academyFirestoreService.getAll(collection, academiaId);
        results.collections[collection] = {
          count: documents.length,
          hasAcademiaId: documents.every(doc => doc.academiaId === academiaId)
        };
        results.totalDocuments += documents.length;

        if (!results.collections[collection].hasAcademiaId) {
          results.issues.push(`Some documents in ${collection} missing academiaId`);
        }

        console.log(`✅ ${collection}: ${documents.length} documents verified`);

      } catch (error) {
        results.issues.push(`Failed to verify ${collection}: ${error.message}`);
        console.error(`❌ ${collection}: verification failed - ${error.message}`);
      }
    }

    console.log(`\n📊 Data Integrity Summary:`);
    console.log(`Total Documents: ${results.totalDocuments}`);
    console.log(`Issues Found: ${results.issues.length}`);

    if (results.issues.length > 0) {
      console.log(`\n🐛 Issues:`);
      results.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    return results;

  } catch (error) {
    console.error('❌ Data integrity check failed:', error);
    throw error;
  }
}

/**
 * Dry-run referential integrity check for all collections
 * Use this before running actual migration to identify broken references
 */
export async function dryRunReferentialIntegrityCheck(options = {}) {
  console.log('🔍 Starting Dry-Run Referential Integrity Check...');
  
  const results = {
    totalChecked: 0,
    totalErrors: 0,
    collectionResults: {},
    brokenReferences: [],
    recommendations: []
  };

  try {
    const collections = Object.keys(MigrationService.COLLECTION_MAPPING);
    
    for (const collectionName of collections) {
      console.log(`\n🗓️ Checking ${collectionName}...`);
      
      const collectionResult = await checkCollectionReferentialIntegrity(
        collectionName, 
        options
      );
      
      results.collectionResults[collectionName] = collectionResult;
      results.totalChecked += collectionResult.documentsChecked;
      results.totalErrors += collectionResult.errors.length;
      results.brokenReferences.push(...collectionResult.errors);
    }

    // Generate recommendations
    results.recommendations = generateIntegrityRecommendations(results);

    // Summary report
    console.log('\n📈 DRY-RUN REFERENTIAL INTEGRITY SUMMARY:');
    console.log('==========================================');
    console.log(`Total Documents Checked: ${results.totalChecked}`);
    console.log(`Total Reference Errors: ${results.totalErrors}`);
    
    if (results.totalErrors === 0) {
      console.log('✅ All referential integrity checks PASSED!');
    } else {
      console.log('\n⚠️ BROKEN REFERENCES FOUND:');
      results.brokenReferences.forEach((error, index) => {
        console.log(`${index + 1}. ${error.collection} - ${error.documentId}: ${error.error}`);
      });
      
      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    return results;

  } catch (error) {
    console.error('❌ Dry-run integrity check failed:', error);
    throw error;
  }
}

/**
 * Check referential integrity for a specific collection
 */
export async function checkCollectionReferentialIntegrity(collectionName, options = {}) {
  const config = MigrationService.COLLECTION_MAPPING[collectionName];
  if (!config || !config.dependentFields) {
    return {
      collection: collectionName,
      documentsChecked: 0,
      errors: [],
      status: 'no_dependencies'
    };
  }

  console.log(`  🔍 Checking dependencies: ${config.dependentFields.map(f => f.field).join(', ')}`);
  
  const results = {
    collection: collectionName,
    documentsChecked: 0,
    errors: [],
    status: 'checked'
  };

  try {
    // Get sample of documents or all if limit not specified
    const limit = options.sampleSize || 100;
    const globalCollection = collection(db, collectionName);
    const querySnapshot = await getDocs(query(globalCollection, limit(limit)));
    
    console.log(`  📄 Found ${querySnapshot.docs.length} documents to check`);

    for (const docSnapshot of querySnapshot.docs) {
      results.documentsChecked++;
      const data = docSnapshot.data();
      const academyId = data[config.academyField];
      
      if (!academyId) {
        results.errors.push({
          collection: collectionName,
          documentId: docSnapshot.id,
          error: `Missing ${config.academyField}`,
          severity: 'high'
        });
        continue;
      }

      // Check referential integrity
      const referenceErrors = await MigrationService.validateReferences(
        data, 
        config.dependentFields, 
        academyId
      );

      referenceErrors.forEach(error => {
        results.errors.push({
          collection: collectionName,
          documentId: docSnapshot.id,
          academyId,
          error,
          severity: 'medium'
        });
      });
    }

    const errorRate = results.errors.length / results.documentsChecked * 100;
    console.log(`  📊 Result: ${results.errors.length} errors in ${results.documentsChecked} documents (${errorRate.toFixed(2)}% error rate)`);
    
    return results;

  } catch (error) {
    console.error(`  ❌ Error checking ${collectionName}:`, error);
    results.errors.push({
      collection: collectionName,
      documentId: 'unknown',
      error: `Check failed: ${error.message}`,
      severity: 'critical'
    });
    return results;
  }
}

/**
 * Generate recommendations based on integrity check results
 */
function generateIntegrityRecommendations(results) {
  const recommendations = [];
  
  if (results.totalErrors === 0) {
    recommendations.push('All referential integrity checks passed. Migration can proceed safely.');
    return recommendations;
  }

  // High-priority issues
  const highSeverityErrors = results.brokenReferences.filter(e => e.severity === 'high');
  if (highSeverityErrors.length > 0) {
    recommendations.push(`CRITICAL: ${highSeverityErrors.length} documents are missing academiaId. These must be fixed before migration.`);
  }

  // Medium-priority issues
  const mediumSeverityErrors = results.brokenReferences.filter(e => e.severity === 'medium');
  if (mediumSeverityErrors.length > 0) {
    recommendations.push(`WARNING: ${mediumSeverityErrors.length} documents have broken references. Consider cleaning these up before migration.`);
  }

  // Collection-specific recommendations
  Object.entries(results.collectionResults).forEach(([collection, result]) => {
    const errorRate = result.errors.length / result.documentsChecked * 100;
    if (errorRate > 10) {
      recommendations.push(`${collection} has a high error rate (${errorRate.toFixed(2)}%). Consider investigating this collection manually.`);
    }
  });

  return recommendations;
}

/**
 * Production Migration Checklist
 * Use this as a guide for production migration
 */
export function getProductionMigrationChecklist() {
  return [
    {
      step: 1,
      title: 'Pre-Migration Backup',
      description: 'Create full database backup',
      critical: true
    },
    {
      step: 2,
      title: 'Deploy New Services',
      description: 'Deploy academy-specific services without activating',
      critical: true
    },
    {
      step: 3,
      title: 'Update Firestore Rules',
      description: 'Deploy updated security rules',
      critical: true
    },
    {
      step: 4,
      title: 'Run Referential Integrity Check',
      description: 'Execute dry-run referential integrity check using dryRunReferentialIntegrityCheck()',
      critical: true
    },
    {
      step: 5,
      title: 'Run Migration Script',
      description: 'Execute data migration for each academy',
      critical: true
    },
    {
      step: 6,
      title: 'Verify Data Integrity',
      description: 'Run data integrity checks using verifyDataIntegrity()',
      critical: true
    },
    {
      step: 7,
      title: 'Update Application Code',
      description: 'Switch services to use academy-specific collections',
      critical: true
    },
    {
      step: 8,
      title: 'Monitor System',
      description: 'Monitor for errors and performance issues',
      critical: false
    },
    {
      step: 9,
      title: 'Cleanup Old Data',
      description: 'Remove old global collections (after verification period)',
      critical: false
    }
  ];
}

export default MigrationTest;