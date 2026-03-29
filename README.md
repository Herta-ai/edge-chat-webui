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

- 🌐 **100% 纯浏览器运行**: 无需繁琐的后端部署！基于 `Transformers.js`，结合 Web Worker 异步计算与 WebGPU 硬件加速，在浏览器内即可流畅运行十亿甚至百亿参数级的量化大模型。
- 💬 **极客风全功能对话 UI**: 采用 Naive UI 精心打造，支持多会话管理、历史记录本地保存、Markdown 沉浸式渲染及代码高亮，为你提供极致顺滑的聊天体验。
- 🎙️ **离线语音识别 (STT)**: 彻底释放双手！支持纯本地的语音转文字功能，响应迅速且绝对保护隐私，让交流像聊天一样自然。
- 🗣️ **拟真语音合成 (TTS)**: 让 AI 拥有真实的声音。内置多模态支持，可加载如 `Qwen3TTS` 等先进的声音生成模型，赋予智能体自然流畅的音色，全程纯离线播报。
- 🎭 **百变 AI 人设面板**: 内置灵活的系统提示词（System Prompt）管理器，支持一键保存和无缝切换不同的人设预设，让 AI 随时扮演你需要的任何角色。
- 🧩 **可视化工作流 (Flow)**: 零代码拖拉拽，轻松编排你的专属业务流。内置大模型节点、逻辑判断、输入输出等丰富组件，复杂任务也能一目了然。
- 🤖 **Agent 智能体与 MCP 接入**: 让大模型“长出”手脚！支持在纯浏览器端注册专属技能（Skills），并完美适配 MCP 协议，轻松让 AI 接入本地文件读取、数据库查询等外部能力。
- 💻 **内置纯前端虚拟环境**: 深度集成 StackBlitz 的 WebContainer 技术，在浏览器中直接为你生成一个完整的 Node.js 虚拟环境！无需安装任何软件，AI 生成的代码即可在浏览器内实时运行、调试与预览。
- 📚 **本地知识库与图谱检索 (GraphRAG)**: 告别大模型幻觉！引入先进的 GraphRAG 技术，自动将你的本地文档处理成结构化的知识图谱，在纯前端为你提供高精度、深度的文档问答功能。
- 🔒 **极致隐私的数据持久化**: 你的数据永远只属于你。所有的聊天记录、模型配置、工作流排版，均通过 `@surrealdb/wasm` 结合 `IndexedDB` 安全地存储在你的浏览器本地，断网也能用。

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

- Bun >= 1.3.7
- 支持 WebGPU 的现代浏览器 (推荐最新版 Chrome / Edge)

### 安装与运行

1. **克隆项目**

   ```bash
   git clone https://github.com/yourusername/edgeflow-llm.git
   cd edgeflow-llm
   ```

2. **安装依赖**

   ```bash
   bun install
   ```

3. **本地开发**

   ```bash
   bun dev
   ```

   _应用将在 `http://localhost:5173` 启动。初次对话时会从 HuggingFace Hub 自动下载并缓存模型文件至本地 IndexedDB。_

4. **生产构建**

   ```bash
   bun build
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
- [ ] WebContainer 支持

## 🤝 参与贡献

欢迎任何形式的贡献！如果你对纯客户端 AI 感兴趣：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的代码 (`git commit -m 'Add some AmazingFeature'`)
4. 推送至分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

## 📚 参考项目

本项目在开发过程中借鉴了以下优秀开源项目的理念与代码实现：

|         项目名称         |                       描述                       |                          链接                           |
| :----------------------: | :----------------------------------------------: | :-----------------------------------------------------: |
|   🎨 **Soybean Admin**   | 基于 Vue3 + Vite + Naive UI 的现代化后台管理模板 |  [GitHub](https://github.com/soybeanjs/soybean-admin)   |
| 🤖 **xsai-transformers** |  基于 Transformers.js 的浏览器端 AI 推理封装库   | [GitHub](https://github.com/moeru-ai/xsai-transformers) |

> 💡 感谢以上开源项目的作者们，站在巨人的肩膀上，我们才能走得更远！

## 📜 许可证

本项目基于 [MIT License](./LICENSE) 开源。请自由地将其用于个人或商业项目。
