# Ms. Nhu Fast English - Tổng Hợp Các API Backend

Dưới đây là bảng tổng hợp chi tiết toàn bộ các API endpoint hiện có trong hệ thống backend của dự án **Ms. Nhu Fast English**, được xây dựng trên nền tảng ASP.NET Core.

---

## 1. Xác thực & Tài khoản (`AuthController`)
* **Base Route:** `/api/auth`
* **Mục đích:** Quản lý đăng ký, đăng nhập, làm mới token, khôi phục mật khẩu và thông tin cá nhân.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Public | Đăng nhập hệ thống (trả về AccessToken & RefreshToken) |
| **POST** | `/api/auth/refresh` | Public | Làm mới AccessToken bằng RefreshToken |
| **POST** | `/api/auth/logout` | Đã đăng nhập | Đăng xuất khỏi thiết bị hiện tại hoặc tất cả thiết bị |
| **POST** | `/api/auth/register/student` | Public | Học viên tự đăng ký tài khoản (bị giới hạn rate limit) |
| **POST** | `/api/auth/register` | Admin | Quản trị viên tạo tài khoản mới cho nhân viên/giáo viên |
| **POST** | `/api/auth/forgot-password` | Public | Yêu cầu gửi mã OTP đặt lại mật khẩu qua email |
| **POST** | `/api/auth/verify-otp` | Public | Xác thực mã OTP đã gửi qua email |
| **POST** | `/api/auth/reset-password` | Public | Đặt lại mật khẩu mới sau khi xác thực OTP thành công |
| **POST** | `/api/auth/change-password` | Đã đăng nhập | Thay đổi mật khẩu khi đang sử dụng |
| **PUT** | `/api/auth/profile` | Đã đăng nhập | Cập nhật thông tin cá nhân (Họ tên, SĐT, Email...) |

---

## 2. Quản lý Lớp học, Học tập & Học phí (`ClassesController`)
* **Base Route:** `/api/classes`
* **Mục đích:** Nghiệp vụ cốt lõi của ứng dụng (lớp học, học viên, bài tập, nộp bài, điểm danh, thông báo, tài liệu và đóng học phí).

### A. API dành cho Học viên
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes/my-classes` | Học viên | Lấy danh sách lớp học mà học viên đang tham gia |
| **GET** | `/api/classes/my-assignments` | Học viên | Lấy danh sách bài tập được giao của các lớp đang học |
| **GET** | `/api/classes/my-tuitions` | Học viên | Xem lịch sử học phí và tóm tắt học phí tháng hiện tại |
| **POST** | `/api/classes/{id}/tuition/pay` | Học viên | Học viên khai báo đã thanh toán học phí cho lớp học |
| **POST** | `/api/classes/join/{token}` | Đã đăng nhập | Chấp nhận thư mời tham gia lớp học qua token liên kết |
| **GET** | `/api/classes/join/{token}` | Đã đăng nhập | Kiểm tra tính hợp lệ của liên kết mời học viên |
| **POST** | `/api/classes/assignments/{assignmentId}/submit` | Học viên | Học viên nộp bài làm cho bài tập được giao |

### B. API Quản lý Chung & Dành cho Giáo viên / Admin
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes` | Admin, Teacher | Lấy toàn bộ danh sách lớp học (phân trang, tìm kiếm) |
| **POST** | `/api/classes` | Admin, Teacher | Tạo một lớp học mới |
| **GET** | `/api/classes/{id}` | Đã đăng nhập | Xem chi tiết thông tin lớp học |
| **PUT** | `/api/classes/{id}` | Admin, Teacher | Cập nhật thông tin lớp học (Tên, giờ học, học phí...) |
| **DELETE** | `/api/classes/{id}` | Admin | Xóa bỏ lớp học khỏi hệ thống |

#### Thành viên Lớp học
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes/{id}/members` | Admin, Teacher | Lấy danh sách học viên trong lớp học |
| **POST** | `/api/classes/{id}/members` | Admin, Teacher | Thêm trực tiếp học sinh vào lớp học |
| **DELETE** | `/api/classes/{id}/members/{memberId}` | Admin, Teacher | Xóa/Mời học sinh ra khỏi lớp học |
| **PUT** | `/api/classes/{id}/members/{memberId}/tuition` | Admin | Cập nhật trạng thái học phí thủ công cho thành viên |

#### Quản lý Học phí lớp học
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes/{id}/tuition-records` | Admin, Teacher | Lấy toàn bộ danh sách bản ghi đóng học phí của lớp học |
| **PUT** | `/api/classes/tuitions/{paymentId}/confirm` | Admin | Xác nhận hoặc từ chối yêu cầu đóng học phí của học viên |

