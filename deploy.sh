#!/bin/bash

# 🚀 CarCatALog Deployment Script
# This script helps you deploy the application step by step

echo "🚀 CarCatALog Deployment Helper"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_success "Prerequisites check passed"
echo ""

# Step 1: Check for uncommitted changes
echo "📝 Step 1: Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes"
    read -p "Do you want to commit them now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        print_success "Changes committed"
    fi
else
    print_success "No uncommitted changes"
fi
echo ""

# Step 2: Push to GitHub
echo "📤 Step 2: Pushing to GitHub..."
read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    print_success "Pushed to GitHub"
else
    print_warning "Skipped GitHub push"
fi
echo ""

# Step 3: Backend deployment
echo "🔧 Step 3: Backend Deployment"
print_info "Choose your backend hosting platform:"
echo "1) Render"
echo "2) Railway"
echo "3) Heroku"
echo "4) Skip backend deployment"
read -p "Enter choice (1-4): " backend_choice

case $backend_choice in
    1)
        print_info "Deploying to Render..."
        print_info "Please follow these steps:"
        echo "  1. Go to https://render.com"
        echo "  2. Click 'New +' → 'Web Service'"
        echo "  3. Connect your GitHub repository"
        echo "  4. Set Root Directory to: backend"
        echo "  5. Set Build Command to: npm install"
        echo "  6. Set Start Command to: npm start"
        echo "  7. Add all environment variables from backend/.env.example"
        read -p "Press Enter when deployment is complete..."
        print_success "Backend deployment configured"
        ;;
    2)
        print_info "Deploying to Railway..."
        if command -v railway &> /dev/null; then
            cd backend
            railway up
            cd ..
            print_success "Backend deployed to Railway"
        else
            print_warning "Railway CLI not installed"
            print_info "Install with: npm install -g @railway/cli"
        fi
        ;;
    3)
        print_info "Deploying to Heroku..."
        if command -v heroku &> /dev/null; then
            cd backend
            heroku create carcatalog-backend
            git push heroku main
            cd ..
            print_success "Backend deployed to Heroku"
        else
            print_warning "Heroku CLI not installed"
            print_info "Install from: https://devcenter.heroku.com/articles/heroku-cli"
        fi
        ;;
    4)
        print_warning "Skipped backend deployment"
        ;;
    *)
        print_error "Invalid choice"
        ;;
esac
echo ""

# Step 4: Frontend deployment
echo "🎨 Step 4: Frontend Deployment"
print_info "Choose your frontend hosting platform:"
echo "1) Vercel"
echo "2) Netlify"
echo "3) Render (Static Site)"
echo "4) Skip frontend deployment"
read -p "Enter choice (1-4): " frontend_choice

case $frontend_choice in
    1)
        print_info "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            cd frontend
            vercel --prod
            cd ..
            print_success "Frontend deployed to Vercel"
        else
            print_warning "Vercel CLI not installed"
            print_info "Install with: npm install -g vercel"
            print_info "Then run: cd frontend && vercel --prod"
        fi
        ;;
    2)
        print_info "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            cd frontend
            npm run build
            netlify deploy --prod
            cd ..
            print_success "Frontend deployed to Netlify"
        else
            print_warning "Netlify CLI not installed"
            print_info "Install with: npm install -g netlify-cli"
            print_info "Then run: cd frontend && netlify deploy --prod"
        fi
        ;;
    3)
        print_info "Deploying to Render (Static Site)..."
        print_info "Please follow these steps:"
        echo "  1. Go to https://render.com"
        echo "  2. Click 'New +' → 'Static Site'"
        echo "  3. Connect your GitHub repository"
        echo "  4. Set Root Directory to: frontend"
        echo "  5. Set Build Command to: npm install && npm run build"
        echo "  6. Set Publish Directory to: dist"
        echo "  7. Add environment variables"
        read -p "Press Enter when deployment is complete..."
        print_success "Frontend deployment configured"
        ;;
    4)
        print_warning "Skipped frontend deployment"
        ;;
    *)
        print_error "Invalid choice"
        ;;
esac
echo ""

# Step 5: Environment variables reminder
echo "🔐 Step 5: Environment Variables"
print_warning "Don't forget to set these environment variables:"
echo ""
echo "Backend:"
echo "  - NODE_ENV=production"
echo "  - MONGODB_URI"
echo "  - JWT_SECRET"
echo "  - FRONTEND_URL"
echo "  - STRIPE_SECRET_KEY"
echo "  - CLOUDINARY credentials"
echo "  - Email service credentials"
echo ""
echo "Frontend:"
echo "  - VITE_API_URL"
echo "  - VITE_STRIPE_PUBLISHABLE_KEY"
echo ""
read -p "Press Enter to continue..."

# Step 6: Database setup
echo ""
echo "💾 Step 6: Database Setup"
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your MongoDB URI: " mongo_uri
    print_info "Seeding subscription plans..."
    MONGODB_URI=$mongo_uri node backend/scripts/seedSubscriptionPlans.js
    
    read -p "Seed test vans? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        MONGODB_URI=$mongo_uri node backend/scripts/seedNewVans.js
    fi
    
    read -p "Seed test bikes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        MONGODB_URI=$mongo_uri node backend/scripts/seedBikes.js
    fi
    
    print_success "Database seeded"
fi
echo ""

# Step 7: Final checks
echo "✅ Step 7: Final Checks"
print_info "Please verify:"
echo "  □ Backend is accessible"
echo "  □ Frontend is accessible"
echo "  □ API calls are working"
echo "  □ Database is connected"
echo "  □ Stripe webhooks configured"
echo "  □ Email service working"
echo ""

# Summary
echo "🎉 Deployment Complete!"
echo "======================="
print_success "Your application should now be deployed"
echo ""
print_info "Next steps:"
echo "  1. Test all functionality"
echo "  2. Configure custom domains (optional)"
echo "  3. Set up monitoring"
echo "  4. Configure backups"
echo ""
print_info "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
