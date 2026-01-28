@echo off
echo Installing reCAPTCHA dependencies...
echo.

echo Installing react-google-recaptcha...
call npm install react-google-recaptcha

echo.
echo Verifying axios is installed in backend...
cd backend
call npm list axios || call npm install axios
cd ..

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Get reCAPTCHA keys from https://www.google.com/recaptcha/admin/create
echo 2. Add RECAPTCHA_SECRET_KEY to backend/.env
echo 3. Add VITE_RECAPTCHA_SITE_KEY to .env
echo 4. See RECAPTCHA_SETUP.md for detailed instructions
echo 5. See src/examples/RecaptchaUsageExample.jsx for usage examples
echo.
pause
