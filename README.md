# Moji — Realtime Chat App

Ứng dụng chat realtime kiểu Messenger: nhắn tin 1-1 / nhóm, kết bạn, gửi ảnh, typing indicator, trạng thái online.

**Repository:** https://github.com/HoangDVH/ChatAppRealTime

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Chức năng đã làm](#chức-năng-đã-làm)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Clone & chạy local](#clone--chạy-local)
- [Tài khoản test](#tài-khoản-test)
- [Deploy](#deploy)

---

## Giới thiệu

Moji là full-stack realtime chat app với:

- **Frontend:** React + Vite, giao diện sidebar + khung chat, dark/light mode
- **Backend:** Express + Socket.io, JWT auth (access + refresh cookie)
- **Database:** MongoDB Atlas
- **Media:** Cloudinary (avatar + ảnh trong chat)

Luồng realtime dùng Socket.io (tin nhắn mới, đã xem, online, typing, lời mời kết bạn).

---

## Công nghệ sử dụng

### Frontend (`frontend/`)

| Công nghệ | Vai trò |
|-----------|---------|
| **React 18** | UI SPA |
| **TypeScript** | Type-safe |
| **Vite 7** | Dev server & build |
| **React Router 7** | Routing (`/signin`, `/signup`, chat…) |
| **Zustand** | State: auth, chat, friends, socket, theme |
| **Axios** | REST API + refresh token interceptor |
| **Socket.io-client** | Realtime |
| **Tailwind CSS 4** + shadcn/Radix UI | UI components |
| **React Hook Form + Zod** | Form & validation |
| **emoji-mart** | Emoji picker |
| **Sonner** | Toast |
| **Cloudinary URL** | Hiển thị ảnh đã upload |

### Backend (`backend/`)

| Công nghệ | Vai trò |
|-----------|---------|
| **Node.js + Express 5** | REST API |
| **Socket.io** | Realtime events |
| **MongoDB + Mongoose** | User, Conversation, Message, Friend, Session |
| **JWT + bcrypt** | Auth & hash password |
| **cookie-parser** | Refresh token httpOnly cookie |
| **Multer + Cloudinary** | Upload avatar / ảnh chat |
| **CORS** | Cho phép frontend (local / Vercel) |
| **Swagger UI** | API docs tại `/api-docs` |

### Hạ tầng / dịch vụ ngoài

- **MongoDB Atlas** — database
- **Cloudinary** — lưu ảnh
- **Render** — host backend (khuyến nghị)
- **Vercel** — host frontend (khuyến nghị)

---

## Chức năng đã làm

### Xác thực
- Đăng ký / Đăng nhập / Đăng xuất
- Access token + Refresh token (cookie, `sameSite=none` khi production)
- Tự refresh khi API trả 403

### Bạn bè
- Tìm user theo username
- Gửi / chấp nhận / từ chối lời mời kết bạn
- Thông báo realtime khi có lời mời mới / được chấp nhận
- Badge số lời mời trên menu người dùng

### Chat
- Danh sách chat 1-1 và nhóm
- Gửi / nhận tin nhắn realtime
- Bubble tin nhắn, nhóm tin, mốc thời gian
- Trạng thái **delivered / seen**
- Unread badge, tin cuối trong danh sách DM
- Infinite scroll lịch sử tin nhắn
- Gửi emoji
- **Gửi & hiện ảnh** trong chat (upload Cloudinary)
- **Typing indicator** (“đang nhập…”)
- Online / offline (Socket.io)

### Nhóm
- Tạo nhóm chat, chọn thành viên
- Gửi tin nhắn trong nhóm

### Hồ sơ
- Xem hồ sơ, upload avatar
- Dark / Light mode

### Khác
- Responsive (sidebar mobile)
- CORS + cookie cross-origin sẵn sàng cho Vercel + Render

---

## Cấu trúc thư mục

```
ChatAppRealTime/
├── backend/                 # Express + Socket.io API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── services/
│   │   └── ...
│   ├── vercel.json
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Clone & chạy local

### 1. Clone repo

```bash
git clone https://github.com/HoangDVH/ChatAppRealTime.git
cd ChatAppRealTime
```

### 2. Cấu hình Backend

```bash
cd backend
copy .env.example .env
# Windows PowerShell cũng dùng: Copy-Item .env.example .env
npm install
```

Điền các biến trong `backend/.env` (xem `backend/.env.example`):

- `MONGODB_CONNECTIONSTRING`
- `ACCESS_TOKEN_SECRET`
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `CLIENT_URL=http://localhost:5174`
- `PORT=5001`

MongoDB Atlas: Network Access cho phép IP của bạn (hoặc `0.0.0.0/0` khi deploy).

Chạy backend:

```bash
npm run dev
```

API: `http://localhost:5001` — Swagger: `http://localhost:5001/api-docs`

### 3. Cấu hình Frontend

Mở terminal mới:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Đảm bảo `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001/
```

Mở trình duyệt: **http://localhost:5174**

---

## Tài khoản test

Dùng 2 trình duyệt / 2 cửa sổ ẩn danh để test chat realtime.

### Tài khoản 1

| Trường | Giá trị |
|--------|---------|
| Họ | Nguyen |
| Tên | An |
| Tên đăng nhập | `nguyenan01` |
| Email | nguyenan01@gmail.com |
| Mật khẩu | `123456` |

### Tài khoản 2

| Trường | Giá trị |
|--------|---------|
| Tên đăng nhập | `hoang` |
| Mật khẩu | `Hoang@123` |

**Gợi ý test:** đăng nhập cả 2 → kết bạn (nếu chưa) → mở chat → thử text, emoji, ảnh, typing.

---

## Deploy

### Backend — Render

- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Env: `NODE_ENV=production`, MongoDB, JWT, Cloudinary, `CLIENT_URL` = URL Vercel (không `/` cuối)

### Frontend — Vercel

- Root Directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env:
  - `VITE_API_URL=https://<service>.onrender.com/api`
  - `VITE_SOCKET_URL=https://<service>.onrender.com/`

Chi tiết template env: `backend/.env.render.example`, `frontend/.env.vercel.example`.

---

## License

ISC
