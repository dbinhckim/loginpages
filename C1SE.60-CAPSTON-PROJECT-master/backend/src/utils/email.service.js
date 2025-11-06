const nodemailer = require('nodemailer');

// *** CẤU HÌNH GỬI EMAIL (Rất quan trọng) ***
// 1. Tạo tài khoản MIỄN PHÍ tại: https://mailtrap.io/
// 2. Lấy thông tin Host, Port, User, Pass trong hòm thư "My Inbox"
// 3. Điền thông tin đó vào bên dưới.
// Mailtrap sẽ "bắt" email lại, không gửi đi thật -> an toàn để test
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io", // Thay bằng host của Mailtrap
  port: 2525,                 // Thay bằng port của Mailtrap
  auth: {
    user: "YOUR_MAILTRAP_USER", // Thay bằng user của Mailtrap
    pass: "YOUR_MAILTRAP_PASS"  // Thay bằng pass của Mailtrap
  }
});

// Hàm gửi email chung
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: '"Dự án Capstone" <noreply@yourproject.com>', // Tên người gửi
      to: to,       // Email người nhận
      subject: subject, // Tiêu đề
      html: html,     // Nội dung HTML
    });
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };