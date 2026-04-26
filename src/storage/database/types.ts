/**
 * 数据库类型定义
 * 基于 Supabase 表结构自动生成
 */

export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: number;
          created_at: string;
          slug: string;
          title: string;
          summary: string;
          emoji: string;
          content: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          slug: string;
          title: string;
          summary: string;
          emoji: string;
          content: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          slug?: string;
          title?: string;
          summary?: string;
          emoji?: string;
          content?: string;
        };
      };
    };
  };
}

export type Tables<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T];

export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TableInsert<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Insert"];

export type TableUpdate<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Update"];
