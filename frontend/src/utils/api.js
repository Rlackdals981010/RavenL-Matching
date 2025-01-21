import axios from "axios";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // 환경 변수에서 API URL 가져오기
});

// 요청 인터셉터: Authorization 헤더 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 JWT 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 헤더에 JWT 추가
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: JWT 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // JWT가 만료된 경우 처리
      localStorage.removeItem("token"); // 토큰 제거
      window.location.href = "/auth/expired"; // 만료 페이지로 리디렉션
    }
    return Promise.reject(error);
  }
);

export default api;