# MsNhu FastEnglish — Tiến độ công việc

## Đã hoàn thành

### Infrastructure
- [x] Docker multi-stage build (backend + frontend)
- [x] Docker Compose (postgres, redis, backend, frontend/nginx)
- [x] GitHub Actions CI/CD (self-hosted runner `actions-runner3`)
- [x] Nginx reverse proxy + HTTPS
- [x] Swagger proxy tại `/api/swagger/index.html`
- [x] Global exception handler middleware
- [x] Chuẩn hóa API response: `{ code, message, data }` / `{ code, message }`

### Auth
- [x] Đăng nhập (JWT access token 15 phút + refresh token Redis 7 ngày)
- [x] Đăng ký tài khoản học sinh (tự đăng ký)
- [x] Admin tạo tài khoản (Teacher / Student)
- [x] Đăng xuất (1 thiết bị hoặc tất cả)
- [x] Quên mật khẩu — OTP 6 số gửi email, TTL 15 phút
- [x] Rate limiting đăng ký (5 req/IP/giờ)
- [x] Seed admin account

### Frontend
- [x] Trang Landing Page
- [x] Trang Đăng nhập
- [x] Trang Đăng ký tài khoản học sinh
- [x] Trang Quên mật khẩu (3 bước: email → OTP → thành công)
- [x] Auto refresh token (axios interceptor)
- [x] Auth guard (bảo vệ route)

---

## Đang làm

- [ ] **Fix quên mật khẩu**: trả 404 khi email không tồn tại thay vì luôn 200 — *đã có plan, chờ duyệt*

---

## Chưa làm

### Module 2 — Học sinh
- [ ] Danh sách học sinh (phân trang, tìm kiếm)
- [ ] Xem / sửa profile học sinh
- [ ] Cập nhật profile bản thân (số điện thoại, trình độ, mục tiêu)

### Module 3 — Giáo viên
- [ ] Danh sách giáo viên
- [ ] Xem / sửa profile giáo viên

### Module 4 — Lớp học
- [ ] Tạo / sửa / xóa lớp học
- [ ] Quản lý buổi học (ClassSession)
- [ ] Thêm / xóa học sinh khỏi lớp

### Module 5 — Điểm danh
- [ ] Điểm danh theo buổi học
- [ ] Xem lịch sử điểm danh

### Module 6 — Học phí
- [ ] Tạo phiếu thu học phí
- [ ] Lịch sử thanh toán

### Module 7 — Tư vấn
- [ ] Form đăng ký tư vấn công khai (`/dang-ky-tu-van`)
- [ ] Quản lý danh sách yêu cầu tư vấn

### Module 8 — Dashboard
- [ ] Thống kê thực: tổng học sinh, lớp đang mở, doanh thu tháng
- [ ] Biểu đồ học sinh theo tháng

### Hạ tầng còn lại
- [ ] DNS A record cho `msnhufastenglish.com` → `160.250.181.91`
- [ ] HTTPS / SSL (Let's Encrypt hoặc Cloudflare)
