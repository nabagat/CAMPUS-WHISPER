import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { Post } from '../src/models/Post.js';
import { seedDatabase } from '../src/utils/seedData.js';

test.before(async () => {
  await connectDB();
  await seedDatabase();
});

test.after(async () => {
  await closeDB();
});

test('GET /api/health - Returns 200 and system status', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'online');
  assert.equal(res.body.platform, 'CampusVoice API');
});

test('POST /api/auth/login - Allows valid student login', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'student@campus.edu',
      password: 'Password123!',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token, 'Should return JWT token');
  assert.equal(res.body.user.role, 'student');
});

test('POST /api/auth/login - Rejects invalid credentials', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'student@campus.edu',
      password: 'WrongPassword!',
    });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('POST /api/posts/precheck - Provides AI pre-moderation and tagging preview', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@campus.edu', password: 'Password123!' });

  const token = loginRes.body.token;

  const res = await request(app)
    .post('/api/posts/precheck')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Water cooler on 2nd floor has foul taste and yellow tint',
      body: 'Students in block B notice the drinking water filter has not been serviced. We need fresh water filters installed.',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.moderation);
  assert.ok(res.body.data.suggestedCategory);
});

test('POST /api/posts - Creates anonymous post and NEVER exposes author identity in public response', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@campus.edu', password: 'Password123!' });

  const token = loginRes.body.token;

  const res = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Lab 4 oscilloscope frequency calibration is off by 15%',
      body: 'During our signals and systems practical, multiple lab benches had oscilloscopes with corrupted frequency scales. Please re-calibrate.',
      category: 'Infrastructure',
      tags: ['#LabEquipment', '#Circuits'],
      isSeriousIssue: false,
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.post.pseudonym, 'Should have a pseudonym');
  assert.equal(res.body.post.authorRef, undefined, 'authorRef MUST NEVER be exposed');
  assert.equal(res.body.post.authorHash, undefined, 'authorHash MUST NEVER be exposed');
  assert.equal(res.body.post.email, undefined, 'Student email MUST NEVER be exposed');
});

test('GET /api/posts - Lists public posts with category and status filter', async () => {
  const res = await request(app).get('/api/posts?category=Infrastructure');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);

  // Verify none of the items in public list leak author identity
  for (const item of res.body.data) {
    assert.equal(item.authorRef, undefined);
    assert.equal(item.authorHash, undefined);
    assert.equal(item.email, undefined);
    assert.ok(item.pseudonym);
  }
});

test('POST /api/votes - Casts upvote on a post and recalculates score', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@campus.edu', password: 'Password123!' });

  const token = loginRes.body.token;
  const post = await Post.findOne({ status: 'active' });

  const initialScore = post.score;

  const res = await request(app)
    .post('/api/votes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      targetId: post._id.toString(),
      targetType: 'post',
      value: 1,
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(typeof res.body.data.score === 'number');
});

test('POST /api/reports - Submits user report on post', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@campus.edu', password: 'Password123!' });

  const token = loginRes.body.token;
  const post = await Post.findOne({ status: 'active' });

  const res = await request(app)
    .post('/api/reports')
    .set('Authorization', `Bearer ${token}`)
    .send({
      targetId: post._id.toString(),
      targetType: 'post',
      reason: 'spam',
      reporterNotes: 'Duplicate post test submission',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
});

test('RBAC - Moderator can access pending queue, normal student cannot', async () => {
  const studentLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student@campus.edu', password: 'Password123!' });

  const modLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'moderator@campus.edu', password: 'Password123!' });

  // Student should get 403 Forbidden
  const studentReq = await request(app)
    .get('/api/moderation/pending')
    .set('Authorization', `Bearer ${studentLogin.body.token}`);
  assert.equal(studentReq.status, 403);

  // Moderator should get 200 OK
  const modReq = await request(app)
    .get('/api/moderation/pending')
    .set('Authorization', `Bearer ${modLogin.body.token}`);
  assert.equal(modReq.status, 200);
  assert.equal(modReq.body.success, true);
  assert.ok(modReq.body.data.posts);
});

test('GET /api/analytics/pulse - Returns public campus transparency pulse and sentiment', async () => {
  const res = await request(app).get('/api/analytics/pulse');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.categories);
  assert.ok(res.body.data.sentiments);
  assert.ok(res.body.data.aiSummary);
});
