#!/bin/bash

# 🔍 Test Frontend-Backend Connection
# This script tests if your deployed frontend and backend can communicate

BACKEND_URL="https://carcatlog-backend-1.onrender.com"
FRONTEND_URL="https://idyllic-tapioca-67e6b7.netlify.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔍 Testing Frontend-Backend Connection"
echo "======================================"
echo ""

# Test 1: Backend Health
echo -e "${BLUE}Test 1: Backend Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 2: Backend API
echo -e "${BLUE}Test 2: Backend API Endpoint${NC}"
API_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/vehicles/count")
HTTP_CODE=$(echo "$API_RESPONSE" | tail -n1)
BODY=$(echo "$API_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Backend API is accessible${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Backend API failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 3: CORS Preflight
echo -e "${BLUE}Test 3: CORS Configuration${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$BACKEND_URL/api/vehicles/count")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓ CORS is configured${NC}"
    echo "$CORS_RESPONSE" | grep "Access-Control"
else
    echo -e "${RED}✗ CORS not configured properly${NC}"
    echo -e "${YELLOW}⚠ You need to add FRONTEND_URL to Render environment variables${NC}"
fi
echo ""

# Test 4: Frontend Accessibility
echo -e "${BLUE}Test 4: Frontend Accessibility${NC}"
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL")
HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend not accessible (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Summary
echo "======================================"
echo -e "${BLUE}Summary${NC}"
echo "======================================"
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Set VITE_API_URL in Netlify to: ${BACKEND_URL}/api"
echo "2. Set FRONTEND_URL in Render to: ${FRONTEND_URL}"
echo "3. Redeploy both services"
echo "4. Test in browser: ${FRONTEND_URL}"
echo ""
echo "For detailed instructions, see: FRONTEND_BACKEND_CONNECTION_FIX.md"
