import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true
});


/* ==========================
   SMART TOKEN SELECTOR
========================== */
const getToken = () => {

  const path = window.location.pathname;

  /* driver routes */
  if (path.startsWith("/captain")) {
    return localStorage.getItem("captainToken");
  }

  /* user routes */
  return localStorage.getItem("token");
};


/* ==========================
   REQUEST INTERCEPTOR
========================== */
api.interceptors.request.use((config) => {

  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


/* ==========================
   RESPONSE INTERCEPTOR
========================== */
api.interceptors.response.use(
  (res) => res,
  (err) => {

    const status = err?.response?.status;

    if (status === 401) {

      const path = window.location.pathname;

      if (path.startsWith("/captain")) {
        localStorage.removeItem("captainToken");
        localStorage.removeItem("captain");
        window.location.replace("/captain-login");
      } else {
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    }

    return Promise.reject(err);
  }
);

export default api;