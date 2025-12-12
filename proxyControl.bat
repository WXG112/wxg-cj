@echo off
:: 自动请求管理员权限
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo 请求管理员权限...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject("Shell.Application") > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "%*", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

:: 参数定义
set "action=%1"
set "proxyHost=%2"
set "proxyPort=%3"
set "regPath=HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings"

:: 参数校验
if "%action%"=="" (
    echo 错误：未指定操作类型（enable/disable）！
    goto ShowUsage
)

if "%action%"=="enable" (
    if "%proxyHost%"=="" (
        echo 错误：开启代理必须指定IP！
        goto ShowUsage
    )
    if "%proxyPort%"=="" (
        echo 错误：开启代理必须指定端口！
        goto ShowUsage
    )
    :: 注册表操作
    reg add "%regPath%" /v ProxyEnable /t REG_DWORD /d 1 /f >nul 2>&1
    if %errorlevel% equ 0 (
        reg add "%regPath%" /v ProxyServer /t REG_SZ /d "%proxyHost%:%proxyPort%" /f >nul 2>&1
        if %errorlevel% equ 0 (
            reg add "%regPath%" /v ProxyOverride /t REG_SZ /d "localhost;127.0.0.1;*.local" /f >nul 2>&1
            echo 系统代理已开启！
            echo 代理IP：%proxyHost% 端口：%proxyPort%
            exit /b 0
        ) else ( 
            echo 错误：设置代理服务器失败
            exit /b 1
        )
    ) else ( 
        echo 错误：开启代理失败
        exit /b 1
    )
) else if "%action%"=="disable" (
    reg add "%regPath%" /v ProxyEnable /t REG_DWORD /d 0 /f >nul 2>&1
    if %errorlevel% equ 0 (
        echo 系统代理已关闭！
        exit /b 0
    ) else (
        echo 错误：关闭代理失败
        exit /b 1
    )
) else (
    echo 错误：无效的操作类型 "%action%"！
    goto ShowUsage
)

:ShowUsage
echo 用法：
echo proxyControl.bat enable [代理IP] [端口]
echo proxyControl.bat disable
echo 示例：proxyControl.bat enable 127.0.0.1 8080
exit /b 1