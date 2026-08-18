# Quản lý chi phí công trình

Ứng dụng đơn giản để ghi nhận và theo dõi chi phí công trình xây dựng: trang **Giao dịch** (transactions) cho nhân viên nhập chi/thu theo công trình, và trang **Quản trị** (admin) để quản lý người dùng, công trình, danh mục chi phí và xem tổng quan.

## Kiến trúc

- `backend/` — Node.js + Express + TypeScript + Prisma (SQLite khi dev). REST API, JWT auth, upload file đính kèm bằng multer (lưu local trong `backend/uploads`).
- `frontend/` — React (Vite) + TypeScript + Tailwind CSS v4 + React Router. Gọi API qua `/api` (Vite dev proxy sang backend cổng 4000).

## Tính năng

**Giao dịch**
- Ghi nhận chi/thu theo công trình, danh mục chi phí, số tiền, ngày, ghi chú
- Đính kèm hóa đơn/chứng từ (ảnh hoặc PDF, tối đa 10MB)
- Lọc theo công trình, danh mục, khoảng thời gian; tổng hợp số tiền
- Nhân viên chỉ sửa/xóa được giao dịch của mình; Admin quản lý tất cả

**Quản trị** (chỉ role `ADMIN`)
- Quản lý người dùng: tạo, đổi vai trò, xóa
- Quản lý công trình và danh mục chi phí: tạo, bật/tắt hoạt động, xóa
- Dashboard tổng quan: tổng chi/thu, biểu đồ chi phí theo từng công trình

## Chạy dự án ở local

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev
```

Backend chạy tại `http://localhost:4000`.

Tài khoản demo sau khi seed:
- Admin: `admin@geta.local` / `Admin@123`
- Nhân viên: `staff@geta.local` / `Staff@123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173` (Vite proxy `/api` và `/uploads` sang backend cổng 4000, xem `frontend/vite.config.ts`).

## Deploy lên Vercel

Vercel chạy backend dưới dạng **serverless function** với filesystem tạm thời (không lưu được file/SQLite lâu dài giữa các lần deploy). Vì vậy khi lên production cần:

1. **Database**: đổi `datasource` trong `backend/prisma/schema.prisma` từ `sqlite` sang `postgresql`, dùng một Postgres miễn phí (Neon, Supabase, Vercel Postgres...). Cập nhật `DATABASE_URL` tương ứng, chạy lại `npx prisma migrate deploy`.
2. **File đính kèm**: thư mục `backend/uploads` sẽ không tồn tại lâu dài trên serverless. Khi deploy thật, nên đổi phần lưu file trong `backend/src/middlewares/upload.middleware.ts` sang một storage bên ngoài (Vercel Blob, S3, Cloudinary...) thay vì `multer.diskStorage`.
3. **Deploy backend**: cách đơn giản nhất là deploy `backend/` như một Vercel Project riêng (Node.js), hoặc deploy trên Render/Railway (chạy Express bình thường, filesystem bền hơn, phù hợp nếu vẫn muốn giữ upload local). Nhớ set biến môi trường `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (trỏ về domain frontend).
4. **Deploy frontend**: import `frontend/` làm một Vercel Project (Framework preset: Vite). Set biến môi trường hoặc sửa `vite.config.ts`/thêm rewrite trong `vercel.json` để trỏ `/api` sang domain backend đã deploy (vì trên Vercel không có dev proxy).

Với quy mô nhỏ (vài chục người dùng nội bộ), phương án đơn giản nhất là: **frontend trên Vercel, backend + Postgres trên Render** (tương tự cấu trúc dự án GETA_INTERNAL cũ), tránh phải viết lại phần upload file.

## Cấu trúc dữ liệu chính

- `User`: id, name, email, passwordHash, role (`ADMIN` | `STAFF`)
- `Project` (Công trình): id, name, code, note, isActive
- `ExpenseCategory` (Danh mục chi phí): id, name, isActive
- `Transaction` (Giao dịch): id, projectId, categoryId, type (`CHI` | `THU`), amount, date, note, attachmentUrl, createdById
