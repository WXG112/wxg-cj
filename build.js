// 导入 Node.js 的child_process.spawn模块，用于执行子进程命令（此处用于调用 Vite 构建工具）。
import { spawn} from "child_process"

//注释说明构建逻辑：单独编译每个入口文件，避免 Content Script（content.js）出现import语句（Chrome 扩展的 Content Script 不支持 ES 模块语法，会报错）。
const entrysDir=["popup","contentPage","contentPageUserInfo","content","background"]
// 定义入口目录数组entrysDir，包含 5 个模块：popup（扩展弹窗）、contentPage（内容页面板）、contentPageUserInfo（用户信息面板）、content（内容脚本）、background（后台服务）。
const entrysFiles=['./src/popup/index.html',"./src/contentPage/index.html","./src/contentPageUserInfo/index.html","src/content/content.ts","./src/background/service-worker.ts"]
entrysDir.forEach((dir,index)=>{
   const args = ['build'];
    args.push('--');

    args.push(dir);
    args.push(entrysFiles[index]);

    const buildProcess = spawn('vite',args, {
    stdio: 'inherit', // 继承父进程的stdio
    shell: true       // 使用shell执行命令
    });


})