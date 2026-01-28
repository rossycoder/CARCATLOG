@echo off
echo.
echo ========================================
echo   Testing Forgot Password Email
echo ========================================
echo.
cd backend
node scripts/testForgotPassword.js
cd ..
echo.
pause
