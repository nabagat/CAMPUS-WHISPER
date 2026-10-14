import { FirebaseModel } from '../config/firebaseStore.js';

class IssueClusterModelClass extends FirebaseModel {
  constructor() {
    super('issueclusters', {
      recurrenceCount: 1,
      sentimentScore: -0.2,
      dominantSentiment: 'Frustrated',
      actionableAdvice: '',
      samplePostIds: [],
      status: 'investigating',
      lastUpdated: () => new Date(),
    });
  }
}

export const IssueCluster = new IssueClusterModelClass();
