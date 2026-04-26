/**
 * 初始化博客数据库表
 * 运行命令: pnpm exec tsx scripts/init-blog-table.ts
 */

import { getSupabaseClient } from "@/storage/database/supabase-client";

async function initBlogTable() {
  console.log("检查博客表是否存在...\n");

  const client = getSupabaseClient();

  // 检查表是否存在
  const { data, error } = await client
    .from("blog_posts")
    .select("id")
    .limit(1);

  if (error) {
    console.log("表不存在或无法访问，需要手动创建");
    console.log("请在 Supabase 控制台执行以下 SQL:\n");
    console.log(CREATE_TABLE_SQL);
    return;
  }

  console.log("✅ 表已存在，可以继续迁移");
}

// 创建表的 SQL
const CREATE_TABLE_SQL = `
-- 创建 blog_posts 表
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  emoji VARCHAR(10),
  content TEXT
);

-- 启用 RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "Allow public read access" ON public.blog_posts
  FOR SELECT USING (true);

-- 创建公开插入策略
CREATE POLICY "Allow public insert access" ON public.blog_posts
  FOR INSERT WITH CHECK (true);

-- 创建公开更新策略
CREATE POLICY "Allow public update access" ON public.blog_posts
  FOR UPDATE USING (true);

-- 创建公开删除策略
CREATE POLICY "Allow public delete access" ON public.blog_posts
  FOR DELETE USING (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
`;

// 执行初始化
initBlogTable().catch((err) => {
  console.error("初始化失败:", err);
  process.exit(1);
});
