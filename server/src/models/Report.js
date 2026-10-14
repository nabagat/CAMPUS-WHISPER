import { FirebaseModel } from '../config/firebaseStore.js';

export const REPORT_REASONS = [
  'harassment',
  'hate_speech',
  'spam',
  'doxxing',
  'misinformation',
  'threat',
  'other',
];

class ReportModelClass extends FirebaseModel {
  constructor() {
    super('reports', {
      reporterNotes: '',
      status: 'pending',
      moderatorNotes: '',
      actionTaken: 'none',
      reviewedBy: null,
      reviewedAt: null,
    });
  }
}

export const Report = new ReportModelClass();
