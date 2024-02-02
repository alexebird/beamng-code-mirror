import { defineConfig } from "vite"
import path from "path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import envCompatible from "vite-plugin-env-compatible"
import { createHtmlPlugin } from "vite-plugin-html"
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { replaceCodePlugin } from "vite-plugin-replace"
import fs from "fs-extra"

const STRIP_PUBLIC_FOLDERS = ['lottieIcons']

function ReloadLocale() {
  return {
    name: 'reload-locale',
    enforce: 'post',
    // HMR
    handleHotUpdate({ file, server }) {
      if (file.endsWith('locales/en-US.json')) {
        console.log('reloading en-US locale...');
        server.ws.send({
          type: 'full-reload',          
          path: '*'
        });
      }
    },
  }
}

function stripPublicFolders(foldersToStrip) {
  return {
    name: 'strip-public-folders',
    resolveId (source) {
      return source === 'virtual-module' ? source : null
    },
    writeBundle (outputOptions, inputOptions) {
      const outDir = outputOptions.dir
      foldersToStrip.forEach(folder => {
        const dir = path.resolve(outDir, folder)
        fs.rm(dir, { recursive: true }, () => console.log(`Deleted unwanted public folder "${dir}"`))
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: "src/assets",

  ...(process.env.NODE_ENV === "production" && { base: "/local/ui/ui-vue/dist/" }),

  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: "",
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      }
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  plugins: [
    replaceCodePlugin({
      replacements: [
        {
          from: /--ASSET_URL\(\"/g,
          to: (process.env.NODE_ENV === 'production') ? `url("/ui/ui-vue/dist/` : `url("http://localhost:9000/`,
        },
        // JS - DEV_ONLY
        {
          from: /(\/\/\s*?DEV_ONLY\s*?>>[.\s\S]*?\/\/\s*?<<\s*?END_DEV_ONLY)/gm,
          to: (process.env.NODE_ENV === 'production') ? '' : '$1' 
        },
        // HTML - DEV_ONLY
        {
          from: /(<!--\s*?DEV_ONLY\s*?>>\s*?-->[.\s\S]*?<!--\s*?<<\s*?END_DEV_ONLY\s*?-->)/gm,
          to: (process.env.NODE_ENV === 'production') ? '' : '$1' 
        },
        // CSS - DEV_ONLY
        {
          from: /(\/\*\s*?DEV_ONLY\s*?>>\s*?\*\/[.\s\S]*?\/\*\s*?<<\s*?END_DEV_ONLY\s*?\*\/)/gm,
          to: (process.env.NODE_ENV === 'production') ? '' : '$1' 
        }
      ],
    }),
    vue(),
    vueJsx(),
    viteCommonjs(),
    envCompatible(),
    createHtmlPlugin({
      inject: {
        data: {
          title: "ui-vue",
        },
      },
    }),
    ReloadLocale(),
    stripPublicFolders(STRIP_PUBLIC_FOLDERS),
  ],
  server: {
    strictPort: false,
    port: 9000,
    host: "localhost",
    https: false,
    hmr: {
      host: "localhost",
      port: 9000,
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
})
