#!/bin/bash

echo "🔧 Installing reCAPTCHA dependencies..."

# Install frontend dependency
echo "📦 Installing react-google-recaptcha..."
npm install react-google-recaptcha

# Backend already has axios, but verify
cd backend
echo "📦 Verifying axios is installed..."
npm list axios || npm install axios

cd ..

echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get reCAPTCHA keys from https://www.google.com/recaptcha/admin/create"
echo "2. Add RECAPTCHA_SECRET_KEY to backend/.env"
echo "3. Add VITE_RECAPTCHA_SITE_KEY to frontend/.env or .env"
echo "4. See RECAPTCHA_SETUP.md for detailed instructions"
echo "5. See src/examples/RecaptchaUsageExample.jsx for usage examples"
