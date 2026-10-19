@echo off
set "PATH=C:\Users\Ocean Developers LTD\tools\nodejs;C:\Users\Ocean Developers LTD\.local\bin;%PATH%"
cd /d "%~dp0root4tech-crm\backend"
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
