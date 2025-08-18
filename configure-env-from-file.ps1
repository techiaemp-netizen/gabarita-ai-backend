# Script para configurar variáveis de ambiente no Render a partir de arquivo .env
# Uso: .\configure-env-from-file.ps1 -RenderApiKey "sua_api_key" -ServiceId "seu_service_id" -EnvFile ".env"

param(
    [Parameter(Mandatory=$true)]
    [string]$RenderApiKey,
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceId,
    
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env"
)

Write-Host "🔧 Configurando variáveis de ambiente no Render a partir do arquivo $EnvFile..." -ForegroundColor Cyan

# Verificar se o arquivo .env existe
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ Arquivo $EnvFile não encontrado!" -ForegroundColor Red
    Write-Host "💡 Dica: Copie o .env.example para .env e preencha com suas credenciais" -ForegroundColor Yellow
    exit 1
}

# Headers para autenticação
$headers = @{
    "Authorization" = "Bearer $RenderApiKey"
    "Content-Type" = "application/json"
}

# URL base da API do Render
$baseUrl = "https://api.render.com/v1"

# Função para definir uma variável de ambiente
function Set-RenderEnvVar {
    param(
        [string]$Key,
        [string]$Value
    )
    
    if ([string]::IsNullOrEmpty($Value) -or $Value -eq "your_*" -or $Value.StartsWith("your_")) {
        Write-Host "⚠️  Pulando $Key (valor não configurado)" -ForegroundColor Yellow
        return
    }
    
    $body = @{
        "key" = $Key
        "value" = $Value
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/services/$ServiceId/env-vars" -Method POST -Headers $headers -Body $body
        Write-Host "✅ $Key configurada com sucesso" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 422) {
            Write-Host "⚠️  $Key já existe, tentando atualizar..." -ForegroundColor Yellow
            # Tentar atualizar a variável existente
            try {
                # Primeiro, obter o ID da variável existente
                $existingVars = Invoke-RestMethod -Uri "$baseUrl/services/$ServiceId/env-vars" -Method GET -Headers $headers
                $existingVar = $existingVars | Where-Object { $_.key -eq $Key }
                
                if ($existingVar) {
                    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/services/$ServiceId/env-vars/$($existingVar.id)" -Method PATCH -Headers $headers -Body $body
                    Write-Host "✅ $Key atualizada com sucesso" -ForegroundColor Green
                }
            }
            catch {
                Write-Host "❌ Erro ao atualizar $Key : $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "❌ Erro ao configurar $Key : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Ler e processar o arquivo .env
Write-Host "\n📖 Lendo arquivo $EnvFile..." -ForegroundColor Yellow

$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line.Split("=", 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            # Remover aspas se existirem
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $envVars[$key] = $value
        }
    }
}

Write-Host "📝 Encontradas $($envVars.Count) variáveis no arquivo" -ForegroundColor Green

# Lista de variáveis importantes para configurar
$importantVars = @(
    "OPENAI_API_KEY",
    "OPENAI_API_BASE",
    "PERPLEXITY_API_KEY",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_CLIENT_ID",
    "FIREBASE_AUTH_URI",
    "FIREBASE_TOKEN_URI",
    "MERCADO_PAGO_ACCESS_TOKEN",
    "MERCADO_PAGO_WEBHOOK_SECRET",
    "SECRET_KEY",
    "DEBUG",
    "FRONTEND_URL",
    "BACKEND_URL",
    "CORS_ORIGINS"
)

Write-Host "\n🚀 Configurando variáveis no Render..." -ForegroundColor Cyan

$configuredCount = 0
$skippedCount = 0

foreach ($varName in $importantVars) {
    if ($envVars.ContainsKey($varName)) {
        Set-RenderEnvVar -Key $varName -Value $envVars[$varName]
        $configuredCount++
    }
    else {
        Write-Host "⚠️  $varName não encontrada no arquivo .env" -ForegroundColor Yellow
        $skippedCount++
    }
}

Write-Host "\n📊 Resumo da configuração:" -ForegroundColor Cyan
Write-Host "✅ Configuradas: $configuredCount variáveis" -ForegroundColor Green
Write-Host "⚠️  Puladas: $skippedCount variáveis" -ForegroundColor Yellow

Write-Host "\n🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "\n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique as variáveis no dashboard do Render" -ForegroundColor White
Write-Host "2. Faça um novo deploy para aplicar as configurações" -ForegroundColor White
Write-Host "3. Teste a API para verificar se tudo está funcionando" -ForegroundColor White

Write-Host "\n🔗 Dashboard do Render: https://dashboard.render.com/web/$ServiceId" -ForegroundColor Blue

# Verificar se as variáveis críticas foram configuradas
$criticalVars = @("OPENAI_API_KEY", "FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL")
$missingCritical = @()

foreach ($criticalVar in $criticalVars) {
    if (-not $envVars.ContainsKey($criticalVar) -or $envVars[$criticalVar].StartsWith("your_")) {
        $missingCritical += $criticalVar
    }
}

if ($missingCritical.Count -gt 0) {
    Write-Host "\n⚠️  ATENÇÃO: Variáveis críticas não configuradas:" -ForegroundColor Red
    foreach ($missing in $missingCritical) {
        Write-Host "   - $missing" -ForegroundColor Red
    }
    Write-Host "\n💡 Configure essas variáveis no arquivo .env antes de fazer o deploy" -ForegroundColor Yellow
}