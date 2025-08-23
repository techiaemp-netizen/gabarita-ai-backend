# Script para verificar configuração do serviço no Render
$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"
$serviceId = "srv-d2bnbaje5dus738dm5sg"

# Headers para autenticação
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "🔍 Verificando configuração do serviço..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" -Headers $headers
    
    Write-Host "📋 Configuração atual do serviço:" -ForegroundColor Green
    Write-Host "Nome: $($response.name)"
    Write-Host "Repositório: $($response.repo)"
    Write-Host "Branch: $($response.branch)"
    Write-Host "Status: $($response.serviceDetails.status)"
    Write-Host "URL: $($response.serviceDetails.url)"
    Write-Host "Build Command: $($response.serviceDetails.buildCommand)"
    Write-Host "Start Command: $($response.serviceDetails.startCommand)"
    
} catch {
    Write-Host "❌ Erro ao verificar serviço: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Detalhes: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}