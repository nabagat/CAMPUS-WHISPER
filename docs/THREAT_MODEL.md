# Security & Privacy Threat Model: CampusVoice

This document summarizes the threat model, security boundaries, and architectural mitigations of **CampusVoice**.

---

## 1. Adversarial Entities & Trust Boundaries

| Adversary | Motivation | Capability | In Scope? |
|---|---|---|---|
| **Curious Peer / Student** | Unmask author of contentious criticism | Public feed, network inspection, browser DevTools | **Yes** (Mitigated) |
| **Course Instructor / Faculty** | Identify student complaining about grading or attendance | Reading public posts, requesting identity from IT | **Yes** (Mitigated) |
| **Rogue Campus Moderator** | Deanonymize whistleblowers using dashboard privileges | Moderator dashboard API, audit logs | **Yes** (Mitigated) |
| **Campus Network Administrator** | Monitor university Wi-Fi traffic (eduroam / dorm LAN) | Packet capture, DNS queries, TLS SNI logs | **Partially** (Documented boundary) |
| **External Attacker / Spammer** | Harass students, inject malware, execute XSS/NoSQLi | Malicious payloads, automated botnets | **Yes** (Mitigated) |
| **Law Enforcement / Court Order** | Investigate bomb threats, violent felony acts | Subpoena server host / MongoDB cluster | **Out of scope** (Transparently disclosed) |

---

## 2. Attack Vectors & Technical Mitigations

### 2.1 Author Identification via Database Inspection
- **Risk:** An attacker or administrator inspecting raw database records attempts to correlate a post with a registered student account.
- **Mitigation:**
  1. In the `Post` and `Comment` schemas, the author reference (`authorRef`) and HMAC signature (`authorHash`) are configured with `select: false`. Mongoose omits them from standard query results.
  2. The public serialization `transform` deletes `authorRef` and `authorHash` before JSON serialization.
  3. Post authors are rendered using rotating pseudonyms (e.g. *"Resilient Owl #18"*) generated deterministically per thread.

### 2.2 Voter Habit Correlation & Profiling
- **Risk:** Storing raw `userId` in a `Vote` collection allows an attacker to profile a student's political opinions or grievances across all posts.
- **Mitigation:**
  1. The `Vote` collection never stores raw `userId`.
  2. It stores `userHash = HMAC_SHA256(userId + targetId, SERVER_SALT)`.
  3. Because `targetId` is part of the hash, a user has a distinct hash for every post they vote on. Votes cannot be correlated across documents.

### 2.3 Server-Side Access Log Snooping
- **Risk:** Traditional web servers log client IP addresses, User-Agents, and query strings in `access.log`.
- **Mitigation:**
  1. CampusVoice replaces default verbose loggers with a minimal `privacyLogger`.
  2. IP addresses, cookies, and authorization headers are never written to log streams.
  3. URL paths are stripped of query parameters before logging.

### 2.4 AI Data Leakage
- **Risk:** Passing unredacted student text to an external AI API might transmit student IDs, phone numbers, or institutional emails to a third party.
- **Mitigation:**
  1. The `aiService` runs `sanitizePii()` before forwarding content to Google Gemini.
  2. Phone numbers, emails, and student registration ID patterns are regex-redacted to `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_ID]`.

### 2.5 Cross-Site Scripting (XSS) & NoSQL Injection
- **Risk:** A malicious user posts `<script>` tags or MongoDB query operators (`$gt`, `$where`) to steal tokens or corrupt database records.
- **Mitigation:**
  1. The `sanitizeInputs` middleware traverses all input bodies and query parameters, stripping keys starting with `$` to prevent NoSQL operator injection.
  2. All string fields are sanitized with `sanitize-html` with a strict whitelist of formatting tags.
  3. HTTP response headers include `Helmet` with strict frameguard, hidePoweredBy, and noSniff headers.

### 2.6 Moderator Privilege Escalation
- **Risk:** A moderator attempts to de-anonymize a post author using developer tools or modifying client JavaScript.
- **Mitigation:**
  1. The moderator queue endpoints (`/api/moderation/pending`, `/api/moderation/reports`) use the same sanitized projection as public endpoints.
  2. The server simply does not transmit user identities to the moderator client.
  3. All actions (approve, reject, remove) are logged to an append-only `AuditLog` collection.

---

## 3. Disclosed Technical Boundaries (Why We Avoid False Claims)

CampusVoice adopts the ethical principle: **Never promise security properties that software cannot deliver.**

1. **Local Campus Wi-Fi Logging:** If a student accesses CampusVoice while connected to university-managed Wi-Fi, the university router logs that their device MAC/IP requested `campusvoice.edu` at that specific timestamp. HTTPS protects the post content, but metadata correlation is theoretically possible for an organization controlling the local network.
2. **Device-Level Keyloggers:** If a student uses a shared public library computer or malware-infected phone, keystrokes can be captured prior to browser TLS encryption.
3. **Stylometry:** Distinctive phrasing, typographical habits, or mentioning uniquely identifiable details can allow peers to guess the author's identity. Students are advised on this in the Privacy Center.
