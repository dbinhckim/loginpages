# Hướng dẫn thiết lập Database cho dự án CS.60

## Yêu cầu hệ thống
- Docker và Docker Compose
- Kết nối Internet (để tải images Docker)

## Cách thiết lập và chạy

### 1. Khởi động Docker Containers
```bash
# Di chuyển đến thư mục database
cd database

# Khởi động containers
docker-compose up -d
```

### 2. Thông tin kết nối

**MySQL:**
- Host: localhost
- Port: 3306
- Database: cs60_recruitment
- Username: cs60user
- Password: cs60password
- Root Password: rootpassword

**phpMyAdmin:**
- URL: http://localhost:8080
- Server: mysql
- Username: cs60user
- Password: cs60password

### 3. Kết nối từ ứng dụng

#### Kết nối từ backend Node.js (ví dụ với mysql2):
```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'cs60user',
  password: 'cs60password',
  database: 'cs60_recruitment'
});
```

#### Kết nối từ backend PHP (ví dụ):
```php
$conn = new mysqli('localhost', 'cs60user', 'cs60password', 'cs60_recruitment');
```

#### Kết nối từ backend Java (ví dụ với JDBC):
```java
String url = "jdbc:mysql://localhost:3306/cs60_recruitment";
String username = "cs60user";
String password = "cs60password";
Connection connection = DriverManager.getConnection(url, username, password);
```

### 4. Tắt Docker Containers
```bash
docker-compose down
```

### 5. Xóa toàn bộ dữ liệu và khởi động lại
```bash
docker-compose down -v
docker-compose up -d
```

## Cấu trúc Database

Database được thiết lập với các module chính:
- **Module 1**: Quản trị người dùng và phân quyền
- **Module 2**: Ngân hàng câu hỏi & Bài test
- **Module 3**: Quản lý ứng viên & Phỏng vấn
- **Module 4**: Hệ thống làm bài kiểm tra
- **Module 5**: Hồ sơ & Kết quả, Báo cáo

Tất cả các bảng được khởi tạo tự động khi container khởi chạy lần đầu.

## Tài khoản mặc định

- Username: admin
- Email: admin@cs60.com
- Password: admin123
- Vai trò: ADMIN
