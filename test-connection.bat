@echo off
REM 🔍 Test Frontend-Backend Connection
REM This script tests if your deployed frontend and backend can communicate

set BACKEND_URL=https://carcatlog-backend-1.onrender.com
set FRONTEND_URL=https://idyllic-tapioca-67e6b7.netlify.app

echo 🔍 Testing Frontend-Backend Connection
echo ======================================
echo.

REM Test 1: Backend Health
echo Test 1: Backend Health Check
curl -s %BACKEND_URL%/health
if %ERRORLEVEL% EQU 0 (
    echo ✓ Backend is running
) else (
    echo ✗ Backend health check failed
)
echo.

REM Test 2: Backend API
echo Test 2: Backend API Endpoint
curl -s %BACKEND_URL%/api/vehicles/count
if %ERRORLEVEL% EQU 0 (
    echo ✓ Backend API is accessible
) else (
    echo ✗ Backend API failed
)
echo.

REM Test 3: Frontend
echo Test 3: Frontend Accessibility
curl -s -I %FRONTEND_URL% | find "200"
if %ERRORLEVEL% EQU 0 (
    echo ✓ Frontend is accessible
) else (
    echo ✗ Frontend not accessible
)
echo.

REM Summary
echo ======================================
echo Summary
echo ======================================
echo.
echo Backend URL: %BACKEND_URL%
echo Frontend URL: %FRONTEND_URL%
echo.
echo Next Steps:
echo 1. Set VITE_API_URL in Netlify to: %BACKEND_URL%/api
echo 2. Set FRONTEND_URL in Render to: %FRONTEND_URL%
echo 3. Redeploy both services
echo 4. Test in browser: %FRONTEND_URL%
echo.
echo For detailed instructions, see: FRONTEND_BACKEND_CONNECTION_FIX.md
echo.
pause
