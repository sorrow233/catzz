# 画廊自动更新后端

这里的代码只在本地或 GitHub Actions 中运行，不会被 Vite 打包进 Cloudflare Pages。前端只读取生成后的 `public/gallery.json`、`public/videos.json` 和对应的压缩图片目录。

手动更新：

```bash
npm install --prefix backend
npm run update:gallery
BILIBILI_COOKIE='仅包含 Cookie 请求头内容' npm run update:videos
```

后端拥有独立的 `package.json` 和依赖目录，Cloudflare 的前端构建不会安装或打包这些依赖。插画更新器读取 Pixiv 用户 `1056186` 的公开插画与 manga 列表，并完整展开多页投稿；视频更新器通过 WBI 签名读取哔哩哔哩空间 `287054703` 的全部投稿。请求和图片下载使用受控并发，每次请求都有超时、指数退避和最多 4 次重试。图片会压缩成 WebP 后写入前端公开资源目录。

`BILIBILI_COOKIE` 只从环境变量读取，禁止写入 `.env` 以外的本地文件或提交到 Git。定时任务需要在 GitHub Actions Secrets 中单独配置同名值；未配置时会安全跳过视频同步，不影响 Pixiv 更新。

定时更新由 `.github/workflows/update-gallery.yml` 每天执行。发现变化后，任务只提交必要的公开 JSON、站点地图和压缩图片。Cloudflare Pages 可以通过 `main` 分支的 Git 集成自动构建；若项目保持 Direct Upload 模式，则在 GitHub 仓库中配置 `CLOUDFLARE_API_TOKEN` 后，由同一任务直接部署。
