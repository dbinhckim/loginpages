# Hệ Thống Tuyển Dụng CS60

Hệ thống tuyển dụng CS60 là một ứng dụng web toàn diện được thiết kế để quản lý quy trình tuyển dụng, bao gồm quản lý ứng viên, tạo bài kiểm tra, phỏng vấn và theo dõi tiến trình tuyển dụng.

## Cấu Trúc Dự Án

```
.
├── backend/             # Server Node.js với Express và Sequelize
├── database/            # Cấu hình và scripts Docker cho MySQL
├── docs/                # Tài liệu dự án
└── frontend/            # Ứng dụng frontend (React)
```

## Chức Năng Chính

- **Quản lý người dùng**: Đăng nhập, phân quyền
- **Quản lý câu hỏi**: Tạo và quản lý ngân hàng câu hỏi
- **Quản lý bài kiểm tra**: Tạo và quản lý các bài kiểm tra
- **Quản lý ứng viên**: Lưu trữ thông tin ứng viên và tài liệu
- **Quản lý phỏng vấn**: Lên lịch và quản lý phỏng vấn
- **Làm bài kiểm tra**: Môi trường cho ứng viên làm bài kiểm tra
- **Báo cáo và phân tích**: Thống kê và báo cáo về quá trình tuyển dụng

## Backend

Backend được xây dựng bằng Node.js, Express và Sequelize với MySQL.

### Cài đặt

1. Cài đặt Docker và Docker Compose
2. Khởi động database:

```bash
cd database
docker-compose up -d
```

3. Cài đặt và chạy backend:

```bash
cd backend
npm install
npm start
```

### API Endpoints

- `/api/auth`: Xác thực và quản lý người dùng
- `/api/users`: Quản lý người dùng và vai trò
- `/api/questions`: Quản lý ngân hàng câu hỏi
- `/api/tests`: Quản lý bài kiểm tra
- `/api/candidates`: Quản lý ứng viên
- `/api/jobs`: Quản lý vị trí tuyển dụng
- `/api/interviews`: Quản lý phỏng vấn
- `/api/candidate-tests`: Quản lý bài làm của ứng viên
- `/api/reports`: Báo cáo và thống kê

## Database

Hệ thống sử dụng MySQL trong Docker container với các bảng chính:

- Users, Roles, Permissions
- Questions, Tests, TestQuestions
- Candidates, JobPositions, JobApplications
- Interviews, InterviewParticipants, InterviewFeedback
- CandidateTests, CandidateAnswers

## Phát Triển

Dự án được phát triển bởi nhóm CS60.
