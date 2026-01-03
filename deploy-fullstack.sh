#!/bin/bash

# 🚀 Full Stack Deployment Script - CarCatALog
# Deploys both backend and frontend together

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_header() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${BLUE}$1${NC}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }

# Check prerequisites
check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    
    local missing=0
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        missing=1
    else
        print_success "Git installed"
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        missing=1
    else
        print_success "Node.js installed ($(node --version))"
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        missing=1
    else
        print_success "npm installed ($(npm --version))"
    fi
    
    if [ $missing -eq 1 ]; then
        print_error "Please install missing prerequisites"
        exit 1
    fi
}

# Test builds locally
test_builds() {
    print_header "🧪 Testing Local Builds"
    
    # Test backend
    print_info "Testing backend..."
    cd backend
    if npm install && npm run lint 2>/dev/null || true; then
        print_success "Backend dependencies installed"
    else
        print_warning "Backend lint check skipped"
    fi
    cd ..
    
    # Test frontend
    print_info "Testing frontend build..."
    cd frontend
    if npm install && npm run build; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    cd ..
}

# Commit and push changes
commit_and_push() {
    print_header "📝 Committing Changes"
    
    if [[ -n $(git status -s) ]]; then
        print_warning "You have uncommitted changes"
        read -p "Commit message (or press Enter to skip): " commit_msg
        
        if [ -n "$commit_msg" ]; then
            git add .
            git commit -m "$commit_msg"
            print_success "Changes committed"
            
            read -p "Push to GitHub? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push origin main
                print_success "Pushed to GitHub"
            fi
        else
            print_warning "Skipped commit"
        fi
    else
        print_success "No uncommitted changes"
    fi
}

# Deploy backend
deploy_backend() {
    print_header "🔧 Backend Deployment"
    
    echo "Choose backend deployment method:"
    echo "1) Render (Recommended - Free tier available)"
    echo "2) Railway"
    echo "3) Manual (I'll deploy myself)"
    echo "4) Skip"
    read -p "Enter choice (1-4): " backend_choice
    
    case $backend_choice in
        1)
            print_info "Deploying to Render..."
            echo ""
            echo "📋 Follow these steps in Render Dashboard:"
            echo ""
            echo "1. Go to https://render.com and sign in with GitHub"
            echo "2. Click 'New +' → 'Web Service'"
            echo "3. Connect your repository"
            echo "4. Configure:"
            echo "   - Name: carcatalog-backend"
            echo "   - Root Directory: backend"
            echo "   - Build Command: npm install"
            echo "   - Start Command: npm start"
            echo "   - Instance Type: Free"
            echo ""
            echo "5. Add environment variables (see backend/.env.production.template)"
            echo ""
            read -p "Enter your Render backend URL (e.g., https://carcatalog-backend.onrender.com): " BACKEND_URL
            
            if [ -n "$BACKEND_URL" ]; then
                # Remove trailing slash
                BACKEND_URL=${BACKEND_URL%/}
                print_success "Backend URL saved: $BACKEND_URL"
            else
                print_warning "No backend URL provided"
            fi
            ;;
        2)
            print_info "Deploying to Railway..."
            if command -v railway &> /dev/null; then
                cd backend
                railway up
                cd ..
                print_success "Backend deployed to Railway"
                read -p "Enter your Railway backend URL: " BACKEND_URL
                BACKEND_URL=${BACKEND_URL%/}
            else
                print_warning "Railway CLI not installed"
                print_info "Install with: npm install -g @railway/cli"
            fi
            ;;
        3)
            print_info "Manual deployment selected"
            read -p "Enter your backend URL when deployed: " BACKEND_URL
            BACKEND_URL=${BACKEND_URL%/}
            ;;
        4)
            print_warning "Skipped backend deployment"
            read -p "Enter your existing backend URL: " BACKEND_URL
            BACKEND_URL=${BACKEND_URL%/}
            ;;
    esac
}

