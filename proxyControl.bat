@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

:: 日志路径
set "logFile=C:\Users\afei\Desktop\proxy_debug.log"
echo [%date% %time%] 模板BAT启动 >> !logFile!

:: 强制提权（必须）
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 0 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del /f /q "%temp%\getadmin.vbs" >nul 2>&1
    exit /B
)

:: 核心：从环境变量读取参数（插件中设置的PROCESS级变量）
set "action=!PROXY_ACTION!"
set "proxyHost=!PROXY_HOST!"
set "proxyPort=!PROXY_PORT!"

:: 记录参数到日志
echo [%date% %time%] 从环境变量接收参数：action=!action! host=!proxyHost! port=!proxyPort! >> !logFile!

:: ===================== 处理开启代理 =====================
if /i "!action!"=="enable" (
    :: 参数校验
    if "!proxyHost!"=="" (
        echo {"status":"error","message":"代理IP不能为空！"}
        echo [%date% %time%] 错误：代理IP为空 >> !logFile!
        exit /B 1
    )
    if "!proxyPort!"=="" (
        echo {"status":"error","message":"代理端口不能为空！"}
        echo [%date% %time%] 错误：代理端口为空 >> !logFile!
        exit /B 1
    )

    :: 1. 修改用户级注册表
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f >> !logFile! 2>&1
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer /t REG_SZ /d "!proxyHost!:!proxyPort!" /f >> !logFile! 2>&1
    echo [%date% %time%] 注册表修改完成：!proxyHost!:!proxyPort! >> !logFile!

    :: 2. 强制刷新系统代理
    powershell -Command "$signature = '[DllImport(\\"user32.dll\\")] public static extern bool SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);'; $user32 = Add-Type -MemberDefinition $signature -Name User32 -Namespace Win32 -PassThru; $hwnd = [IntPtr]0xFFFF; $msg = 0x001A; $result = [UIntPtr]::Zero; $user32::SendMessageTimeout($hwnd, $msg, [UIntPtr]::Zero, 'Internet Settings', 0x0002, 1000, [ref]$result);" >> !logFile! 2>&1

    :: 3. 验证结果
    reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable >> !logFile! 2>&1
    reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer >> !logFile! 2>&1

    echo [%date% %time%] 代理开启成功 >> !logFile!
    echo {"status":"success","message":"系统代理已开启：!proxyHost!:!proxyPort!"}
    exit /B 0
)

:: ===================== 处理关闭代理 =====================
if /i "!action!"=="disable" (
    :: 1. 关闭注册表代理开关
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f >> !logFile! 2>&1
    echo [%date% %time%] 注册表代理开关关闭 >> !logFile!

    :: 2. 强制刷新系统代理
    powershell -Command "$signature = '[DllImport(\\"user32.dll\\")] public static extern bool SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);'; $user32 = Add-Type -MemberDefinition $signature -Name User32 -Namespace Win32 -PassThru; $hwnd = [IntPtr]0xFFFF; $msg = 0x001A; $result = [UIntPtr]::Zero; $user32::SendMessageTimeout($hwnd, $msg, [UIntPtr]::Zero, 'Internet Settings', 0x0002, 1000, [ref]$result);" >> !logFile! 2>&1

    echo [%date% %time%] 代理关闭成功 >> !logFile!
    echo {"status":"success","message":"系统代理已关闭"}
    exit /B 0
)

:: ===================== 无效参数处理 =====================
echo {"status":"error","message":"无效操作类型：!action!"}
echo [%date% %time%] 错误：无效操作类型 !action! >> !logFile!
exit /B 1

endlocal
exit /B 0