import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // 后端是 CommonJS，需要告诉 Vitest 不要转换这些模块
    server: {
      deps: {
        // 允许 require() 语法
        inline: ['supertest'],
      },
    },
  },
});
