# Database Schema Documentation: CampusVoice

CampusVoice is built with an **Inbuilt Firebase/Firestore Persistent Storage Engine** (`FirebaseStore`). The data architecture uses strict **privacy-by-design** principles to maintain absolute logical separation between authenticated identity credentials and anonymous public content without requiring external database connections or IP whitelists.

---

## Architecture Diagram: Identity Isolation

```
  ┌─────────────────────────────────┐
  │         User Collection         │
  │  (Auth Credentials & Roles)     │
  │  - email: String (Unique)       │
  │  - password: Hash (bcrypt)      │
  │  - role: student|moderator|admin│
  │  - department, academicYear     │
  └────────────────┬────────────────┘
                   │
                   │ (Logical Severance: NEVER exposed via public APIs)
                   ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                       Post Collection                       │
  │  - title: String                                            │
  │  - body: String                                             │
  │  - category: Academics|Faculty|Hostel|Mess|Infrastructure|...│
  │  - pseudonym: String ("Courageous Falcon #42")              │
  │  - pseudonymAvatar: JSON / SVG Seed                         │
  │  - isSeriousIssue: Boolean                                  │
  │  - status: active|under_review|resolved|rejected            │
  │  - score, upvotes, downvotes, viewCount, commentCount       │
  │  - aiAnalysis: { toxicity, spam, threat, sentiment, ... }   │
  │  ─────────────────────────────────────────────────────────  │
  │  * authorRef: ObjectId (select: false)                      │
  │  * authorHash: HMAC(userId, salt) (select: false)           │
  └─────────────────────────────────────────────────────────────┘
```

---

## 1. User Collection (`User.js`)

Stores user account data for access control, rate limiting, and role-based permissions.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto, Primary Key | Internal MongoDB document identifier |
| `email` | String | Required, Unique, Lowercase, Indexed | Campus email address |
| `password` | String | Required, Min: 8, `select: false` | Salted bcrypt password hash (12 salt rounds) |
| `role` | String | Enum: `['student', 'moderator', 'admin']`, Default: `'student'` | Access level |
| `status` | String | Enum: `['active', 'suspended']`, Default: `'active'` | Account state |
| `department` | String | Default: `'General Campus'` | Campus department (for high-level stats) |
| `academicYear` | String | Enum: `['1st Year', ..., 'Graduate', 'Staff']` | Academic standing |
| `avatarSeed` | String | Default: Random alphanumeric | Seed for user profile avatar |
| `createdAt` | Date | Auto Timestamp | Account registration timestamp |
| `updatedAt` | Date | Auto Timestamp | Account modification timestamp |

---

## 2. Post Collection (`Post.js`)

Stores feedback discussions. **Author identity is strictly hidden via `select: false`.**

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto, Primary Key | Post identifier |
| `title` | String | Required, Min: 5, Max: 200, Indexed | Concise title |
| `body` | String | Required, Min: 15, Max: 5000 | Full content |
| `category` | String | Enum (8 Campus Categories), Required | Academics, Faculty, Hostel, Mess, Infrastructure, Administration, Events, General |
| `tags` | [String] | Max 6 tags, Indexed | Hashtags (e.g. `#WiFi`, `#Hostel4`) |
| `status` | String | Enum: `['active', 'under_review', 'resolved', 'rejected']`, Default: `'active'` | Lifecycle status |
| `riskLevel` | String | Enum: `['low', 'medium', 'high']` | AI evaluated safety tier |
| `isSeriousIssue`| Boolean | Default: `false`, Indexed | Priority safety hazard flag |
| `pseudonym` | String | Required | Generated alias (e.g. *"Courageous Falcon #42"*) |
| `pseudonymAvatar`| String | JSON String | Background color, initials, and visual seed |
| `authorRef` | ObjectId | Ref: `'User'`, `select: false` | **HIDDEN**. Logical link excluded from all default queries |
| `authorHash` | String | HMAC-SHA256, `select: false` | **HIDDEN**. Verification token for author edit/delete |
| `score` | Number | Default: 0, Indexed | Upvotes minus downvotes |
| `upvotes` | Number | Default: 0 | Total positive votes |
| `downvotes` | Number | Default: 0 | Total negative votes |
| `commentCount` | Number | Default: 0 | Number of public comments |
| `viewCount` | Number | Default: 0 | Post view impressions |
| `aiAnalysis` | Object | Nested Schema | AI safety scoring (toxicity, harassment, spam, threat, sentiment, reasoning) |
| `resolutionNote`| String | Default: `''` | Explanation written by admin upon resolution |
| `resolvedAt` | Date | Optional | Timestamp when issue was marked resolved |

