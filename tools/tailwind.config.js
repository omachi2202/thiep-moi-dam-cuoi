/* Cấu hình Tailwind v3.4.17 (AD-005). CLI chạy với cwd = gốc repo (tools/build_tailwind.py đặt cwd). */
module.exports = {
  content: [
    './index.html',
    './invite.html',
    './js/**/*.js',
    '!./js/export_bundle.js', // tệp sinh ra, chứa bản sao nguồn
  ],
  // Đã rà js/**: mọi lớp Tailwind đều xuất hiện nguyên văn (ternary/biến chứa chuỗi đầy đủ),
  // không có ghép chuỗi kiểu 'bg-' + x. Lớp động còn lại (loop-*, img-shape-*, hero-dia-*, tex-*, frame-*, orn-*)
  // là CSS riêng ở css/app.css, không thuộc Tailwind. Thêm lớp dựng động mới vào đây.
  safelist: [],
  theme: { extend: {} },
  plugins: [],
};
