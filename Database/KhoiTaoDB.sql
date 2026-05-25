-- 1. Bảng users (Người dùng)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname NVARCHAR(100) NOT NULL,
    avatar_url VARCHAR(MAX),
    role VARCHAR(20) DEFAULT 'USER',
    created_date DATETIME DEFAULT GETDATE()
);

-- 2. Bảng categories (Loại địa điểm)
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255)
);

-- 3. Bảng places (Địa điểm chính thức)
CREATE TABLE places (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    thumbnail_url VARCHAR(MAX), -- Ảnh đại diện
    category_id INT FOREIGN KEY REFERENCES categories(id),
    is_active BIT DEFAULT 1,
    created_date DATETIME DEFAULT GETDATE()
);

-- 4. Bảng place_suggestions (Kiến nghị địa điểm)
CREATE TABLE place_suggestions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    thumbnail_url VARCHAR(MAX), -- Đã bổ sung ảnh đại diện
    status VARCHAR(20) DEFAULT 'PENDING',
    user_id INT FOREIGN KEY REFERENCES users(id),
    place_id INT FOREIGN KEY REFERENCES places(id),
    created_date DATETIME DEFAULT GETDATE()
);

-- 5. Bảng place_images (Đổi tên từ 'images' - Hình ảnh phụ của Địa điểm)
CREATE TABLE place_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    url VARCHAR(MAX) NOT NULL,
    place_id INT FOREIGN KEY REFERENCES places(id),
    suggestion_id INT FOREIGN KEY REFERENCES place_suggestions(id)
);

-- 6. Bảng checkins (Đã gộp nghiệp vụ: Check-in + Rating + Comment)
CREATE TABLE checkins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id),
    place_id INT FOREIGN KEY REFERENCES places(id),
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Bắt buộc đánh giá
    content NVARCHAR(MAX) NOT NULL, -- Bắt buộc để lại bình luận
    created_date DATETIME DEFAULT GETDATE()
);

-- 7. Bảng checkin_images (Đổi tên từ 'comment_images' - Ảnh đính kèm lúc check-in)
CREATE TABLE checkin_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    url VARCHAR(MAX) NOT NULL,
    checkin_id INT FOREIGN KEY REFERENCES checkins(id) ON DELETE CASCADE
    -- Lưu ý: Chỉ lưu ảnh tùy chọn của User lúc checkin
);

-- =============================================
-- INDEXING
-- =============================================

-- 1. Tối ưu: Thống kê Top địa điểm theo Ngày/Tuần/Tháng
-- Đưa created_date lên đầu để Database lọc khoảng thời gian trước, sau đó mới đếm place_id
CREATE NONCLUSTERED INDEX IX_Checkins_Stats_Timeline
ON checkins (created_date, place_id);

-- 2. Tối ưu: Chống spam (1 ngày/1 lần/1 địa điểm) và Xem lịch sử cá nhân
-- Đưa user_id lên đầu giúp Backend kiểm tra nhanh xem "User này đã làm gì"
CREATE NONCLUSTERED INDEX IX_Checkins_User_Logic
ON checkins (user_id, place_id, created_date);

-- 3. Tối ưu: Hiển thị danh sách Review/Comment tại trang chi tiết địa điểm
-- Giúp load toàn bộ đánh giá của 1 địa điểm nhanh hơn khi khách xem bản đồ
CREATE NONCLUSTERED INDEX IX_Checkins_Place_Reviews
ON checkins (place_id)
INCLUDE (rating, content, created_date); 
-- Lưu ý: Lệnh 'INCLUDE' giúp lấy nội dung comment nhanh hơn mà không cần quay lại bảng chính