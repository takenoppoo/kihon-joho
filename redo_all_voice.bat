@echo off
cd /d "%~dp0"
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
echo Start VOICEVOX first. Then press any key.
pause >nul
if not exist audio mkdir audio
del /q audio\*.mp3 audio\*.wav audio\manifest.json audio\manifest.js 2>nul
echo Making ALL audio from scratch. This takes a long time. A log is saved to voice_log.txt
py -3 gen_voice.py --force > voice_log.txt 2>&1
if errorlevel 1 python gen_voice.py --force > voice_log.txt 2>&1
type voice_log.txt
echo.
echo Finished. If something went wrong, send voice_log.txt to Claude.
pause >nul
