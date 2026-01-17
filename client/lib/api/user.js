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
  getVisits: (page = 1, limit = 10) => apiRequest(`/user/visits?page=${page}&limit=${limit}`),

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
};
