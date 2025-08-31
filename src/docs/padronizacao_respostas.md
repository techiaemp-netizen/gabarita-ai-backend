# Padronização de Respostas JSON

## Problema Identificado

O projeto possui inconsistências nos formatos de resposta JSON entre diferentes rotas:

### Padrões Encontrados:

1. **Padrão Inglês (success/error/data)**:
   - `{'sucesso': True, 'dados': {...}}`
- `{'sucesso': False, 'erro': 'mensagem'}`
   - Usado em: questoes.py, simulados.py, usuarios.py (deploy), opcoes.py (deploy)

2. **Padrão Português (sucesso/erro/dados)**:
   - `{'sucesso': True, 'dados': {...}}`
   - `{'sucesso': False, 'erro': 'mensagem'}`
   - Usado em: auth.py, usuarios.py, opcoes.py, planos.py

3. **Padrões Mistos**:
   - `{'sucesso': True, 'usuario': {...}}` (auth.py)
   - `{'erro': 'mensagem'}` (sem campo sucesso)

## Padrão Unificado Adotado

**Usar português em todas as respostas:**

```json
{
  "sucesso": boolean,
  "dados": any,
  "erro": string (opcional)
}
```

### Casos Especiais:

1. **Autenticação** - manter campo `usuario` para compatibilidade:
```json
{
  "sucesso": true,
  "usuario": {...},
  "token": "..."
}
```

2. **Erros** - sempre incluir campo `sucesso`:
```json
{
  "sucesso": false,
  "erro": "Mensagem de erro"
}
```

## Arquivos a Serem Modificados

1. `src/routes/questoes.py` - converter success/error/data para sucesso/erro/dados
2. `src/routes/simulados.py` - converter success/error/data para sucesso/erro/dados
3. `src/routes/opcoes.py` (deploy) - converter success/error/data para sucesso/erro/dados
4. `src/routes/usuarios.py` (deploy) - converter success/error/data para sucesso/erro/dados
5. `src/main.py` - converter stubs de success/data para sucesso/dados

## Implementação

As mudanças serão feitas gradualmente, arquivo por arquivo, mantendo a funcionalidade existente.