# Script de Deploy Completo para Render com Configuração Automática de Variáveis
# Uso: .\deploy-with-env-config.ps1 [-ConfigureEnv] [-EnvFile ".env"]

param(
    [switch]$ConfigureEnv,
    [string]$EnvFile = ".env"
)

$apiKey = "rnd_fwSBtmlP5hkuFYbTWxFF83FHidRj"
$repoUrl = "https://github.com/techiaemp-netizen/gabarita-ai-backend"
$serviceName = "gabarita-ai-backend"

Write-Host "🚀 Deploy Gabarita AI Backend para Render" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Headers para autenticação
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

# Função para configurar variáveis de ambiente
function Set-RenderEnvVar {
    param(
        [string]$ServiceId,
        [string]$Key,
        [string]$Value
    )
    
    if ([string]::IsNullOrEmpty($Value) -or $Value -eq "your_*" -or $Value.StartsWith("your_")) {
        Write-Host "⚠️  Pulando $Key (valor não configurado)" -ForegroundColor Yellow
        return $false
    }
    
    $body = @{
        "key" = $Key
        "value" = $Value
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$ServiceId/env-vars" -Method POST -Headers $headers -Body $body
        Write-Host "✅ $Key configurada" -ForegroundColor Green
        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 422) {
            Write-Host "⚠️  $Key já existe" -ForegroundColor Yellow
            return $true
        }
        else {
            Write-Host "❌ Erro ao configurar $Key : $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Verificar se o serviço já existe
Write-Host "\n🔍 Verificando serviços existentes..." -ForegroundColor Yellow

try {
    $existingServices = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Headers $headers
    $existingService = $existingServices | Where-Object { $_.service.name -eq $serviceName }
    
    if ($existingService) {
        $serviceId = $existingService.service.id
        $serviceUrl = $existingService.service.serviceDetails.url
        
        Write-Host "✅ Serviço '$serviceName' já existe!" -ForegroundColor Green
        Write-Host "📋 Service ID: $serviceId" -ForegroundColor Cyan
        Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Cyan
        
        # Configurar variáveis de ambiente se solicitado
        if ($ConfigureEnv) {
            Write-Host "\n🔧 Configurando variáveis de ambiente..." -ForegroundColor Cyan
            
            if (-not (Test-Path $EnvFile)) {
                Write-Host "❌ Arquivo $EnvFile não encontrado!" -ForegroundColor Red
                Write-Host "💡 Dica: Copie o .env.example para .env e preencha com suas credenciais" -ForegroundColor Yellow
                exit 1
            }
            
            # Ler variáveis do arquivo .env
            $envVars = @{}
            Get-Content $EnvFile | ForEach-Object {
                $line = $_.Trim()
                if ($line -and -not $line.StartsWith("#")) {
                    $parts = $line.Split("=", 2)
                    if ($parts.Length -eq 2) {
                        $key = $parts[0].Trim()
                        $value = $parts[1].Trim()
                        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                            $value = $value.Substring(1, $value.Length - 2)
                        }
                        $envVars[$key] = $value
                    }
                }
            }
            
            # Configurar variáveis importantes
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
                "CORS_ORIGINS"
            )
            
            $configuredCount = 0
            foreach ($varName in $importantVars) {
                if ($envVars.ContainsKey($varName)) {
                    if (Set-RenderEnvVar -ServiceId $serviceId -Key $varName -Value $envVars[$varName]) {
                        $configuredCount++
                    }
                }
            }
            
            Write-Host "\n📊 $configuredCount variáveis configuradas" -ForegroundColor Green
        }
        
        # Trigger novo deploy
        Write-Host "\n🔄 Iniciando novo deploy..." -ForegroundColor Yellow
        try {
            $deployResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" -Method POST -Headers $headers -Body '{}'
            Write-Host "✅ Deploy iniciado com sucesso!" -ForegroundColor Green
            Write-Host "📋 Deploy ID: $($deployResponse.id)" -ForegroundColor Cyan
        }
        catch {
            Write-Host "❌ Erro ao iniciar deploy: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host "\n🎉 Processo concluído!" -ForegroundColor Green
        Write-Host "🔗 Dashboard: https://dashboard.render.com/web/$serviceId" -ForegroundColor Blue
        exit 0
    }
} catch {
    Write-Host "❌ Erro ao verificar serviços existentes: $($_.Exception.Message)" -ForegroundColor Red
}

# Criar novo serviço se não existir
Write-Host "\n🆕 Criando novo serviço..." -ForegroundColor Yellow

try {
    # Get owner ID
    $ownerResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Headers $headers
    $ownerId = $ownerResponse[0].owner.id
    
    # Create service payload
    $serviceData = @{
        type = "web_service"
        name = $serviceName
        ownerId = $ownerId
        repo = $repoUrl
        branch = "master"
        buildCommand = "pip install -r requirements.txt"
        startCommand = "python src/main.py"
        envVars = @(
            @{ key = "PYTHON_VERSION"; value = "3.11.0" }
            @{ key = "PORT"; value = "10000" }
        )
    }
    
    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body ($serviceData | ConvertTo-Json -Depth 10)
    
    $newServiceId = $response.service.id
    $newServiceUrl = $response.service.serviceDetails.url
    
    Write-Host "✅ Serviço criado com sucesso!" -ForegroundColor Green
    Write-Host "📋 Service ID: $newServiceId" -ForegroundColor Cyan
    Write-Host "🌐 Service URL: $newServiceUrl" -ForegroundColor Cyan
    
    # Configurar variáveis de ambiente se solicitado
    if ($ConfigureEnv) {
        Write-Host "\n⏳ Aguardando serviço ficar disponível..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "🔧 Configurando variáveis de ambiente..." -ForegroundColor Cyan
        
        if (Test-Path $EnvFile) {
            & ".\configure-env-from-file.ps1" -RenderApiKey $apiKey -ServiceId $newServiceId -EnvFile $EnvFile
        }
        else {
            Write-Host "⚠️  Arquivo $EnvFile não encontrado. Variáveis de ambiente não configuradas." -ForegroundColor Yellow
            Write-Host "💡 Configure manualmente no dashboard ou use o script configure-env-from-file.ps1" -ForegroundColor Yellow
        }
    }
    
    Write-Host "\n🎉 Deploy concluído!" -ForegroundColor Green
    Write-Host "🔗 Dashboard: https://dashboard.render.com/web/$newServiceId" -ForegroundColor Blue
    
} catch {
    Write-Host "❌ Erro ao criar serviço:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    
    Write-Error "Failed to create service: $($_.Exception.Message)"
}

Write-Host "\n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Aguarde o deploy completar (5-10 minutos)" -ForegroundColor White
Write-Host "2. Configure as variáveis de ambiente se não fez ainda" -ForegroundColor White
Write-Host "3. Teste a API com .\test-api.ps1" -ForegroundColor White

if (-not $ConfigureEnv) {
    Write-Host "\n💡 Dica: Use -ConfigureEnv para configurar variáveis automaticamente" -ForegroundColor Yellow
    Write-Host "   Exemplo: .\deploy-with-env-config.ps1 -ConfigureEnv" -ForegroundColor Yellow
}