# Black One NFC Memory System

一套面向 NFC 物件的内容体验系统，包含：

- 用户端 H5 体验页：NFC 触碰后打开，自动加载对应音频与抽象线条佛影动画
- 内容资产层：音频、短句文案、封面、视觉参数与分析数据
- 后台运营系统：上传管理、专属链接生成、二维码、启停与基础访问统计

## 已实现能力

- 后台登录页 `/admin/login`
- 后台内容列表 `/admin`
- 新建 / 编辑内容单元
- 音频上传支持：MP3 / WAV / AAC / M4A
- 服务端自动压缩音频，生成 amplitude / frequency 数据
- 每个内容自动绑定唯一访问链接 `/nfc/[slug]`
- 支持 `/experience?id=xxx` 兼容跳转
- 复制链接与二维码生成，方便写入 NFC
- 内容启停与基础访问统计

## 技术栈

- Next.js 16 + React 19
- Node 内置 `node:sqlite`
- 系统 `ffmpeg / ffprobe` 负责音频压缩与分析
- 自定义 Canvas 动画驱动用户端体验页

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 复制环境变量

```bash
cp .env.example .env.local
```

3. 启动开发环境

```bash
npm run dev
```

4. 打开地址

- 前台介绍页：[http://localhost:3000](http://localhost:3000)
- 后台登录：[http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 环境变量

- `NEXT_PUBLIC_SITE_NAME`：站点名称
- `NEXT_PUBLIC_SITE_URL`：前台公开地址
- `SITE_URL`：服务端使用的公开地址
- `ADMIN_USERNAME`：后台账号
- `ADMIN_PASSWORD`：后台密码
- `SESSION_SECRET`：后台会话签名密钥

## 存储结构

- `storage/data/blackone.sqlite`：SQLite 数据库
- `storage/audio/original`：原始音频
- `storage/audio/processed`：压缩后的移动端音频
- `storage/covers`：封面图片

## Docker 部署

先准备好 `.env`，再执行：

```bash
docker build -t blackone-nfc .
docker run -d \
  --name blackone-nfc \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/storage:/app/storage \
  blackone-nfc
```

说明：

- 容器内已经安装 `ffmpeg`
- `storage` 目录需要挂载为持久卷，否则重新部署会丢失上传内容与数据库
- 若部署到 Railway / Render / VPS，核心要求也是同样两点：提供 Node 22+ 与持久化存储

## Render 部署

这个仓库已经包含根目录 `render.yaml`，可以直接用 Render Blueprint 导入。

注意：

- 这套系统依赖持久化磁盘保存 `storage`，因此不适合 Render Free 实例
- 官方文档说明 Free web service 不能附加 persistent disk，所以建议至少使用 `Starter`
- 当前 `render.yaml` 已经预设：
  - `runtime: docker`
  - `plan: starter`
  - `region: singapore`
  - 挂载磁盘到 `/app/storage`
  - 自动生成 `SESSION_SECRET`
  - 在导入时提示填写后台账号密码和站点地址

## 后续可扩展

- 限量编号系统
- 动态更新同一 NFC 的内容
- 用户收藏机制
- 普通版 / 隐藏版 / 特别版分级内容
