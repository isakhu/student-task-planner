@echo off
REM Simple deployment script for Student Task Planner (Windows)

echo ========================================
echo Student Task Planner - GitHub Deployment
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
)

REM Add all files
echo Adding files to Git...
git add .

REM Commit
echo Creating commit...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update Student Task Planner
git commit -m "%commit_msg%"

REM Check if remote exists
git remote | findstr origin >nul
if errorlevel 1 (
    echo.
    echo Setting up GitHub remote...
    set /p username="Enter your GitHub username: "
    git remote add origin https://github.com/%username%/student-task-planner.git
    git branch -M main
)

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Your code is now on GitHub!
echo.
echo Next steps:
echo 1. Go to https://render.com and sign up
echo 2. Create a new Web Service
echo 3. Connect your GitHub repository
echo 4. Your app will be live in minutes!
echo.
pause
