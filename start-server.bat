@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo サーバーを起動しています...
echo ブラウザを開いています...
echo.

REM Chromeを起動（バックグラウンド）
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8000"

REM 少し遅延させてPythonサーバーを起動
timeout /t 2 /nobreak

echo Chromeを起動しました。
echo サーバーが起動しています...
echo 終了するには このウィンドウを閉じるか Ctrl+C を押してください
echo.

python -m http.server 8000
