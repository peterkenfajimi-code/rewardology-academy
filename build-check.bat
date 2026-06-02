@echo off
setlocal
set "PATH=C:\Users\pfajimi\node-portable;%PATH%"
cd /d "%~dp0"
echo Building in %CD% > build-log.txt
call "C:\Users\pfajimi\node-portable\npm.cmd" run build >> build-log.txt 2>&1
echo BUILD_EXIT_CODE=%ERRORLEVEL% >> build-log.txt
