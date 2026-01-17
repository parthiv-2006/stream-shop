import { apiRequest } from './client';

export const userApi = {
  // Get user profile with preferences and recent visits
  getProfile: () => apiRequest('/user/profile'),

  // Update user preferences
  updatePreferences: (preferences) => apiRequest('/user/preferences', {
    method: 'POST',
    body: JSON.stringify(preferences),
  }),

  // Get visit history
  getVisits: (page = 1, limit = 10, pendingOnly = false) => 
    apiRequest(`/user/visits?page=${page}&limit=${limit}${pendingOnly ? '&pending_only=true' : ''}`),

  // Get a single visit
  getVisit: (visitId) => apiRequest(`/user/visits/${visitId}`),

  // Get pending feedback visits
  getPendingFeedback: () => apiRequest('/user/visits/pending'),

  // Add a new visit
  addVisit: (visitData) => apiRequest('/user/visits', {
    method: 'POST',
    body: JSON.stringify(visitData),
  }),

  // Update a visit (rating/review)
  updateVisit: (visitId, data) => apiRequest(`/user/visits/${visitId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Submit detailed feedback for a visit
  submitFeedback: (visitId, feedback) => apiRequest(`/user/visits/${visitId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedback),
  }),
};
