# 📱 Quick APK Builder Script

# This script helps you create an APK for your 7K Music app
# Choose the method that works best for you

Write-Host "🎵 7K Music - APK Builder" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if app is built
if (!(Test-Path "dist")) {
    Write-Host "📦 Building web app..." -ForegroundColor Yellow
    npm run build
}

Write-Host ""
Write-Host "Choose APK build method:" -ForegroundColor Green
Write-Host ""
Write-Host "1. PWABuilder (Easiest - requires deployed URL)" -ForegroundColor White
Write-Host "2. Bubblewrap CLI (Requires Android SDK)" -ForegroundColor White
Write-Host "3. Deploy to Vercel first" -ForegroundColor White
Write-Host "4. Cancel" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Opening PWABuilder..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Steps:" -ForegroundColor Yellow
        Write-Host "1. Deploy your app first (choose option 3 if not deployed yet)"
        Write-Host "2. Enter your deployed URL on PWABuilder"
        Write-Host "3. Click 'Start' and then 'Package For Stores'"
        Write-Host "4. Select 'Android' and download APK"
        Write-Host ""
        Start-Process "https://www.pwabuilder.com/"
    }
    "2" {
        Write-Host ""
        Write-Host "🔧 Checking Bubblewrap installation..." -ForegroundColor Cyan
        
        if (!(Get-Command "bubblewrap" -ErrorAction SilentlyContinue)) {
            Write-Host "Installing Bubblewrap CLI..." -ForegroundColor Yellow
            npm install -g @bubblewrap/cli
        }
        
        Write-Host ""
        $url = Read-Host "Enter your deployed app URL (e.g., https://your-app.vercel.app)"
        
        if ($url) {
            Write-Host "Initializing Bubblewrap project..." -ForegroundColor Yellow
            bubblewrap init --manifest="$url/manifest.webmanifest"
            
            Write-Host "Building APK..." -ForegroundColor Yellow
            bubblewrap build
            
            Write-Host ""
            Write-Host "✅ APK built successfully!" -ForegroundColor Green
            Write-Host "📱 Location: ./app/build/outputs/apk/release/" -ForegroundColor Cyan
        } else {
            Write-Host "❌ URL required!" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host ""
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
        Write-Host ""
        
        if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
            Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "Building app..." -ForegroundColor Yellow
        npm run build
        
        Write-Host ""
        Write-Host "Deploying..." -ForegroundColor Yellow
        Write-Host "(You may need to login to Vercel on first run)" -ForegroundColor Gray
        vercel --prod
        
        Write-Host ""
        Write-Host "✅ Deployment complete!" -ForegroundColor Green
        Write-Host "Now use option 1 (PWABuilder) with your Vercel URL" -ForegroundColor Cyan
    }
    "4" {
        Write-Host "Cancelled." -ForegroundColor Gray
        exit
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
