import { defineConfig } from 'drizzle-kit';
// 改成 dotenv/config，明确加载 .env 文件
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ 请在 .env.local 里配置 DATABASE_URL');
}

export default defineConfig({
  schema: './src/storage/database/shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});