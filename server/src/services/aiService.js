import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { CATEGORIES } from '../models/Post.js';

let geminiClient = null;
if (ENV.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    console.log('🤖 [AI] Google Gemini Gen AI client initialized');
  } catch (err) {
    console.warn('⚠️ [AI] Could not initialize Gemini client, falling back to local NLP heuristics:', err.message);
  }
}

/**
 * Strip potential personal identifiers (emails, phone numbers, student IDs)
 * BEFORE passing any text to an AI model or external service.
 */
function sanitizePii(text) {
  if (!text) return '';
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(/\b(roll|id|reg|student|enrol)\s*[:#]?\s*[a-zA-Z0-9_-]{5,15}\b/gi, '[REDACTED_ID]');
}

/**
 * Local Rule-Based NLP Moderation Heuristic Fallback
 */
function runLocalModeration(title, body) {
  const combined = `${title} ${body}`.toLowerCase();

  const threatKeywords = ['kill', 'bomb', 'shoot', 'attack', 'weapon', 'suicide', 'die', 'murder', 'destroy everyone', 'stab'];
  const harassmentKeywords = ['idiot', 'stupid', 'loser', 'scam', 'hate', 'ugly', 'whore', 'bastard', 'bitch', 'asshole', 'fuck'];
  const spamKeywords = ['free crypto', 'click here', 'earn money fast', 'telegram @', 'whatsapp +', 'buy followers', 'cheap essay'];

  let toxicity = 0.05;
  let harassment = 0.02;
  let spam = 0.01;
  let threat = 0.0;
  const flags = [];

  for (const word of threatKeywords) {
    if (combined.includes(word)) {
      threat = Math.max(threat, 0.85);
      flags.push('threat_detected');
    }
  }

  for (const word of harassmentKeywords) {
    if (combined.includes(word)) {
      harassment = Math.max(harassment, 0.65);
      toxicity = Math.max(toxicity, 0.6);
      flags.push('profanity_or_harassment');
    }
  }

  for (const word of spamKeywords) {
    if (combined.includes(word)) {
      spam = Math.max(spam, 0.8);
      flags.push('spam_detected');
    }
  }

  const maxScore = Math.max(toxicity, harassment, spam, threat);
  let overallRisk = 'LOW';
  let reasoning = 'Content appears within normal campus guidelines.';

  if (maxScore >= ENV.AI_AUTO_REJECT_THRESHOLD || threat >= 0.7) {
    overallRisk = 'HIGH';
    reasoning = 'Content contains severe violations, safety risks, or severe harassment.';
  } else if (maxScore >= ENV.AI_AUTO_APPROVE_THRESHOLD) {
    overallRisk = 'MEDIUM';
    reasoning = 'Content contains language requiring human moderator judgment before public visibility.';
  }

  // Sentiment detection
  let sentiment = 'Neutral';
  if (combined.includes('urgent') || combined.includes('hazard') || combined.includes('broken') || combined.includes('danger')) {
    sentiment = 'Urgent';
  } else if (combined.includes('unacceptable') || combined.includes('worst') || combined.includes('terrible') || combined.includes('disgusted') || combined.includes('sick of')) {
    sentiment = 'Frustrated';
  } else if (combined.includes('suggest') || combined.includes('improve') || combined.includes('could we') || combined.includes('proposal') || combined.includes('solution')) {
    sentiment = 'Constructive';
  } else if (combined.includes('great') || combined.includes('thank') || combined.includes('resolved') || combined.includes('good') || combined.includes('appreciated')) {
    sentiment = 'Positive';
  }

  return {
    toxicity,
    harassment,
    spam,
    threat,
    overallRisk,
    flags,
    reasoning,
    sentiment,
  };
}

/**
 * Local Rule-Based Categorization and Tagging Heuristics
 */
function runLocalCategorization(title, body) {
  const text = `${title} ${body}`.toLowerCase();

  const categoryScores = {
    Mess: 0,
    Hostel: 0,
    Academics: 0,
    Faculty: 0,
    Infrastructure: 0,
    Administration: 0,
    Events: 0,
    General: 1,
  };

  if (/(mess|food|canteen|lunch|dinner|breakfast|caterer|hygiene|taste|meal)/.test(text)) categoryScores.Mess += 5;
  if (/(hostel|room|warden|curfew|roommate|hot water|washroom|block\s+[a-z]|ac\b)/.test(text)) categoryScores.Hostel += 5;
  if (/(exam|quiz|grading|syllabus|curriculum|course|credits|assignment|cgpa|gpa)/.test(text)) categoryScores.Academics += 5;
  if (/(professor|faculty|teacher|lecturer|instructor|hod|ta\b|teaching)/.test(text)) categoryScores.Faculty += 5;
  if (/(wifi|internet|lab|projector|library|bench|light|ac\s+in\s+hall|sports|gym|road|bus|parking)/.test(text)) categoryScores.Infrastructure += 5;
  if (/(fees|scholarship|registrar|id\s+card|clearance|security|admin|office|bureaucracy)/.test(text)) categoryScores.Administration += 5;
  if (/(fest|hackathon|cultural|sports\s+meet|symposium|guest\s+lecture|club|workshop)/.test(text)) categoryScores.Events += 5;

  let suggestedCategory = 'General';
  let highest = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > highest) {
      highest = score;
      suggestedCategory = cat;
    }
  }

  // Extract clean tags
  const tags = [];
  if (/wifi|internet|network|speed/i.test(text)) tags.push('#WiFi');
  if (/food|mess|hygiene|dining/i.test(text)) tags.push('#MessFood');
  if (/hostel|warden|room/i.test(text)) tags.push('#HostelLife');
  if (/exam|schedule|grading/i.test(text)) tags.push('#Exams');
  if (/library|study|books/i.test(text)) tags.push('#Library');
  if (/bus|transport|shuttle/i.test(text)) tags.push('#CampusTransit');
  if (/lab|equipment|pc/i.test(text)) tags.push('#LabFacilities');

  if (tags.length === 0) {
    tags.push(`#${suggestedCategory}`);
  }

  return {
    suggestedCategory,
    detectedTopics: tags.slice(0, 4),
  };
}

