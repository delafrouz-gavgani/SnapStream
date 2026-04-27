# =============================================================================
# SnapStream — Azure Deployment Script
# Run this from: C:\Users\SULEMAN\Downloads\Scalable Assignments\Melika\SnapStream\
# =============================================================================

# ── CONFIGURE THESE BEFORE RUNNING ───────────────────────────────────────────
$STUDENT_NUMBER  = "REPLACE_WITH_MELIKA_STUDENT_NUMBER"   # e.g. "20169999"
$DATABASE_URL    = "REPLACE_WITH_NEON_CONNECTION_STRING"  # from neon.tech
$JWT_SECRET      = "SnapStream-production-secret-change-this-to-32-chars-min"
# ─────────────────────────────────────────────────────────────────────────────

$BACKEND_NAME    = "snapstream-$STUDENT_NUMBER-backend"
$FRONTEND_NAME   = "snapstream-$STUDENT_NUMBER-frontend"
$RESOURCE_GROUP  = "SnapStream-RG"
$PLAN_NAME       = "SnapStream-Plan"
$BACKEND_DIR     = "$PSScriptRoot\backend"
$FRONTEND_DIR    = "$PSScriptRoot\frontend"
$BACKEND_ZIP     = "$PSScriptRoot\backend-deploy.zip"

Write-Host "`n=== SnapStream Azure Deployment ===" -ForegroundColor Cyan

# Guard: ensure required values are set
if ($STUDENT_NUMBER -eq "REPLACE_WITH_MELIKA_STUDENT_NUMBER") {
    Write-Error "Set STUDENT_NUMBER at the top of this script before running."
    exit 1
}
if ($DATABASE_URL -eq "REPLACE_WITH_NEON_CONNECTION_STRING") {
    Write-Error "Set DATABASE_URL (Neon connection string) at the top of this script before running."
    exit 1
}

# ── STEP 1: Migrate Neon database ────────────────────────────────────────────
Write-Host "`n[1/9] Pushing schema to Neon database..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR
$env:DATABASE_URL = $DATABASE_URL
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) { Write-Error "prisma db push failed"; exit 1 }

Write-Host "[1/9] Seeding demo accounts..." -ForegroundColor Yellow
node prisma/seed.js
if ($LASTEXITCODE -ne 0) { Write-Error "seed.js failed"; exit 1 }

# ── STEP 2: Create Azure resource group ──────────────────────────────────────
Write-Host "`n[2/9] Creating resource group $RESOURCE_GROUP..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
az group create --name $RESOURCE_GROUP --location uksouth
if ($LASTEXITCODE -ne 0) { Write-Error "Resource group creation failed"; exit 1 }

# ── STEP 3: Create App Service Plan (FREE F1) ─────────────────────────────────
Write-Host "`n[3/9] Creating App Service Plan (F1 free tier)..." -ForegroundColor Yellow
az appservice plan create `
    --name $PLAN_NAME `
    --resource-group $RESOURCE_GROUP `
    --sku F1 `
    --is-linux
if ($LASTEXITCODE -ne 0) { Write-Error "App Service Plan creation failed"; exit 1 }

# ── STEP 4: Create backend Web App ───────────────────────────────────────────
Write-Host "`n[4/9] Creating backend Web App $BACKEND_NAME..." -ForegroundColor Yellow
az webapp create `
    --name $BACKEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --plan $PLAN_NAME `
    --runtime "NODE:18-lts"
if ($LASTEXITCODE -ne 0) { Write-Error "Web App creation failed"; exit 1 }

# ── STEP 5: Set environment variables ────────────────────────────────────────
Write-Host "`n[5/9] Configuring environment variables..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $BACKEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --settings `
        DATABASE_URL="$DATABASE_URL" `
        JWT_SECRET="$JWT_SECRET" `
        PORT="8080" `
        NODE_ENV="production" `
        SCM_DO_BUILD_DURING_DEPLOYMENT="true" `
        CLIENT_URL="https://PLACEHOLDER.azurestaticapps.net"
if ($LASTEXITCODE -ne 0) { Write-Error "App settings failed"; exit 1 }

az webapp config set `
    --name $BACKEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --startup-file "node server.js"

