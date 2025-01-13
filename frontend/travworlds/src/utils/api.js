import axios from "axios";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // 환경 변수에서 URL 가져오기
});

export default api;