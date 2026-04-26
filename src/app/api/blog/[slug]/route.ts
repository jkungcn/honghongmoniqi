import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

// 文章主题提示词模板
const ARTICLE_THEMES = [
  "如何避免吵架后的冷暴力",
  "异地恋维持感情的技巧",
  "情侣之间如何有效沟通",
  "处理分歧的正确方式",
  "让对方感到被爱的表达方式",
];

// 生成文章的提示词
function getGenerateArticlePrompt(theme: string): string {
  return `请为「${theme}」主题写一篇轻松幽默的恋爱攻略文章。

要求：
1. 300-500字
2. 轻松幽默的语气，像朋友聊天
3. 包含具体可操作的建议
4. 用 emoji 增加趣味性
5. 段落不要太长，每段2-3句话
6. 结尾有个小总结
7. 标题要吸引人

请按以下 JSON 格式返回：
{
  "title": "文章标题",
  "summary": "文章摘要（50字左右）",
  "content": "文章正文内容"
}

注意：只返回 JSON，不要包含其他内容。`;
}

// 获取文章详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("blog_posts")
      .select("id, title, summary, content, emoji, slug, created_at")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(`查询失败: ${error.message}`);

    if (!data) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      summary: data.summary,
      content: data.content,
      emoji: data.emoji,
      slug: data.slug,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error("Failed to fetch article:", err);
    return NextResponse.json({ error: "获取文章失败" }, { status: 500 });
  }
}

// AI 生成新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme } = body;

    // 如果没有指定主题，随机选择一个
    const selectedTheme = theme || ARTICLE_THEMES[Math.floor(Math.random() * ARTICLE_THEMES.length)];

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 调用 LLM 生成文章
    const response = await client.invoke(
      [{ role: "user", content: getGenerateArticlePrompt(selectedTheme) }],
      {
        model: "doubao-seed-2-0-lite-260215",
        temperature: 0.8,
      }
    );

    // 解析 LLM 返回的 JSON
    let articleData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("无法解析文章内容");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      return NextResponse.json({ error: "生成文章格式错误" }, { status: 500 });
    }

    // 生成 slug
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // 选择一个随机 emoji
    const emojis = ["💕", "💗", "💖", "💝", "💘", "💓", "💞", "💟"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    // 保存到数据库
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: articleData.title,
        summary: articleData.summary,
        content: articleData.content,
        emoji: emoji,
        slug: slug,
      })
      .select("id, title, summary, emoji, slug, created_at")
      .single();

    if (error) throw new Error(`保存失败: ${error.message}`);

    return NextResponse.json({
      success: true,
      article: {
        id: data.id,
        title: data.title,
        summary: data.summary,
        emoji: data.emoji,
        slug: data.slug,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("Failed to generate article:", err);
    return NextResponse.json({ error: "生成文章失败" }, { status: 500 });
  }
}
