# 前端部署到Vercel操作指南

## 前置条件
1. 已注册Vercel账号（可直接用GitHub账号登录）
2. 代码已成功推送到GitHub仓库：https://github.com/liuxiaook/ai-image

## 部署步骤

### 1. 导入项目到Vercel
- 登录Vercel控制台：https://vercel.com/
- 点击右上角 **Add New** -> **Project**
- 在Import Git Repository中找到并选择您的`ai-image`仓库
- 点击 **Import** 按钮

### 2. 配置项目
- **Project Name**：自定义项目名称（Vercel会生成默认的访问域名）
- **Root Directory**：保持默认即可（因为我们的代码在仓库根目录）
- **Framework Preset**：Vercel会自动识别为`Vite`，无需修改
- **Build Command**：保持默认 `npm run build`
- **Output Directory**：保持默认 `dist`
- **Environment Variables**（可选）：如果需要配置环境变量，在这里添加
  - 比如后端API地址：`VITE_API_URL = https://your-backend-url.com/api`
  - 注意：Vite环境变量必须以`VITE_`开头才能被前端访问

### 3. 开始部署
- 点击 **Deploy** 按钮
- 等待部署完成，过程大约1-2分钟
- 部署成功后会跳转到项目成功页面，显示Vercel分配的访问域名

### 4. （可选）配置SPA路由支持
如果您的前端使用了BrowserRouter模式，需要添加`vercel.json`配置文件解决刷新404问题：

在项目根目录创建`vercel.json`文件：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

添加后提交到GitHub，Vercel会自动重新部署。

## 后续更新
- 每次将代码push到GitHub的master分支，Vercel会自动触发部署，更新线上版本
- 可以在Vercel项目后台查看部署历史、访问日志、配置域名等