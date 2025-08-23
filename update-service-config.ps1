# Script para atualizar configuração do serviço no Render
$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"
$serviceId = "srv-d2bnbaje5dus738dm5sg"

# Headers para autenticação
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "🔧 Atualizando configuração do serviço..." -ForegroundColor Cyan

# Configuração atualizada
$updateData = @{
    buildCommand = "pip install -r requirements.txt"
    startCommand = "gunicorn --bind 0.0.0.0:10000 src.main:app"
    envVars = @(
        @{ key = "PYTHON_VERSION"; value = "3.11.0" }
        @{ key = "PORT"; value = "10000" }
    )
}

try {
    Write-Host "📋 Dados de atualização:" -ForegroundColor Yellow
    Write-Host "Build Command: $($updateData.buildCommand)"
    Write-Host "Start Command: $($updateData.startCommand)"
    
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" -Method PATCH -Headers $headers -Body ($updateData | ConvertTo-Json -Depth 10)
    
    Write-Host "✅ Configuração atualizada com sucesso!" -ForegroundColor Green
    Write-Host "Nome: $($response.name)"
    Write-Host "Build Command: $($response.serviceDetails.buildCommand)"
    Write-Host "Start Command: $($response.serviceDetails.startCommand)"
    
    # Forçar novo deploy após atualização
    Write-Host "\n🚀 Iniciando novo deploy..." -ForegroundColor Cyan
    $deployResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" -Method POST -Headers $headers
    
    Write-Host "Deploy ID: $($deployResponse.id)"
    Write-Host "Status: $($deployResponse.status)"
    
} catch {
    Write-Host "❌ Erro ao atualizar configuração: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorBody" -ForegroundColor Red
    }
}