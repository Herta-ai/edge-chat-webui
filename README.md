<div align="center">

# 🌊 EdgeChatWebUI

**构建在浏览器端的下一代 AI 智能体与工作流编排 WebUI**

![Vue3](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Naive UI](https://img.shields.io/badge/Naive_UI-000000?style=for-the-badge&logo=nui&logoColor=white)
![Transformers.js](https://img.shields.io/badge/Transformers.js-FF9D00?style=for-the-badge&logo=huggingface&logoColor=white)
![WebGPU](https://img.shields.io/badge/WebGPU-005C84?style=for-the-badge&logo=webgl&logoColor=white)

</div>

---

## 💡 什么是 EdgeChatWebUI？

**EdgeChatWebUI** 是一个纯前端运行、零后端的本地大语言模型对话与工作流编排平台。
得益于 `Transformers.js` 和 `WebGPU` 的强大性能，我们将大模型推理完全迁移到了你的浏览器之中。不仅如此，它还融合了类似 Langflow/Dify 的**可视化节点拖拽编排**，并原生支持**MCP（模型上下文协议）** 与本地 **Skills**。

无需复杂的环境配置，打开网页，即可在你的设备本地运行强大的 AI Agent 并在绝对保障隐私的前提下处理任务。

## ✨ 核心特性

- 🧠 **100% 浏览器运行**: 基于 `Transformers.js`，借助 Web Worker 异步计算与 WebGPU 硬件加速，流畅运行十亿甚至百亿参数级量化模型。
- 💬 **全功能对话 UI**: 基于 Naive UI 打造的极客风界面。支持多会话管理、历史记录持久化、Markdown 渲染、代码高亮。
- 🎙️ **本地语音转文字 (STT)**: 提供本地离线语音转文字功能，释放双手！
- 🎙️ **本地语音合成 (TTS)**: 内置多模态支持，可加载如 `Qwen3TTS` 等先进的声音生成模型，赋予你的 AI 智能体自然流畅的真实音色，纯离线播报。
- 🎭 **灵活的提示词管理**: 内置系统提示词（System Prompt）配置面板，随时保存并切换不同的人设预设。
- 🧩 **可视化 Flow 编排**: 零代码拖拉拽编排你的专属业务流。内置大模型节点、逻辑判断、输入输出等多种组件。
- 🛠 **Agent & MCP 支持**: 让模型长出手脚！支持纯浏览器端 Skills 注册，并适配 MCP 协议接入外部能力（如本地文件读取、数据库查询）。
- 📦 **纯本地数据持久化**: 所有的对话历史、模型配置、节点排版数据，均通过 `@surrealdb/wasm` + `IndexedDB` 安全地存储在你的浏览器本地，数据永远属于你。
- 📦 **本地文档RAG**: 通过GraphRAG技术将文档处理成知识图谱，并提供RAG功能。

## 📸 界面预览

_(项目开发中，截图占位区)_

|                                           聊天界面 (Chat View)                                           |                                        节点编排 (Flow Orchestration)                                         |
| :------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------: |
| <img src="https://via.placeholder.com/600x400/18181C/FFFFFF?text=Chat+Interface" width="400" alt="chat"> | <img src="https://via.placeholder.com/600x400/18181C/FFFFFF?text=Drag-and-Drop+Flow" width="400" alt="flow"> |

## 🏗 技术架构

- **前端框架**: Vite + Vue 3 (Composition API) + TypeScript
- **状态管理**: Pinia
- **组件库**: Naive UI + UnoCSS
- **AI 底层**: Hugging Face Transformers.js (支持 LLM & STT & TTS 模型)
- **多媒体处理**: Web Audio API
- **可视化节点**: Vue Flow
- **本地数据库**: IndexedDB (基于 @surrealdb/wasm 驱动)

## 🚀 快速开始

### 环境要求

- Node.js >= 22.x
- pnpm >= 10.x
- 支持 WebGPU 的现代浏览器 (推荐最新版 Chrome / Edge)

### 安装与运行

1. **克隆项目**

   ```bash
   git clone https://github.com/Herta-ai/edge-chat-webui.git
   cd edge-chat-webui
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **本地开发**

   ```bash
   pnpm dev
   ```

   _应用将在 `http://localhost:5173` 启动。初次对话时会从 HuggingFace Hub 自动下载并缓存模型文件至本地 IndexedDB。_

4. **生产构建**

   ```bash
   pnpm build
   ```

## 🗺 路线图 (Roadmap)

我们有着宏大的计划！详细的开发阶段目标请查看 [PLAN.md](./PLAN.md)。

- [ ] 核心对话 UI 与 IndexedDB 持久化
- [ ] Transformers.js 集成与 Web Worker 隔离 (涵盖 LLM 推理计算)
- [ ] 集成纯本地的文本转语音 (TTS) 模块，支持 Qwen3TTS 等先进语音模型
- [ ] Vue Flow 节点画布集成与 TTS 工具节点封装
- [ ] Agent 模块 (Tool Calling / 基础 Skills 支持)
- [ ] MCP 协议浏览器适配
- [ ] PWA 离线支持

## 🤝 参与贡献

欢迎任何形式的贡献！如果你对纯客户端 AI 感兴趣：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的代码 (`git commit -m 'Add some AmazingFeature'`)
4. 推送至分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

## 📜 许可证

本项目基于 [MIT License](./LICENSE) 开源。请自由地将其用于个人或商业项目。
