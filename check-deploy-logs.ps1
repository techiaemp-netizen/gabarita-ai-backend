# Script para verificar logs do deploy no Render
$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"
$serviceId = "srv-d2bnbaje5dus738dm5sg"
$deployId = "dep-d2kpnbripnbc73fe2v7g"

# Headers para autenticação
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "📋 Verificando logs do deploy..." -ForegroundColor Cyan

try {
    # Get deploy details
    $deployResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys/$deployId" -Headers $headers
    
    Write-Host "\n📊 Detalhes do Deploy:" -ForegroundColor Green
    Write-Host "ID: $($deployResponse.id)"
    Write-Host "Status: $($deployResponse.status)"
    Write-Host "Commit: $($deployResponse.commit.id)"
    Write-Host "Mensagem: $($deployResponse.commit.message)"
    Write-Host "Criado em: $($deployResponse.createdAt)"
    Write-Host "Finalizado em: $($deployResponse.finishedAt)"
    
    # Get build logs
    Write-Host "\n📝 Logs do Build:" -ForegroundColor Yellow
    $logsResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys/$deployId/logs" -Headers $headers
    
    foreach ($log in $logsResponse) {
        Write-Host "[$($log.timestamp)] $($log.message)"
    }
    
} catch {
    Write-Host "❌ Erro ao verificar logs: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}