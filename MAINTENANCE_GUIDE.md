# 🔧 Guia de Manutenção - Gabarita AI

## 📊 Monitoramento Contínuo

### 🎯 Métricas Principais

#### Performance
- **Tempo de Resposta da API**: < 500ms (ideal), < 2s (aceitável)
- **Tempo de Carregamento Frontend**: < 3s primeira visita, < 1s visitas subsequentes
- **Uptime**: ≥ 99.9% (máximo 8.76 horas de downtime por ano)
- **Taxa de Erro**: < 1% (ideal), < 5% (aceitável)

#### Uso de Recursos
- **CPU Backend**: < 70% em média
- **Memória Backend**: < 80% do disponível
- **Uso de Banco de Dados**: < 80% da capacidade
- **Largura de Banda**: Monitorar picos e tendências

#### Negócio
- **Taxa de Conversão de Registro**: Baseline e tendências
- **Sessões Ativas**: Picos e padrões de uso
- **Geração de Questões**: Sucesso vs falhas
- **Uso de Planos Premium**: Conversão e retenção

### 🔍 Ferramentas de Monitoramento

#### Logs
```bash
# Verificar logs do backend
tail -f /var/log/gabarita/app.log

# Filtrar erros
grep "ERROR" /var/log/gabarita/app.log | tail -20

# Monitorar requests
grep "POST\|GET\|PUT\|DELETE" /var/log/gabarita/app.log | tail -50
```

#### Health Checks
```bash
# Verificar saúde da API
curl -X GET https://api.gabarita.com/health

# Verificar conectividade do banco
curl -X GET https://api.gabarita.com/health/database

# Verificar integração OpenAI
curl -X GET https://api.gabarita.com/health/openai
```

#### Métricas de Sistema
```bash
# Uso de CPU e memória
top -p $(pgrep -f "python run.py")

# Espaço em disco
df -h

# Conexões de rede
netstat -an | grep :5000
```

## 🚨 Alertas e Notificações

### 🔴 Alertas Críticos (Ação Imediata)
- **API Down**: Resposta 5xx por > 2 minutos
- **Banco de Dados Inacessível**: Falha de conexão
- **Uso de CPU > 90%**: Por > 5 minutos
- **Uso de Memória > 95%**: Por > 2 minutos
- **Espaço em Disco < 10%**: Qualquer partição
- **Taxa de Erro > 10%**: Em 5 minutos

### 🟡 Alertas de Atenção (Monitorar)
- **Tempo de Resposta > 2s**: Média em 10 minutos
- **Taxa de Erro > 5%**: Em 15 minutos
- **Uso de CPU > 70%**: Por > 15 minutos
- **Conexões de DB > 80%**: Do pool disponível
- **Falhas de Integração OpenAI**: > 5% em 1 hora

### 📧 Configuração de Notificações
```python
# Exemplo de configuração de alertas
ALERT_CHANNELS = {
    'critical': ['email:admin@gabarita.com', 'slack:#alerts'],
    'warning': ['email:dev@gabarita.com', 'slack:#monitoring'],
    'info': ['slack:#general']
}

ALERT_THRESHOLDS = {
    'response_time': 2000,  # ms
    'error_rate': 0.05,     # 5%
    'cpu_usage': 0.70,      # 70%
    'memory_usage': 0.80,   # 80%
    'disk_usage': 0.90      # 90%
}
```

## 🔄 Procedimentos de Manutenção

### 📅 Manutenção Diária

#### Checklist Matinal (5 minutos)
- [ ] Verificar status geral do sistema
- [ ] Revisar logs de erro das últimas 24h
- [ ] Confirmar backups automáticos
- [ ] Verificar métricas de performance
- [ ] Testar endpoints críticos

```bash
#!/bin/bash
# Script de verificação diária
echo "=== Verificação Diária Gabarita AI ==="
echo "Data: $(date)"

# Health check
echo "\n1. Health Check:"
curl -s https://api.gabarita.com/health | jq .

# Últimos erros
echo "\n2. Últimos Erros (24h):"
grep "ERROR" /var/log/gabarita/app.log | tail -5

# Uso de recursos
echo "\n3. Uso de Recursos:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)"
echo "Memória: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
echo "Disco: $(df -h / | awk 'NR==2{print $5}')"

# Backup status
echo "\n4. Status do Backup:"
ls -la /backups/gabarita_*.sql | tail -1
```

### 📊 Manutenção Semanal

