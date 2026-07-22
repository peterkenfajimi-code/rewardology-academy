@echo off
setlocal
cd /d "%~dp0"
echo Building in %CD% > build-log.txt
call npm.cmd run build >> build-log.txt 2>&1
echo BUILD_EXIT_CODE=%ERRORLEVEL% >> build-log.txt
