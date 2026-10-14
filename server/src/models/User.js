import bcrypt from 'bcryptjs';
import { FirebaseModel } from '../config/firebaseStore.js';

class UserModelClass extends FirebaseModel {
  constructor() {
    super('users', {
      role: 'student',
      status: 'active',
      department: 'General Campus',
      academicYear: 'Other',
      avatarSeed: () => Math.random().toString(36).substring(2, 10),
    });
  }

  async create(data) {
    const copy = { ...data };
    if (copy.email) {
      copy.email = copy.email.toLowerCase().trim();
    }
    // Hash password if not already bcrypt hashed
    if (copy.password && !copy.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      copy.password = await bcrypt.hash(copy.password, salt);
    }
    const doc = await super.create(copy);
    return this._attachMethods(doc);
  }

  _attachMethods(doc) {
    if (!doc) return null;
    doc.comparePassword = async function (candidatePassword) {
      if (!this.password || !candidatePassword) return false;
      return bcrypt.compare(candidatePassword, this.password);
    };
    return doc;
  }

  findOne(query) {
    const q = super.findOne(query);
    const origExecute = q.execute.bind(q);
    q.execute = async () => {
      const res = await origExecute();
      return this._attachMethods(res);
    };
    return q;
  }

  findById(id) {
    const q = super.findById(id);
    const origExecute = q.execute.bind(q);
    q.execute = async () => {
      const res = await origExecute();
      return this._attachMethods(res);
    };
    return q;
  }
}

export const User = new UserModelClass();
