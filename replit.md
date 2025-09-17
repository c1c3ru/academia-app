# React Native Academia Management Application

## Overview
A comprehensive React Native application for managing martial arts academies, with features for student management, class scheduling, payments, evaluations, and more.

## Recent Changes (September 17, 2025)

### Major Migration: Academy-Based Data Isolation

**COMPLETED:** Implemented comprehensive academy-based data isolation for Firebase Firestore, migrating from global collections to academy-specific subcollections to ensure proper data separation between different academies/gyms.

#### Architecture Changes

**Before:**
```
/classes/{classId}
/payments/{paymentId}  
/checkins/{checkinId}
/graduations/{graduationId}
```

**After:**
```
/gyms/{academiaId}/classes/{classId}
/gyms/{academiaId}/payments/{paymentId}
/gyms/{academiaId}/checkins/{checkinId}  
/gyms/{academiaId}/graduations/{graduationId}
/gyms/{academiaId}/evaluations/{evaluationId}
/gyms/{academiaId}/audit_logs/{logId}
```

#### New Services Created

1. **migrationService.js** - Comprehensive data migration from global to academy-specific collections
2. **academyFirestoreService.js** - Academy-isolated Firestore operations with validation
3. **academyValidation.js** - Validation middleware and helper functions for academy operations
4. **academyPaymentService.js** - Academy-specific payment operations 
5. **academyEvaluationService.js** - Academy-specific evaluation and graduation management
6. **auditLogService.js** - Comprehensive audit logging infrastructure

#### Key Features Implemented

- **Data Isolation**: Each academy's data is completely isolated in separate subcollections
- **Academy Validation**: All operations require and validate academiaId before execution
- **Audit Logging**: Complete audit trail for all critical operations with user context
- **Migration Tools**: Safe migration from global to academy-specific collections
- **Security Rules**: Updated Firestore rules to enforce academy-based access control
- **Backward Compatibility**: Existing services remain unchanged during transition

#### Security Enhancements

- Updated `firestore.rules` with academy-specific access controls
- Audit logs restricted to admin access only
- Critical audit backup collection for sensitive operations
- Cross-academy access prevention with validation middleware

#### Migration Process

1. **Analysis**: Identified all global collections requiring migration
2. **Service Creation**: Built new academy-specific services 
3. **Validation Layer**: Added comprehensive validation middleware
4. **Migration Tools**: Created safe migration utilities with rollback capability
5. **Security Rules**: Updated Firestore security rules
6. **Testing Framework**: Created comprehensive test suite for migration verification

## Project Architecture

### Core Services
- `firestoreService.js` - Legacy global Firestore operations (being phased out)
- `academyFirestoreService.js` - NEW: Academy-isolated database operations
- `academyCollectionsService.js` - Academy-specific collection management
- `firebase.js` - Firebase configuration and initialization

### Academy-Specific Services  
- `academyPaymentService.js` - Payment processing with academy isolation
- `academyEvaluationService.js` - Student evaluations and graduations
- `auditLogService.js` - Comprehensive audit logging
- `migrationService.js` - Data migration utilities

### Validation & Security
- `academyValidation.js` - Academy validation middleware and helpers
- `firestore.rules` - Updated security rules for academy isolation

### User Interface
- React Native with React Navigation
- Context providers for authentication and theme
- Screen-based architecture organized by user roles

## User Preferences

### Development Standards
- Use academy-specific services for all new features
- Always validate academiaId before database operations
- Include audit logging for critical operations
- Follow existing React Native and Firebase patterns

### Code Style
- Use ES6+ syntax and async/await
- Comprehensive error handling with user-friendly messages
- Console logging for debugging and audit trails
- Consistent naming conventions (camelCase for variables, PascalCase for components)

## Migration Status

✅ **COMPLETED:**
- Migration service implementation
- Academy-specific Firestore service
- Validation middleware and helpers
- Payment service migration
- Evaluation service migration  
- Audit logging infrastructure
- Updated Firestore security rules
- Test suite for migration verification

⏳ **PENDING:**
- Production migration execution (when ready)
- Application code updates to use new services
- Legacy service deprecation
- Performance monitoring post-migration

## Collections Structure

### Academy-Specific Collections (Isolated)
```
/gyms/{academiaId}/
  ├── classes/          - Academy classes
  ├── payments/         - Student payments  
  ├── checkins/         - Class check-ins
  ├── graduations/      - Student graduations
  ├── evaluations/      - Student evaluations
  ├── modalities/       - Academy modalities
  ├── plans/            - Subscription plans
  ├── announcements/    - Academy announcements
  ├── events/           - Academy events
  ├── eventRegistrations/ - Event registrations
  ├── evaluation_schedules/ - Evaluation schedules
  └── audit_logs/       - Audit trail (admin only)
```

### Global Collections (Shared)
```
/users/              - User accounts (all academies)
/gyms/               - Academy/gym configurations  
/invites/            - Academy invitations
```

## Development Guidelines

1. **Always use academy-specific services** for new features
2. **Validate academiaId** in all database operations
3. **Add audit logging** for critical operations  
4. **Follow security best practices** with proper error handling
5. **Test thoroughly** before deploying academy-related changes

## Testing

Use the migration test suite in `src/tests/migrationTest.js`:

```javascript
import { MigrationTest } from './src/tests/migrationTest';

const test = new MigrationTest();
await test.runAllTests();
```

---

*Last updated: September 17, 2025*
*Migration Status: IMPLEMENTATION COMPLETE - Ready for Production Migration*