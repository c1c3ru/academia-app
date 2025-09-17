# Firestore Restructure Plan

## Current Structure Analysis

### Main Collections (Keep as is):
- `users/` - Global user profiles with academiaId reference
- `gyms/` - Main academies collection
- `invites/` - Global invites (cross-academy functionality)

### Current Subcollections under gyms/{academiaId}/:
- `alunos/` - Students (legacy name)
- `instrutores/` - Instructors (legacy name) 
- `turmas/` - Classes (legacy name)
- `pagamentos/` - Payments (legacy name)
- `planos/` - Plans (legacy name)
- `modalities/` - Modalities
- `plans/` - Plans (duplicate?)
- `announcements/` - Announcements
- `graduation_levels/` - Graduation levels
- `classes/` - Classes (duplicate?)
- `payments/` - Payments (duplicate?)
- `checkins/` - Check-ins
- `graduations/` - Graduations
- `evaluations/` - Evaluations
- `evaluation_schedules/` - Evaluation schedules
- `events/` - Events
- `eventRegistrations/` - Event registrations
- `notifications/` - Notifications
- `injuries/` - Injuries
- `audit_logs/` - Audit logs
- `critical_audit_backup/` - Critical backups

## Proposed Clean Structure

### Main Collections:
```
users/
gyms/
invites/
```

### Standardized Subcollections under gyms/{academiaId}/:
```
students/          (rename from alunos)
instructors/       (rename from instrutores)
classes/           (rename from turmas, consolidate duplicates)
payments/          (rename from pagamentos, consolidate duplicates)
plans/             (consolidate planos/plans)
modalities/
announcements/
graduation_levels/
graduations/
evaluations/
evaluation_schedules/
events/
event_registrations/ (rename from eventRegistrations)
notifications/
injuries/
checkins/
audit_logs/
```

## Migration Steps:
1. Update security rules with standardized English names
2. Create migration script to rename collections
3. Update application code to use new paths
4. Remove legacy/duplicate collections
5. Test all functionality
