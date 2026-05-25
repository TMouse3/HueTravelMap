// Tạo avatar từ tên nếu không có ảnh đại diện
export const getInitial = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};