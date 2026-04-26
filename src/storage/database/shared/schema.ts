import { pgTable, serial, timestamp, varchar, text, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial().primaryKey(),
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
