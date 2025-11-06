# Khởi động toàn bộ hệ thống
docker-compose up -d

# Dừng toàn bộ hệ thống
docker-compose down

# Rebuild và khởi động lại khi có thay đổi code
docker-compose up -d --build

# Xem logs của từng service
docker logs -f cs60_backend   # Xem logs backend
docker logs -f cs60_mysql    # Xem logs database
docker logs -f cs60_frontend # Xem logs frontend
# build fe
docker-compose up -d --build frontend
#-------------------------------------------
Dịch vụ,Địa chỉ truy cập,Ghi chú
Frontend (Website),http://localhost:3000
,"Đây là cổng phổ biến cho các ứng dụng phát triển. Nếu không hoạt động, hãy thử http://localhost hoặc kiểm tra file docker-compose.yml của bạn để tìm cổng map ra ngoài (ví dụ: 80:80)."
Trang Đăng Nhập,http://localhost:3000/pages/login.html,Đây là trang đích sau khi file index.html chuyển hướng.
API Backend,http://localhost:5000,Đây là API server được container cs60_backend chạy. Frontend sẽ giao tiếp với địa chỉ này.
phpMyAdmin,Thường là http://localhost:8081,"Nếu bạn có container phpMyAdmin, đây là cổng phổ biến. (Kiểm tra docker-compose.yml để xác nhận)."