#### Buổi học (Sessions)
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes/{id}/sessions` | Đã đăng nhập | Lấy danh sách tất cả buổi học của lớp |
| **POST** | `/api/classes/{id}/sessions` | Admin, Teacher | Tạo một buổi học mới cho lớp |
| **POST** | `/api/classes/{id}/import-curriculum` | Admin, Teacher | Import nhanh danh sách các buổi học từ Khung chương trình có sẵn |
| **PUT** | `/api/classes/sessions/{sessionId}` | Admin, Teacher | Cập nhật thông tin buổi học |
| **DELETE** | `/api/classes/sessions/{sessionId}` | Admin, Teacher | Xóa buổi học |

#### Điểm danh (Attendance)
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes/{id}/attendance/{sessionId}` | Đã đăng nhập | Xem tình trạng điểm danh của một buổi học |
| **POST** | `/api/classes/{id}/attendance/{sessionId}` | Admin, Teacher | Thực hiện điểm danh/lưu trạng thái điểm danh cho học sinh |

#### Tài liệu Lớp học (Documents)
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/classes/{id}/documents` | Admin, Teacher | Thêm tài liệu tham khảo vào lớp học |
| **GET** | `/api/classes/all-documents` | Đã đăng nhập | Lấy danh sách tất cả tài liệu |
| **DELETE** | `/api/classes/documents/{documentId}` | Admin, Teacher | Xóa tài liệu khỏi lớp học |

#### Bài tập & Chấm điểm (Assignments & Submissions)
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes/{id}/assignments` | Đã đăng nhập | Lấy danh sách các bài tập của lớp |
| **GET** | `/api/classes/assignments/{assignmentId}` | Đã đăng nhập | Xem chi tiết nội dung một bài tập |
| **POST** | `/api/classes/{id}/assignments` | Admin, Teacher | Tạo bài tập mới giao cho lớp |
| **PUT** | `/api/classes/assignments/{assignmentId}` | Admin, Teacher | Cập nhật bài tập |
| **DELETE** | `/api/classes/assignments/{assignmentId}` | Admin, Teacher | Xóa bài tập |
| **GET** | `/api/classes/assignments/{assignmentId}/submissions` | Admin, Teacher | Lấy danh sách các bài nộp của học sinh đối với bài tập này |
| **POST** | `/api/classes/assignments/submissions/{submissionId}/grade` | Admin, Teacher | Nhận xét và cho điểm bài làm của học sinh |

#### Thư mời tham gia lớp (Invitations)
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/classes/{id}/invite` | Admin, Teacher | Tạo link mời hoặc mã mời học sinh tham gia lớp |
| **GET** | `/api/classes/{id}/invite` | Admin, Teacher | Lấy thông tin mã mời hiện tại của lớp học |
| **DELETE** | `/api/classes/{id}/invite` | Admin, Teacher | Vô hiệu hóa/Hủy bỏ mã mời của lớp học |

#### Bảng tin thông báo & Bình luận (Announcements & Comments)
| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/classes/{id}/announcements` | Đã đăng nhập | Xem danh sách các thông báo trên bảng tin lớp học |
| **POST** | `/api/classes/{id}/announcements` | Admin, Teacher | Đăng thông báo mới lên bảng tin |
| **PUT** | `/api/classes/{id}/announcements/{announcementId}` | Admin, Teacher | Cập nhật bài đăng thông báo |
| **DELETE** | `/api/classes/{id}/announcements/{announcementId}` | Admin, Teacher | Xóa thông báo khỏi lớp học |
| **POST** | `/api/classes/{id}/announcements/{announcementId}/comments` | Đã đăng nhập | Viết bình luận thảo luận trong thông báo |
| **DELETE** | `/api/classes/{id}/announcements/{announcementId}/comments/{commentId}` | Đã đăng nhập | Xóa bình luận |

---

## 3. Quản lý Khung Chương Trình Học (`CurriculumTemplatesController`)
* **Base Route:** `/api/curriculum-templates`
* **Mục đích:** Xây dựng sẵn lộ trình, chủ đề từng buổi để import nhanh cho các lớp học mới.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/curriculum-templates` | Đã đăng nhập | Xem danh sách tất cả khung chương trình học có sẵn |
| **GET** | `/api/curriculum-templates/{id}` | Đã đăng nhập | Lấy thông tin chi tiết (lộ trình từng buổi) của khung chương trình |
| **POST** | `/api/curriculum-templates` | Admin | Tạo khung chương trình học mới kèm lộ trình |
| **DELETE** | `/api/curriculum-templates/{id}` | Admin | Xóa khung chương trình học |

---

## 4. Quản lý Tin tức / Blog (`BlogController`)
* **Base Route:** `/api/blog`
* **Mục đích:** Các bài viết tin tức, kiến thức Tiếng Anh công khai cho website.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/blog/categories` | Public | Xem danh sách danh mục blog (Tin tức, Học tập, Sự kiện...) |
| **GET** | `/api/blog/posts` | Public | Lấy danh sách các bài viết đã xuất bản (phân trang, lọc danh mục) |
| **GET** | `/api/blog/posts/{slug}` | Public | Xem chi tiết bài viết qua Slug (tự động tăng lượt xem) |
| **GET** | `/api/blog/admin/posts` | Admin, Teacher | Lấy toàn bộ bài viết (cả nháp và đã đăng) để quản trị |
| **GET** | `/api/blog/admin/posts/{id}` | Admin, Teacher | Xem chi tiết bài viết quản trị qua ID |
| **POST** | `/api/blog/admin/posts` | Admin, Teacher | Tạo bài viết mới (tự động phát sinh slug duy nhất) |
| **PUT** | `/api/blog/admin/posts/{id}` | Admin, Teacher | Cập nhật bài viết |
| **DELETE** | `/api/blog/admin/posts/{id}` | Admin, Teacher | Xóa bài viết |
| **POST** | `/api/blog/admin/categories` | Admin, Teacher | Tạo danh mục blog mới |
| **PUT** | `/api/blog/admin/categories/{id}` | Admin, Teacher | Cập nhật danh mục blog |
| **DELETE** | `/api/blog/admin/categories/{id}` | Admin, Teacher | Xóa danh mục blog |

