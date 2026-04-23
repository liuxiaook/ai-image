# AI 图像生成工具

类似DALL-E 3的AI图像生成网站，基于火山引擎AI模型，支持文生图、图生图、高清放大、风格转换、历史记录保存等功能。

## ✨ 功能列表
- 🎨 **文生图**: 根据文字描述生成AI图像，支持多种风格和尺寸选择
- 🖼️ **图生图**: 基于参考图片生成新的图像，可调整相似度
- 🔍 **高清放大**: 将低分辨率图片放大2/4/8倍，保持清晰度
- 🎭 **风格转换**: 将图片转换为动漫、水彩、油画等多种风格
- 💾 **历史记录**: 自动保存所有生成记录，支持随时查看和下载
- 📱 **响应式设计**: 适配PC和移动端访问

## 🛠️ 技术栈
- **前端**: React 18 + Vite + Ant Design
- **后端**: Node.js + Express
- **AI服务**: 火山引擎Coding Plan 图像生成API（Doubao系列模型）
- **部署**: 支持免费部署到Vercel(前端) + Render(后端)

## 🚀 快速开始

### 1. 配置火山引擎Coding Plan API
1. 登录你的火山引擎Coding Plan控制台
2. 进入API密钥管理页面，获取你的API Key
3. 在`backend`目录下创建`.env`文件，复制`.env.example`内容并填入你的密钥:
```env
VOLC_API_KEY=839cbb9a-a9c0-43b0-8c18-020b8805d732
VOLC_API_URL=https://ark.cn-beijing.volces.com/api/v3/images/generations
PORT=3001
```
> 注意：如果你的Coding Plan有自己的专属API地址，请替换上面的`VOLC_API_URL`为你的实际地址

### 2. 本地运行
#### 启动后端服务
```bash
cd backend
npm install
node index.js
```
后端服务将运行在 http://localhost:3001

#### 启动前端服务
```bash
# 在项目根目录
npm install
npm run dev
```
前端服务将运行在 http://localhost:5173

## 🌐 部署到公网(免费方案)

### 前端部署到 Vercel
1. Fork 本项目到你的GitHub
2. 登录Vercel: https://vercel.com/
3. 导入你的项目仓库
4. 配置环境变量:
   - `VITE_API_URL`: 你的后端服务地址，格式为 `https://你的后端域名/api`
5. 点击部署，部署完成后会得到一个免费的域名

### 后端部署到 Render
1. 登录Render: https://render.com/
2. 选择"New" -> "Web Service"
3. 导入你的项目仓库，选择`backend`目录作为部署目录
4. 配置启动命令: `node index.js`
5. 配置环境变量，填入你在`.env`中的所有配置
6. 点击部署，部署完成后会得到一个免费的域名，将这个域名填入前端的`VITE_API_URL`环境变量即可

## 📝 注意事项
1. 火山引擎API调用会产生费用，请确保你的账户有足够余额
2. 免费部署方案有资源限制，适合个人使用，如果访问量高建议升级付费方案
3. 图片上传功能默认使用mock地址，你可以替换为自己的OSS存储服务或者火山引擎的图片上传接口
4. 历史记录默认存储在本地JSON文件中，部署后建议改为数据库存储

## 🎯 后续扩展
- 增加用户登录注册功能
- 支持批量生成图片
- 增加图像编辑功能（裁剪、滤镜等）
- 集成更多AI模型
- 支持分享生成的图片到社交平台