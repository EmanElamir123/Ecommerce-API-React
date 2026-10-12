// تنسيق السعر بالجنيه المصري
export const formatPrice = (value) => {
  const number = Number(value) || 0;
  return `${number.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`;
};

// تنسيق التاريخ بشكل مقروء بالعربي
export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * بيحدد لون شارة (badge) مناسب حسب اسم حالة الطلب.
 * بيدور على كلمات مفتاحية في اسم الحالة عشان يشتغل مع أي أسماء حالات
 * موجودة في قاعدة البيانات من غير ما نحتاج نعرف الـ IDs بتاعتها.
 */
export const getStatusVariant = (statusName = "") => {
  const status = statusName.toLowerCase();
  if (status.includes("cancel") || status.includes("ملغ") || status.includes("رفض")) return "danger";
  if (status.includes("complete") || status.includes("مكتمل") || status.includes("تم") || status.includes("delivered") || status.includes("تسليم"))
    return "success";
  if (status.includes("ship") || status.includes("شحن") || status.includes("طريق")) return "info";
  if (status.includes("pending") || status.includes("انتظار") || status.includes("معلق") || status.includes("processing") || status.includes("قيد"))
    return "warning";
  return "secondary";
};
