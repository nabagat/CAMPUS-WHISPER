import { FirebaseModel } from '../config/firebaseStore.js';

class CommentModelClass extends FirebaseModel {
  constructor() {
    super('comments', {
      parentId: null,
      isAuthorOP: false,
      status: 'active',
      upvotes: 0,
      downvotes: 0,
      score: 0,
      aiAnalysis: {
        toxicity: 0,
        harassment: 0,
        spam: 0,
        threat: 0,
        overallRisk: 'LOW',
        flags: [],
        reasoning: '',
      },
    });
  }
}

export const Comment = new CommentModelClass();
