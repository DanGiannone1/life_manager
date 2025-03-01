# Life Manager Application Startup Script
# This script builds the frontend and deploys it to the backend

# Define full paths for frontend and backend directories
$frontendPath = "D:\projects\life_manager\frontend"
$backendPath = "D:\projects\life_manager\backend"

# Navigate to the frontend directory
Write-Host "Navigating to $frontendPath"
Set-Location $frontendPath

# Remove the old dist directory in the backend if it exists
if (Test-Path "$backendPath\dist") {
    Write-Host "Removing old dist directory at $backendPath\dist..."
    Remove-Item -Recurse -Force "$backendPath\dist"
}

# Build the frontend
Write-Host "Building frontend..."
npm run build

# Check for build errors
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed!"
    Set-Location $backendPath
    exit 1
}

# Copy the new dist directory to the backend
Write-Host "Copying dist to $backendPath\dist..."
Copy-Item -Path "dist" -Destination "$backendPath\dist" -Recurse

# Navigate to the backend directory
Write-Host "Navigating to $backendPath"
Set-Location $backendPath

# Run the FastAPI application using Uvicorn
Write-Host "Starting FastAPI application with Uvicorn..."
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# This script can be executed by running:
# ./start_app.ps1 