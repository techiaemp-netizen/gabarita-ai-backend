# Script para forçar novo deploy no Render
$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"
$serviceId = "srv-d2bnbaje5dus738dm5sg"

# Headers para autenticação
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "🚀 Forçando novo deploy no Render..." -ForegroundColor Cyan

try {
    # Trigger manual deploy
    $deployResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" -Method POST -Headers $headers
    
    Write-Host "✅ Deploy iniciado com sucesso!" -ForegroundColor Green
    Write-Host "Deploy ID: $($deployResponse.id)"
    Write-Host "Status: $($deployResponse.status)"
    Write-Host "Commit: $($deployResponse.commit.id)"
    Write-Host "Branch: $($deployResponse.commit.branch)"
    
    Write-Host "\n⏳ Aguardando deploy..." -ForegroundColor Yellow
    
    # Wait and check deploy status
    do {
        Start-Sleep -Seconds 10
        $statusResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys/$($deployResponse.id)" -Headers $headers
        Write-Host "Status atual: $($statusResponse.status)" -ForegroundColor Yellow
    } while ($statusResponse.status -eq "build_in_progress" -or $statusResponse.status -eq "update_in_progress")
    
    if ($statusResponse.status -eq "live") {
        Write-Host "\n🎉 Deploy concluído com sucesso!" -ForegroundColor Green
        Write-Host "Serviço está online: https://gabarita-ai-backend.onrender.com"
    } else {
        Write-Host "\n❌ Deploy falhou. Status: $($statusResponse.status)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erro ao forçar deploy: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}