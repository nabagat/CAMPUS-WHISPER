import crypto from 'crypto';
import { ENV } from '../config/env.js';

const ADJECTIVES = [
  'Courageous', 'Resilient', 'Curious', 'Vibrant', 'Thoughtful',
  'Determined', 'Insightful', 'Mindful', 'Pragmatic', 'Eloquent',
  'Vigilant', 'Resourceful', 'Dynamic', 'Harmonious', 'Observant',
  'Patient', 'Tenacious', 'Brilliant', 'Empathetic', 'Fearless'
];

const NOUNS = [
  'Owl', 'Falcon', 'Otter', 'Lynx', 'Badger',
  'Panda', 'Dolphin', 'Phoenix', 'Sparrow', 'Bison',
  'Eagle', 'Fox', 'Koala', 'Raven', 'Cheetah',
  'Hedgehog', 'Wolf', 'Stag', 'Hawk', 'Robin'
];

const AVATAR_BG_COLORS = [
  '#0284c7', '#0d9488', '#16a34a', '#ca8a04',
  '#ea580c', '#e11d48', '#9333ea', '#4f46e5',
  '#2563eb', '#059669', '#d97706', '#dc2626'
];

/**
 * Generate a friendly, non-identifying pseudonym.
 */
export function generatePseudonym(contextSeed = '') {
  const hash = crypto
    .createHash('sha256')
    .update(`${contextSeed || Math.random()}-${Date.now()}`)
    .digest('hex');

  const adjIndex = parseInt(hash.substring(0, 4), 16) % ADJECTIVES.length;
  const nounIndex = parseInt(hash.substring(4, 8), 16) % NOUNS.length;
  const number = (parseInt(hash.substring(8, 12), 16) % 99) + 1;

  return `${ADJECTIVES[adjIndex]} ${NOUNS[nounIndex]} #${number}`;
}

/**
 * Generates an SVG avatar seed and background color.
 */
export function generatePseudonymAvatar(pseudonym) {
  const hash = crypto.createHash('md5').update(pseudonym).digest('hex');
  const colorIndex = parseInt(hash.substring(0, 2), 16) % AVATAR_BG_COLORS.length;
  const initials = pseudonym
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('');

  return {
    seed: hash.substring(0, 8),
    bgColor: AVATAR_BG_COLORS[colorIndex],
    initials: initials.toUpperCase() || 'CV',
  };
}

/**
 * Creates an HMAC hash of a user ID for ownership validation.
 * Never stores or exposes the raw user ID in publicly readable fields.
 */
export function createAuthorHash(userId) {
  return crypto
    .createHmac('sha256', ENV.ANONYMITY_SALT)
    .update(userId.toString())
    .digest('hex');
}

/**
 * Creates a unique vote hash per user per target.
 * Cannot be reversed to determine which posts a user voted on.
 */
export function createVoteHash(userId, targetId) {
  return crypto
    .createHmac('sha256', ENV.ANONYMITY_SALT)
    .update(`${userId.toString()}:${targetId.toString()}`)
    .digest('hex');
}
