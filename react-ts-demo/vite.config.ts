import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "chart-vendor": ["recharts"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  // resolve: {
  //   alias: {
  //     console: "console-browserify",
  //   },
  // },console:"console-browserify"会把所有console调用替换成一个polyfill库,
  // 这个库在运行时有初始化开销。strict模式下触发更多的console调用（比如类型检查失败的警告），
  // 导致这个polyfill被频繁调用，TBT时间大幅增长。
});
