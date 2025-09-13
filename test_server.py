"""
Servidor Flask simples para teste
"""
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'], supports_credentials=True)

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'status': 'OK', 'message': 'Backend funcionando!'})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '')
    senha = data.get('senha', '')
    
    # Simulação de login
    usuario = {
        'id': '123',
        'nome': 'Usuário Teste',
        'email': email,
        'cargo': 'Enfermeiro na Atenção Primária',
        'bloco': 'Bloco 5',
        'vida': 85,
        'pontuacao': 1250
    }
    
    return jsonify({
        'sucesso': True,
        'usuario': usuario,
        'token': '123'
    })

@app.route('/api/questoes/gerar', methods=['POST'])
def gerar_questao():
    data = request.get_json()
    
    # Questão simulada
    questao = {
        'id': 'q123',
        'questao': 'Qual é o principal objetivo da Política Nacional de Atenção Básica?',
        'tipo': 'multipla_escolha',
        'alternativas': [
            'A) Reduzir custos do sistema de saúde',
            'B) Organizar a atenção básica como porta de entrada do SUS',
            'C) Aumentar o número de especialistas',
            'D) Privatizar serviços de saúde',
            'E) Centralizar atendimentos em hospitais'
        ],
        'tema': 'Política Nacional de Atenção Básica',
        'dificuldade': 'medio'
    }
    
    return jsonify({
        'sucesso': True,
        'questao': questao
    })

if __name__ == '__main__':
    print("🚀 Iniciando servidor de teste...")
    app.run(host='0.0.0.0', port=5001, debug=True)

