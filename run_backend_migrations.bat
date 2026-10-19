@echo off
set "PATH=C:\Users\Ocean Developers LTD\tools\nodejs;C:\Users\Ocean Developers LTD\.local\bin;%PATH%"
cd /d "%~dp0root4tech-crm\backend"
echo Creating initial migrations...
.venv\Scripts\python.exe manage.py makemigrations accounts
.venv\Scripts\python.exe manage.py makemigrations dashboard
.venv\Scripts\python.exe manage.py makemigrations notifications
.venv\Scripts\python.exe manage.py makemigrations
echo Applying migrations...
.venv\Scripts\python.exe manage.py migrate
echo Seeding initial CRM data...
.venv\Scripts\python.exe manage.py seed_data
echo Backend setup and seeding complete!
