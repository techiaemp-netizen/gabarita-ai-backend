import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import openai

# Carregar variáveis de ambiente
load_dotenv()

# Configurar OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')
openai.api_base = os.getenv('OPENAI_API_BASE')

# Configurar Firebase (usando variáveis de ambiente para desenvolvimento)
if not firebase_admin._apps:
    # Para desenvolvimento, usar credenciais de ambiente
    # Em produção, usar arquivo de credenciais
    cred_dict = {
        "type": "service_account",
        "project_id": os.getenv('FIREBASE_PROJECT_ID'),
        "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
        "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
        "client_id": os.getenv('FIREBASE_CLIENT_ID'),
        "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
        "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
    }
    
    try:
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase inicializado com sucesso!")
    except Exception as e:
        print(f"Erro ao inicializar Firebase: {e}")
        print("Continuando sem Firebase para desenvolvimento local...")

# Inicializar Firestore
try:
    db_firestore = firestore.client()
    print("Firestore conectado com sucesso!")
except Exception as e:
    print(f"Erro ao conectar Firestore: {e}")
    db_firestore = None

from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.questoes import questoes_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configurações da aplicação
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'gabarita_ai_secret_key_2025')
app.config['DEBUG'] = os.getenv('DEBUG', 'True').lower() == 'true'

# Configurar CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
CORS(app, origins=cors_origins, supports_credentials=True)

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(questoes_bp, url_prefix='/api/questoes')

# Configuração do SQLite para desenvolvimento local (backup)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
