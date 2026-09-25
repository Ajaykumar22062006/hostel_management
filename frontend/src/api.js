import axios from 'axios';

// Use VITE_API_URL if defined, fallback to localhost:5000 in dev, or relative URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
axios.defaults.baseURL = API_BASE_URL;

export default API_BASE_URL;
