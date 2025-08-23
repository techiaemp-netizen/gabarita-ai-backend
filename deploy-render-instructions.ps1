# Instrucoes para Deploy no Render
Write-Host "=== DEPLOY NO RENDER - REPOSITORIO ATUALIZADO ===" -ForegroundColor Green
Write-Host ""

Write-Host "REPOSITORIO CORRETO:" -ForegroundColor Cyan
Write-Host "   https://github.com/techiaemp-netizen/gabarita-ai-backend-public" -ForegroundColor Yellow
Write-Host ""

Write-Host "CONFIGURACOES PARA O RENDER:" -ForegroundColor Cyan
Write-Host "   Nome: gabarita-ai-backend" -ForegroundColor White
Write-Host "   Repositorio: techiaemp-netizen/gabarita-ai-backend-public" -ForegroundColor White
Write-Host "   Branch: main" -ForegroundColor White
Write-Host "   Build Command: pip install -r requirements.txt" -ForegroundColor White
Write-Host "   Start Command: python src/main.py" -ForegroundColor White
Write-Host "   Health Check Path: /health" -ForegroundColor White
Write-Host ""

Write-Host "Abrindo Render Dashboard..." -ForegroundColor Yellow
Start-Process "https://dashboard.render.com/"

Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Green
Write-Host "1. Faca login no Render" -ForegroundColor White
Write-Host "2. Clique em New + > Web Service" -ForegroundColor White
Write-Host "3. Conecte o repositorio publico: techiaemp-netizen/gabarita-ai-backend-public" -ForegroundColor White
Write-Host "4. Use as configuracoes mostradas acima" -ForegroundColor White
Write-Host "5. Configure as variaveis de ambiente necessarias" -ForegroundColor White
Write-Host ""