#### Análise de Performance (30 minutos)
- [ ] Revisar métricas de performance da semana
- [ ] Analisar logs de erro e padrões
- [ ] Verificar crescimento de dados
- [ ] Otimizar queries lentas
- [ ] Limpar logs antigos
- [ ] Atualizar documentação se necessário

```sql
-- Queries para análise semanal

-- Top 10 endpoints mais lentos
SELECT endpoint, AVG(response_time) as avg_time, COUNT(*) as requests
FROM api_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY endpoint 
ORDER BY avg_time DESC 
LIMIT 10;

-- Erros mais frequentes
SELECT error_type, COUNT(*) as occurrences
FROM error_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY error_type 
ORDER BY occurrences DESC;

-- Crescimento de usuários
SELECT DATE(created_at) as date, COUNT(*) as new_users
FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at) 
ORDER BY date;
```

### 🗓️ Manutenção Mensal

#### Otimização e Limpeza (2 horas)
- [ ] Backup completo do sistema
- [ ] Otimização do banco de dados
- [ ] Limpeza de logs antigos
- [ ] Atualização de dependências
- [ ] Revisão de segurança
- [ ] Teste de recuperação de desastres
- [ ] Análise de custos de infraestrutura

```bash
#!/bin/bash
# Script de manutenção mensal

echo "=== Manutenção Mensal Gabarita AI ==="
echo "Data: $(date)"

# Backup completo
echo "\n1. Criando backup completo..."
pg_dump $DATABASE_URL > "/backups/monthly_backup_$(date +%Y%m%d).sql"

# Limpeza de logs (manter últimos 30 dias)
echo "\n2. Limpando logs antigos..."
find /var/log/gabarita -name "*.log" -mtime +30 -delete

# Otimização do banco
echo "\n3. Otimizando banco de dados..."
psql $DATABASE_URL -c "VACUUM ANALYZE;"
psql $DATABASE_URL -c "REINDEX DATABASE gabarita_db;"

# Verificar atualizações
echo "\n4. Verificando atualizações..."
npm audit
pip list --outdated

echo "\nManutenção mensal concluída!"
```

## 🛠️ Troubleshooting

### 🔥 Problemas Comuns

#### 1. API Lenta ou Não Responsiva

**Sintomas:**
- Tempo de resposta > 5s
- Timeouts frequentes
- Usuários reportando lentidão

**Diagnóstico:**
```bash
# Verificar carga do servidor
top
htop

# Verificar conexões de banco
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Verificar logs de erro
tail -f /var/log/gabarita/app.log | grep ERROR

# Testar conectividade
curl -w "@curl-format.txt" -o /dev/null -s https://api.gabarita.com/health
```

**Soluções:**
1. Reiniciar aplicação se necessário
2. Otimizar queries lentas
3. Aumentar recursos se persistir
4. Verificar integração OpenAI

#### 2. Falhas de Autenticação

**Sintomas:**
- Usuários não conseguem fazer login
- Tokens JWT inválidos
- Erro 401/403 frequentes

**Diagnóstico:**
```bash
# Verificar logs de autenticação
grep "auth" /var/log/gabarita/app.log | tail -20

# Testar endpoint de login
curl -X POST https://api.gabarita.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Verificar configuração JWT
echo $JWT_SECRET_KEY | wc -c  # Deve ter pelo menos 32 caracteres
```

**Soluções:**
1. Verificar configuração JWT_SECRET_KEY
2. Validar formato de dados de login
3. Verificar expiração de tokens
4. Reiniciar serviço se necessário

#### 3. Falhas na Geração de Questões

**Sintomas:**
- Erro ao gerar questões
- Timeout na integração OpenAI
- Respostas vazias ou malformadas

**Diagnóstico:**
```bash
# Verificar logs da OpenAI
grep "openai" /var/log/gabarita/app.log | tail -10

# Testar chave da API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Verificar rate limits
grep "rate_limit" /var/log/gabarita/app.log
```

**Soluções:**
1. Verificar validade da chave OpenAI
2. Implementar retry logic
3. Verificar rate limits
4. Usar fallback se disponível

### 🔧 Comandos Úteis

```bash
# Reiniciar aplicação
sudo systemctl restart gabarita-api

# Ver logs em tempo real
tail -f /var/log/gabarita/app.log

# Verificar processos
ps aux | grep python

# Verificar portas
netstat -tlnp | grep :5000

# Backup rápido
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M).sql.gz

# Restaurar backup
gunzip -c backup_file.sql.gz | psql $DATABASE_URL

# Verificar espaço em disco
du -sh /var/log/gabarita/
du -sh /backups/

# Limpar cache (se aplicável)
redis-cli FLUSHALL
```

