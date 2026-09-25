import axios from 'axios';

// In production (Vercel frontend), use the Render backend URL via env var.
// In local dev, fall back to localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_BASE_URL;

export default API_BASE_URL;
