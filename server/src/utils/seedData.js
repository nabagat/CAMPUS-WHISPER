import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Vote } from '../models/Vote.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { IssueCluster } from '../models/IssueCluster.js';
import {
  generatePseudonym,
  generatePseudonymAvatar,
  createAuthorHash,
  createVoteHash,
} from '../services/pseudonymService.js';

export async function seedDatabase() {
  console.log('🌱 [SEED] Starting CampusVoice database seed...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Vote.deleteMany({}),
    Report.deleteMany({}),
    AuditLog.deleteMany({}),
    IssueCluster.deleteMany({}),
  ]);

  console.log('🧹 [SEED] Cleared previous database collections.');

  // 1. Create Core Users
  const studentUser = await User.create({
    email: 'student@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Computer Science',
    academicYear: '3rd Year',
  });

  const moderatorUser = await User.create({
    email: 'moderator@campus.edu',
    password: 'Password123!',
    role: 'moderator',
    department: 'Campus Student Affairs',
    academicYear: 'Staff',
  });

  const adminUser = await User.create({
    email: 'admin@campus.edu',
    password: 'Password123!',
    role: 'admin',
    department: 'Dean of Students Office',
    academicYear: 'Staff',
  });

  const studentAlex = await User.create({
    email: 'alex@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Electrical Engineering',
    academicYear: '2nd Year',
  });

  const studentPriya = await User.create({
    email: 'priya@campus.edu',
    password: 'Password123!',
    role: 'student',
    department: 'Mechanical Engineering',
    academicYear: '4th Year',
  });

  console.log('👥 [SEED] Created demo accounts:');
  console.log('   - student@campus.edu (Student)');
  console.log('   - moderator@campus.edu (Moderator)');
  console.log('   - admin@campus.edu (Admin)');

  // 2. Realistic Campus Posts
  const rawPosts = [
    {
      title: 'Main Library 3rd Floor Wi-Fi drops every 10 minutes during peak hours',
      body: 'Students trying to submit assignments and stream online lectures are constantly getting disconnected. Speed tests show high packet loss (over 35%). Can IT Services please check the access points on Block B 3rd Floor?',
      category: 'Infrastructure',
      tags: ['#WiFi', '#Library', '#ITServices'],
      status: 'active',
      score: 42,
      upvotes: 45,
      downvotes: 3,
      isSeriousIssue: false,
      user: studentAlex,
      aiAnalysis: {
        toxicity: 0.05,
        harassment: 0.01,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'LOW',
        sentiment: 'Frustrated',
        suggestedCategory: 'Infrastructure',
        detectedTopics: ['#WiFi', '#Library'],
      },
    },
    {
      title: 'South Campus Mess served raw undercooked chicken on Tuesday night',
      body: 'Multiple students from Hostel 4 and 6 woke up with severe food poisoning yesterday after eating the Tuesday dinner. The inspection logs have not been posted on the mess notice board for two months. We urgently need a food safety audit.',
      category: 'Mess',
      tags: ['#MessHygiene', '#FoodSafety', '#Hostel4'],
      status: 'active',
      score: 88,
      upvotes: 90,
      downvotes: 2,
      isSeriousIssue: true,
      user: studentUser,
      aiAnalysis: {
        toxicity: 0.1,
        harassment: 0.05,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'LOW',
        sentiment: 'Urgent',
        suggestedCategory: 'Mess',
        detectedTopics: ['#MessHygiene', '#FoodSafety'],
      },
    },
    {
      title: 'Course drop deadline occurs before Midterm exam grades are published',
      body: 'According to the academic calendar, the last day to drop a course with a "W" is this Friday, but CS301 and MATH240 professors said midterm grades won\'t be released until next Tuesday. Students cannot make an informed academic decision without knowing where they stand.',
      category: 'Academics',
      tags: ['#CourseDrop', '#Grading', '#AcademicPolicy'],
      status: 'active',
      score: 64,
      upvotes: 65,
      downvotes: 1,
      isSeriousIssue: false,
      user: studentPriya,
      aiAnalysis: {
        toxicity: 0.02,
        harassment: 0.01,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'LOW',
        sentiment: 'Constructive',
        suggestedCategory: 'Academics',
        detectedTopics: ['#CourseDrop', '#AcademicPolicy'],
      },
    },
    {
      title: 'Block C 2nd Floor Hot Water geyser has been leaking and tripping the circuit breaker',
      body: 'There has been no hot water in the north wing washroom for 6 days. When anyone switches on the heater, the master fuse trips the entire floor lights. Maintenance was informed on Monday morning ticket #4912 but nobody showed up.',
      category: 'Hostel',
      tags: ['#HostelC', '#Maintenance', '#Safety'],
      status: 'resolved',
      score: 31,
      upvotes: 32,
      downvotes: 1,
      isSeriousIssue: false,
      user: studentUser,
      resolutionNote: 'Hostel Maintenance team replaced the burned heating coil and re-certified the electrical breaker on Thursday.',
      resolvedAt: new Date(Date.now() - 86400000),
      aiAnalysis: {
        toxicity: 0.05,
        harassment: 0.02,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'LOW',
        sentiment: 'Frustrated',
        suggestedCategory: 'Hostel',
        detectedTopics: ['#HostelC', '#Maintenance'],
      },
    },
    {
      title: 'Digital Electronics lab supervisor has missed 3 consecutive office hour slots',
      body: 'The project milestone is due next week and several teams are stuck on FPGA board pin configurations. When students went to the lab room during published office hours, the door was locked without any notice.',
      category: 'Faculty',
      tags: ['#LabSupport', '#OfficeHours', '#ECE'],
      status: 'active',
      score: 27,
      upvotes: 28,
      downvotes: 1,
      isSeriousIssue: false,
      user: studentAlex,
      aiAnalysis: {
        toxicity: 0.08,
        harassment: 0.05,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'LOW',
        sentiment: 'Urgent',
        suggestedCategory: 'Faculty',
        detectedTopics: ['#LabSupport', '#OfficeHours'],
      },
    },
    {
      title: 'Bus shuttle between North Gate and Metro Station overcrowded at 8:45 AM',
      body: 'Every morning between 8:30 and 9:15 AM, over 100 students are packed at the North Gate waiting for a single 30-seater shuttle. People are constantly late for 9 AM classes. Adding just one extra shuttle in that 45-minute window would solve the bottleneck.',
      category: 'Administration',
      tags: ['#CampusTransit', '#ShuttleBus', '#NorthGate'],
      status: 'active',
      score: 53,
      upvotes: 55,
      downvotes: 2,
      isSeriousIssue: false,
      user: studentPriya,
      aiAnalysis: {
        toxicity: 0.02,
        harassment: 0.01,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'LOW',
        sentiment: 'Constructive',
        suggestedCategory: 'Administration',
        detectedTopics: ['#CampusTransit', '#ShuttleBus'],
      },
    },
    {
      title: 'Proposal: Open Central Library 24/7 during Final Exam Fortnight',
      body: 'Currently the library closes at 11:00 PM. Many students don\'t have quiet study environments in crowded hostel rooms. Peer universities keep common study halls open overnight during exams with student security badge access. Can student council advocate for this?',
      category: 'Academics',
      tags: ['#LibraryHours', '#FinalsStudy', '#StudentCouncil'],
      status: 'active',
      score: 112,
      upvotes: 114,
      downvotes: 2,
      isSeriousIssue: false,
      user: studentUser,
      aiAnalysis: {
        toxicity: 0.01,
        harassment: 0.0,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'LOW',
        sentiment: 'Constructive',
        suggestedCategory: 'Academics',
        detectedTopics: ['#LibraryHours', '#FinalsStudy'],
      },
    },
    {
      title: 'Sports Complex gym equipment cables are frayed and pose injury risk',
      body: 'The cable crossover machine and seated lat pulldown both have visible steel cable fraying with rubber sheathing torn off. If a cable snaps under heavy load, someone will get seriously hurt. Please inspect and replace urgently.',
      category: 'Infrastructure',
      tags: ['#GymSafety', '#SportsComplex', '#Repairs'],
      status: 'under_review',
      riskLevel: 'medium',
      score: 18,
      upvotes: 18,
      downvotes: 0,
      isSeriousIssue: true,
      user: studentAlex,
      aiAnalysis: {
        toxicity: 0.15,
        harassment: 0.02,
        spam: 0.0,
        threat: 0.35,
        overallRisk: 'MEDIUM',
        flags: ['physical_safety_hazard'],
        reasoning: 'Mentions potential physical injury hazard in campus gym equipment. Queued for human verification.',
        sentiment: 'Urgent',
        suggestedCategory: 'Infrastructure',
        detectedTopics: ['#GymSafety', '#Repairs'],
      },
    },
    {
      title: 'Unfair penalty charges for library books returned within grace period',
      body: 'The automated library drop box recorded my return at 4:58 PM on Friday, yet the automated billing portal charged a $15 overdue penalty over the weekend claiming Monday morning check-in. The circulation desk refused to look at the dropbox timestamp.',
      category: 'Administration',
      tags: ['#LibraryFines', '#BillingError'],
      status: 'under_review',
      riskLevel: 'medium',
      score: 12,
      upvotes: 12,
      downvotes: 0,
      isSeriousIssue: false,
      user: studentPriya,
      aiAnalysis: {
        toxicity: 0.25,
        harassment: 0.1,
        spam: 0.0,
        threat: 0.0,
        overallRisk: 'MEDIUM',
        reasoning: 'Billing dispute requiring administrative check before public publishing.',
        sentiment: 'Frustrated',
        suggestedCategory: 'Administration',
        detectedTopics: ['#LibraryFines', '#BillingError'],
      },
    },
  ];

  const createdPosts = [];

  for (const raw of rawPosts) {
    const pseudonym = generatePseudonym(raw.user._id);
    const avatarInfo = generatePseudonymAvatar(pseudonym);
    const authorHash = createAuthorHash(raw.user._id);

    const post = await Post.create({
      title: raw.title,
      body: raw.body,
      category: raw.category,
      tags: raw.tags,
      status: raw.status,
      riskLevel: raw.riskLevel || 'low',
      isSeriousIssue: raw.isSeriousIssue || false,
      pseudonym,
      pseudonymAvatar: JSON.stringify(avatarInfo),
      authorRef: raw.user._id,
      authorHash,
      score: raw.score,
      upvotes: raw.upvotes,
      downvotes: raw.downvotes,
      viewCount: Math.floor(raw.score * 3.5) + 20,
      aiAnalysis: raw.aiAnalysis,
      resolutionNote: raw.resolutionNote || '',
      resolvedAt: raw.resolvedAt || null,
    });

    createdPosts.push(post);
  }

  console.log(`📝 [SEED] Created ${createdPosts.length} realistic campus posts.`);

  // 3. Threaded Comments on Posts
  const wifiPost = createdPosts[0];
  const messPost = createdPosts[1];

  if (wifiPost) {
    const c1Pseudonym = generatePseudonym(`${studentUser._id}-${wifiPost._id}`);
    const c1 = await Comment.create({
      postId: wifiPost._id,
      body: 'Can confirm! I was taking an online quiz on Canvas yesterday and it disconnected twice. Had to tether to my phone mobile data.',
      pseudonym: c1Pseudonym,
      pseudonymAvatar: JSON.stringify(generatePseudonymAvatar(c1Pseudonym)),
      isAuthorOP: false,
      authorRef: studentUser._id,
      authorHash: createAuthorHash(studentUser._id),
      status: 'active',
      upvotes: 14,
      score: 14,
    });

    // OP Reply
    const opPseudonym = `${wifiPost.pseudonym} (OP)`;
    await Comment.create({
      postId: wifiPost._id,
      parentId: c1._id,
      body: 'Thanks for chiming in! I sent an email to helpdesk@campus.edu with speedtest screenshots as well. Let us hope they reboot the APs soon.',
      pseudonym: opPseudonym,
      pseudonymAvatar: wifiPost.pseudonymAvatar,
      isAuthorOP: true,
      authorRef: studentAlex._id,
      authorHash: createAuthorHash(studentAlex._id),
      status: 'active',
      upvotes: 8,
      score: 8,
    });

    await Post.findByIdAndUpdate(wifiPost._id, { commentCount: 2 });
  }

  if (messPost) {
    const cPseudonym = generatePseudonym(`${studentAlex._id}-${messPost._id}`);
    await Comment.create({
      postId: messPost._id,
      body: 'Two of my roommates went to the campus health center this morning. The doctor confirmed it was acute food poisoning. Please save your mess token receipts!',
      pseudonym: cPseudonym,
      pseudonymAvatar: JSON.stringify(generatePseudonymAvatar(cPseudonym)),
      isAuthorOP: false,
      authorRef: studentAlex._id,
      authorHash: createAuthorHash(studentAlex._id),
      status: 'active',
      upvotes: 22,
      score: 22,
    });

    await Post.findByIdAndUpdate(messPost._id, { commentCount: 1 });
  }

  // 4. Sample User Reports
  if (createdPosts[7]) {
    await Report.create({
      targetId: createdPosts[7]._id,
      targetType: 'post',
      reason: 'threat',
      reporterNotes: 'Safety hazard mentioned regarding gym cables. Flagging so administration prioritizes inspection.',
      status: 'pending',
    });
  }

  // 5. Issue Clusters
  await IssueCluster.create([
    {
      title: 'Campus Wireless Network Instability in High-Density Zones',
      category: 'Infrastructure',
      recurrenceCount: 14,
      sentimentScore: -0.6,
      dominantSentiment: 'Frustrated',
      summary: 'Widespread complaints across Library, Academic Block B, and Hostel 4 reporting frequent dropouts and latency spikes over 300ms during afternoon study sessions.',
      actionableAdvice: 'IT Services should perform channel congestion mapping and install dual-band APs in Library floors 2 and 3.',
      samplePostIds: [createdPosts[0]._id],
      status: 'in_progress',
    },
    {
      title: 'Dining Hall Food Quality & Hygiene Monitoring',
      category: 'Mess',
      recurrenceCount: 18,
      sentimentScore: -0.75,
      dominantSentiment: 'Urgent',
      summary: 'Multiple reports of gastrointestinal symptoms following specific meal cycles in South Campus Mess. Demand for unannounced food safety inspections.',
      actionableAdvice: 'Convene Campus Health Committee with student mess representatives; mandate weekly vendor temperature & cleanliness logs.',
      samplePostIds: [createdPosts[1]._id],
      status: 'investigating',
    },
    {
      title: 'Study Spaces & Extended Operating Hours During Midterms',
      category: 'Academics',
      recurrenceCount: 23,
      sentimentScore: 0.2,
      dominantSentiment: 'Constructive',
      summary: 'Strong positive student demand for extending Library hours to 24/7 or opening lecture halls overnight for examination preparation.',
      actionableAdvice: 'Pilot overnight opening of Central Library Ground Floor during final exam weeks with student card swipe access.',
      samplePostIds: [createdPosts[6]._id],
      status: 'acknowledged',
    },
  ]);

  // 6. Audit Logs
  await AuditLog.create([
    {
      moderatorId: moderatorUser._id,
      moderatorEmail: moderatorUser.email,
      action: 'resolve_post',
      targetType: 'post',
      targetId: createdPosts[3]._id,
      reason: 'Issue verified fixed by Hostel maintenance team.',
    },
    {
      moderatorId: adminUser._id,
      moderatorEmail: adminUser.email,
      action: 'system_seed',
      targetType: 'system',
      reason: 'Initial platform bootstrap and demo dataset deployment.',
    },
  ]);

  console.log('✅ [SEED] CampusVoice database seeding completed successfully!');
}

// Allow standalone CLI execution: node src/utils/seedData.js
if (process.argv[1]?.includes('seedData.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('❌ [SEED] Error seeding database:', err);
      process.exit(1);
    }
  })();
}
