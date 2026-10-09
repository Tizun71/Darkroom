# Darkroom

Gallery tĩnh hiển thị ảnh AI kèm prompt đã tạo ra ảnh đó. Dùng Vite + React + Tailwind, không có backend.

## Chạy

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # xuất ra dist/, deploy lên bất kỳ static host nào
npm run preview   # xem thử bản build
npm run check     # kiểm tra content/ (CI chạy lệnh này trên mọi PR)
```

## Người khác đóng góp thế nào

Xem trang `/contribute.html` hoặc `CONTRIBUTING.md`. Tóm tắt: người đóng góp gửi pull request thêm 2 file (ảnh + `.md`) vào `content/`, GitHub Action (`.github/workflows/check.yml`) chạy `npm run check` và `npm run build`, bạn review rồi merge. Ai không quen PR thì dùng issue form "Submit a prompt".

Nhớ điền `REPO_URL` trong `src/config.ts` để các link tới repo (upload, fork, issue) hiện ra.

## Thêm ảnh mới

Thả hai file **cùng tên** vào thư mục `content/`:

```
content/
  harbor-dawn.jpg    ← ảnh (.jpg .jpeg .png .webp .avif .gif)
  harbor-dawn.md     ← prompt
```

Nội dung `harbor-dawn.md`:

```md
---
title: Harbor at dawn
model: Midjourney v7
date: 2026-09-25
tags: landscape, morning
negative: text, watermark
---
Fishing boats in a quiet harbor at dawn, mist on the water, ...
```

- Phần dưới dấu `---` là prompt. Nút copy sẽ copy đúng phần này.
- `title`, `model`, `date`, `tags` bắt buộc (`npm run check` báo lỗi nếu thiếu). `negative`, `author` không bắt buộc. Tác phẩm có `date` mới nhất hiện đầu trang.
- Ảnh phải là file trong `content/`. `npm run check` từ chối `image: https://...` để ảnh không mất về sau.
- Ảnh quá lớn: `npm run compress -- <ảnh> <tên>` thu nhỏ và lưu thành `.avif` trong `content/`.
- Tên file (`harbor-dawn`) được dùng làm link chia sẻ: `/#/harbor-dawn`.
- `author:` nhận link X (`https://x.com/ten`), link GitHub hoặc username GitHub. Link X lấy avatar từ `https://unavatar.io/x/ten`, GitHub lấy từ `https://unavatar.io/github/ten`.

Khi đang chạy `npm run dev`, trang tự tải lại mỗi khi bạn thêm, sửa hoặc xoá file trong `content/`. Nếu một file `.md` không có ảnh đi kèm, terminal sẽ báo lỗi và tác phẩm đó bị bỏ qua.

## Cấu trúc

Trang chỉ có một việc: xem ảnh, bấm Copy. Header một dòng, thanh tìm kiếm + tag dính trên cùng, lưới ảnh, bấm ảnh để xem prompt đầy đủ và copy.

| Đường dẫn | Vai trò |
|---|---|
| `content/` | Ảnh và prompt. Thường chỉ cần sửa ở đây. |
| `plugins/gallery.ts` | Plugin Vite đọc `content/` lúc build, lấy kích thước ảnh, tạo module `virtual:gallery`. |
| `src/config.ts` | Điền `REPO_URL` để hiện link GitHub ở header và trang contribute. |
| `src/components/Contribute.tsx` | Trang hướng dẫn đóng góp. |
| `scripts/check-content.ts` | Kiểm tra tên file, trường bắt buộc, kích thước ảnh. |
| `.github/` | CI, PR template, issue form. |
| `src/App.tsx` | Header, tìm kiếm, lọc tag, footer, link chia sẻ `#/<id>`. |
| `src/components/Wall.tsx` | Lưới masonry, mỗi ô hiện model và người đóng góp. |
| `src/components/Lightbox.tsx` | Xem chi tiết: prompt, nút Copy, negative prompt, link chia sẻ. |
| `src/components/CopyButton.tsx` | Nút copy (dựa trên 21st.dev Copy Button), có fallback. |
| `src/page.tsx` | Trang Privacy, Terms, 404. |
| `src/index.css` | Màu và font (Tailwind v4 `@theme`). |
"# Darkroom" 
