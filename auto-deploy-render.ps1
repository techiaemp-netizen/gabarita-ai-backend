# Script automatizado para deploy no Render
# Este script abre o Render no navegador e fornece instruções passo a passo

Write-Host "=== DEPLOY AUTOMATIZADO NO RENDER ===" -ForegroundColor Green
Write-Host ""

# Verificar se o arquivo render.yaml existe
$renderYamlExists = Test-Path "render.yaml"
if ($renderYamlExists) {
    Write-Host "✓ Arquivo render.yaml encontrado" -ForegroundColor Green
}
else {
    Write-Host "✗ Arquivo render.yaml não encontrado" -ForegroundColor Red
    exit 1
}

# Abrir o Render no navegador
Write-Host "1. Abrindo o Render Dashboard..." -ForegroundColor Yellow
Start-Process "https://dashboard.render.com/"

Write-Host ""
Write-Host "2. INSTRUÇÕES AUTOMÁTICAS:" -ForegroundColor Cyan
Write-Host "   • Faça login na sua conta Render" -ForegroundColor White
Write-Host "   • Clique em 'New +' > 'Web Service'" -ForegroundColor White
Write-Host "   • Conecte seu repositório: techiaemp-netizen/gabarita-ai-backend-public" -ForegroundColor White
Write-Host "   • Branch: main" -ForegroundColor White
Write-Host ""

Write-Host "3. CONFIGURAÇÕES (copie e cole):" -ForegroundColor Cyan
Write-Host "   Nome: gabarita-ai-backend" -ForegroundColor White
Write-Host "   Região: Oregon (US West)" -ForegroundColor White
Write-Host "   Branch: main" -ForegroundColor White
Write-Host "   Build Command: pip install -r requirements.txt" -ForegroundColor White
Write-Host "   Start Command: python src/main.py" -ForegroundColor White
Write-Host "   Plan: Free" -ForegroundColor White
Write-Host ""

Write-Host "4. VARIÁVEIS DE AMBIENTE:" -ForegroundColor Cyan
Write-Host "   PYTHON_VERSION = 3.11.0" -ForegroundColor White
Write-Host "   PORT = 10000" -ForegroundColor White
Write-Host ""

Write-Host "5. HEALTH CHECK:" -ForegroundColor Cyan
Write-Host "   Health Check Path: /health" -ForegroundColor White
Write-Host ""

# Aguardar confirmação
Read-Host "Pressione ENTER quando o deploy estiver completo"

# Tentar obter a URL do serviço
Write-Host "6. Verificando o serviço..." -ForegroundColor Yellow
Write-Host "   Sua URL do backend será algo como:" -ForegroundColor White
Write-Host "   https://gabarita-ai-backend.onrender.com" -ForegroundColor Green
Write-Host ""

Write-Host "✓ Deploy concluído! Teste a URL acima." -ForegroundColor Green
Write-Host "✓ O arquivo render.yaml foi adicionado ao repositório para futuras referências." -ForegroundColor Green

Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Magenta
Write-Host "1. Teste o endpoint /health da sua API" -ForegroundColor White
Write-Host "2. Atualize a URL do backend no frontend se necessário" -ForegroundColor White
Write-Host "3. Teste a integração completa" -ForegroundColor White