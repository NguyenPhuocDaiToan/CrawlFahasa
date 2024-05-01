const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf } = format;

// Định dạng cho log
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Tạo logger cho thành công
const successLogger = createLogger({
  format: combine(
    timestamp(), // Thêm timestamp cho mỗi log
    logFormat // Sử dụng định dạng log đã định nghĩa
  ),
  transports: [
    new transports.File({ filename: 'src/logs/success.log' }), // Ghi log thành công vào file success.log
  ],
});

// Tạo logger cho thất bại
const errorLogger = createLogger({
  format: combine(
    timestamp(), // Thêm timestamp cho mỗi log
    logFormat // Sử dụng định dạng log đã định nghĩa
  ),
  transports: [
    new transports.File({ filename: 'src/logs/error.log' }), // Ghi log thất bại vào file error.log
  ],
});

module.exports = {
  successLogger,
  errorLogger,
};
