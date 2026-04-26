import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取文章列表
export async function GET() {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from("blog_posts")
      .select("id, title, summary, emoji, slug, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`查询失败: ${error.message}`);

    // 格式化返回数据
    const articles = (data || []).map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      emoji: article.emoji,
      slug: article.slug,
      createdAt: article.created_at,
    }));

    return NextResponse.json({ articles });
  } catch (err) {
    console.error("Failed to fetch articles:", err);
    return NextResponse.json({ error: "获取文章列表失败" }, { status: 500 });
  }
}