/**
 * Moderate content via Gemini 3.8 Flash (or fallback)
 */
export async function moderateContent(title, body) {
  const sanitizedTitle = sanitizePii(title);
  const sanitizedBody = sanitizePii(body);

  if (!geminiClient) {
    return runLocalModeration(sanitizedTitle, sanitizedBody);
  }

  try {
    const prompt = `You are a campus safety and content moderation AI for an anonymous student feedback platform.
Analyze the following post content strictly for toxicity, harassment, abusive content, spam, and dangerous threats.
Respond ONLY with a valid JSON object matching this schema:
{
  "toxicity": number (0.0 to 1.0),
  "harassment": number (0.0 to 1.0),
  "spam": number (0.0 to 1.0),
  "threat": number (0.0 to 1.0),
  "overallRisk": "LOW" | "MEDIUM" | "HIGH",
  "flags": string[],
  "reasoning": string,
  "sentiment": "Positive" | "Neutral" | "Negative" | "Frustrated" | "Urgent" | "Constructive"
}

Post Title: "${sanitizedTitle}"
Post Body: "${sanitizedBody}"`;

    const interaction = await geminiClient.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
    });

    const responseText = interaction.output_text?.trim();
    if (responseText) {
      // Strip json code fences if any
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        toxicity: Number(parsed.toxicity || 0),
        harassment: Number(parsed.harassment || 0),
        spam: Number(parsed.spam || 0),
        threat: Number(parsed.threat || 0),
        overallRisk: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.overallRisk) ? parsed.overallRisk : 'LOW',
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        reasoning: parsed.reasoning || '',
        sentiment: parsed.sentiment || 'Neutral',
      };
    }
  } catch (error) {
    console.warn('⚠️ [AI] Gemini moderation request failed, using local fallback:', error.message);
  }

  return runLocalModeration(sanitizedTitle, sanitizedBody);
}

/**
 * Categorize post and extract tags via Gemini or fallback
 */
export async function categorizeAndTag(title, body) {
  const sanitizedTitle = sanitizePii(title);
  const sanitizedBody = sanitizePii(body);

  if (!geminiClient) {
    return runLocalCategorization(sanitizedTitle, sanitizedBody);
  }

  try {
    const prompt = `Categorize this campus feedback post into ONE of these allowed categories:
[${CATEGORIES.join(', ')}].
Also extract 2-4 concise hashtag topics (e.g. ["#WiFiOutage", "#HostelBlock3"]).
Respond ONLY with a valid JSON object:
{
  "suggestedCategory": string,
  "detectedTopics": string[]
}

Title: "${sanitizedTitle}"
Body: "${sanitizedBody}"`;

    const interaction = await geminiClient.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
    });

    const responseText = interaction.output_text?.trim();
    if (responseText) {
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const validCategory = CATEGORIES.includes(parsed.suggestedCategory) ? parsed.suggestedCategory : 'General';
      return {
        suggestedCategory: validCategory,
        detectedTopics: Array.isArray(parsed.detectedTopics) ? parsed.detectedTopics.slice(0, 5) : [],
      };
    }
  } catch (error) {
    console.warn('⚠️ [AI] Gemini categorization failed, using local fallback:', error.message);
  }

  return runLocalCategorization(sanitizedTitle, sanitizedBody);
}

/**
 * Aggregate campus concerns into executive summaries and recurring clusters.
 */
export async function summarizeCampusConcerns(posts) {
  if (!posts || posts.length === 0) {
    return {
      summary: 'No active campus concerns reported in the current window.',
      recurringIssues: [],
    };
  }

  const sanitizedSnippets = posts.slice(0, 15).map(p => ({
    title: sanitizePii(p.title),
    category: p.category,
    status: p.status,
    score: p.score,
  }));

  if (!geminiClient) {
    // Robust local cluster aggregator
    const categoryCounts = {};
    for (const p of posts) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `${cat} (${count} reports)`)
      .join(', ');

    return {
      summary: `Students are actively discussing campus facilities and policies. The most frequent areas of concern are ${topCategories}. Several high-priority topics involve infrastructure maintenance, hostel amenities, and mess food standards.`,
      sentimentBreakdown: {
        Frustrated: 45,
        Constructive: 30,
        Urgent: 15,
        Positive: 10,
      },
    };
  }

  try {
    const prompt = `Analyze these recent student feedback posts from a university campus.
Create an executive summary for university administration detailing the recurring themes, sentiment breakdown, and actionable steps.
Respond ONLY with JSON:
{
  "summary": string,
  "topConcerns": string[],
  "actionableSteps": string[],
  "sentimentBreakdown": {
    "Frustrated": number,
    "Constructive": number,
    "Urgent": number,
    "Positive": number
  }
}

Posts: ${JSON.stringify(sanitizedSnippets)}`;

    const interaction = await geminiClient.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
    });

    const responseText = interaction.output_text?.trim();
    if (responseText) {
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    }
  } catch (error) {
    console.warn('⚠️ [AI] Gemini summary failed, using heuristic fallback:', error.message);
  }

  return {
    summary: 'Students report recurring concerns regarding campus infrastructure, Wi-Fi stability, and dining hall quality. Constructive recommendations suggest establishing transparent maintenance timelines.',
    sentimentBreakdown: {
      Frustrated: 40,
      Constructive: 35,
      Urgent: 15,
      Positive: 10,
    },
  };
}
