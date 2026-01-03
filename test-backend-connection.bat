@echo off
echo Testing Backend Connection...
echo.
echo Testing Render Backend:
curl -X GET https://carcatlog-backend-1.onrender.com/health
echo.
echo.
echo If you see a response above, the backend is working!
echo If not, the backend might be sleeping (Render free tier spins down after inactivity)
echo.
pause
