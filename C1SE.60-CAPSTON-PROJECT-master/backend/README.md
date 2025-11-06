# CS60 Recruitment System - Backend

Backend API server cho hệ thống tuyển dụng CS60, được phát triển với Node.js, Express và MySQL.

## Cấu trúc dự án

```
backend/
├── logs/               # Log files
├── src/                # Source code
│   ├── config/         # Cấu hình ứng dụng và database
│   ├── controllers/    # Xử lý logic nghiệp vụ
│   ├── middlewares/    # Middleware (xác thực, phân quyền, validation)
│   ├── models/         # Định nghĩa model/schema
│   ├── routes/         # Định tuyến API
│   ├── services/       # Các dịch vụ
│   ├── utils/          # Tiện ích
│   └── server.js       # Entry point
├── uploads/            # Thư mục lưu file tải lên
├── .env                # Biến môi trường
├── package.json        # Thông tin ứng dụng và dependencies
└── README.md           # Tài liệu hướng dẫn
```

## Yêu cầu

- Node.js >= 14.x
- MySQL 8.0
- Docker (để chạy container database)

## Cài đặt

1. **Clone repository và cài đặt dependencies**

```bash
git clone <repository-url>
cd CS.60/backend
npm install
```

2. **Cấu hình biến môi trường**

Tạo file `.env` hoặc sửa file đã có:

```
NODE_ENV=development
PORT=5000
HOST=localhost

# Database settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=cs60user
DB_PASS=cs60password
DB_NAME=cs60_recruitment

# JWT settings
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# File upload settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880  # 5MB

# Logging
LOG_LEVEL=info
```

3. **Khởi động server**

```bash
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký (dành cho ứng viên)
- `GET /api/auth/profile` - Lấy thông tin tài khoản (đã đăng nhập)
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/logout` - Đăng xuất

### User Management

- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:id` - Lấy thông tin người dùng theo ID
- `POST /api/users` - Tạo người dùng mới
- `PUT /api/users/:id` - Cập nhật thông tin người dùng
- `DELETE /api/users/:id` - Xóa người dùng
- `GET /api/users/roles/all` - Lấy danh sách vai trò

### Questions & Tests

- `GET /api/questions` - Lấy danh sách câu hỏi
- `GET /api/questions/:id` - Lấy thông tin câu hỏi theo ID
- `POST /api/questions` - Tạo câu hỏi mới
- `PUT /api/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi
- `GET /api/questions/categories` - Lấy danh sách danh mục câu hỏi
- `GET /api/tests` - Lấy danh sách bài test
- `GET /api/tests/:id` - Lấy thông tin bài test theo ID
- `POST /api/tests` - Tạo bài test mới
- `PUT /api/tests/:id` - Cập nhật bài test
- `DELETE /api/tests/:id` - Xóa bài test

### Candidates & Applications

- `GET /api/candidates` - Lấy danh sách ứng viên
- `GET /api/candidates/:id` - Lấy thông tin ứng viên theo ID
- `POST /api/candidates` - Tạo ứng viên mới
- `PUT /api/candidates/:id` - Cập nhật thông tin ứng viên
- `DELETE /api/candidates/:id` - Xóa ứng viên
- `POST /api/candidates/:id/resumes` - Tải lên CV cho ứng viên
- `GET /api/candidates/:id/applications` - Lấy danh sách đơn ứng tuyển của ứng viên
- `POST /api/candidates/:id/applications` - Tạo đơn ứng tuyển mới cho ứng viên

### Interviews

- `GET /api/interviews` - Lấy danh sách cuộc phỏng vấn
- `GET /api/interviews/:id` - Lấy thông tin cuộc phỏng vấn theo ID
- `POST /api/interviews` - Tạo cuộc phỏng vấn mới
- `PUT /api/interviews/:id` - Cập nhật cuộc phỏng vấn
- `DELETE /api/interviews/:id` - Hủy cuộc phỏng vấn
- `GET /api/interviews/:id/feedback` - Lấy đánh giá của cuộc phỏng vấn
- `POST /api/interviews/:id/feedback` - Thêm đánh giá cho cuộc phỏng vấn

### Test Taking

- `GET /api/candidates/tests` - Lấy danh sách bài test đã giao
- `GET /api/candidates/tests/:id` - Lấy thông tin bài test đã giao theo ID
- `POST /api/candidates/tests/:id/start` - Bắt đầu làm bài test
- `POST /api/candidates/tests/:id/submit` - Nộp bài test
- `GET /api/candidates/tests/:id/result` - Lấy kết quả bài test

## Authentication & Authorization

- Hệ thống sử dụng JWT (JSON Web Token) để xác thực người dùng
- Tất cả các API (trừ đăng nhập và đăng ký) đều yêu cầu token xác thực
- Header xác thực: `Authorization: Bearer <token>`
- Phân quyền dựa trên RBAC (Role-Based Access Control)

## Mô hình dữ liệu

Hệ thống sử dụng Sequelize ORM để tương tác với database MySQL.
Cấu trúc database tuân theo thiết kế đã định nghĩa trong schema SQL.

## Xử lý lỗi

Các mã lỗi API:
- 200: Thành công
- 201: Tạo thành công
- 400: Lỗi dữ liệu đầu vào
- 401: Chưa xác thực
- 403: Không có quyền
- 404: Không tìm thấy
- 500: Lỗi server

## Development

### Scripts

- `npm start` - Khởi động server
- `npm run dev` - Khởi động server với nodemon (auto-reload)
- `npm test` - Chạy unit tests

### Testing

Jest được sử dụng cho unit testing và integration testing.

### Logging

Winston được sử dụng để ghi log, các log được lưu trong thư mục `logs/`.

## License

CS60 - Team 60
