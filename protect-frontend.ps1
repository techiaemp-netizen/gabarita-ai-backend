# ========================================
# SCRIPT DE PROTECAO DO FRONTEND HOMOLOGADO
# ========================================

Write-Host "PROTECAO DO FRONTEND HOMOLOGADO" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Funcao para verificar branch atual
function Check-CurrentBranch {
    Write-Host "Verificando branch atual..." -ForegroundColor Cyan
    
    try {
        $currentBranch = git branch --show-current
        Write-Host "   Branch atual: $currentBranch" -ForegroundColor White
        
        if ($currentBranch -eq "frontend-stable") {
            Write-Host "   Status: PROTEGIDA" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   Status: NAO PROTEGIDA" -ForegroundColor Yellow
            Write-Host "   Recomendacao: Use 'git checkout frontend-stable'" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "   Erro ao verificar branch: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funcao para identificar arquivos de contaminacao
function Find-ContaminationFiles {
    Write-Host "Procurando arquivos de contaminacao..." -ForegroundColor Cyan
    
    $patterns = @(
        "*backup*", "*old*", "*temp*", "*test*",
        "*experimental*", "*draft*", "*wip*", "*.bak",
        "*.tmp", "*~", "*.orig", "*.rej"
    )
    
    $contaminationFiles = @()
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path "." -Recurse -Name $pattern -ErrorAction SilentlyContinue
        if ($files) {
            $contaminationFiles += $files
        }
    }
    
    if ($contaminationFiles.Count -gt 0) {
        Write-Host "   CONTAMINACAO DETECTADA:" -ForegroundColor Red
        foreach ($file in $contaminationFiles) {
            Write-Host "   - $file" -ForegroundColor Red
        }
        return $contaminationFiles
    } else {
        Write-Host "   Nenhum arquivo de contaminacao encontrado" -ForegroundColor Green
        return @()
    }
}

# Funcao para remover arquivos de contaminacao
function Remove-ContaminationFiles {
    param([array]$files)
    
    if ($files.Count -eq 0) {
        Write-Host "Nenhum arquivo para remover" -ForegroundColor Green
        return $true
    }
    
    Write-Host "Removendo arquivos de contaminacao..." -ForegroundColor Cyan
    
    $removedCount = 0
    foreach ($file in $files) {
         try {
             if (Test-Path $file) {
                 Remove-Item $file -Force -Recurse -Confirm:$false
                 Write-Host "   Removido: $file" -ForegroundColor Green
                 $removedCount++
             }
         } catch {
             Write-Host "   Erro ao remover $file`: $($_.Exception.Message)" -ForegroundColor Red
         }
     }
    
    Write-Host "Total removido: $removedCount arquivos" -ForegroundColor Cyan
    return $removedCount -eq $files.Count
}

# Funcao para verificar integridade do frontend
function Check-FrontendIntegrity {
    Write-Host "Verificando integridade do frontend..." -ForegroundColor Cyan
    
    $essentialFiles = @(
        "package.json",
        "next.config.js",
        "tailwind.config.js",
        "app/layout.tsx",
        "app/page.tsx"
    )
    
    $missingFiles = @()
    $existingFiles = @()
    
    foreach ($file in $essentialFiles) {
        if (Test-Path $file) {
            $existingFiles += $file
            Write-Host "   OK: $file" -ForegroundColor Green
        } else {
            $missingFiles += $file
            Write-Host "   FALTANDO: $file" -ForegroundColor Red
        }
    }
    
    $integrityScore = ($existingFiles.Count / $essentialFiles.Count) * 100
    Write-Host "Pontuacao de integridade: $integrityScore%" -ForegroundColor Cyan
    
    return $missingFiles.Count -eq 0
}

# Funcao para criar backup seguro
function Create-SecureBackup {
    Write-Host "Criando backup seguro..." -ForegroundColor Cyan
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupName = "frontend-stable-backup-$timestamp"
    
    try {
        # Criar backup usando Git
        git tag $backupName
        Write-Host "   Backup criado: $backupName" -ForegroundColor Green
        
        # Listar ultimos 3 backups
        $tags = git tag --sort=-creatordate | Select-Object -First 3
        Write-Host "   Ultimos backups:" -ForegroundColor Cyan
        foreach ($tag in $tags) {
            Write-Host "   - $tag" -ForegroundColor White
        }
        
        return $true
    } catch {
        Write-Host "   Erro ao criar backup: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Execucao principal
Write-Host "Iniciando verificacao de protecao..." -ForegroundColor Yellow

$branchOk = Check-CurrentBranch
$contaminationFiles = Find-ContaminationFiles
$cleanupOk = Remove-ContaminationFiles -files $contaminationFiles
$integrityOk = Check-FrontendIntegrity
$backupOk = Create-SecureBackup

Write-Host "RELATORIO DE PROTECAO" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta
Write-Host "Branch protegida: $(if($branchOk){'SIM'}else{'NAO'})" -ForegroundColor White
Write-Host "Limpeza realizada: $(if($cleanupOk){'SIM'}else{'NAO'})" -ForegroundColor White
Write-Host "Integridade: $(if($integrityOk){'SIM'}else{'NAO'})" -ForegroundColor White
Write-Host "Backup criado: $(if($backupOk){'SIM'}else{'NAO'})" -ForegroundColor White

if ($branchOk -and $cleanupOk -and $integrityOk -and $backupOk) {
    Write-Host "FRONTEND PROTEGIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "Sistema pronto para uso seguro" -ForegroundColor Green
    exit 0
} else {
    Write-Host "PROTECAO PARCIAL - Alguns itens falharam" -ForegroundColor Yellow
    Write-Host "Revise os itens marcados como NAO" -ForegroundColor Yellow
    exit 1
}

Write-Host "PROTECAO CONCLUIDA" -ForegroundColor Green