"""\nConfiguração do Firebase para o Gabarita.AI\n"""
import os
# import firebase_admin
# from firebase_admin import credentials, firestore, auth
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
        print("[FIREBASE] 🔧 Modo desenvolvimento - Firebase desabilitado temporariamente")
        self.db = None
        self.auth = None
        return
    
    def get_db(self):
        """Retorna a instância do Firestore"""
        return self.db
    
    def get_auth(self):
        """Retorna a instância do Firebase Auth"""
        return self.auth
    
    def verify_token(self, token):
        """Verifica um token Firebase"""
        print("[FIREBASE] Token verification disabled in dev mode")
        return None
    
    def create_user(self, email, password, display_name=None):
        """Cria um novo usuário"""
        print("[FIREBASE] User creation disabled in dev mode")
        return None
    
    def get_user_by_email(self, email):
        """Busca usuário por email"""
        print("[FIREBASE] User lookup disabled in dev mode")
        return None
    
    def update_user(self, uid, **kwargs):
        """Atualiza dados do usuário"""
        print("[FIREBASE] User update disabled in dev mode")
        return None
    
    def delete_user(self, uid):
        """Deleta um usuário"""
        print("[FIREBASE] User deletion disabled in dev mode")
        return None
    
    def is_connected(self):
        """Verifica se o Firebase está conectado"""
        return False
    
    def is_configured(self):
        """Verifica se o Firebase está configurado"""
        return False

# Instância global
firebase_config = FirebaseConfig()

