# 🎵 7K Music - Quick Installation Script
# This script will help you set up the 7K Music app quickly

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   7K MUSIC - SETUP WIZARD" -ForegroundColor Cyan
Write-Host "   Play. Discover. Create - Legally." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Recommended: LTS version (v18 or higher)" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
Write-Host "Checking for npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   YOUTUBE API KEY SETUP" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    
    if ($overwrite -ne "y") {
        Write-Host "Keeping existing .env file..." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "Follow these steps to get your YouTube API key:" -ForegroundColor Yellow
        Write-Host "1. Go to https://console.cloud.google.com/" -ForegroundColor White
        Write-Host "2. Create a new project or select existing one" -ForegroundColor White
        Write-Host "3. Enable 'YouTube Data API v3'" -ForegroundColor White
        Write-Host "4. Create credentials (API Key)" -ForegroundColor White
        Write-Host "5. Copy your API key" -ForegroundColor White
        Write-Host ""
        
        $apiKey = Read-Host "Enter your YouTube API Key"
        
        if ($apiKey) {
            "VITE_YOUTUBE_API_KEY=$apiKey" | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host "✅ .env file updated!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No API key entered. You'll need to manually edit .env" -ForegroundColor Yellow
        }
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: You need to add your YouTube API Key!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://console.cloud.google.com/" -ForegroundColor White
    Write-Host "2. Create a new project or select existing one" -ForegroundColor White
    Write-Host "3. Enable 'YouTube Data API v3'" -ForegroundColor White
    Write-Host "4. Create credentials (API Key)" -ForegroundColor White
    Write-Host "5. Copy your API key" -ForegroundColor White
    Write-Host "6. Edit .env file and replace 'your_youtube_api_key_here'" -ForegroundColor White
    Write-Host ""
    
    $openEnv = Read-Host "Do you want to enter your API key now? (y/n)"
    
    if ($openEnv -eq "y") {
        $apiKey = Read-Host "Enter your YouTube API Key"
        
        if ($apiKey) {
            "VITE_YOUTUBE_API_KEY=$apiKey" | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host "✅ .env file configured!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No API key entered. Please edit .env manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Remember to edit .env file before running the app!" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the development server, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "To build for production, run:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Yellow
Write-Host "  README.md - Full documentation" -ForegroundColor White
Write-Host "  SETUP.md - Detailed setup guide" -ForegroundColor White
Write-Host "  LEGAL.md - Legal compliance information" -ForegroundColor White
Write-Host ""
Write-Host "Happy music streaming! 🎵" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Do you want to start the dev server now? (y/n)"

if ($startNow -eq "y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "The app will open at http://localhost:5173" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
}
