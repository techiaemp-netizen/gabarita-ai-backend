"""
Teste de integração com Perplexity
"""
import os
import sys
sys.path.append('.')

from src.services.perplexity_service import perplexity_service

def testar_perplexity():
    print("🧪 Testando integração com Perplexity...")
    
    # Testar geração de feedback
    questao = "Qual é o principal objetivo da Estratégia Saúde da Família?"
    alternativa_escolhida = "A"
    alternativa_correta = "B"
    tema = "Política Nacional de Atenção Básica"
    
    print(f"📝 Gerando feedback para erro em: {tema}")
    print(f"❌ Alternativa escolhida: {alternativa_escolhida}")
    print(f"✅ Alternativa correta: {alternativa_correta}")
    
    feedback = perplexity_service.gerar_feedback_erro(
        questao=questao,
        alternativa_escolhida=alternativa_escolhida,
        alternativa_correta=alternativa_correta,
        tema=tema
    )
    
    if feedback:
        print("✅ Feedback gerado com sucesso!")
        print(f"📚 Explicação: {feedback.get('explicacao_erro', 'N/A')[:100]}...")
        print(f"💡 Conceitos: {feedback.get('conceitos_importantes', 'N/A')[:100]}...")
        print(f"🔗 Fontes: {len(feedback.get('fontes_estudo', []))} links")
        print(f"💭 Dicas: {feedback.get('dicas', 'N/A')[:100]}...")
        return True
    else:
        print("❌ Erro ao gerar feedback!")
        return False

def testar_pesquisa():
    print("\n🔍 Testando pesquisa de conteúdo...")
    
    tema = "Estratégia Saúde da Família"
    
    resultado = perplexity_service.pesquisar_conteudo(tema)
    
    if resultado:
        print("✅ Pesquisa realizada com sucesso!")
        print(f"📄 Conteúdo: {resultado[:200]}...")
        return True
    else:
        print("❌ Erro na pesquisa!")
        return False

if __name__ == "__main__":
    sucesso1 = testar_perplexity()
    sucesso2 = testar_pesquisa()
    
    if sucesso1 and sucesso2:
        print("\n🎉 Todos os testes concluídos com sucesso!")
    else:
        print("\n💥 Alguns testes falharam!")

