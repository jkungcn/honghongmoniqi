/**
 * 博客文章迁移脚本
 * 将现有文章迁移到 Supabase 数据库
 * 运行命令: pnpm exec tsx scripts/migrate-blog-posts.ts
 */

import { getSupabaseClient } from "@/storage/database/supabase-client";
import type { Tables } from "@/storage/database/types";

type BlogPost = Tables["blog_posts"];

// 现有文章数据
const EXISTING_POSTS: Omit<BlogPost, "id" | "created_at">[] = [
  {
    slug: "golden-30-minutes-after-fight",
    title: "吵架之后的黄金30分钟",
    summary: "吵架后30分钟内做什么，决定了你们感情的走向",
    emoji: "⏰",
    content: `吵架的时候，你是不是也曾经摔门而出、一个人躲在被窝里哭、或者冷战到底？

其实，吵架后的**黄金30分钟**才是决定你们感情走向的关键！

## 这30分钟该做什么？

### 1. 先冷静，别急着道歉（0-10分钟）
我知道你很想马上道歉说"我错了"，但等等！情绪上头的时候说的每句话都可能火上浇油。

先深呼吸，倒杯水，找个舒服的地方坐下来。

### 2. 写下你想说的话（10-20分钟）
拿出手机或者纸笔，把你想说的整理一下：
- 刚才我说了什么让你这么生气？
- 我真正想表达的是什么？
- 下次遇到这种情况我可以怎么做？

### 3. 主动但不带攻击性地开口（20-30分钟）
"我刚才冷静想了想，我的问题是..."

记住，**承认错误不等于认输**，而是代表你珍惜这段关系。

## 小总结
吵架不可怕，可怕的是吵完之后的处理方式。掌握好这个黄金30分钟，你们的感情只会越吵越好！💕`,
  },
  {
    slug: "why-you-are-right-is-the-worst-reply",
    title: "为什么「你说得对」是最烂的回复",
    summary: "分析为什么敷衍的认同反而会让对方更生气",
    emoji: "🤦",
    content: `"好好好，你说得对。"
"行行行，都是我的错。"
"嗯嗯嗯，随便你怎么想。"

这些回复，你是不是也用过？

## 为什么敷衍反而更糟糕？

### 情绪升级的罪魁祸首
对方巴拉巴拉说了一大堆，结果你就回一句"你说的对"。这传递的信息是：**我根本不在乎你在说什么**。

这比不同意TA的观点更伤人！

### 破坏信任感
"你说的对"听起来像是认可，实际上是在说"我不想跟你吵了，随便吧"。长期这样，对方会觉得：**我说的你从来不听**。

## 正确的回应方式

### 1. 先复述对方的感受
"我听出来了，你刚才特别委屈对不对？"

让对方知道你真的听到了。

### 2. 说出你的理解
"换成是我，我也会很生气。"

### 3. 表达你的想法
"不过我想补充一下我的角度..."

## 小技巧
遇到分歧时，记住这个公式：
> **共情 + 理解 + 表达 = 有效沟通**

不要再说"你说得对"了，这真的是最烂的回复！🙅`,
  },
  {
    slug: "the-correct-way-to-apologize",
    title: "道歉的正确打开方式",
    summary: "学会这几招，让对方心甘情愿原谅你",
    emoji: "🙏",
    content: `你是不是也遇到过这种情况：明明道了歉，对方却不领情？

那是因为你的道歉方式出了问题！

## 常见的错误道歉方式

### ❌ "对不起还不行吗？"
这叫道歉？听起来像是在逼对方原谅。

### ❌ "我错了，你别生气了。"
道歉+1，但是完全没有诚意。

### ❌ 沉默不语，等对方消气
冷处理不是道歉，是逃避！

## 正确的道歉公式

### ✅ 承认错误 + 说明原因 + 提出改变

举个例子：
"我昨天没有回你消息，让你担心了（承认错误）。
当时我正在开会，手机静音了，开完会又忙着赶报告，就忘了（说明原因）。
以后我会提前跟你说一声，或者开完会第一时间回你（提出改变）。"

## 还有几个小技巧

### 1. 不要在道歉的时候加"但是"
"对不起，但是我也没想到..."
❌ 这样前面的对不起就白说了！

### 2. 选择合适的时机道歉
不是越快越好，但也不能拖太久。
建议等双方都冷静下来再道歉。

### 3. 用行动证明
说完对不起，之后要用行动来证明你的改变。
说到做不到，下次道歉就更难了。

## 小总结
道歉不是认输，而是勇敢和负责的表现。学会正确的道歉方式，你和TA的关系会更进一步！💪`,
  },
];

async function migrateBlogPosts() {
  console.log("开始迁移博客文章...\n");

  const client = getSupabaseClient();

  // 检查是否已有文章
  const { data: existingData } = await client
    .from("blog_posts")
    .select("slug")
    .limit(10);

  const existingSlugs = new Set((existingData || []).map((p) => p.slug));

  // 过滤掉已存在的文章
  const newPosts = EXISTING_POSTS.filter((post) => !existingSlugs.has(post.slug));

  if (newPosts.length === 0) {
    console.log("✅ 文章已全部迁移，无需重复操作");
    return;
  }

  console.log(`📝 将插入 ${newPosts.length} 篇文章\n`);

  // 批量插入
  const { data, error } = await client
    .from("blog_posts")
    .insert(newPosts)
    .select("id, title, slug");

  if (error) {
    console.error("❌ 迁移失败:", error.message);
    process.exit(1);
  }

  console.log("✅ 迁移成功！\n");
  console.log("已导入的文章：");
  (data || []).forEach((post, index) => {
    console.log(`  ${index + 1}. ${post.title} (${post.slug})`);
  });

  console.log(`\n总计: ${data?.length || 0} 篇文章`);
}

// 执行迁移
migrateBlogPosts().catch((err) => {
  console.error("迁移脚本执行失败:", err);
  process.exit(1);
});