# Deploy frontend
deploy_frontend() {
    print_header "🎨 Frontend Deployment"
    
    if [ -z "$BACKEND_URL" ]; then
        read -p "Enter your backend URL: " BACKEND_URL
        BACKEND_URL=${BACKEND_URL%/}
    fi
    
    # Create production env file
    print_info "Creating production environment file..."
    cat > frontend/.env.production << EOF
VITE_API_URL=${BACKEND_URL}/api
VITE_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-pk_test_your_key}
EOF
    print_success "Created frontend/.env.production"
    
    echo ""
    echo "Choose frontend deployment method:"
    echo "1) Vercel (Recommended - Free tier, auto-deploy)"
    echo "2) Netlify"
    echo "3) Render Static Site"
    echo "4) Manual (I'll deploy myself)"
    echo "5) Skip"
    read -p "Enter choice (1-5): " frontend_choice
    
    case $frontend_choice in
        1)
            print_info "Deploying to Vercel..."
            if command -v vercel &> /dev/null; then
                cd frontend
                print_info "Running Vercel deployment..."
                vercel --prod
                cd ..
                print_success "Frontend deployed to Vercel"
            else
                print_warning "Vercel CLI not installed"
                echo ""
                echo "📋 Install and deploy manually:"
                echo "1. npm install -g vercel"
                echo "2. cd frontend"
                echo "3. vercel login"
                echo "4. vercel --prod"
                echo ""
                echo "OR use Vercel Dashboard:"
                echo "1. Go to https://vercel.com"
                echo "2. Import your repository"
                echo "3. Set Root Directory: frontend"
                echo "4. Add environment variables:"
                echo "   - VITE_API_URL=${BACKEND_URL}/api"
                echo "   - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
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
                echo ""
                echo "📋 Install and deploy manually:"
                echo "1. npm install -g netlify-cli"
                echo "2. cd frontend"
                echo "3. netlify login"
                echo "4. npm run build"
                echo "5. netlify deploy --prod"
            fi
            ;;
        3)
            print_info "Deploying to Render Static Site..."
            echo ""
            echo "📋 Follow these steps in Render Dashboard:"
            echo "1. Go to https://render.com"
            echo "2. Click 'New +' → 'Static Site'"
            echo "3. Connect your repository"
            echo "4. Configure:"
            echo "   - Root Directory: frontend"
            echo "   - Build Command: npm install && npm run build"
            echo "   - Publish Directory: dist"
            echo "5. Add environment variables:"
            echo "   - VITE_API_URL=${BACKEND_URL}/api"
            echo "   - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
            ;;
        4)
            print_info "Manual deployment selected"
            echo ""
            echo "📋 Remember to:"
            echo "1. Build: npm run build"
            echo "2. Deploy the 'dist' folder"
            echo "3. Set environment variables:"
            echo "   - VITE_API_URL=${BACKEND_URL}/api"
            echo "   - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
            ;;
        5)
            print_warning "Skipped frontend deployment"
            ;;
    esac
    
    echo ""
    read -p "Enter your frontend URL (when deployed): " FRONTEND_URL
    FRONTEND_URL=${FRONTEND_URL%/}
}

# Update backend with frontend URL
update_backend_url() {
    if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
        print_header "🔄 Updating Backend Configuration"
        print_warning "Don't forget to update FRONTEND_URL in your backend environment variables!"
        echo "Set FRONTEND_URL=${FRONTEND_URL} in your backend hosting platform"
    fi
}

# Database setup
setup_database() {
    print_header "💾 Database Setup"
    
    read -p "Do you want to seed the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your MongoDB URI: " MONGODB_URI
        
        if [ -n "$MONGODB_URI" ]; then
            print_info "Seeding subscription plans..."
            MONGODB_URI=$MONGODB_URI node backend/scripts/seedSubscriptionPlans.js
            
            read -p "Seed test vans? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                MONGODB_URI=$MONGODB_URI node backend/scripts/seedNewVans.js
            fi
            
            read -p "Seed test bikes? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                MONGODB_URI=$MONGODB_URI node backend/scripts/seedBikes.js
            fi
            
            print_success "Database seeded"
        fi
    fi
}

# Final summary
show_summary() {
    print_header "🎉 Deployment Summary"
    
    echo "Your application deployment is complete!"
    echo ""
    
    if [ -n "$BACKEND_URL" ]; then
        echo "Backend:  $BACKEND_URL"
    fi
    
    if [ -n "$FRONTEND_URL" ]; then
        echo "Frontend: $FRONTEND_URL"
    fi
    
    echo ""
    print_warning "⚠️  Important Next Steps:"
    echo ""
    echo "1. Update backend FRONTEND_URL environment variable to: $FRONTEND_URL"
    echo "2. Configure Stripe webhooks:"
    echo "   - URL: ${BACKEND_URL}/api/payments/webhook"
    echo "   - Events: checkout.session.completed, payment_intent.succeeded"
    echo "3. Test the application thoroughly"
    echo "4. Monitor logs for errors"
    echo ""
    print_info "📚 For detailed instructions, see FULL_STACK_DEPLOYMENT.md"
}

# Main execution
main() {
    clear
    echo "🚀 CarCatALog Full Stack Deployment"
    echo "===================================="
    echo ""
    
    check_prerequisites
    test_builds
    commit_and_push
    deploy_backend
    deploy_frontend
    update_backend_url
    setup_database
    show_summary
    
    echo ""
    print_success "Deployment script completed!"
    echo ""
}

# Run main function
main
