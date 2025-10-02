import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

instance.interceptors.request.use((cfg) => {
  const tok = localStorage.getItem('token');
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default instance;