# ----------------------------------------------------------------------
# GIAI ĐOẠN 1: BUILDER - Cài đặt dependencies và build (nếu có)
# ----------------------------------------------------------------------
# Sử dụng base image đầy đủ (node:18) để có môi trường ổn định cho việc cài đặt
FROM node:18 AS builder

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy package files (tận dụng Docker cache)
COPY package*.json ./

# Cài đặt tất cả dependencies
RUN npm install

# Copy toàn bộ mã nguồn còn lại
COPY . .

# Nếu dự án của bạn có bước build (ví dụ: chuyển đổi TypeScript sang JS), hãy thêm lệnh này:
# RUN npm run build


# ----------------------------------------------------------------------
# GIAI ĐOẠN 2: PRODUCTION - Tạo image cuối cùng nhỏ gọn
# ----------------------------------------------------------------------
# Sử dụng base image 'slim' hoặc 'alpine' (ít thư viện không cần thiết) để giảm kích thước image cuối cùng
FROM node:18-slim

# Đặt thư mục làm việc
WORKDIR /app

# Thiết lập biến môi trường cho môi trường Production
ENV NODE_ENV=production
ENV PORT=5000

# Copy chỉ những thứ cần thiết từ giai đoạn BUILDER sang
# 1. Copy dependencies đã cài đặt (node_modules)
COPY --from=builder /app/node_modules ./node_modules
# 2. Copy mã nguồn ứng dụng (bao gồm src, config, .env, v.v.)
COPY --from=builder /app /app

# Khuyến nghị: Chạy ứng dụng bằng user không phải root để tăng cường bảo mật
# USER node

# Expose port backend
EXPOSE ${PORT}

# Lệnh khởi chạy server
CMD ["node", "src/server.js"]