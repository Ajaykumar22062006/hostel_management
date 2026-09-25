import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ;
axios.defaults.baseURL = API_BASE_URL;

export default API_BASE_URL;
