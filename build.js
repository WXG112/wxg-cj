import { spawn} from "child_process"

//每个入口文件每次单独编译，防止js文件分割，因为分割后，content.js会有import语句，这样会报错,content不允许有import语句

const entrysDir=["popup","contentPage","contentPageUserInfo","content","background"]
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