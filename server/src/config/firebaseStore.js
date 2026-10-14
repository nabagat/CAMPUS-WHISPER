import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_DIR = isVercel ? '/tmp' : DEFAULT_DATA_DIR;
const DB_FILE = path.join(DATA_DIR, 'firebase_db.json');

// In-Memory Storage Cache backed by persistent JSON file
class FirebaseStore {
  constructor() {
    this.collections = {
      users: new Map(),
      posts: new Map(),
      comments: new Map(),
      votes: new Map(),
      reports: new Map(),
      auditlogs: new Map(),
      issueclusters: new Map(),
    };
    this.isLoaded = false;
    this.saveTimeout = null;
  }

  async init() {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // If running on Vercel and /tmp/firebase_db.json does not exist yet, copy initial seed from project
      if (isVercel && !fs.existsSync(DB_FILE)) {
        const defaultFile = path.join(DEFAULT_DATA_DIR, 'firebase_db.json');
        if (fs.existsSync(defaultFile)) {
          try {
            fs.copyFileSync(defaultFile, DB_FILE);
          } catch (e) {
            console.warn('[FIREBASE_STORE] Could not copy initial db file to /tmp:', e.message);
          }
        }
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          for (const [colName, docs] of Object.entries(parsed)) {
            const map = new Map();
            if (Array.isArray(docs)) {
              docs.forEach((doc) => {
                map.set(String(doc._id), this._deserializeDoc(doc));
              });
            }
            this.collections[colName] = map;
          }
        }
      }
      this.isLoaded = true;
      console.log('📦 [FIREBASE_STORE] Inbuilt persistent Firestore store initialized at:', DB_FILE);
    } catch (err) {
      console.error('❌ [FIREBASE_STORE] Failed to load data file, starting with empty store:', err.message);
      this.isLoaded = true;
    }
  }

  _deserializeDoc(doc) {
    const copy = { ...doc };
    if (copy.createdAt && typeof copy.createdAt === 'string') {
      copy.createdAt = new Date(copy.createdAt);
    }
    if (copy.updatedAt && typeof copy.updatedAt === 'string') {
      copy.updatedAt = new Date(copy.updatedAt);
    }
    if (copy.resolvedAt && typeof copy.resolvedAt === 'string') {
      copy.resolvedAt = new Date(copy.resolvedAt);
    }
    return copy;
  }

  scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveToDisk();
    }, 150);
  }

  async saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dump = {};
      for (const [colName, map] of Object.entries(this.collections)) {
        dump[colName] = Array.from(map.values());
      }
      await fs.promises.writeFile(DB_FILE, JSON.stringify(dump, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ [FIREBASE_STORE] Failed to persist data to disk:', err.message);
    }
  }

  getCollection(name) {
    const key = name.toLowerCase();
    if (!this.collections[key]) {
      this.collections[key] = new Map();
    }
    return this.collections[key];
  }

  clearAll() {
    for (const key of Object.keys(this.collections)) {
      this.collections[key].clear();
    }
    this.saveToDisk();
  }
}

export const firebaseStore = new FirebaseStore();

// Generate a 24-char hex string similar to MongoDB ObjectId
export function generateDocId() {
  return crypto.randomBytes(12).toString('hex');
}

/**
 * Deep getter for dot-notation paths e.g. "aiAnalysis.sentiment"
 */
function getDeepValue(obj, pathStr) {
  if (!obj) return undefined;
  if (!pathStr.includes('.')) return obj[pathStr];
  const parts = pathStr.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

/**
 * Evaluates whether a document matches query conditions
 */
function matchesQuery(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or') {
      if (!Array.isArray(value) || !value.some((subQuery) => matchesQuery(doc, subQuery))) {
        return false;
      }
      continue;
    }

    if (key === '$and') {
      if (!Array.isArray(value) || !value.every((subQuery) => matchesQuery(doc, subQuery))) {
        return false;
      }
      continue;
    }

    const docVal = getDeepValue(doc, key);

    // Operator queries: { field: { $gt: 5, $in: [...] } }
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof RegExp) && !(value instanceof Date)) {
      for (const [op, opVal] of Object.entries(value)) {
        if (op === '$in') {
          if (Array.isArray(docVal)) {
            const hasMatch = docVal.some((item) => opVal.map(String).includes(String(item)));
            if (!hasMatch) return false;
          } else if (!opVal.map(String).includes(String(docVal))) {
            return false;
          }
        } else if (op === '$nin') {
          if (Array.isArray(docVal)) {
            const hasMatch = docVal.some((item) => opVal.map(String).includes(String(item)));
            if (hasMatch) return false;
          } else if (opVal.map(String).includes(String(docVal))) {
            return false;
          }
        } else if (op === '$ne') {
          if (String(docVal) === String(opVal)) return false;
        } else if (op === '$gt') {
          if (!(docVal > opVal)) return false;
        } else if (op === '$gte') {
          if (!(docVal >= opVal)) return false;
        } else if (op === '$lt') {
          if (!(docVal < opVal)) return false;
        } else if (op === '$lte') {
          if (!(docVal <= opVal)) return false;
        } else if (op === '$regex') {
          const flags = value.$options || '';
          const regex = new RegExp(opVal, flags);
          if (!regex.test(String(docVal || ''))) return false;
        }
      }
      continue;
    }

    if (value instanceof RegExp) {
      if (!value.test(String(docVal || ''))) return false;
      continue;
    }

    // Array field containment check: if docVal is array (like tags), check if value is in array
    if (Array.isArray(docVal)) {
      if (!docVal.map(String).includes(String(value))) return false;
      continue;
    }

    // Direct match (handling ObjectId or String equality)
    if (String(docVal) !== String(value)) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a Document instance with .save() method
 */
