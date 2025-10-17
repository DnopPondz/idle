// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite', // <-- แก้จาก driver เป็น dialect
  dbCredentials: {
    url: 'file:./sqlite.db', // <-- เพิ่ม file: เข้าไปข้างหน้า
  },
});