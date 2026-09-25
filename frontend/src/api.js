import axios from 'axios';

// Automatically targets http://localhost:5000 in dev, and relative /api/ on Vercel deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

export default API_BASE_URL;
