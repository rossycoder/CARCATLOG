@echo off
REM 🚀 CarCatALog Deployment Script for Windows
REM This script helps you deploy the application step by step

echo 🚀 CarCatALog Deployment Helper
echo ================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✓ Prerequisites check passed
echo.

REM Step 1: Check for uncommitted changes
echo 📝 Step 1: Checking for uncommitted changes...
git status -s >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠ You have uncommitted changes
    set /p commit_choice="Do you want to commit them now? (y/n): "
    if /i "%commit_choice%"=="y" (
        git add .
        set /p commit_msg="Enter commit message: "
        git commit -m "%commit_msg%"
        echo ✓ Changes committed
    )
) else (
    echo ✓ No uncommitted changes
)
echo.

REM Step 2: Push to GitHub
echo 📤 Step 2: Pushing to GitHub...
set /p push_choice="Push to GitHub? (y/n): "
if /i "%push_choice%"=="y" (
    git push origin main
    echo ✓ Pushed to GitHub
) else (
    echo ⚠ Skipped GitHub push
)
echo.

REM Step 3: Backend deployment
echo 🔧 Step 3: Backend Deployment
echo Choose your backend hosting platform:
echo 1) Render
echo 2) Railway
echo 3) Heroku
echo 4) Skip backend deployment
set /p backend_choice="Enter choice (1-4): "

if "%backend_choice%"=="1" (
    echo ℹ Deploying to Render...
    echo Please follow these steps:
    echo   1. Go to https://render.com
    echo   2. Click 'New +' → 'Web Service'
    echo   3. Connect your GitHub repository
    echo   4. Set Root Directory to: backend
    echo   5. Set Build Command to: npm install
    echo   6. Set Start Command to: npm start
    echo   7. Add all environment variables from backend/.env.example
    pause
    echo ✓ Backend deployment configured
) else if "%backend_choice%"=="2" (
    echo ℹ Deploying to Railway...
    where railway >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        cd backend
        railway up
        cd ..
        echo ✓ Backend deployed to Railway
    ) else (
        echo ⚠ Railway CLI not installed
        echo Install with: npm install -g @railway/cli
    )
) else if "%backend_choice%"=="3" (
    echo ℹ Deploying to Heroku...
    where heroku >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        cd backend
        heroku create carcatalog-backend
        git push heroku main
        cd ..
        echo ✓ Backend deployed to Heroku
    ) else (
        echo ⚠ Heroku CLI not installed
        echo Install from: https://devcenter.heroku.com/articles/heroku-cli
    )
) else if "%backend_choice%"=="4" (
    echo ⚠ Skipped backend deployment
) else (
    echo ✗ Invalid choice
)
echo.

REM Step 4: Frontend deployment
echo 🎨 Step 4: Frontend Deployment
echo Choose your frontend hosting platform:
echo 1) Vercel
echo 2) Netlify
echo 3) Render (Static Site)
echo 4) Skip frontend deployment
set /p frontend_choice="Enter choice (1-4): "

if "%frontend_choice%"=="1" (
    echo ℹ Deploying to Vercel...
    where vercel >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        cd frontend
        vercel --prod
        cd ..
        echo ✓ Frontend deployed to Vercel
    ) else (
        echo ⚠ Vercel CLI not installed
        echo Install with: npm install -g vercel
        echo Then run: cd frontend ^&^& vercel --prod
    )
) else if "%frontend_choice%"=="2" (
    echo ℹ Deploying to Netlify...
    where netlify >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        cd frontend
        call npm run build
        netlify deploy --prod
        cd ..
        echo ✓ Frontend deployed to Netlify
    ) else (
        echo ⚠ Netlify CLI not installed
        echo Install with: npm install -g netlify-cli
        echo Then run: cd frontend ^&^& netlify deploy --prod
    )
) else if "%frontend_choice%"=="3" (
    echo ℹ Deploying to Render (Static Site)...
    echo Please follow these steps:
    echo   1. Go to https://render.com
    echo   2. Click 'New +' → 'Static Site'
    echo   3. Connect your GitHub repository
    echo   4. Set Root Directory to: frontend
    echo   5. Set Build Command to: npm install ^&^& npm run build
    echo   6. Set Publish Directory to: dist
    echo   7. Add environment variables
    pause
    echo ✓ Frontend deployment configured
) else if "%frontend_choice%"=="4" (
    echo ⚠ Skipped frontend deployment
) else (
    echo ✗ Invalid choice
)
echo.

REM Step 5: Environment variables reminder
echo 🔐 Step 5: Environment Variables
echo ⚠ Don't forget to set these environment variables:
echo.
echo Backend:
echo   - NODE_ENV=production
echo   - MONGODB_URI
echo   - JWT_SECRET
echo   - FRONTEND_URL
echo   - STRIPE_SECRET_KEY
echo   - CLOUDINARY credentials
echo   - Email service credentials
echo.
echo Frontend:
echo   - VITE_API_URL
echo   - VITE_STRIPE_PUBLISHABLE_KEY
echo.
pause

REM Step 6: Database setup
echo.
echo 💾 Step 6: Database Setup
set /p seed_choice="Do you want to seed the database? (y/n): "
if /i "%seed_choice%"=="y" (
    set /p mongo_uri="Enter your MongoDB URI: "
    echo ℹ Seeding subscription plans...
    set MONGODB_URI=%mongo_uri%
    node backend/scripts/seedSubscriptionPlans.js
    
    set /p seed_vans="Seed test vans? (y/n): "
    if /i "%seed_vans%"=="y" (
        node backend/scripts/seedNewVans.js
    )
    
    set /p seed_bikes="Seed test bikes? (y/n): "
    if /i "%seed_bikes%"=="y" (
        node backend/scripts/seedBikes.js
    )
    
    echo ✓ Database seeded
)
echo.

REM Step 7: Final checks
echo ✅ Step 7: Final Checks
echo ℹ Please verify:
echo   □ Backend is accessible
echo   □ Frontend is accessible
echo   □ API calls are working
echo   □ Database is connected
echo   □ Stripe webhooks configured
echo   □ Email service working
echo.

REM Summary
echo 🎉 Deployment Complete!
echo =======================
echo ✓ Your application should now be deployed
echo.
echo ℹ Next steps:
echo   1. Test all functionality
echo   2. Configure custom domains (optional)
echo   3. Set up monitoring
echo   4. Configure backups
echo.
echo ℹ For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
pause
