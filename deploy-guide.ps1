# GUIA AUTOMATIZADO DE DEPLOY NO RENDER
Write-Host "=== DEPLOY AUTOMATIZADO NO RENDER ===" -ForegroundColor Green
Write-Host ""

# Abrir o Render no navegador
Write-Host "1. Abrindo o Render Dashboard..." -ForegroundColor Yellow
Start-Process "https://dashboard.render.com/"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "2. SIGA ESTAS INSTRUCOES:" -ForegroundColor Cyan
Write-Host "   - Faca login na sua conta Render" -ForegroundColor White
Write-Host "   - Clique em 'New +' > 'Web Service'" -ForegroundColor White
Write-Host "   - Conecte seu repositorio: techiaemp-netizen/gabarita-ai-backend-public" -ForegroundColor White
Write-Host "   - Branch: main" -ForegroundColor White
Write-Host ""

Write-Host "3. CONFIGURACOES (copie e cole):" -ForegroundColor Cyan
Write-Host "   Nome: gabarita-ai-backend" -ForegroundColor Yellow
Write-Host "   Regiao: Oregon (US West)" -ForegroundColor Yellow
Write-Host "   Branch: main" -ForegroundColor Yellow
Write-Host "   Build Command: pip install -r requirements.txt" -ForegroundColor Yellow
Write-Host "   Start Command: python src/main.py" -ForegroundColor Yellow
Write-Host "   Plan: Free" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. VARIAVEIS DE AMBIENTE:" -ForegroundColor Cyan
Write-Host "   PYTHON_VERSION = 3.11.0" -ForegroundColor Yellow
Write-Host "   PORT = 10000" -ForegroundColor Yellow
Write-Host ""

Write-Host "5. HEALTH CHECK:" -ForegroundColor Cyan
Write-Host "   Health Check Path: /health" -ForegroundColor Yellow
Write-Host ""

Write-Host "6. CLIQUE EM 'Create Web Service'" -ForegroundColor Green
Write-Host ""

# Aguardar confirmacao
Read-Host "Pressione ENTER quando o deploy estiver completo"

Write-Host ""
Write-Host "DEPLOY CONCLUIDO!" -ForegroundColor Green
Write-Host "Sua URL sera: https://gabarita-ai-backend.onrender.com" -ForegroundColor Green
Write-Host "Teste o endpoint: https://gabarita-ai-backend.onrender.com/health" -ForegroundColor Green
Write-Host ""
Write-Host "PRONTO! Agora voce tem o backend deployado automaticamente!" -ForegroundColor Magenta