### Post Indexes:
- Text Index: `{ title: 'text', body: 'text', tags: 'text' }` (Enables high-performance keyword search)
- Compound Index: `{ category: 1, createdAt: -1 }` (Category feeds)
- Compound Index: `{ status: 1, score: -1 }` (Trending active posts)
- Compound Index: `{ status: 1, createdAt: -1 }` (Latest active posts)
- Compound Index: `{ isSeriousIssue: 1, createdAt: -1 }` (Priority grievance escalation)

---

## 3. Comment Collection (`Comment.js`)

Supports threaded, nested anonymous discussions.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto, Primary Key | Comment identifier |
| `postId` | ObjectId | Ref: `'Post'`, Required, Indexed | Parent post |
| `parentId` | ObjectId | Ref: `'Comment'`, Default: `null`, Indexed | For nested sub-replies |
| `body` | String | Required, Min: 2, Max: 2000 | Comment body |
| `pseudonym` | String | Required | Generated alias |
| `pseudonymAvatar`| String | JSON String | Avatar properties |
| `isAuthorOP` | Boolean | Default: `false` | Indicates if commenter is the original post creator |
| `status` | String | Enum: `['active', 'under_review', 'rejected']` | Moderation state |
| `authorRef` | ObjectId | `select: false` | Excluded from queries |
| `authorHash` | String | `select: false` | Excluded from queries |
| `score` | Number | Default: 0 | Net votes |

---

## 4. Vote Collection (`Vote.js`)

Prevents double-voting without enabling voter tracking or profile profiling.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `userHash` | String | `HMAC_SHA256(userId + targetId, salt)` |
| `targetId` | ObjectId | Target Post or Comment ID |
| `targetType` | String | `'post'` or `'comment'` |
| `value` | Number | `1` (upvote) or `-1` (downvote) |

**Unique Index**: `{ userHash: 1, targetId: 1, targetType: 1 }` (Strictly enforces one vote per user per entity).

---

## 5. Report Collection (`Report.js`)

Community content reporting channel.

| Field | Type | Description |
|---|---|---|
| `targetId` | ObjectId | Reported item ID |
| `targetType` | String | `'post'` or `'comment'` |
| `reason` | String | `'harassment'`, `'hate_speech'`, `'spam'`, `'doxxing'`, `'misinformation'`, `'threat'`, `'other'` |
| `reporterNotes`| String | Context provided by reporting student |
| `status` | String | `'pending'`, `'reviewed'`, `'dismissed'`, `'action_taken'` |
| `moderatorNotes`| String | Internal resolution note |
| `reviewedBy` | ObjectId | Moderator user ID |

---

## 6. AuditLog Collection (`AuditLog.js`)

Maintains accountability for moderator actions.

| Field | Type | Description |
|---|---|---|
| `moderatorId` | ObjectId | ID of acting moderator/admin |
| `moderatorEmail`| String | Email for administrator accountability |
| `action` | String | `'approve_post'`, `'reject_post'`, `'resolve_post'`, `'suspend_user'`, etc. |
| `targetType` | String | `'post'`, `'comment'`, `'report'`, `'user'`, `'system'` |
| `targetId` | ObjectId | Identifier of targeted entity |
| `reason` | String | Moderator rationale |
| `createdAt` | Date | Timestamp of action |

---

## 7. IssueCluster Collection (`IssueCluster.js`)

Stores aggregated campus issue clusters detected across multiple posts.

| Field | Type | Description |
|---|---|---|
| `title` | String | Summary title of recurring problem |
| `category` | String | Affected campus category |
| `recurrenceCount`| Number | Number of related posts |
| `sentimentScore` | Number | Aggregated sentiment (-1.0 to 1.0) |
| `dominantSentiment`| String | `'Frustrated'`, `'Urgent'`, `'Constructive'`, `'Neutral'`, `'Positive'` |
| `summary` | String | AI executive briefing for campus leadership |
| `actionableAdvice`| String | Concrete recommended administration action |
| `samplePostIds` | [ObjectId] | Sample representative posts |
| `status` | String | `'investigating'`, `'acknowledged'`, `'in_progress'`, `'resolved'` |
