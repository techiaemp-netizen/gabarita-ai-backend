"""
Teste de integração com ChatGPT
"""
import os
import sys
sys.path.append('.')

from src.services.chatgpt_service import chatgpt_service

def testar_chatgpt():
    print("🧪 Testando integração com ChatGPT...")
    
    # Testar geração de questão
    cargo = "Enfermeiro na Atenção Primária"
    conteudo_edital = "Política Nacional de Atenção Básica, Estratégia Saúde da Família"
    tipo_questao = "múltipla escolha"
    
    print(f"📝 Gerando questão para: {cargo}")
    print(f"📚 Conteúdo: {conteudo_edital}")
    
    questao = chatgpt_service.gerar_questao(
        cargo=cargo,
        conteudo_edital=conteudo_edital,
        tipo_questao=tipo_questao
    )
    
    if questao:
        print("✅ Questão gerada com sucesso!")
        print(f"📋 Questão: {questao.get('questao', 'N/A')}")
        print(f"🎯 Tema: {questao.get('tema', 'N/A')}")
        print(f"📊 Dificuldade: {questao.get('dificuldade', 'N/A')}")
        print(f"🔤 Alternativas: {len(questao.get('alternativas', []))}")
        print(f"✓ Gabarito: {questao.get('gabarito', 'N/A')}")
        
        # Testar validação
        if chatgpt_service.validar_questao(questao):
            print("✅ Questão válida!")
        else:
            print("❌ Questão inválida!")
            
        return True
    else:
        print("❌ Erro ao gerar questão!")
        return False

if __name__ == "__main__":
    sucesso = testar_chatgpt()
    if sucesso:
        print("\n🎉 Teste concluído com sucesso!")
    else:
        print("\n💥 Teste falhou!")

