@echo off
cd /d "%~dp0"
echo Make sure VOICEVOX is running.
py -3 gen_voice.py
echo.
echo Finished. Press any key to close.
pause >nul
