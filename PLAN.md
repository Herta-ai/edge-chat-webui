# 🚀 EdgeChatWebUI 项目开发计划 (PLAN)

## 📌 项目概述

构建一个 100% 运行在浏览器中的大语言模型 (LLM) 对话与工作流编排 WebUI。
**核心理念**：零后端、隐私优先、可视化编排、Agent 生态接入。

## 🛠 技术栈

- **构建工具**: Vite
- **前端框架**: Vue 3 (Composition API, `<script setup>`)
- **状态管理**: Pinia
- **组件库**: Naive UI
- **本地存储**: IndexedDB (@surrealdb/wasm)
- **AI 推理引擎**: Transformers.js (配合 WebGPU & Web Worker)
- **图表与节点编排**: Vue Flow (适用于拖拉拽 Flow 节点)
- **协议支持**: MCP (基于 SSE/WebSocket 适配，或者使用支持跨域请求的Streamable HTTP)

---

## 📅 阶段划分

### 阶段一：基础设施搭建 (Phase 1)

- [ ] 初始化 Vite + Vue3 + TypeScript 项目。
- [ ] 集成 Naive UI、Vue Router、Pinia。
- [ ] 封装本地存储服务（IndexedDB），设计数据表结构：
  - `conversations` (会话列表)
  - `messages` (聊天记录)
  - `prompts` (系统提示词预设)
  - `models` (本地缓存的模型列表)
  - `flows` (工作流配置数据)
- [ ] 搭建基础的主体 UI 框架（侧边栏、顶部导航、主内容区、深色/浅色模式切换）。

### 阶段二：核心推理引擎与对话管理 (Phase 2)

- [ ] 引入 `transformers.js`，在 Web Worker 中初始化推理引擎，避免阻塞 UI 线程。
- [ ] 实现模型管理模块
- [ ] 开发基础 Chat UI（支持流式输出、Markdown 渲染、代码高亮）。
- [ ] 集成 TTS (Text-to-Speech) 模块：支持加载如 `Qwen3TTS`、`SpeechT5` 等纯本地语音模型，实现对话内容的自动语音播报与音频播放控制。
- [ ] 实现会话功能：支持新建、删除、历史记录加载。
- [ ] 实现系统提示词 (System Prompt) 动态配置与切换。

### 阶段三：可视化工作流编排 (Phase 3 - Flow)

- [ ] 集成 `Vue Flow`，搭建拖拉拽画板底座。
- [ ] 设计并实现基础节点组件：
  - **触发器节点** (Input, Chat, API)
  - **处理节点** (LLM, Prompt 组装, 条件分支)
  - **工具节点** (Web Search, JS Code, TTS 语音合成, 技能调用)
  - **输出节点** (Output, Reply, Audio Play)
- [ ] 实现图连线逻辑 (Edges) 与节点间的数据传递协议。
- [ ] 开发基于图遍历的 Flow 执行引擎。
- [ ] 实现 Flow 的保存、加载与本地测试。

### 阶段四：Agent 模块与扩展能力 (Phase 4 - Agent/MCP)

- [ ] 设计本地 Skills (技能) 接口规范，预置常用纯前端技能（如计算器、当前时间、正则匹配）。
- [ ] 接入 MCP (Model Context Protocol)：
  - 实现基于 SSE (Server-Sent Events) 或 WebSocket 的 MCP Client，以连接外部 MCP Server（突破纯浏览器限制，获取系统级能力）。
- [ ] 赋予 LLM 工具调用能力 (Tool Calling / ReAct 机制)，使其能自主根据上下文选择节点或 Skills。
- [ ] 将 Agent 挂载至 Chat 或 Flow 中运行。

### 阶段五：性能优化与体验打磨 (Phase 5)

- [ ] 开启 WebGPU 加速并添加硬件兼容性检测。
- [ ] 实现模型下载进度条管理与断点续传逻辑。
- [ ] 增加 PWA (Progressive Web App) 支持，允许离线安装和使用。
- [ ] 完善前端错误捕获与用户友好的提示（如内存溢出、WebGPU 不支持等）。
- [ ] 探索 GraphRAG 技术实现知识图谱
- [ ] 探索类似 `Project AIRI` 的数字人技术，结果展示更加生动。

---

## 📂 推荐目录结构预研

```text
src/
├── assets/          # 静态资源
├── components/      # 公共 UI 组件
├── libs/            # 核心业务逻辑
│   ├── llm/         # transformers.js 封装与 Web Worker 通信
│   ├── tts/         # 语音合成处理模块 (Qwen3TTS 等模型驱动)
│   ├── flow/        # 节点执行引擎
│   └── agent/       # MCP Client 与 Skills 实现
├── database/        # IndexedDB 封装 (@surrealdb/wasm)
├── layouts/         # 页面布局
├── router/          # 路由配置
├── store/           # Pinia 状态管理
├── views/           # 页面视图
│   ├── Chat/        # 聊天界面
│   ├── Flow/        # 拖拉拽编排界面
│   ├── Models/      # 模型管理界面
│   └── Settings/    # 设置界面
├── App.vue
└── main.ts
```