function wrapDocument(raw, model) {
  if (!raw) return null;
  const doc = { ...raw };

  // Attach .save() method
  Object.defineProperty(doc, 'save', {
    enumerable: false,
    value: async function () {
      doc.updatedAt = new Date();
      model._set(doc._id, doc);
      return wrapDocument(doc, model);
    },
  });

  // Attach .toObject() and .toJSON()
  Object.defineProperty(doc, 'toObject', {
    enumerable: false,
    value: function () {
      return { ...doc };
    },
  });

  return doc;
}

/**
 * Query Chain Class supporting .sort(), .skip(), .limit(), .select(), .populate(), .lean()
 */
class QueryChain {
  constructor(model, queryFilter = {}) {
    this.model = model;
    this.queryFilter = queryFilter;
    this._sortObj = null;
    this._skipNum = 0;
    this._limitNum = 0;
    this._selectFields = [];
    this._isLean = false;
    this._isFindOne = false;
  }

  findOne() {
    this._isFindOne = true;
    return this;
  }

  sort(sortArg) {
    this._sortObj = sortArg;
    return this;
  }

  skip(n) {
    this._skipNum = Math.max(0, parseInt(n) || 0);
    return this;
  }

  limit(n) {
    this._limitNum = Math.max(0, parseInt(n) || 0);
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      this._selectFields = fields.split(/\s+/).filter(Boolean);
    } else if (Array.isArray(fields)) {
      this._selectFields = fields;
    }
    return this;
  }

  populate() {
    // Populate is handled gracefully
    return this;
  }

  lean() {
    this._isLean = true;
    return this;
  }

  async execute() {
    const col = firebaseStore.getCollection(this.model.collectionName);
    let results = [];

    for (const doc of col.values()) {
      if (matchesQuery(doc, this.queryFilter)) {
        results.push({ ...doc });
      }
    }

    // Apply Sorting
    if (this._sortObj) {
      const sortEntries = Object.entries(this._sortObj);
      results.sort((a, b) => {
        for (const [key, dir] of sortEntries) {
          const valA = getDeepValue(a, key);
          const valB = getDeepValue(b, key);
          if (valA === valB) continue;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          const comparison = valA > valB ? 1 : -1;
          return dir === -1 || dir === 'desc' ? -comparison : comparison;
        }
        return 0;
      });
    }

    // Apply Pagination
    if (this._skipNum > 0) {
      results = results.slice(this._skipNum);
    }
    if (this._limitNum > 0) {
      results = results.slice(0, this._limitNum);
    }

    // Apply field selection
    const filterFields = (item) => {
      const copy = { ...item };
      // By default, authorRef and authorHash are hidden unless explicitly selected with '+'
      const explicitAuthorHash = this._selectFields.includes('+authorHash') || this._selectFields.includes('authorHash');
      const explicitAuthorRef = this._selectFields.includes('+authorRef') || this._selectFields.includes('authorRef');

      if (!explicitAuthorHash) delete copy.authorHash;
      if (!explicitAuthorRef) delete copy.authorRef;

      // Handle negative selects e.g. -password
      for (const sel of this._selectFields) {
        if (sel.startsWith('-')) {
          delete copy[sel.slice(1)];
        }
      }

      return this._isLean ? copy : wrapDocument(copy, this.model);
    };

    if (this._isFindOne) {
      const single = results[0];
      return single ? filterFields(single) : null;
    }

    return results.map(filterFields);
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

/**
 * Base Model Class providing Mongoose/Firestore compatible operations
 */
export class FirebaseModel {
  constructor(collectionName, schemaDefaults = {}) {
    this.collectionName = collectionName;
    this.schemaDefaults = schemaDefaults;
  }

  _getCollection() {
    return firebaseStore.getCollection(this.collectionName);
  }

  _set(id, data) {
    const col = this._getCollection();
    col.set(String(id), data);
    firebaseStore.scheduleSave();
  }

  async create(data) {
    const col = this._getCollection();
    if (Array.isArray(data)) {
      const created = [];
      for (const item of data) {
        created.push(await this.create(item));
      }
      return created;
    }

    const docId = data._id ? String(data._id) : generateDocId();
    const doc = {
      ...this.schemaDefaults,
      ...data,
      _id: docId,
      id: docId,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };

    col.set(docId, doc);
    firebaseStore.scheduleSave();
    return wrapDocument(doc, this);
  }

  find(query = {}) {
    return new QueryChain(this, query);
  }

  findOne(query = {}) {
    return new QueryChain(this, query).findOne();
  }

  findById(id) {
    if (!id) return new QueryChain(this, { _id: 'NOT_FOUND' }).findOne();
    return new QueryChain(this, { _id: String(id) }).findOne();
  }

  async findByIdAndUpdate(id, update = {}, options = {}) {
    const col = this._getCollection();
    const existing = col.get(String(id));
    if (!existing) return null;

    const updated = { ...existing };

    // Handle MongoDB $inc operator
    if (update.$inc) {
      for (const [incKey, incVal] of Object.entries(update.$inc)) {
        updated[incKey] = (updated[incKey] || 0) + Number(incVal);
      }
    }

    // Handle MongoDB $set operator
    if (update.$set) {
      Object.assign(updated, update.$set);
    }

    // Handle top-level keys
    for (const [key, val] of Object.entries(update)) {
      if (!key.startsWith('$')) {
        updated[key] = val;
      }
    }

    updated.updatedAt = new Date();
    col.set(String(id), updated);
    firebaseStore.scheduleSave();

    return wrapDocument(updated, this);
  }

  async findByIdAndDelete(id) {
    const col = this._getCollection();
    const existing = col.get(String(id));
    if (!existing) return null;

    col.delete(String(id));
    firebaseStore.scheduleSave();
    return wrapDocument(existing, this);
  }

  async countDocuments(query = {}) {
    const col = this._getCollection();
    let count = 0;
    for (const doc of col.values()) {
      if (matchesQuery(doc, query)) count++;
    }
    return count;
  }

  async deleteMany(query = {}) {
    const col = this._getCollection();
    let deletedCount = 0;
    for (const [id, doc] of Array.from(col.entries())) {
      if (matchesQuery(doc, query)) {
        col.delete(id);
        deletedCount++;
      }
    }
    firebaseStore.scheduleSave();
    return { deletedCount };
  }

  async updateMany(query = {}, update = {}) {
    const col = this._getCollection();
    let modifiedCount = 0;
    for (const [id, doc] of Array.from(col.entries())) {
      if (matchesQuery(doc, query)) {
        const updated = { ...doc, ...update, updatedAt: new Date() };
        col.set(id, updated);
        modifiedCount++;
      }
    }
    firebaseStore.scheduleSave();
    return { modifiedCount };
  }

  async aggregate(pipeline = []) {
    const col = this._getCollection();
    let results = Array.from(col.values()).map((d) => ({ ...d }));

    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter((doc) => matchesQuery(doc, stage.$match));
      } else if (stage.$unwind) {
        const field = stage.$unwind.replace('$', '');
        const expanded = [];
        for (const doc of results) {
          const arr = doc[field];
          if (Array.isArray(arr) && arr.length > 0) {
            for (const item of arr) {
              expanded.push({ ...doc, [field]: item });
            }
          }
        }
        results = expanded;
      } else if (stage.$group) {
        const groups = new Map();
        const { _id: groupField, ...accumulators } = stage.$group;

        for (const doc of results) {
          let groupKey = 'all';
          if (typeof groupField === 'string' && groupField.startsWith('$')) {
            groupKey = getDeepValue(doc, groupField.slice(1));
          } else if (groupField !== null) {
            groupKey = groupField;
          }

          if (!groups.has(groupKey)) {
            const initial = { _id: groupKey };
            for (const [accKey, accVal] of Object.entries(accumulators)) {
              if (accVal.$sum !== undefined) initial[accKey] = 0;
              if (accVal.$avg !== undefined) {
                initial[accKey] = 0;
                initial[`_${accKey}_count`] = 0;
              }
            }
            groups.set(groupKey, initial);
          }

          const current = groups.get(groupKey);
          for (const [accKey, accVal] of Object.entries(accumulators)) {
            if (accVal.$sum !== undefined) {
              const val = accVal.$sum === 1 ? 1 : Number(getDeepValue(doc, accVal.$sum.slice(1))) || 0;
              current[accKey] += val;
            } else if (accVal.$avg !== undefined) {
              const val = Number(getDeepValue(doc, accVal.$avg.slice(1))) || 0;
              current[accKey] += val;
              current[`_${accKey}_count`] += 1;
            }
          }
        }

        // Finalize averages
        results = Array.from(groups.values()).map((g) => {
          for (const [accKey, accVal] of Object.entries(accumulators)) {
            if (accVal.$avg !== undefined && g[`_${accKey}_count`] > 0) {
              g[accKey] = g[accKey] / g[`_${accKey}_count`];
              delete g[`_${accKey}_count`];
            }
          }
          return g;
        });
      } else if (stage.$sort) {
        const sortEntries = Object.entries(stage.$sort);
        results.sort((a, b) => {
          for (const [key, dir] of sortEntries) {
            const valA = getDeepValue(a, key);
            const valB = getDeepValue(b, key);
            if (valA === valB) continue;
            const comp = valA > valB ? 1 : -1;
            return dir === -1 ? -comp : comp;
          }
          return 0;
        });
      } else if (stage.$limit) {
        results = results.slice(0, stage.$limit);
      }
    }

    return results;
  }
}
