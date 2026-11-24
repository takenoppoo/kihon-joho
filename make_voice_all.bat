@echo off
cd /d "%~dp0"
echo Remake ALL audio. Make sure VOICEVOX is running.
py -3 gen_voice.py --force
echo.
echo Finished. Press any key to close.
pause >nul
