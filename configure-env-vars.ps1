# Script para configurar variáveis de ambiente no Render automaticamente
# Requer: Render API Key e Service ID

param(
    [Parameter(Mandatory=$true)]
    [string]$RenderApiKey,
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceId,
    
    [Parameter(Mandatory=$true)]
    [string]$OpenAIApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$PerplexityApiKey,
    
    [Parameter(Mandatory=$true)]
    [string]$FirebaseProjectId,
    
    [Parameter(Mandatory=$true)]
    [string]$FirebasePrivateKeyId,
    
    [Parameter(Mandatory=$true)]
    [string]$FirebasePrivateKey,
    
    [Parameter(Mandatory=$true)]
    [string]$FirebaseClientEmail,
    
    [Parameter(Mandatory=$true)]
    [string]$FirebaseClientId,
    
    [Parameter(Mandatory=$false)]
    [string]$MercadoPagoAccessToken,
    
    [Parameter(Mandatory=$false)]
    [string]$MercadoPagoWebhookSecret
)

Write-Host "🔧 Configurando variáveis de ambiente no Render..." -ForegroundColor Cyan

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
    
    if ([string]::IsNullOrEmpty($Value)) {
        Write-Host "⚠️  Pulando $Key (valor vazio)" -ForegroundColor Yellow
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
        Write-Host "❌ Erro ao configurar $Key : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Configurar todas as variáveis de ambiente
Write-Host "\n📝 Configurando variáveis obrigatórias..." -ForegroundColor Yellow

# OpenAI
Set-RenderEnvVar -Key "OPENAI_API_KEY" -Value $OpenAIApiKey
Set-RenderEnvVar -Key "OPENAI_API_BASE" -Value "https://api.openai.com/v1"

# Perplexity (opcional)
if ($PerplexityApiKey) {
    Set-RenderEnvVar -Key "PERPLEXITY_API_KEY" -Value $PerplexityApiKey
}

# Firebase
Set-RenderEnvVar -Key "FIREBASE_PROJECT_ID" -Value $FirebaseProjectId
Set-RenderEnvVar -Key "FIREBASE_PRIVATE_KEY_ID" -Value $FirebasePrivateKeyId
Set-RenderEnvVar -Key "FIREBASE_PRIVATE_KEY" -Value $FirebasePrivateKey
Set-RenderEnvVar -Key "FIREBASE_CLIENT_EMAIL" -Value $FirebaseClientEmail
Set-RenderEnvVar -Key "FIREBASE_CLIENT_ID" -Value $FirebaseClientId
Set-RenderEnvVar -Key "FIREBASE_AUTH_URI" -Value "https://accounts.google.com/o/oauth2/auth"
Set-RenderEnvVar -Key "FIREBASE_TOKEN_URI" -Value "https://oauth2.googleapis.com/token"

# MercadoPago (opcional)
if ($MercadoPagoAccessToken) {
    Set-RenderEnvVar -Key "MERCADO_PAGO_ACCESS_TOKEN" -Value $MercadoPagoAccessToken
}
if ($MercadoPagoWebhookSecret) {
    Set-RenderEnvVar -Key "MERCADO_PAGO_WEBHOOK_SECRET" -Value $MercadoPagoWebhookSecret
}

# Configurações da aplicação
Set-RenderEnvVar -Key "SECRET_KEY" -Value "gabarita_ai_secret_key_2025"
Set-RenderEnvVar -Key "DEBUG" -Value "False"
Set-RenderEnvVar -Key "FRONTEND_URL" -Value "https://gabaritai.app.br"
Set-RenderEnvVar -Key "CORS_ORIGINS" -Value "https://gabaritai.app.br,https://gabarita-ai-frontend-in51yjzgf-rafaels-projects-dbcb8980.vercel.app"

Write-Host "\n🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "\n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique as variáveis no dashboard do Render" -ForegroundColor White
Write-Host "2. Faça um novo deploy para aplicar as configurações" -ForegroundColor White
Write-Host "3. Teste a API para verificar se tudo está funcionando" -ForegroundColor White

Write-Host "\n🔗 Dashboard do Render: https://dashboard.render.com/web/$ServiceId" -ForegroundColor Blue