@echo off
title PAFolio - Web Server

echo =======================================================================
echo   PAFolio - Executive Portfolio and Evaluation System
echo =======================================================================
echo.

cd /d "%~dp0"

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python found. Starting local web server at http://localhost:8080 ...
    echo [INFO] Press Ctrl+C in this window to stop the server.
    echo.
    start "" http://localhost:8080
    python -m http.server 8080
    goto :eof
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js found. Starting local web server at http://localhost:8080 ...
    echo [INFO] Press Ctrl+C in this window to stop the server.
    echo.
    start "" http://localhost:8080
    npx --yes http-server -p 8080 -c-1
    goto :eof
)

echo [INFO] Python or Node.js not detected.
echo [INFO] Opening index.html directly in your default browser...
start "" "%~dp0index.html"
echo.
pause
