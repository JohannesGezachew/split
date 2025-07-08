import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // Try to get telegramId from localStorage
    const telegramId = localStorage.getItem('telegramId');
    if (telegramId) {
      config.headers['x-telegram-id'] = telegramId;
    }
    return config;
  },
  error => {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default api;