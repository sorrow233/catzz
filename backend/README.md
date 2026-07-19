# 画廊自动更新后端

这里的代码只在本地或 GitHub Actions 中运行，不会被 Vite 打包进 Cloudflare Pages。前端只读取生成后的 `public/gallery.json` 和 `public/artworks/`。

手动更新：

```bash
npm install --prefix backend
npm run update:gallery
```

后端拥有独立的 `package.json` 和依赖目录，Cloudflare 的前端构建不会安装或打包这些依赖。更新器会读取 Pixiv 用户 `1056186` 的公开作品列表，只同步尚未入库的作品；详情请求和图片下载限制为 3 路并发，每次请求都有超时、指数退避和最多 4 次重试。图片会压缩成最长边不超过 2000 像素的 WebP，再写入前端公开资源目录。

定时更新由 `.github/workflows/update-gallery.yml` 每天执行。发现变化后，任务只提交必要的公开 JSON、站点地图和压缩图片。Cloudflare Pages 可以通过 `main` 分支的 Git 集成自动构建；若项目保持 Direct Upload 模式，则在 GitHub 仓库中配置 `CLOUDFLARE_API_TOKEN` 后，由同一任务直接部署。
