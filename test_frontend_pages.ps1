# Script de Teste do Frontend Gabarita AI
# Testa todas as páginas principais do frontend

Write-Host "=== RELATÓRIO DE TESTES - GABARITA AI ==="
Write-Host "Data: $(Get-Date)"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://127.0.0.1:5000"
Write-Host ""

# Lista de páginas para testar
$pages = @(
    "/",
    "/login",
    "/signup", 
    "/planos",
    "/dashboard",
    "/simulado",
    "/questoes",
    "/ranking",
    "/noticias",
    "/ajuda",
    "/perfil",
    "/jogos"
)

Write-Host "=== TESTE DE PÁGINAS DO FRONTEND ==="
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($page in $pages) {
    $url = "http://localhost:3000$page"
    Write-Host "Testando: $url" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host " OK (Status: $($response.StatusCode))" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " Status: $($response.StatusCode)" -ForegroundColor Yellow
            $errorCount++
        }
    }
    catch {
        Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "=== TESTE DE ENDPOINTS DO BACKEND ==="
Write-Host ""

# Lista de endpoints para testar
$endpoints = @(
    @{url="/health"; method="GET"; description="Health Check"},
    @{url="/api/planos"; method="GET"; description="Listar Planos"}
)

foreach ($endpoint in $endpoints) {
    $url = "http://127.0.0.1:5000$($endpoint.url)"
    Write-Host "Testando: $($endpoint.description) - $url" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10        
        Write-Host " OK (Status: $($response.StatusCode))" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "=== RESUMO DOS TESTES ==="
Write-Host "Sucessos: $successCount" -ForegroundColor Green
Write-Host "Erros: $errorCount" -ForegroundColor Red
Write-Host "Total: $($successCount + $errorCount)"