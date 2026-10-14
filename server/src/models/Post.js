import { FirebaseModel } from '../config/firebaseStore.js';

export const CATEGORIES = [
  'Academics',
  'Faculty',
  'Hostel',
  'Mess',
  'Infrastructure',
  'Administration',
  'Events',
  'General',
];

class PostModelClass extends FirebaseModel {
  constructor() {
    super('posts', {
      category: 'General',
      tags: [],
      status: 'active',
      riskLevel: 'low',
      isSeriousIssue: false,
      score: 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      viewCount: 0,
      moderatorNotes: '',
      resolutionNote: '',
      resolvedAt: null,
      aiAnalysis: {
        toxicity: 0,
        harassment: 0,
        spam: 0,
        threat: 0,
        overallRisk: 'LOW',
        flags: [],
        reasoning: '',
        sentiment: 'Neutral',
        suggestedCategory: '',
        detectedTopics: [],
      },
    });
  }
}

export const Post = new PostModelClass();
