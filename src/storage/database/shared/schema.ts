import { pgTable, serial, timestamp, varchar, text, index, integer, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 用户表
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_username_idx").on(table.username),
  ]
);

// 游戏记录表
export const gameRecords = pgTable(
  "game_records",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    scenario: varchar("scenario", { length: 100 }).notNull(),
    finalScore: integer("final_score").notNull(),
    result: varchar("result", { length: 20 }).notNull(), // 'success' or 'failure'
    playedAt: timestamp("played_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("game_records_user_id_idx").on(table.userId),
    index("game_records_played_at_idx").on(table.playedAt),
  ]
);

// 排行榜表
export const leaderboard = pgTable(
  "leaderboard",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    username: varchar("username", { length: 50 }).notNull(),
    bestScore: integer("best_score").notNull(),
    scenario: varchar("scenario", { length: 100 }).notNull(),
    achievedAt: timestamp("achieved_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("leaderboard_user_id_idx").on(table.userId),
    index("leaderboard_best_score_idx").on(table.bestScore),
  ]
);

// 博客文章表
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    emoji: varchar("emoji", { length: 50 }),
    slug: varchar("slug", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("blog_posts_slug_idx").on(table.slug),
    index("blog_posts_created_at_idx").on(table.createdAt),
  ]
);
