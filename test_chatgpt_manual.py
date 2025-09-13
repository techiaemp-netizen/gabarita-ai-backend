#!/usr/bin/env python3
"""
Teste MANUAL de integração com ChatGPT

Este arquivo deve ser executado APENAS quando você quiser testar a integração com ChatGPT.
NÃO execute este arquivo automaticamente ou em produção.

Para executar: python test_chatgpt_manual.py
"""
import os
import sys
sys.path.append('.')

from src.services.chatgpt_service import chatgpt_service

def testar_chatgpt_manual():
    """
    Teste manual da integração com ChatGPT
    Este teste só deve ser executado quando explicitamente solicitado
    """
    print("🧪 [TESTE MANUAL] Testando integração com ChatGPT...")
    print("⚠️  Este é um teste manual - não deve ser executado automaticamente")
    
    # Testar geração de questão
    cargo = "Enfermeiro na Atenção Primária"
    conteudo_edital = "Política Nacional de Atenção Básica, Estratégia Saúde da Família"
    tipo_questao = "múltipla escolha"
    
    print(f"📝 [TESTE] Gerando questão para: {cargo}")
    print(f"📚 [TESTE] Conteúdo: {conteudo_edital}")
    
    questao = chatgpt_service.gerar_questao(
        cargo=cargo,
        conteudo_edital=conteudo_edital,
        tipo_questao=tipo_questao
    )
    
    if questao:
        print("✅ [TESTE] Questão gerada com sucesso!")
        print(f"📋 [TESTE] Questão: {questao.get('questao', 'N/A')[:100]}...")
        print(f"🎯 [TESTE] Tema: {questao.get('tema', 'N/A')}")
        print(f"📊 [TESTE] Dificuldade: {questao.get('dificuldade', 'N/A')}")
        print(f"🔤 [TESTE] Alternativas: {len(questao.get('alternativas', []))}")
        print(f"✓ [TESTE] Gabarito: {questao.get('gabarito', 'N/A')}")
        
        # Testar validação
        if chatgpt_service.validar_questao(questao):
            print("✅ [TESTE] Questão válida!")
        else:
            print("❌ [TESTE] Questão inválida!")
            
        return True
    else:
        print("❌ [TESTE] Erro ao gerar questão!")
        return False

def main():
    """
    Função principal que só executa se explicitamente chamada
    """
    print("\n" + "="*60)
    print("🔧 TESTE MANUAL DE INTEGRAÇÃO COM CHATGPT")
    print("⚠️  Este teste só deve ser executado manualmente!")
    print("="*60 + "\n")
    
    resposta = input("Deseja realmente executar o teste? (s/N): ")
    
    if resposta.lower() in ['s', 'sim', 'y', 'yes']:
        sucesso = testar_chatgpt_manual()
        if sucesso:
            print("\n🎉 [TESTE] Teste concluído com sucesso!")
        else:
            print("\n💥 [TESTE] Teste falhou!")
    else:
        print("\n❌ Teste cancelado pelo usuário.")

if __name__ == "__main__":
    main()