@echo off
title PAFolio - Push to GitHub
echo =======================================================================
echo   PAFolio - Push Project to GitHub (gorthailand1617-glitch)
echo =======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Git status...
git status
echo.

echo [2/3] Adding changes and committing...
git add .
git commit -m "Update PAFolio: Video Studio 1080p, Thai Natural TTS, 11 Themes, and Drive Sync" 2>nul
echo.

echo [3/3] Pushing to GitHub (https://github.com/gorthailand1617-glitch/PAFolio.git)...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================================
    echo   SUCCESS: PAFolio has been successfully pushed to your GitHub!
    echo   URL: https://github.com/gorthailand1617-glitch/PAFolio
    echo =======================================================================
) else (
    echo.
    echo =======================================================================
    echo   NOTICE: If the repository does not exist on GitHub yet:
    echo   1. Open: https://github.com/new
    echo   2. Repository name: PAFolio
    echo   3. Click "Create repository"
    echo   4. Run this script again!
    echo =======================================================================
)

echo.
pause
