import axios from 'axios';

const BACKEND_IP = "192.168.0.114";
export const BASE_URL = `http://${BACKEND_IP}:8080`;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // THIS KEEPS SESSION COOKIES!
});
