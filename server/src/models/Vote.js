import { FirebaseModel } from '../config/firebaseStore.js';

class VoteModelClass extends FirebaseModel {
  constructor() {
    super('votes', {
      value: 1,
    });
  }
}

export const Vote = new VoteModelClass();
