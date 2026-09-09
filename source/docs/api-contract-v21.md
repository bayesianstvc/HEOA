# HEOA V21 前端／后端接缝

本文件约定后端目标接口形状，当前仅有 TypeScript 契约和 HTTP 客户端骨架，尚未实现以下服务端路由。页面仍从本地 Repository 读取数据；后端到位后需完成异步 Repository 接线与契约测试，保持页面结构不变。

## 端点

- `GET /api/content`
- `GET /api/content/:id`
- `POST /api/content`
- `PATCH /api/content/:id`
- `POST /api/content/:id/transitions`
- `GET /api/members`
- `GET /api/members/:id`
- `POST /api/members`
- `PATCH /api/members/:id`
- `POST /api/members/:id/transitions`
- `GET /api/media/:assetId?variant=original|display|thumbnail`

## 查询参数

列表接口统一使用：`page`、`pageSize`、`q`、`year`、`category`、`centerId`、`status`。

## 响应

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 12,
    "total": 0,
    "pageCount": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "error": null,
  "requestId": "optional"
}
```

错误统一返回 `{ "data": null, "error": { "code": "...", "message": "..." } }`。

## 状态与幂等

公开端必须由服务端强制只返回 `published`，不能信任 URL 的 status 参数；管理端状态筛选必须经过鉴权。历史本地内容缺少 status 时，当前兼容层按既有已发布内容读取，正式迁移必须显式补齐状态。

状态集合为 draft、review、published、withdrawn、archived。合法迁移（含驳回、重审、重新发布、恢复）、角色权限及审计记录由正式后端确定，不能仅用线性枚举代替状态机。写操作携带 `Idempotency-Key`，可选 `If-Match-Version`；幂等去重和并发冲突必须由后端实际执行。

## 媒体解析

正文与成员只保存 `assetId`。媒体服务负责 `assetId → metadata → objectKey → URL`，并返回原图、展示图、缩略图三种变体。旧裸 URL 仅作为兼容回退，不作为新的唯一引用。
