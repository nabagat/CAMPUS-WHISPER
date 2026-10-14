import { FirebaseModel } from '../config/firebaseStore.js';

class AuditLogModelClass extends FirebaseModel {
  constructor() {
    super('auditlogs', {
      reason: '',
      metadata: {},
    });
  }
}

export const AuditLog = new AuditLogModelClass();
