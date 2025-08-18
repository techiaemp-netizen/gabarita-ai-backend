"""
Configuração do Firebase para o Gabarita.AI
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

class FirebaseConfig:
    """Classe para gerenciar configurações do Firebase"""
    
    def __init__(self):
        self.db = None
        self.auth = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Inicializa o Firebase com as credenciais"""
        try:
            if not firebase_admin._apps:
                # Configuração para desenvolvimento usando variáveis de ambiente
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
                
                # Verificar se todas as credenciais estão presentes
                if all(cred_dict.values()):
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    print("[FIREBASE] Firebase inicializado com sucesso!")
                    
                    # Inicializar serviços apenas se Firebase foi inicializado
                    self.db = firestore.client()
                    self.auth = auth
                    print("[FIREBASE] Firestore e Auth conectados com sucesso!")
                else:
                    print("[FIREBASE] Credenciais do Firebase não encontradas. Usando modo desenvolvimento.")
                    self.db = None
                    self.auth = None
                    return
            
        except Exception as e:
            print(f"[FIREBASE] Erro ao inicializar Firebase: {e}")
            self.db = None
            self.auth = None
    
    def get_db(self):
        """Retorna a instância do Firestore"""
        return self.db
    
    def get_auth(self):
        """Retorna a instância do Auth"""
        return self.auth
    
    def is_connected(self):
        """Verifica se o Firebase está conectado"""
        return self.db is not None

# Instância global do Firebase
firebase_config = FirebaseConfig()

