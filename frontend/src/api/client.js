import axios from "axios";

// عنوان الـ API الأساسي بييجي من ملف .env (متغير VITE_API_BASE_URL)
// لو مش متظبط بييجي بديل افتراضي عشان المشروع ميقفش
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5289/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// قبل كل ريكوست: لو فيه توكن مسجل بنبعته في الـ Authorization header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// بعد أي رد فيه خطأ 401 (الجلسة منتهية) بنمسح بيانات الدخول
// عشان الواجهة ترجع تعامل المستخدم كأنه مش مسجل دخول
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
    }
    return Promise.reject(error);
  }
);

/**
 * بيحول أي خطأ راجع من الـ API (ProblemDetails أو ValidationProblemDetails)
 * لرسالة واحدة واضحة نقدر نعرضها للمستخدم.
 */
export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return "حصل خطأ غير متوقع، حاول تاني.";

  if (data.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const firstMessage = data.errors[firstKey]?.[0];
    if (firstMessage) return firstMessage;
  }
  if (data.title) return data.title;
  if (typeof data === "string") return data;
  return "حصل خطأ غير متوقع، حاول تاني.";
}

export default apiClient;
