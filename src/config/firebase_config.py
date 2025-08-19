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
                # Verificar se as credenciais são válidas (não são placeholders)
                firebase_project_id = os.getenv('FIREBASE_PROJECT_ID')
                firebase_private_key = os.getenv('FIREBASE_PRIVATE_KEY', '')
                firebase_client_email = os.getenv('FIREBASE_CLIENT_EMAIL')
                
                # Verificar se são credenciais reais ou placeholders
                if (firebase_project_id and 
                    firebase_private_key and 
                    firebase_client_email and
                    'placeholder' not in firebase_private_key and
                    'placeholder' not in firebase_client_email and
                    'BEGIN PRIVATE KEY' in firebase_private_key):
                    
                    # Configuração para produção usando variáveis de ambiente
                    cred_dict = {
                        "type": "service_account",
                        "project_id": firebase_project_id,
                        "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                        "private_key": firebase_private_key.replace('\\n', '\n'),
                        "client_email": firebase_client_email,
                        "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                        "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
                        "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
                    }
                    
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    print("[FIREBASE] Firebase inicializado com sucesso!")
                    
                    # Inicializar serviços apenas se Firebase foi inicializado
                    self.db = firestore.client()
                    self.auth = auth
                    print("[FIREBASE] Firestore e Auth conectados com sucesso!")
                else:
                    print("[FIREBASE] Credenciais do Firebase não encontradas ou são placeholders. Usando modo desenvolvimento.")
                    self.db = None
                    self.auth = None
                    return
            
        except Exception as e:
            print(f"[FIREBASE] Erro ao inicializar Firebase: {e}")
            print("[FIREBASE] Continuando em modo desenvolvimento sem Firebase.")
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
