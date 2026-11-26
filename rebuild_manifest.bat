@echo off
cd /d "%~dp0"
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
py -3 rebuild_manifest.py
if errorlevel 1 python rebuild_manifest.py
echo.
echo Finished. Upload audio\manifest.json to GitHub.
pause >nul
