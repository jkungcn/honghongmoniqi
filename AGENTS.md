# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/            # API 路由
│   │   │   ├── game/       # 游戏 API
│   │   │   ├── tts/        # TTS API
│   │   │   └── blog/       # 博客 API
│   │   ├── game/           # 游戏页面
│   │   ├── blog/           # 博客页面
│   │   │   └── [slug]/      # 文章详情页
│   │   └── page.tsx        # 首页
│   ├── components/          # 组件
│   │   ├── GameChat.tsx    # 聊天界面组件
│   │   ├── OptionButton.tsx # 选项按钮组件
│   │   ├── HeartsBar.tsx    # 好感度进度条组件
│   │   └── ResultScreen.tsx # 结果页面组件
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 哄哄模拟器 - 项目规范

### 功能概述
情侣吵架后哄人的模拟器游戏。AI扮演正在生气的对象，用户通过选择题的方式回应，在10轮内把对方哄好。

### 核心玩法
- 用户选择对方性别（女朋友/男朋友）
- 用户从5个预设场景中选择一个
- AI动态生成对话内容和选项
- 好感度系统（初始20分，满分100，最低-50）
- 胜利条件：10轮内好感度 >= 40
- 失败条件：好感度降到-50以下，或10轮用完好感度仍 < 40

### 预设场景
1. 忘记纪念日 —— 今天是你们在一起三周年，你完全忘了
2. 深夜不回消息 —— 你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回
3. 被发现和异性聊天 —— 对方看到你和异性朋友的暧昧聊天记录
4. 把对方的猫弄丢了 —— 你帮对方照顾猫的时候，猫跑丢了
5. 当众让对方没面子 —— 你在朋友聚会上开了一个过分的玩笑

### 技术实现

#### 后端 API (src/app/api/)
- `POST /api/game/start` - 开始游戏，生成第一轮对话
  - 请求: `{ gender: 'female' | 'male', scene: string, voiceType: string }`
  - 响应: `{ dialogue: string, options: Option[], affectionChange: number }`

- `POST /api/game/respond` - 用户选择后生成下一轮
  - 请求: `{ gender: string, scene: string, history: Dialogue[], selectedOption: string, affection: number, round: number, voiceType: string }`
  - 响应: `{ dialogue: string, options: Option[], affectionChange: number, newAffection: number, gameOver: boolean, success: boolean }`

- `POST /api/tts` - TTS 语音合成
  - 请求: `{ text: string, speaker: string }`
  - 响应: `{ audioUri: string }`

- `GET /api/blog` - 获取博客文章列表
  - 响应: `{ articles: Article[] }`

- `GET /api/blog/[slug]` - 获取文章详情（LLM 动态生成内容）
  - 响应: `{ slug, title, summary, emoji, createdAt, content }`

#### 博客文章
1. 吵架之后的黄金30分钟 —— 吵架后30分钟内做什么，决定了你们感情的走向
2. 为什么「你说得对」是最烂的回复 —— 分析为什么敷衍的认同反而会让对方更生气
3. 道歉的正确打开方式 —— 学会这几招，让对方心甘情愿原谅你

#### 语音配置 (TTS)
- 温柔女声: `zh_female_vv_uranus_bigtts`
- 霸道御姐: `zh_female_meilinvyou_saturn_bigtts`
- 可爱软妹: `saturn_zh_female_keainvsheng_tob`
- 低沉男声: `zh_male_m191_uranus_bigtts`
- 温柔男声: `zh_male_dayi_saturn_bigtts`

#### LLM Prompt 设计
- 使用 `doubao-seed-2-0-lite-260215` 模型
- 温度 0.8-1.0，保持俏皮可爱的风格
- 对方情绪根据好感度动态调整

### 界面设计
- 微信聊天界面风格
- 左侧：对方头像 + 消息气泡
- 右侧：用户选择的消息
- 顶部：好感度进度条 + 轮次
- 响应式布局，支持手机和电脑

### 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
