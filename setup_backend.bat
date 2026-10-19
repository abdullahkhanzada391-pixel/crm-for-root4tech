@echo off
set "PATH=C:\Users\Ocean Developers LTD\tools\nodejs;C:\Users\Ocean Developers LTD\.local\bin;%PATH%"
cd /d "%~dp0root4tech-crm\backend"
echo Creating virtualenv with uv...
"C:\Users\Ocean Developers LTD\.local\bin\uv.exe" venv .venv --python 3.12
echo Installing backend requirements...
"C:\Users\Ocean Developers LTD\.local\bin\uv.exe" pip install -r requirements.txt --python .venv\Scripts\python.exe
echo Backend dependencies installed!
