@echo off
echo ========================================
echo   Redeploying Frontend to Vercel
echo ========================================
echo.
echo This will trigger a new deployment with updated environment variables.
echo.
cd frontend
echo Installing Vercel CLI (if not already installed)...
call npm install -g vercel
echo.
echo Logging in to Vercel...
call vercel login
echo.
echo Deploying to production...
call vercel --prod
echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your site should be live in 1-2 minutes at:
echo https://carcatlog1.vercel.app
echo.
echo Make sure to:
echo 1. Hard refresh your browser (Ctrl+Shift+R)
echo 2. Clear browser cache if needed
echo.
pause
