# 🛡️ ESTRUTURA DE PROTEÇÃO DO FRONTEND

## 📁 Organização de Diretórios

### ✅ VERSÃO HOMOLOGADA (PROTEGIDA)
```
gabarita-ai-frontend/          # ← VERSÃO ESTÁVEL E HOMOLOGADA
├── app/                       # Aplicação principal
├── components/                # Componentes reutilizáveis
├── utils/                     # Utilitários (auth.js, firestore.js)
├── types/                     # Definições TypeScript
├── services/                  # Serviços de API
├── config/                    # Configurações
├── public/                    # Arquivos públicos
└── package.json               # Dependências estáveis
```

### 🚫 DIRETÓRIOS A EVITAR (CONTAMINAÇÃO)
```
frontend-versions-archive/     # ← NÃO USAR - Versões antigas
Frontend Modelo 2.0/          # ← NÃO USAR - Versão experimental
TESTE 111/                    # ← NÃO USAR - Testes temporários
app/ (raiz)                   # ← NÃO USAR - Versão desatualizada
```

## 🌿 Branches de Proteção

### 🔒 Branches Protegidas
- **`frontend-stable`** - Versão homologada atual
- **`master`** - Branch principal estável
- **`main`** - Branch principal (se existir)

### ⚠️ Branches Temporárias
- **`trae-bagunça`** - Backup da versão problemática
- **`backup-*`** - Backups automáticos com timestamp

## 📋 Regras de Proteção

### ✅ PERMITIDO
1. Trabalhar apenas em `gabarita-ai-frontend/`
2. Usar branches `frontend-stable` ou `master`
3. Fazer commits pequenos e documentados
4. Testar antes de fazer push
5. Usar o script `protect-frontend.ps1`

### 🚫 PROIBIDO
1. Copiar arquivos de `frontend-versions-archive/`
2. Misturar código de diferentes versões
3. Trabalhar em branches experimentais sem backup
4. Fazer merge sem validação
5. Ignorar avisos do script de proteção

## 🔧 Ferramentas de Proteção

### 📜 Scripts Disponíveis
- **`protect-frontend.ps1`** - Validação e limpeza automática
- **`.gitignore`** - Ignora arquivos de contaminação

### 🛠️ Comandos Úteis
```powershell
# Verificar proteção
.\protect-frontend.ps1

# Limpar contaminação
Remove-ContaminationFiles

# Criar backup seguro
Create-SafeBackup

# Verificar integridade
Check-FrontendIntegrity
```

## 🚨 Sinais de Contaminação

### ❌ Arquivos Suspeitos
- Nomes com `backup`, `old`, `temp`, `test`
- Duplicatas de componentes
- Imports incorretos (`@/contexts/AuthContext`)
- Dependências conflitantes

### ❌ Comportamentos Suspeitos
- Erros TypeScript súbitos
- Componentes não encontrados
- Estilos quebrados
- Funcionalidades inconsistentes

## 🎯 Fluxo de Trabalho Seguro

### 1. Antes de Começar
```bash
git checkout frontend-stable
.\protect-frontend.ps1
```

### 2. Durante o Desenvolvimento
```bash
# Trabalhar apenas em gabarita-ai-frontend/
cd gabarita-ai-frontend
npm run dev
```

### 3. Antes de Commit
```bash
.\protect-frontend.ps1
git add .
git commit -m "feat: descrição clara"
```

### 4. Antes de Push
```bash
Create-SafeBackup
git push origin frontend-stable
```

## 📞 Suporte

Em caso de contaminação detectada:
1. Execute `Remove-ContaminationFiles`
2. Verifique com `Check-FrontendIntegrity`
3. Se necessário, restaure do backup mais recente
4. Documente o incidente para prevenção futura

---

**🛡️ Lembre-se: A proteção é responsabilidade de todos!**