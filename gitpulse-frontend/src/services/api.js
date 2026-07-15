import axios from 'axios';

// Vite default local backend endpoint, can be overridden by env variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 25000 // 25 seconds for long-running scraper fallback requests
});

export async function analyzeUser(username) {
  try {
    const response = await apiClient.post('/api/analyze', { username });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch user analysis');
    } else if (error.request) {
      throw new Error('No response from the server. Make sure the backend is running.');
    } else {
      throw new Error(error.message);
    }
  }
}

export async function checkBackendHealth() {
  try {
    const response = await apiClient.get('/api/health');
    return response.data;
  } catch (error) {
    return { status: 'down', error: error.message };
  }
}

export async function getRateLimitStatus() {
  try {
    const response = await apiClient.get('/api/analyze/limit-status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rate limit status:', error.message);
    return null;
  }
}

export default apiClient;
