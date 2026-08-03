import axios from 'axios';

const API_BASE = 'http://localhost:5082/api';

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export default axiosClient;
