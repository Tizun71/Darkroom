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

Xem trang `/contribute.html` hoặc `CONTRIBUTING.md`. Tóm tắt: người đóng góp gửi pull request thêm 1 thư mục `content/<tên>/` (ảnh + `prompt.md`), GitHub Action (`.github/workflows/check.yml`) chạy `npm run check` và `npm run build`, bạn review rồi merge. Ai không quen PR thì dùng issue form "Submit a prompt".

Nhớ điền `REPO_URL` trong `src/config.ts` để các link tới repo (upload, fork, issue) hiện ra.

## Thêm ảnh mới

Mỗi tác phẩm là **một thư mục** trong `content/`:

```
content/
  harbor-dawn/
    image.avif    ← ảnh (image.jpg .jpeg .png .webp .avif .gif)
    prompt.md     ← prompt
```

Cách nhanh nhất:

```bash
npm run add -- ~/Downloads/poster.png harbor-dawn
```

Lệnh này nén ảnh thành `content/harbor-dawn/image.avif` và tạo `prompt.md` mẫu. Sửa các trường, dán prompt, chạy `npm run check`.

Nội dung `prompt.md`:

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
- Ảnh phải là file trong thư mục của tác phẩm. `npm run check` từ chối `image: https://...` để ảnh không mất về sau.
- Ảnh quá lớn: `npm run add -- <ảnh> <tên>` thu nhỏ và lưu thành `content/<tên>/image.avif` (`npm run compress` là alias).
- Tên thư mục (`harbor-dawn`) được dùng làm link chia sẻ: `/#/harbor-dawn`.
- `author:` nhận link X (`https://x.com/ten`), link GitHub hoặc username GitHub. Link X lấy avatar từ `https://unavatar.io/x/ten`, GitHub lấy từ `https://unavatar.io/github/ten`.

Khi đang chạy `npm run dev`, trang tự tải lại mỗi khi bạn thêm, sửa hoặc xoá file trong `content/`. Nếu một thư mục thiếu `prompt.md` hoặc ảnh, terminal sẽ báo lỗi và tác phẩm đó bị bỏ qua.

## Ảnh qua CDN (jsDelivr)

Khi Vercel build từ một commit GitHub, ảnh **không** được đóng gói vào `dist/`. Site trỏ thẳng tới jsDelivr, ghim theo commit đang deploy:

```
https://cdn.jsdelivr.net/gh/<owner>/<repo>@<commit-sha>/content/<tên>/image.avif
```

- Bật tự động nhờ system env của Vercel (`VERCEL_GIT_REPO_OWNER`, `VERCEL_GIT_REPO_SLUG`, `VERCEL_GIT_COMMIT_SHA`). Cần bật "Automatically expose System Environment Variables" (mặc định bật) và repo phải public.
- Ghim theo SHA nên URL không bao giờ cũ, jsDelivr cache vĩnh viễn. Kích thước ảnh vẫn đọc lúc build nên lưới không nhảy.
- `IMAGE_CDN=off`: tắt, đóng gói ảnh như bình thường (dùng khi `vercel deploy` từ máy với commit chưa push).
- `IMAGE_CDN_BASE=https://cdn.jsdelivr.net/gh/Tizun71/Darkroom@main`: tự đặt base URL khi build ở nơi khác.
- Chạy local (`npm run dev`, `npm run build`) không có các env trên nên vẫn dùng ảnh local.

## Cấu trúc

Trang chỉ có một việc: xem ảnh, bấm Copy. Header một dòng, thanh tìm kiếm + tag dính trên cùng, lưới ảnh, bấm ảnh để xem prompt đầy đủ và copy.

| Đường dẫn | Vai trò |
|---|---|
| `content/` | Mỗi tác phẩm một thư mục: `image.*` + `prompt.md`. Thường chỉ cần sửa ở đây. |
| `plugins/gallery.ts` | Plugin Vite đọc `content/` lúc build, lấy kích thước ảnh, tạo module `virtual:gallery`, chọn ảnh local hay CDN. |
| `scripts/add-entry.ts` | `npm run add`: nén ảnh, tạo thư mục và `prompt.md` mẫu. |
| `src/config.ts` | Điền `REPO_URL` để hiện link GitHub ở header và trang contribute. |
| `src/components/Contribute.tsx` | Trang hướng dẫn đóng góp. |
| `scripts/check-content.ts` | Kiểm tra tên thư mục, trường bắt buộc, kích thước ảnh. |
| `.github/` | CI, PR template, issue form. |
| `src/App.tsx` | Header, tìm kiếm, lọc tag, footer, link chia sẻ `#/<id>`. |
| `src/components/Wall.tsx` | Lưới masonry, mỗi ô hiện model và người đóng góp. |
| `src/components/Lightbox.tsx` | Xem chi tiết: prompt, nút Copy, negative prompt, link chia sẻ. |
| `src/components/CopyButton.tsx` | Nút copy (dựa trên 21st.dev Copy Button), có fallback. |
| `src/page.tsx` | Trang Privacy, Terms, 404. |
| `src/index.css` | Màu và font (Tailwind v4 `@theme`). |
"# Darkroom" 
