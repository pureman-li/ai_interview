# AI面试官

基于 AI 的智能面试系统，提供模拟面试体验。

## 功能特点

- 🤖 智能面试：基于 AI 的面试官，提供专业的面试体验
- 📝 简历分析：支持上传简历，AI 会根据简历内容生成更有针对性的问题
- 🎯 多职位支持：支持多个技术岗位的面试，包括：
  - 前端开发工程师
  - 后端开发工程师
  - 全栈开发工程师
  - 算法工程师
  - 产品经理
  - 互联网运营
- 📊 面试反馈：提供详细的面试评估报告，包括：
  - 总体评分
  - 优势分析
  - 改进建议
  - 综合评价
- 💬 智能追问：根据回答进行针对性追问，深入评估候选人能力
- 🎨 现代化界面：使用 Chakra UI 构建的现代化用户界面
- 📱 响应式设计：支持各种设备访问

## 本地部署指南

### 环境要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本

### 部署步骤

1. 克隆项目
```bash
git clone https://github.com/pureman-li/ai_interview.git
cd ai_interview
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件并添加以下配置：
```env
VITE_DEEPSEEK_API_URL=你的API地址
VITE_DEEPSEEK_API_KEY=你的API密钥
```

4. 启动开发服务器
```bash
npm run dev
```

5. 访问应用
打开浏览器访问 http://localhost:5173

### 使用说明

1. 选择面试职位
2. 上传简历（可选）
3. 开始面试对话
4. 回答面试官的问题
5. 面试结束后查看评估报告

## 技术栈

- React
- TypeScript
- Vite
- Chakra UI
- React Markdown
- Axios

## 注意事项

- 请确保 API 密钥的安全性，不要将其提交到代码仓库
- 建议使用最新版本的现代浏览器访问
- 上传的简历文件大小限制为 10MB
- 支持的简历格式：PDF、Word 文档

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License
