# 🗺️ HueTravelMap - Bản đồ du lịch Huế

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Microsoft_SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" />
</p>

---

## 📖 Giới thiệu dự án

**HueTravelMap** là hệ thống bản đồ du lịch dành cho thành phố Huế, cung cấp cho người dùng góc nhìn trực quan về vị trí địa lý của các địa điểm du lịch nổi bật.

Người dùng có thể:
- 📍 Xem các địa điểm du lịch trực tiếp trên bản đồ
- 🔎 Tìm kiếm và khám phá địa điểm
- ⭐ Check-in và đánh giá địa điểm
- 💬 Bình luận và chia sẻ hình ảnh thực tế
- 🧭 Xem thông tin chi tiết của từng địa điểm
- 🤖 Nhận diện địa điểm du lịch bằng AI thông qua hình ảnh

Hệ thống hướng đến trải nghiệm khám phá du lịch trực quan, hiện đại và có tính tương tác cộng đồng.

---

## 🛠️ Công nghệ sử dụng

### Backend
- Java 21
- Spring Boot 3
- Spring Security + JWT Authentication
- Spring AI
- RESTful API

### Frontend
- ReactJS 19
- Vite
- TailwindCSS
- Axios
- Leaflet / OpenStreetMap

### Database
- Microsoft SQL Server 2014 SP3

### Kiến trúc hệ thống
- Mô hình Client - Service
- Frontend và Backend tách biệt
- Xác thực và phân quyền bằng JWT

---

## 📂 Cấu trúc thư mục

```bash
HueTravelMap/
├── Backend/
├── Frontend/
├── Database/
├── TaiLieu/
└── Images/
```

---

## ⚙️ Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone https://github.com/TMouse3/HueTravelMap.git
```

---

### 2. Cấu hình Backend

Di chuyển đến thư mục:

```bash
Backend/src/main/resources/
```

Đổi tên file:

```bash
application-example.properties
```

thành:

```bash
application.properties
```

Sau đó cấu hình các thông tin cần thiết:

```properties
# Database
spring.datasource.username=
spring.datasource.password=

# JWT
jwt.secret=

# Gemini AI
gemini.api.key=

# SMTP Mail
spring.mail.username=
spring.mail.password=

# Upload image folder
app.upload.dir=
```

---

### 3. Cài đặt Database

Mở SQL Server và chạy script trong thư mục:

```bash
Database/
```

---

### 4. Chạy Backend

```bash
cd Backend
./mvnw spring-boot:run
```

Hoặc chạy trực tiếp bằng VSCode / IntelliJ / STS.

Backend mặc định:

```bash
http://localhost:8080
```

---

### 5. Chạy Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend mặc định:

```bash
http://localhost:5173
```

---

## 🔐 Tính năng bảo mật

- JWT Authentication
- Phân quyền người dùng và quản trị viên
- Xác thực API bằng Spring Security

---

## 🤖 Tính năng AI

Dự án tích hợp **Spring AI** và **Gemini AI** để:
- Nhận diện địa điểm du lịch thông qua hình ảnh
- Hỗ trợ gợi ý thông tin địa điểm

---

## 📸 Hình ảnh dự án

> Có thể thêm screenshot giao diện tại đây.

---

## 👨‍💻 Tác giả

- TMouse3
