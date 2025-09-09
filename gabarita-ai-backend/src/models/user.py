from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    """Modelo de usuário para o sistema Gabarita AI"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(80), nullable=False)
    nome = db.Column(db.String(120), nullable=True)
    plano = db.Column(db.String(50), default='trial', nullable=False)
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Campos de configurações (JSON)
    configuracoes = db.Column(db.JSON, default=lambda: {
        'notificacoes': True,
        'tema': 'claro'
    })
    
    # Campos de estatísticas
    questoes_respondidas = db.Column(db.Integer, default=0)
    acertos = db.Column(db.Integer, default=0)
    erros = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        """Converte o usuário para dicionário"""
        data = {
            'id': self.id,
            'email': self.email,
            'nickname': self.nickname,
            'nome': self.nome,
            'plano': self.plano,
            'ativo': self.ativo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'configuracoes': self.configuracoes or {},
            'questoes_respondidas': self.questoes_respondidas,
            'acertos': self.acertos,
            'erros': self.erros
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
            
        return data
    
    @classmethod
    def create_user(cls, email, password, nickname=None, nome=None):
        """Cria um novo usuário"""
        user = cls(
            email=email.lower().strip(),
            nickname=nickname or email.split('@')[0],
            nome=nome or nickname or email.split('@')[0]
        )
        user.set_password(password)
        return user
    
    @classmethod
    def find_by_email(cls, email):
        """Busca usuário por email"""
        return cls.query.filter_by(email=email.lower().strip()).first()
    
    def update_stats(self, acertou=None):
        """Atualiza estatísticas do usuário"""
        self.questoes_respondidas += 1
        if acertou is True:
            self.acertos += 1
        elif acertou is False:
            self.erros += 1
        self.updated_at = datetime.utcnow()
