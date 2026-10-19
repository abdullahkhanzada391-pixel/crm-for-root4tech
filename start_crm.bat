@echo off
title ROOT 4 TECH CRM Launcher
echo ====================================================
echo             ROOT 4 TECH - Modern CRM
echo ====================================================

set "PATH=C:\Users\Ocean Developers LTD\tools\nodejs;C:\Users\Ocean Developers LTD\.local\bin;%PATH%"

:: Check if Django backend is already listening on 8000
netstat -ano | findstr ":8000" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Starting Django Backend on port 8000...
    cd /d "%~dp0root4tech-crm\backend"
    start "ROOT 4 TECH - Django Backend" cmd /k ".venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"
    timeout /t 2 /nobreak >nul
) else (
    echo Backend is already running on port 8000.
)

:: Check if Vite is already listening on 5173
netstat -ano | findstr ":5173" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Starting Vite Frontend on port 5173...
    cd /d "%~dp0root4tech-crm\frontend"
    start "ROOT 4 TECH - React Frontend" cmd /k "npm.cmd run dev -- --host 0.0.0.0 --port 5173"
    timeout /t 2 /nobreak >nul
) else (
    echo Frontend is already running on port 5173.
)

echo Opening ROOT 4 TECH CRM in your default browser...
start http://localhost:5173
echo ====================================================
echo  - CRM Web App:   http://localhost:5173
echo  - API Backend:   http://127.0.0.1:8000/api/health/
echo ====================================================