## 📋 Backup e Recuperação

### 💾 Estratégia de Backup

#### Backup Automático Diário
```bash
#!/bin/bash
# /etc/cron.daily/gabarita-backup

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M)
RETENTION_DAYS=30

# Backup do banco de dados
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup de arquivos de configuração
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" \
  /etc/gabarita/ \
  /var/log/gabarita/ \
  ~/.env*

# Limpar backups antigos
find $BACKUP_DIR -name "*backup*" -mtime +$RETENTION_DAYS -delete

# Log do backup
echo "$(date): Backup concluído - db_backup_$DATE.sql.gz" >> /var/log/backup.log
```

#### Backup Semanal Completo
```bash
#!/bin/bash
# Backup completo semanal (domingos)

if [ $(date +%u) -eq 7 ]; then
    # Backup completo do sistema
    tar -czf "/backups/full_backup_$(date +%Y%m%d).tar.gz" \
      --exclude='/proc' \
      --exclude='/sys' \
      --exclude='/dev' \
      --exclude='/tmp' \
      --exclude='/backups' \
      /
fi
```

### 🔄 Procedimentos de Recuperação

#### Recuperação do Banco de Dados
```bash
# 1. Parar aplicação
sudo systemctl stop gabarita-api

# 2. Criar backup do estado atual (precaução)
pg_dump $DATABASE_URL > current_state_backup.sql

# 3. Restaurar backup
gunzip -c backup_file.sql.gz | psql $DATABASE_URL

# 4. Verificar integridade
psql $DATABASE_URL -c "SELECT count(*) FROM users;"
psql $DATABASE_URL -c "SELECT count(*) FROM questions;"

# 5. Reiniciar aplicação
sudo systemctl start gabarita-api

# 6. Testar funcionalidades críticas
curl https://api.gabarita.com/health
```

#### Recuperação Completa do Sistema
```bash
# 1. Provisionar nova instância
# 2. Instalar dependências básicas
# 3. Restaurar arquivos de configuração
# 4. Restaurar banco de dados
# 5. Configurar variáveis de ambiente
# 6. Iniciar serviços
# 7. Verificar funcionamento
# 8. Atualizar DNS se necessário
```

## 📞 Contatos de Emergência

### 🚨 Escalação de Incidentes

**Nível 1 - Desenvolvedor Principal**
- Email: dev@gabarita.com
- Telefone: +55 11 99999-9999
- Slack: @dev-principal

**Nível 2 - DevOps/SRE**
- Email: devops@gabarita.com
- Telefone: +55 11 88888-8888
- Slack: @devops-team

**Nível 3 - CTO/Gerência**
- Email: cto@gabarita.com
- Telefone: +55 11 77777-7777
- Slack: @cto

### 🔧 Fornecedores de Serviços

**Vercel (Frontend)**
- Support: https://vercel.com/support
- Status: https://vercel-status.com

**Render (Backend)**
- Support: https://render.com/support
- Status: https://status.render.com

**OpenAI**
- Support: https://help.openai.com
- Status: https://status.openai.com

---

## 📊 Relatórios e Métricas

### 📈 Relatório Semanal Automático
```python
# weekly_report.py
import psycopg2
from datetime import datetime, timedelta

def generate_weekly_report():
    # Conectar ao banco
    conn = psycopg2.connect(DATABASE_URL)
    
    # Métricas da semana
    metrics = {
        'new_users': get_new_users_count(),
        'active_sessions': get_active_sessions(),
        'questions_generated': get_questions_count(),
        'error_rate': get_error_rate(),
        'avg_response_time': get_avg_response_time()
    }
    
    # Gerar relatório
    report = f"""
    📊 RELATÓRIO SEMANAL - GABARITA AI
    Período: {datetime.now() - timedelta(days=7)} até {datetime.now()}
    
    👥 Usuários:
    - Novos registros: {metrics['new_users']}
    - Sessões ativas: {metrics['active_sessions']}
    
    🎯 Performance:
    - Questões geradas: {metrics['questions_generated']}
    - Taxa de erro: {metrics['error_rate']:.2%}
    - Tempo médio de resposta: {metrics['avg_response_time']:.0f}ms
    
    🔍 Próximas ações:
    - [Baseado nas métricas coletadas]
    """
    
    return report
```

---

**Última Atualização**: Janeiro 2025  
**Versão**: 1.0  
**Responsável**: Equipe DevOps Gabarita AI