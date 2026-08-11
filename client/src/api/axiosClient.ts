import axios from "axios";

const API_BASE = "http://localhost:5082/api";
// const API_BASE = "https://localhost:7142/api";

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default axiosClient;