# ── STEP 6: Zip and deploy backend ───────────────────────────────────────────
Write-Host "`n[6/9] Zipping backend (excluding node_modules)..." -ForegroundColor Yellow
$tempDir = "$env:TEMP\snapstream-backend-deploy"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
$null = robocopy $BACKEND_DIR $tempDir /E /XD "node_modules" ".git" /XF ".env" ".env.test" "backend-deploy.zip"
if (Test-Path $BACKEND_ZIP) { Remove-Item $BACKEND_ZIP -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $BACKEND_ZIP -Force
Remove-Item $tempDir -Recurse -Force

Write-Host "[6/9] Deploying backend zip to Azure..." -ForegroundColor Yellow
az webapp deploy `
    --name $BACKEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --src-path $BACKEND_ZIP `
    --type zip
if ($LASTEXITCODE -ne 0) { Write-Error "Backend zip deploy failed"; exit 1 }

Write-Host "[6/9] Waiting 30 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

$backendUrl = "https://$BACKEND_NAME.azurewebsites.net"
Write-Host "[6/9] Testing backend health: $backendUrl/api/health" -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "$backendUrl/api/health" -UseBasicParsing -TimeoutSec 30 -ErrorAction SilentlyContinue
if ($health.StatusCode -eq 200) {
    Write-Host "Backend is healthy!" -ForegroundColor Green
} else {
    Write-Warning "Backend health check failed. Check logs: az webapp log tail --name $BACKEND_NAME --resource-group $RESOURCE_GROUP"
}

# ── STEP 7: Build frontend ────────────────────────────────────────────────────
Write-Host "`n[7/9] Building frontend with production API URL..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR
Set-Content -Path ".env" -Value "VITE_API_URL=https://$BACKEND_NAME.azurewebsites.net" -Encoding utf8
npm install
if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit 1 }
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "npm build failed"; exit 1 }

# ── STEP 8: Deploy frontend to Static Web Apps ───────────────────────────────
Write-Host "`n[8/9] Creating Azure Static Web App $FRONTEND_NAME..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
az staticwebapp create `
    --name $FRONTEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --location "westeurope"
if ($LASTEXITCODE -ne 0) { Write-Error "Static Web App creation failed"; exit 1 }

$deployToken = az staticwebapp secrets list `
    --name $FRONTEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --query "properties.apiKey" -o tsv

Write-Host "[8/9] Deploying frontend files..." -ForegroundColor Yellow
npm install -g @azure/static-web-apps-cli --silent
Set-Location $FRONTEND_DIR
swa deploy ./dist `
    --deployment-token $deployToken `
    --env production
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend deploy failed"; exit 1 }

# ── STEP 9: Update CORS origin on backend ────────────────────────────────────
$frontendUrl = az staticwebapp show `
    --name $FRONTEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --query "defaultHostname" -o tsv

Write-Host "`n[9/9] Updating CLIENT_URL on backend to https://$frontendUrl..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $BACKEND_NAME `
    --resource-group $RESOURCE_GROUP `
    --settings CLIENT_URL="https://$frontendUrl"

az webapp restart --name $BACKEND_NAME --resource-group $RESOURCE_GROUP

# ── Done ─────────────────────────────────────────────────────────────────────
Write-Host "`n============================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host " Frontend : https://$frontendUrl"
Write-Host " Backend  : https://$BACKEND_NAME.azurewebsites.net"
Write-Host ""
Write-Host " Demo accounts:"
Write-Host "   Creator  : melika@snapstream.com / Melika@Str1!"
Write-Host "   Creator  : omar@snapstream.com   / Omar#Vid2!"
Write-Host "   Consumer : viewer@snapstream.com / Cam@View1!2"
Write-Host ""
Write-Host " To view backend logs:"
Write-Host "   az webapp log tail --name $BACKEND_NAME --resource-group $RESOURCE_GROUP"
Write-Host ""
Write-Host " To clean up (run AFTER recording demo video):"
Write-Host "   az group delete --name $RESOURCE_GROUP --yes --no-wait"
Write-Host "============================================" -ForegroundColor Green
