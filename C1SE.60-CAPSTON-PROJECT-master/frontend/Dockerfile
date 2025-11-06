# Sử dụng Node.js image để chạy frontend dev server
FROM node:18

WORKDIR /app
COPY . .
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", ".", "-l", "3000"]
