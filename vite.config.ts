import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    // 配置别名
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always", // 括号内才使用数学计算
        globalVars: {
          // 全局变量
          mainColor: "red",
        },
        javascriptEnabled: true,
        additionalData: `@import "@/assets/less/index.less";`
      },
    },
  },
  build: {
    target: "es2015", // 默认值
    outDir: "dist", // 构建结果的目录，默认值
    assetsDir: "assets", // 放置生成的静态资源的目录，相对outDir
    minify: "terser", // 压缩选项，默认为terser
    terserOptions: {
      compress: {
        drop_console: true, // 是否删除所有的console语句
        drop_debugger: true, // 是否删除所有的debugger语句
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",
      },
    },
    // 构建时不生成.map文件，加快构建速度
    sourcemap: false,
  },
  server: {
    open: true, // 是否自动在浏览器打开项目
    port: 3000, // 设置服务启动时的端口
    host: "0.0.0.0", // 指定服务监听的主机地址
    cors: true
  },
});
