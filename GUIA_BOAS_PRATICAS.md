# 📖 GUIA DE BOAS PRÁTICAS - ISOLAMENTO DE VERSÕES

## 🎯 Objetivo
Manter a integridade da versão homologada do frontend, prevenindo contaminação com versões experimentais, backups ou código desatualizado.

## 🔒 Princípios Fundamentais

### 1. **Separação Absoluta**
- ✅ Uma pasta = Uma versão
- ✅ Uma branch = Um propósito
- ✅ Um ambiente = Uma configuração
- 🚫 Nunca misturar código de fontes diferentes

### 2. **Versionamento Disciplinado**
- ✅ Commits pequenos e frequentes
- ✅ Mensagens descritivas
- ✅ Tags para marcos importantes
- 🚫 Commits grandes e confusos

### 3. **Validação Constante**
- ✅ Testar antes de cada commit
- ✅ Executar scripts de proteção
- ✅ Verificar integridade regularmente
- 🚫 Assumir que "está funcionando"

## 📋 Checklist Diário

### 🌅 Início do Trabalho
```bash
# 1. Verificar branch atual
git branch --show-current

# 2. Executar proteção
.\protect-frontend.ps1

# 3. Verificar status
git status

# 4. Entrar no diretório correto
cd gabarita-ai-frontend
```

### 💻 Durante o Desenvolvimento
```bash
# 1. Trabalhar apenas em gabarita-ai-frontend/
# 2. Fazer commits pequenos
git add .
git commit -m "tipo: descrição clara"

# 3. Testar frequentemente
npm run dev

# 4. Verificar erros no console
# 5. Validar funcionalidades
```

### 🌙 Final do Trabalho
```bash
# 1. Executar proteção final
.\protect-frontend.ps1

# 2. Criar backup se necessário
Create-SafeBackup

# 3. Push seguro
git push origin frontend-stable

# 4. Documentar progresso
```

## 🚨 Sinais de Alerta

### ❌ Código
- Imports com `@/contexts/AuthContext`
- Arquivos com sufixos `.backup`, `.old`, `.temp`
- Componentes duplicados
- Dependências conflitantes
- Erros TypeScript súbitos

### ❌ Estrutura
- Arquivos fora de `gabarita-ai-frontend/`
- Pastas com nomes suspeitos (`backup`, `old`, `test`)
- Múltiplas versões do mesmo arquivo
- Configurações inconsistentes

### ❌ Comportamento
- Funcionalidades que param de funcionar
- Estilos quebrados
- Rotas não encontradas
- Erros de autenticação
- Performance degradada

## 🛠️ Ações Corretivas

### 🧹 Limpeza Imediata
```powershell
# Remover contaminação
Remove-ContaminationFiles

# Verificar integridade
Check-FrontendIntegrity

# Restaurar se necessário
git checkout frontend-stable
git reset --hard HEAD
```

### 🔄 Restauração Completa
```bash
# 1. Criar backup da situação atual
git checkout -b backup-problema-$(date +%Y%m%d-%H%M%S)

# 2. Voltar para versão estável
git checkout frontend-stable

# 3. Limpar dependências
cd gabarita-ai-frontend
rm -rf .next node_modules
npm install

# 4. Testar funcionamento
npm run dev
```

## 📊 Monitoramento

### 🔍 Verificações Semanais
- [ ] Executar `protect-frontend.ps1`
- [ ] Verificar tamanho do repositório
- [ ] Revisar branches ativas
- [ ] Limpar branches antigas
- [ ] Atualizar documentação

### 📈 Métricas de Qualidade
- **Tempo de build**: < 30 segundos
- **Erros TypeScript**: 0
- **Warnings**: < 5
- **Tamanho bundle**: Monitorar crescimento
- **Cobertura de testes**: Manter ou melhorar

## 🎓 Treinamento da Equipe

### 📚 Conhecimentos Essenciais
1. **Git Flow**: Branches, merges, rebases
2. **TypeScript**: Tipos, interfaces, validações
3. **Next.js**: Estrutura, roteamento, builds
4. **Debugging**: Console, DevTools, logs
5. **Proteção**: Scripts, validações, backups

### 🏆 Boas Práticas Avançadas
1. **Code Review**: Sempre revisar antes do merge
2. **Testing**: Testes unitários e integração
3. **Documentation**: Manter docs atualizadas
4. **Performance**: Monitorar e otimizar
5. **Security**: Validar inputs, sanitizar dados

## 🚀 Evolução Contínua

### 📝 Registro de Melhorias
- Documentar problemas encontrados
- Propor soluções preventivas
- Atualizar scripts de proteção
- Compartilhar aprendizados
- Revisar processos regularmente

### 🔄 Ciclo de Melhoria
1. **Identificar** problema ou oportunidade
2. **Analisar** causa raiz
3. **Implementar** solução
4. **Testar** efetividade
5. **Documentar** e compartilhar

---

## 📞 Contatos de Emergência

### 🆘 Em Caso de Crise
1. **Parar** todas as atividades
2. **Documentar** o problema
3. **Executar** restauração de emergência
4. **Comunicar** à equipe
5. **Analisar** causa pós-incidente

### 🛡️ Lema da Proteção
> "Melhor prevenir uma contaminação do que remediar um sistema quebrado."

---

**📋 Lembre-se: Estas práticas são sua primeira linha de defesa contra a contaminação de código!**