---

## 5. Quản lý Hồ sơ Học viên (`StudentsController`)
* **Base Route:** `/api/students`
* **Mục đích:** Giúp Admin quản lý chi tiết danh sách học viên trong trung tâm.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/students` | Admin | Xem danh sách học viên (tìm kiếm theo tên, cấp độ, mục tiêu, trạng thái) |
| **GET** | `/api/students/{id}` | Admin | Xem thông tin chi tiết & hồ sơ của học viên |
| **POST** | `/api/students` | Admin | Admin tạo trực tiếp tài khoản & hồ sơ học viên mới |
| **PUT** | `/api/students/{id}` | Admin | Cập nhật thông tin/trạng thái hồ sơ học viên |
| **DELETE** | `/api/students/{id}` | Admin | Khóa tài khoản của học viên |

---

## 6. Quản lý Hồ sơ Giáo viên (`TeachersController`)
* **Base Route:** `/api/teachers`
* **Mục đích:** Quản lý danh sách giáo viên của hệ thống.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/teachers` | Admin | Lấy danh sách giáo viên trong trung tâm |
| **GET** | `/api/teachers/{id}` | Admin | Xem chi tiết hồ sơ giáo viên |
| **POST** | `/api/teachers` | Admin | Admin tạo tài khoản giáo viên mới |
| **PUT** | `/api/teachers/{id}` | Admin | Cập nhật thông tin giáo viên |
| **DELETE** | `/api/teachers/{id}` | Admin | Khóa tài khoản giáo viên |

---

## 7. Yêu cầu Tư vấn (`ConsultationController`)
* **Base Route:** `/api/consultations`
* **Mục đích:** Tiếp nhận thông tin đăng ký tư vấn từ Landing Page/Public website.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/consultations` | Public | Khách gửi thông tin đăng ký tư vấn (Họ tên, SĐT, Email, tin nhắn) |
| **GET** | `/api/consultations` | Admin | Xem danh sách đăng ký tư vấn (phân trang, lọc trạng thái) |
| **GET** | `/api/consultations/new-count` | Admin | Xem số lượng yêu cầu tư vấn mới chưa xử lý |
| **PUT** | `/api/consultations/{id}` | Admin | Cập nhật trạng thái xử lý yêu cầu tư vấn (đang gọi, đã chốt, hủy...) |
| **DELETE** | `/api/consultations/{id}` | Admin | Xóa bỏ yêu cầu tư vấn |

---

## 8. Cấu hình Hệ thống & Phân quyền (`SettingsController`)
* **Base Route:** `/api/settings`
* **Mục đích:** Cấu hình chung hệ thống và thay đổi vai trò (Role) người dùng.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/settings` | Public | Lấy thông tin cấu hình chung (Thông tin liên hệ, ngân hàng nhận học phí...) |
| **PUT** | `/api/settings` | Admin | Cập nhật cấu hình chung của hệ thống |
| **GET** | `/api/settings/users` | Admin | Lấy danh sách người dùng để quản lý vai trò |
| **PUT** | `/api/settings/users/{userId}/roles` | Admin | Cập nhật quyền (Roles) cho một người dùng (Admin, Teacher, Student) |
| **POST** | `/api/settings/categories` | Admin | Tạo danh mục lớp học mới |
| **PUT** | `/api/settings/categories/{id}` | Admin | Cập nhật danh mục lớp học |
| **DELETE** | `/api/settings/categories/{id}` | Admin | Xóa danh mục lớp học |

---

## 9. Tải lên tập tin (`UploadController`)
* **Base Route:** `/api/upload`
* **Mục đích:** Xử lý upload tài liệu, ảnh thumbnail bài viết, bài nộp học sinh.

| HTTP Method | Route | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/upload` | Public | Tải lên một tập tin (trả về URL lưu trữ cục bộ `/api/uploads/...`) |
