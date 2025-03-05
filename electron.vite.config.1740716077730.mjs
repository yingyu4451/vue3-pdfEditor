// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
var electron_vite_config_default = defineConfig({
  main: {
    assetsInclude: ["**/*.gz?asset", "**/*.gz", "**/*.docx", "**/*.docx?asset", "**/*.traineddata"],
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    assetsInclude: ["**/*.gz?asset", "**/*.gz", "**/*.docx", "**/*.docx?asset", "**/*.traineddata"],
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    assetsInclude: ["**/*.gz?asset", "**/*.gz", "**/*.docx", "**/*.docx?asset", "**/*.traineddata"],
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [vue()],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8008",
          // 你的 Web 服务地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "")
        }
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
