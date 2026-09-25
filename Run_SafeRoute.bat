@echo off
setlocal enabledelayedexpansion
title SafeRoute
cd /d "%~dp0"

echo Checking dependencies...
python -m pip install -r requirements.txt >nul 2>&1

echo.
echo Starting SafeRoute backend on http://localhost:8000 ...
start "SafeRoute Backend" cmd /k "python -m uvicorn backend:app --reload --port 8000"

echo Waiting for backend to become ready (up to 20 seconds)...
set READY=0
for /L %%i in (1,1,20) do (
    curl -s http://localhost:8000/api/health >nul 2>&1
    if not errorlevel 1 (
        set READY=1
    )
    if "!READY!"=="1" goto :ready
    timeout /t 1 /nobreak >nul
)

:ready
if "!READY!"=="1" (
    echo Backend is ready.
) else (
    echo WARNING: Backend did not respond after 20 seconds.
    echo Check the "SafeRoute Backend" window for an error message
    echo ^(common causes: missing packages, or port 8000 already in use^).
)

echo.
echo Starting SafeRoute frontend on http://localhost:5500 ...
start "SafeRoute Frontend" cmd /k "python -m http.server 5500"

timeout /t 2 /nobreak >nul

echo Opening SafeRoute in your browser...
start "" "http://localhost:5500"

echo.
echo SafeRoute should now be open at http://localhost:5500
echo Keep the "SafeRoute Backend" and "SafeRoute Frontend" windows open while using the app.
echo If location search or routing still fails, check the "SafeRoute Backend" window for a Python error.
