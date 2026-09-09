# V22 原始清晰度发布契约

## 回归根因

历史发布脚本把所有栅格图片缩小至最长边 320px，并使用 WebP quality 25；生产构建又把本地高清例外路径改回这些缩略图。HTTP 200 和图片格式验证不足以发现清晰度损失。

## 当前保证

- `content/site-content.json` 的稳定 assetId 不变，成员展示顺序不变。
- 原图完整保留在 V22 离线包的 `sites-media-hq`；公开站点使用 `sites-media-display-web`：最长边上限 1280px、WebP quality 72、alpha quality 90，不放大低分辨率原图。该参数优先保证新闻正文与卡片清晰，同时适配 Sites 发布通道。
- `sites-media-display-map.json` 只负责逻辑路径及历史缩略图地址到新物理地址的解析；显示图不再使用 320px/quality 25 版本。
- `sites-public` 是本地与生产共同使用的生成目录，Vite 原样复制静态文件。
- 新媒体地址携带 v22，避免旧图缓存。旧图保留供历史链接兼容，新页面不再引用它们。
- `npm run build` 必须通过逐文件展示图字节一致性门禁；缺文件、修改展示图或构建二次降质立即失败。
- 对部分本身低于屏幕需求的原始照片，保持原始信息；未来应收集更高分辨率的原始照片，不能伪造细节。
- 两个 Windows 尾点文件名的历史附件使用已存在的安全命名附件副本，不涉及图片降级；清单明确记录。

## 后端接入

继续沿用 assetId → metadata → objectKey → URL；后端可增加经过清晰度验收的 display/thumbnail 派生图，但 original 必须不可变。禁止为了减小部署包而覆盖 original，或把缩略图当成所有视口的展示图。
