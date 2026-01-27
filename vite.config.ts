import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { createSvg } from "./src/icons/svgIcon";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), createSvg("./src/icons/svg/")],
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
    // 是否为生产环境构建产物做优化
    // 默认process.env.NODE_ENV === 'production'
    // 为true时，会默认开启生产环境的配置
    // 比如，terser压缩，tree-shaking等。
    // 为false时，则不会开启
    // 生产环境的配置，可以通过配置文件来定制
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
  },
});
