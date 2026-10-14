const API_BASE = '/api';

/**
 * Universal fetch wrapper with authorization headers and JSON parsing
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('campus_voice_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json().catch(() => ({ success: false, message: 'Server response error' }));

  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem('campus_voice_token');
      window.dispatchEvent(new CustomEvent('campus_voice_unauthorized'));
    }
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: credentials => request('/auth/login', { method: 'POST', body: credentials }),
  register: userData => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),

  // Posts
  getPosts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/posts?${query.toString()}`);
  },
  getPostById: id => request(`/posts/${id}`),
  createPost: postData => request('/posts', { method: 'POST', body: postData }),
  updatePost: (id, postData) => request(`/posts/${id}`, { method: 'PUT', body: postData }),
  deletePost: id => request(`/posts/${id}`, { method: 'DELETE' }),
  resolvePost: (id, note) => request(`/posts/${id}/resolve`, { method: 'PATCH', body: { resolutionNote: note } }),
  aiPrecheck: ({ title, body }) => request('/posts/precheck', { method: 'POST', body: { title, body } }),

  // Comments
  getComments: postId => request(`/comments/post/${postId}`),
  addComment: (postId, body, parentId = null) => request(`/comments/post/${postId}`, { method: 'POST', body: { body, parentId } }),
  deleteComment: id => request(`/comments/${id}`, { method: 'DELETE' }),

  // Voting
  castVote: ({ targetId, targetType, value }) => request('/votes', { method: 'POST', body: { targetId, targetType, value } }),

  // Reporting
  createReport: reportData => request('/reports', { method: 'POST', body: reportData }),

  // Moderation
  getPendingQueue: (page = 1) => request(`/moderation/pending?page=${page}`),
  getReportsQueue: () => request('/moderation/reports'),
  moderatePost: (id, action, moderatorNotes = '') => request(`/moderation/posts/${id}`, { method: 'POST', body: { action, moderatorNotes } }),
  moderateComment: (id, action, moderatorNotes = '') => request(`/moderation/comments/${id}`, { method: 'POST', body: { action, moderatorNotes } }),
  resolveReport: (id, action, moderatorNotes = '') => request(`/moderation/reports/${id}`, { method: 'POST', body: { action, moderatorNotes } }),
  getAuditLogs: (page = 1) => request(`/moderation/audit-logs?page=${page}`),

  // Admin
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/admin/users?${query.toString()}`);
  },
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
  updateUserStatus: (id, status, reason = '') => request(`/admin/users/${id}/status`, { method: 'PATCH', body: { status, reason } }),
  getSystemMetrics: () => request('/admin/metrics'),

  // Analytics
  getCampusPulse: () => request('/analytics/pulse'),
  getRecurringIssues: () => request('/analytics/recurring'),
};
