# SystemA Setup Script

Write-Host "SystemA - Architecture Design Tool Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies. Check disk space and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Gray
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env and add your Supabase credentials!" -ForegroundColor Red
    Write-Host "  1. Go to https://supabase.com and create a project" -ForegroundColor Gray
    Write-Host "  2. Run the SQL from supabase-schema.sql in the SQL editor" -ForegroundColor Gray
    Write-Host "  3. Copy your project URL and anon key to .env" -ForegroundColor Gray
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open http://localhost:5173 in your browser" -ForegroundColor Cyan
Write-Host ""
