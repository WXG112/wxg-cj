@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

:: 自动提权逻辑（兼容所有Windows版本）
openfiles >nul 2>&1
if %errorlevel% equ 0 (
    goto gotAdmin
) else (
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "%*", "", "runas", 0 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del /f /q "%temp%\getadmin.vbs" >nul 2>&1
    exit /B
)

:gotAdmin
:: 参数初始化
set "action="
set "proxyHost="
set "proxyPort="
:: 同时兼容32/64位系统的注册表路径
set "regPath=HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
set "regPath64=HKLM\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Internet Settings"

:: 优先读取命令行参数
if not "%~1"=="" (
    set "action=%~1"
    set "proxyHost=%~2"
    set "proxyPort=%~3"
) else (
    :: 读取Native Messaging JSON输入
    set "input="
    for /f "delims=" %%i in ('more') do set "input=%%i"
    
    :: 解析enable指令
    echo !input! | findstr /i /c:"action\":\"enable\"" >nul
    if !errorlevel! equ 0 (
        set "action=enable"
        for /f "tokens=2 delims=:" %%a in ('echo !input! ^| findstr /i /c:"proxyHost\""') do (
            set "temp=%%a"
            set "proxyHost=!temp:~2,-1!"
        )
        for /f "tokens=2 delims=:" %%a in ('echo !input! ^| findstr /i /c:"proxyPort\""') do (
            set "temp=%%a"
            set "proxyPort=!temp:~2,-1!"
        )
    )
    
    :: 解析disable指令
    echo !input! | findstr /i /c:"action\":\"disable\"" >nul
    if !errorlevel! equ 0 (
        set "action=disable"
    )
)

:: 参数校验
if "!action!"=="" (
    echo {"status":"error","message":"未指定操作类型（enable/disable）！"}
    goto ShowUsage
)

:: ========== 核心修复：开启代理（注册表+netsh双保障） ==========
if /i "!action!"=="enable" (
    if "!proxyHost!"=="" (
        echo {"status":"error","message":"开启代理必须指定IP！"}
        goto ShowUsage
    )
    if "!proxyPort!"=="" (
        echo {"status":"error","message":"开启代理必须指定端口！"}
        goto ShowUsage
    )
    
    :: 1. 修改用户级注册表（优先）
    reg add "!regPath!" /v ProxyEnable /t REG_DWORD /d 1 /f >nul 2>&1
    reg add "!regPath!" /v ProxyServer /t REG_SZ /d "!proxyHost!:!proxyPort!" /f >nul 2>&1
    reg add "!regPath!" /v ProxyOverride /t REG_SZ /d "localhost;127.0.0.1;*.local" /f >nul 2>&1
    
    :: 2. 64位系统补充修改32位注册表
    if exist "%SYSTEMROOT%\SysWOW64" (
        reg add "!regPath64!" /v ProxyEnable /t REG_DWORD /d 1 /f >nul 2>&1
        reg add "!regPath64!" /v ProxyServer /t REG_SZ /d "!proxyHost!:!proxyPort!" /f >nul 2>&1
    )
    
    :: 3. 用netsh强制设置系统代理（关键：让修改实时生效）
    netsh winhttp set proxy "!proxyHost!:!proxyPort!" "localhost;127.0.0.1;*.local" >nul 2>&1
    
    :: 4. 验证是否生效
    reg query "!regPath!" /v ProxyEnable | findstr /i "0x1" >nul 2>&1
    if !errorlevel! equ 0 (
        echo {"status":"success","message":"系统代理已开启，IP：!proxyHost! 端口：!proxyPort!"}
        exit /b 0
    ) else (
        echo {"status":"error","message":"注册表修改成功，但系统代理未生效（可能被组策略限制）"}
        exit /b 1
    )
)

:: ========== 核心修复：关闭代理（注册表+netsh双保障） ==========
if /i "!action!"=="disable" (
    :: 1. 修改用户级注册表
    reg add "!regPath!" /v ProxyEnable /t REG_DWORD /d 0 /f >nul 2>&1
    
    :: 2. 64位系统补充修改32位注册表
    if exist "%SYSTEMROOT%\SysWOW64" (
        reg add "!regPath64!" /v ProxyEnable /t REG_DWORD /d 0 /f >nul 2>&1
    )
    
    :: 3. 用netsh重置系统代理
    netsh winhttp reset proxy >nul 2>&1
    
    :: 4. 验证是否生效
    reg query "!regPath!" /v ProxyEnable | findstr /i "0x0" >nul 2>&1
    if !errorlevel! equ 0 (
        echo {"status":"success","message":"系统代理已关闭"}
        exit /b 0
    ) else (
        echo {"status":"error","message":"注册表修改成功，但系统代理未关闭（可能被组策略限制）"}
        exit /b 1
    )
)

:: 无效操作类型
echo {"status":"error","message":"无效的操作类型：!action!"}
goto ShowUsage

:ShowUsage
echo {"status":"error","message":"用法：proxyControl.bat enable [代理IP] [端口] 或 proxyControl.bat disable"}
exit /b 1

endlocal