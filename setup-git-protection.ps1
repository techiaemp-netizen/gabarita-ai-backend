# ========================================
# CONFIGURACAO DE PROTECOES GIT AUTOMATICAS
# ========================================

Write-Host "Configurando protecoes Git automaticas" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Funcao para criar hook pre-commit
function Create-PreCommitHook {
    Write-Host "Criando hook pre-commit..." -ForegroundColor Cyan
    
    $hookPath = ".git/hooks/pre-commit"
    $hookContent = @'
#!/bin/sh
# Hook pre-commit para protecao contra contaminacao

echo "Verificando protecao antes do commit..."

# Verificar arquivos de contaminacao
contamination_files=$(git diff --cached --name-only | grep -E "(backup|old|temp|test|experimental|draft|wip)")

if [ ! -z "$contamination_files" ]; then
    echo "COMMIT BLOQUEADO: Arquivos de contaminacao detectados:"
    echo "$contamination_files"
    echo "Execute o script de limpeza antes de fazer commit"
    exit 1
fi

echo "Verificacoes de protecao aprovadas"
exit 0
'@
    
    try {
        if (!(Test-Path ".git/hooks")) {
            New-Item -ItemType Directory -Path ".git/hooks" -Force | Out-Null
        }
        
        $hookContent | Out-File -FilePath $hookPath -Encoding UTF8
        Write-Host "   Hook pre-commit criado" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   Erro ao criar hook: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funcao para configurar Git
function Configure-GitSettings {
    Write-Host "Configurando settings Git..." -ForegroundColor Cyan
    
    try {
        git config pull.rebase true
        Write-Host "   Configurado pull.rebase = true" -ForegroundColor Green
        
        git config push.default current
        Write-Host "   Configurado push.default = current" -ForegroundColor Green
        
        git config status.showUntrackedFiles all
        Write-Host "   Configurado status.showUntrackedFiles = all" -ForegroundColor Green
        
        git config color.ui auto
        Write-Host "   Configurado color.ui = auto" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "   Erro na configuracao: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funcao para criar aliases uteis
function Create-GitAliases {
    Write-Host "Criando aliases Git uteis..." -ForegroundColor Cyan
    
    try {
        git config alias.st "status"
        git config alias.co "checkout"
        git config alias.br "branch"
        git config alias.ci "commit"
        git config alias.unstage "reset HEAD --"
        git config alias.last "log -1 HEAD"
        git config alias.protect "!powershell.exe -ExecutionPolicy Bypass -File protect-frontend.ps1"
        
        Write-Host "   Aliases criados com sucesso" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   Erro ao criar aliases: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funcao para testar configuracoes
function Test-GitConfiguration {
    Write-Host "Testando configuracoes..." -ForegroundColor Cyan
    
    $passedTests = 0
    $totalTests = 4
    
    # Teste 1: Hook pre-commit
    if (Test-Path ".git/hooks/pre-commit") {
        Write-Host "   Hook pre-commit OK" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "   Hook pre-commit FALHOU" -ForegroundColor Red
    }
    
    # Teste 2: Config pull.rebase
    $pullRebase = git config pull.rebase
    if ($pullRebase -eq "true") {
        Write-Host "   Config pull.rebase OK" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "   Config pull.rebase FALHOU" -ForegroundColor Red
    }
    
    # Teste 3: Config push.default
    $pushDefault = git config push.default
    if ($pushDefault -eq "current") {
        Write-Host "   Config push.default OK" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "   Config push.default FALHOU" -ForegroundColor Red
    }
    
    # Teste 4: Alias protect
    $aliasProtect = git config alias.protect
    if ($aliasProtect) {
        Write-Host "   Alias protect OK" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "   Alias protect FALHOU" -ForegroundColor Red
    }
    
    Write-Host "Testes aprovados: $passedTests/$totalTests" -ForegroundColor Cyan
    return $passedTests -eq $totalTests
}

# Execucao principal
Write-Host "Iniciando configuracao..." -ForegroundColor Yellow

$preCommitOk = Create-PreCommitHook
$configOk = Configure-GitSettings
$aliasesOk = Create-GitAliases
$testsOk = Test-GitConfiguration

Write-Host "RELATORIO DE CONFIGURACAO" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta
Write-Host "Hook pre-commit: $(if($preCommitOk){'OK'}else{'FALHOU'})" -ForegroundColor White
Write-Host "Configuracoes Git: $(if($configOk){'OK'}else{'FALHOU'})" -ForegroundColor White
Write-Host "Aliases Git: $(if($aliasesOk){'OK'}else{'FALHOU'})" -ForegroundColor White
Write-Host "Testes: $(if($testsOk){'OK'}else{'FALHOU'})" -ForegroundColor White

if ($preCommitOk -and $configOk -and $aliasesOk -and $testsOk) {
    Write-Host "CONFIGURACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Green
    Write-Host "NOVOS COMANDOS DISPONIVEIS:" -ForegroundColor Cyan
    Write-Host "   git protect     - Executar verificacao de protecao" -ForegroundColor White
    Write-Host "   git st          - Status resumido" -ForegroundColor White
    Write-Host "   git co          - Checkout" -ForegroundColor White
    Write-Host "   git br          - Branch" -ForegroundColor White
} else {
    Write-Host "CONFIGURACAO PARCIAL - Alguns itens falharam" -ForegroundColor Yellow
}

Write-Host "PROTECOES GIT ATIVADAS" -ForegroundColor Green