import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import copy from 'rollup-plugin-copy'
import { fileURLToPath, URL } from 'node:url'
import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));
console.log({[argv["_"][1]]:argv["_"][2]})
// https://vitejs.dev/config/
export default defineConfig({

    root: 'src/',
    plugins: [
      vue(),

      copy({
        targets: [
          { src: 'manifest.json', dest: 'dist' },
          { src: "src/icons/**", dest: 'dist/icons' },

        ],

      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {

      outDir: path.resolve(__dirname, 'dist'),
      rollupOptions: {
        // input: {
        //   popup: path.resolve(__dirname, 'src/popup/index.html'),
        //   contentPage: path.resolve(__dirname, 'src/contentPage/index.html'),
        //   contentPageUserInfo: path.resolve(__dirname, 'src/contentPageUserInfo/index.html'),
        //   content: path.resolve(__dirname, 'src/content/content.ts'),
        //   background: path.resolve(__dirname, 'src/background/service-worker.ts'),
        // },
        input: {[argv["_"][1]]:argv["_"][2]},
        output: {
          inlineDynamicImports: true,//禁用自动分割文件，只用单入口文件
          assetFileNames: 'assets/[name]-[hash].[ext]', // 静态资源
          chunkFileNames: 'js/[name]-[hash].js', // 代码分割中产生的 chunk
          entryFileNames: (chunkInfo) => { // 入口文件,这里仅仅是为了定义上面的5个入口文件的输入路径和命名（这里主要是针对每个入口的js脚本）
            const baseName = path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId))
            // console.log("baseName--->"+baseName)
            // console.log("chunkInfo.name--->"+chunkInfo.name)
            //baseName带表文件名称不带后缀名，chunkInfo.name和[name]表示上面配的input中的key
            // baseName--->index
            // chunkInfo.name--->popup      
            // baseName--->index
            // chunkInfo.name--->contentPage
            // baseName--->content
            // chunkInfo.name--->content    
            // baseName--->service-worker   
            // chunkInfo.name--->background
            const saveArr = ['content', 'service-worker']
            return `[name]/${saveArr.includes(baseName) ? baseName : chunkInfo.name}.js`;
          }
        }
      },
    },
  })
