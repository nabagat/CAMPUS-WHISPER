# REST API Documentation: CampusVoice

The CampusVoice API provides secure endpoints for anonymous campus discussions, AI moderation, role-based governance, and public campus pulse analytics.

**Base URL**: `http://localhost:5000/api`

---

## Authentication & Headers

Protected routes require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Create a new student, moderator, or admin account.

**Request Body:**
```json
{
  "email": "student@campus.edu",
  "password": "Password123!",
  "department": "Computer Science",
  "academicYear": "3rd Year",
  "role": "student" // optional: "student", "moderator", "admin"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67dae47...",
    "email": "student@campus.edu",
    "role": "student",
    "department": "Computer Science",
    "academicYear": "3rd Year"
  }
}
```

### `POST /api/auth/login`
Authenticate with campus credentials.

**Request Body:**
```json
{
  "email": "student@campus.edu",
  "password": "Password123!"
}
```

### `GET /api/auth/me`
Retrieve profile of currently authenticated user.

### `GET /api/auth/demo-accounts`
Returns predefined test credentials for quick grading.

---

## 2. Posts Endpoints (`/api/posts`)

### `POST /api/posts/precheck`
Runs real-time AI safety screening and topic extraction on draft content before publishing.

**Request Body:**
```json
{
  "title": "Water cooler on 2nd floor has foul taste and yellow tint",
  "body": "Students in block B notice the drinking water filter has not been serviced. We need fresh water filters installed."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "moderation": {
      "toxicity": 0.05,
      "harassment": 0.01,
      "spam": 0.0,
      "threat": 0.0,
      "overallRisk": "LOW",
      "flags": [],
      "reasoning": "Content appears within normal campus guidelines.",
      "sentiment": "Urgent"
    },
    "suggestedCategory": "Infrastructure",
    "detectedTopics": ["#MessHygiene", "#Infrastructure"]
  }
}
```

### `GET /api/posts`
Query public posts with filtering, sorting, and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `category` | String | Academics, Faculty, Hostel, Mess, Infrastructure, Administration, Events, General |
| `sort` | String | `trending`, `latest`, `top`, `discussed` |
| `status` | String | `active`, `resolved`, `under_review` (default: `active,resolved`) |
| `isSeriousIssue`| Boolean | Filter for high-severity issues (`true`) |
| `search` | String | Full-text keyword search |
| `tag` | String | Filter by specific hashtag |
| `page` | Integer | Page number (default: 1) |
| `limit` | Integer | Items per page (default: 10, max: 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67dae47...",
      "title": "Main Library 3rd Floor Wi-Fi drops every 10 minutes",
      "body": "Students trying to submit assignments...",
      "category": "Infrastructure",
      "tags": ["#WiFi", "#Library"],
      "status": "active",
      "isSeriousIssue": false,
      "pseudonym": "Courageous Falcon #42",
      "score": 42,
      "upvotes": 45,
      "downvotes": 3,
      "commentCount": 2,
      "viewCount": 167,
      "userVote": 1,
      "createdAt": "2026-09-17T17:48:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 9, "totalPages": 1 }
}
```

### `POST /api/posts`
Create an anonymous post.

**Request Body:**
```json
{
  "title": "Broken heating coil in Block C hot water geyser",
  "body": "There has been no hot water on 2nd floor for 6 days. Ticket #4912 was filed Monday.",
  "category": "Hostel",
  "tags": ["HostelC", "Maintenance"],
  "isSeriousIssue": false
}
```

### `GET /api/posts/:id`
Fetch single post details and atomically increments view count.

### `PUT /api/posts/:id`
Edit post (Author or Moderator/Admin).

### `DELETE /api/posts/:id`
Delete post (Author or Moderator/Admin).

### `PATCH /api/posts/:id/resolve` (Moderator/Admin)
Mark post as resolved with administrative explanation.

---

## 3. Comments Endpoints (`/api/comments`)

### `GET /api/comments/post/:postId`
Fetch threaded comments for a post, including OP badges and nested reply hierarchies.

### `POST /api/comments/post/:postId`
Submit an anonymous comment or reply.

**Request Body:**
```json
{
  "body": "I had the same issue yesterday during my quiz!",
  "parentId": null // or parent comment ID for sub-reply
}
```

---

## 4. Voting Endpoints (`/api/votes`)

### `POST /api/votes`
Cast an upvote (+1) or downvote (-1). Voting the same value toggles off the vote.

**Request Body:**
```json
{
  "targetId": "67dae47...",
  "targetType": "post", // "post" or "comment"
  "value": 1 // 1 or -1
}
```

---

## 5. Reports Endpoints (`/api/reports`)

### `POST /api/reports`
Flag offensive or harmful content for moderator review.

**Request Body:**
```json
{
  "targetId": "67dae47...",
  "targetType": "post",
  "reason": "harassment",
  "reporterNotes": "Mentions personal room numbers."
}
```

---

## 6. Moderation Endpoints (`/api/moderation`)
*Requires `moderator` or `admin` role.*

- `GET /api/moderation/pending` - Review queue of held posts and comments.
- `GET /api/moderation/reports` - Pending user reports.
- `POST /api/moderation/posts/:id` - Body: `{ "action": "approve"|"reject"|"remove", "moderatorNotes": "..." }`
- `POST /api/moderation/reports/:id` - Body: `{ "action": "dismiss"|"action_taken", "moderatorNotes": "..." }`
- `GET /api/moderation/audit-logs` - Chronological moderator action timeline.

---

## 7. Admin Endpoints (`/api/admin`)
*Requires `admin` role.*

- `GET /api/admin/users` - List registered accounts with role and status.
- `PATCH /api/admin/users/:id/role` - Update role (`student`, `moderator`, `admin`).
- `PATCH /api/admin/users/:id/status` - Toggle status (`active`, `suspended`).
- `GET /api/admin/metrics` - High-level system KPIs.

---

## 8. Analytics Endpoints (`/api/analytics`)

- `GET /api/analytics/pulse` - Live category distribution, sentiment breakdown, and Gemini AI briefing.
- `GET /api/analytics/recurring` - Recurring issue clusters detected across student reports.
