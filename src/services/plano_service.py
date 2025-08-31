from datetime import datetime, timedelta
from firebase_admin import firestore
from config.firebase_config import firebase_config
from utils.logger import StructuredLogger, log_database_operation

class PlanoService:
    """Serviço para gerenciamento de planos de usuário"""
    
    # Definição dos tipos de planos disponíveis
    TIPOS_PLANOS = {
        'gratuito': 'gratuito',
        'trial': 'trial',
        'promo': 'promo',
        'lite': 'lite',
        'premium': 'premium',
        'premium_plus': 'premium_plus',
        'black': 'black'
    }
    
    # Configuração de duração dos planos (em dias)
    DURACAO_PLANOS = {
        'gratuito': None,  # Sem expiração
        'trial': None,     # Sem expiração
        'promo': 7,        # 7 dias
        'lite': 30,        # 30 dias
        'premium': 60,     # 60 dias
        'premium_plus': 60, # 60 dias
        'black': None      # Até data específica (5 de dezembro de 2025)
    }
    
    # Data de expiração específica para plano black
    DATA_EXPIRACAO_BLACK = datetime(2025, 12, 5, 23, 59, 59)
    
    # Configuração de renovação dos planos
    RENOVACAO_PLANOS = {
        'gratuito': False,
        'trial': False,      # Não renova
        'promo': False,      # Não renova (só pode usar 1x por usuário)
        'lite': True,        # Renova mediante pagamento
        'premium': True,     # Renova mediante pagamento
        'premium_plus': True, # Renova mediante pagamento
        'black': False       # Não renova
    }
    
    # Preços dos planos
    PRECOS_PLANOS = {
        'gratuito': 0.00,
        'trial': 0.00,
        'promo': 5.90,
        'lite': 14.90,
        'premium': 20.00,
        'premium_plus': 40.00,
        'black': 70.00
    }
    
    # Recursos disponíveis por plano
    RECURSOS_PLANOS = {
        'gratuito': {
            'questoes_limitadas': True,
            'limite_questoes': 3,
            'simulados': False,
            'relatorios': False,
            'ranking': False,
            'suporte': False,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'trial': {
            'questoes_limitadas': True,
            'limite_questoes': 3,
            'simulados': False,
            'relatorios': False,
            'ranking': False,
            'suporte': False,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'promo': {
            'questoes_limitadas': False,
            'limite_questoes': None,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'lite': {
            'questoes_limitadas': False,
            'limite_questoes': None,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'premium': {
            'questoes_limitadas': False,
            'limite_questoes': None,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'premium_plus': {
            'questoes_limitadas': False,
            'limite_questoes': None,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': True,
            'modo_foco': True,
            'redacao': False
        },
        'black': {
            'questoes_limitadas': False,
            'limite_questoes': None,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': True,
            'modo_foco': True,
            'redacao': True
        }
    }
    
    def __init__(self):
        self.db = firebase_config.get_db() if firebase_config.is_connected() else None
        self.logger = StructuredLogger("plano_service")
    
    @log_database_operation(StructuredLogger(__name__), "obter_plano_usuario")
    def obter_plano_usuario(self, user_id):
        """Obtém o plano atual do usuário"""
        try:
            self.logger.info("Obtendo plano do usuário", extra={'user_id': user_id})
            
            if not self.db:
                self.logger.warning("Database não conectado, retornando plano padrão", extra={'user_id': user_id})
                return self._plano_padrao()
            
            user_doc = self.db.collection('usuarios').document(user_id).get()
            if not user_doc.exists:
                self.logger.info("Usuário não encontrado, retornando plano padrão", extra={'user_id': user_id})
                return self._plano_padrao()
            
            user_data = user_doc.to_dict()
            plano_info = user_data.get('plano', {})
            
            # Verificar se o plano ainda está válido
            if self._plano_expirado(plano_info):
                self.logger.info("Plano expirado, revertendo para gratuito", extra={
                    'user_id': user_id,
                    'plano_tipo': plano_info.get('tipo', 'N/A')
                })
                # Plano expirado, reverter para gratuito
                self._reverter_plano_gratuito(user_id)
                return self._plano_padrao()
            
            self.logger.info("Plano obtido com sucesso", extra={
                'user_id': user_id,
                'plano_tipo': plano_info.get('tipo', 'N/A')
            })
            
            return plano_info
            
        except Exception as e:
            self.logger.error("Erro ao obter plano do usuário", extra={
                'error': str(e),
                'user_id': user_id
            })
            print(f"Erro ao obter plano do usuário: {e}")
            return self._plano_padrao()
    
    @log_database_operation(StructuredLogger(__name__), "ativar_plano")
    def ativar_plano(self, user_id, tipo_plano, metodo_pagamento=None):
        """Ativa um plano para o usuário"""
        try:
            self.logger.info("Iniciando ativação de plano", extra={
                'user_id': user_id,
                'tipo_plano': tipo_plano,
                'metodo_pagamento': metodo_pagamento
            })
            
            if tipo_plano not in self.TIPOS_PLANOS.values():
                self.logger.error("Tipo de plano inválido", extra={
                    'user_id': user_id,
                    'tipo_plano': tipo_plano
                })
                raise ValueError(f"Tipo de plano inválido: {tipo_plano}")
            
            # Verificar se usuário já usou plano promo
            if tipo_plano == 'promo' and self._usuario_ja_usou_promo(user_id):
                self.logger.warning("Usuário já utilizou plano promocional", extra={
                    'user_id': user_id,
                    'tipo_plano': tipo_plano
                })
                raise ValueError("Usuário já utilizou o plano promocional")
            
            # Calcular data de expiração
            data_expiracao = self._calcular_data_expiracao(tipo_plano)
            
            plano_info = {
                'tipo': tipo_plano,
                'data_ativacao': datetime.now().isoformat(),
                'data_expiracao': data_expiracao.isoformat() if data_expiracao else None,
                'ativo': True,
                'metodo_pagamento': metodo_pagamento,
                'pode_renovar': self.RENOVACAO_PLANOS.get(tipo_plano, False)
            }
            
            if not self.db:
                return plano_info
            
            # Atualizar no Firestore (usar set com merge=True para criar se não existir)
            self.db.collection('usuarios').document(user_id).set({
                'plano': plano_info,
                'data_ultima_atualizacao': datetime.now().isoformat()
            }, merge=True)
            
            # Registrar histórico de planos
            self._registrar_historico_plano(user_id, plano_info)
            
            self.logger.info("Plano ativado com sucesso", extra={
                'user_id': user_id,
                'tipo_plano': tipo_plano,
                'data_expiracao': data_expiracao.isoformat() if data_expiracao else None
            })
            
            return plano_info
            
        except Exception as e:
            self.logger.error("Erro ao ativar plano", extra={
                'error': str(e),
                'user_id': user_id,
                'tipo_plano': tipo_plano
            })
            print(f"Erro ao ativar plano: {e}")
            raise e
    
    @log_database_operation(StructuredLogger(__name__), "verificar_acesso_recurso")
    def verificar_acesso_recurso(self, user_id, recurso):
        """Verifica se o usuário tem acesso a um recurso específico"""
        try:
            self.logger.info("Verificando acesso a recurso", extra={
                'user_id': user_id,
                'recurso': recurso
            })
            
            plano = self.obter_plano_usuario(user_id)
            tipo_plano = plano.get('tipo', 'gratuito')
            
            recursos = self.RECURSOS_PLANOS.get(tipo_plano, self.RECURSOS_PLANOS['gratuito'])
            tem_acesso = recursos.get(recurso, False)
            
            self.logger.info("Verificação de acesso concluída", extra={
                'user_id': user_id,
                'recurso': recurso,
                'tipo_plano': tipo_plano,
                'tem_acesso': tem_acesso
            })
            
            return tem_acesso
            
        except Exception as e:
            self.logger.error("Erro ao verificar acesso ao recurso", extra={
                'error': str(e),
                'user_id': user_id,
                'recurso': recurso
            })
            print(f"Erro ao verificar acesso ao recurso: {e}")
            return False
    
    @log_database_operation(StructuredLogger(__name__), "obter_limite_questoes")
    def obter_limite_questoes(self, user_id):
        """Obtém o limite de questões para o usuário"""
        try:
            self.logger.info("Obtendo limite de questões", extra={
                'user_id': user_id
            })
            
            plano = self.obter_plano_usuario(user_id)
            tipo_plano = plano.get('tipo', 'gratuito')
            
            recursos = self.RECURSOS_PLANOS.get(tipo_plano, self.RECURSOS_PLANOS['gratuito'])
            
            if recursos.get('questoes_limitadas', True):
                limite = recursos.get('limite_questoes', 3)
            else:
                limite = None  # Ilimitado
            
            self.logger.info("Limite de questões obtido", extra={
                'user_id': user_id,
                'tipo_plano': tipo_plano,
                'limite': limite
            })
            
            return limite
                
        except Exception as e:
            self.logger.error("Erro ao obter limite de questões", extra={
                'error': str(e),
                'user_id': user_id
            })
            print(f"Erro ao obter limite de questões: {e}")
            return 3  # Padrão gratuito
    
    def _plano_padrao(self):
        """Retorna o plano padrão (gratuito)"""
        return {
            'tipo': 'gratuito',
            'data_ativacao': datetime.now().isoformat(),
            'data_expiracao': None,
            'ativo': True,
            'metodo_pagamento': None,
            'pode_renovar': False
        }
    
    def _plano_expirado(self, plano_info):
        """Verifica se um plano está expirado"""
        if not plano_info.get('ativo', False):
            return True
        
        data_expiracao_str = plano_info.get('data_expiracao')
        if not data_expiracao_str:
            return False  # Plano sem expiração
        
        try:
            data_expiracao = datetime.fromisoformat(data_expiracao_str.replace('Z', '+00:00'))
            return datetime.now() > data_expiracao
        except:
            return True  # Se não conseguir parsear, considerar expirado
    
    def _calcular_data_expiracao(self, tipo_plano):
        """Calcula a data de expiração para um tipo de plano"""
        if tipo_plano == 'black':
            return self.DATA_EXPIRACAO_BLACK
        
        duracao = self.DURACAO_PLANOS.get(tipo_plano)
        if duracao is None:
            return None  # Sem expiração
        
        return datetime.now() + timedelta(days=duracao)
    
    def _usuario_ja_usou_promo(self, user_id):
        """Verifica se o usuário já utilizou o plano promocional"""
        try:
            if not self.db:
                return False
            
            historico = self.db.collection('historico_planos').where('user_id', '==', user_id).where('tipo_plano', '==', 'promo').limit(1).get()
            return len(historico) > 0
            
        except Exception as e:
            print(f"Erro ao verificar uso do plano promo: {e}")
            return False
    
    def _reverter_plano_gratuito(self, user_id):
        """Reverte o usuário para o plano gratuito"""
        try:
            if not self.db:
                return
            
            plano_gratuito = self._plano_padrao()
            self.db.collection('usuarios').document(user_id).update({
                'plano': plano_gratuito,
                'data_ultima_atualizacao': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"Erro ao reverter para plano gratuito: {e}")
    
    def listar_planos(self):
        """Lista todos os planos disponíveis"""
        try:
            planos = []
            
            # Plano Trial Free
            planos.append({
                'id': 'trial',
                'nome': 'Trial Free',
                'descricao': 'Experimente nossa plataforma',
                'preco': self.PRECOS_PLANOS['trial'],
                'duracao_dias': self.DURACAO_PLANOS['trial'],
                'recursos': self.RECURSOS_PLANOS['trial'],
                'tipo': 'trial',
                'popular': False
            })
            
            # Plano Black CNU
            planos.append({
                'id': 'black',
                'nome': 'Black CNU',
                'descricao': 'Para quem quer passar no CNU',
                'preco': self.PRECOS_PLANOS['black'],
                'duracao_dias': None,  # Até data específica
                'data_expiracao': self.DATA_EXPIRACAO_BLACK.isoformat(),
                'recursos': self.RECURSOS_PLANOS['black'],
                'tipo': 'black',
                'popular': True
            })
            
            # Plano Premium
            planos.append({
                'id': 'premium',
                'nome': 'Premium',
                'descricao': 'Acesso completo a todos os recursos do Black CNU',
                'preco': self.PRECOS_PLANOS['premium'],
                'duracao_dias': self.DURACAO_PLANOS['premium'],
                'recursos': self.RECURSOS_PLANOS['premium'],
                'tipo': 'premium',
                'popular': False
            })
            
            return planos
            
        except Exception as e:
            print(f"Erro ao listar planos: {e}")
            return []
    
    @log_database_operation(StructuredLogger(__name__), "registrar_historico_plano")
    def _registrar_historico_plano(self, user_id, plano_info):
        """Registra o histórico de planos do usuário"""
        try:
            self.logger.info("Registrando histórico de plano", extra={
                'user_id': user_id,
                'tipo_plano': plano_info['tipo']
            })
            
            if not self.db:
                self.logger.warning("Database não conectado - histórico não registrado", extra={
                    'user_id': user_id,
                    'tipo_plano': plano_info['tipo']
                })
                return
            
            historico = {
                'user_id': user_id,
                'tipo_plano': plano_info['tipo'],
                'data_ativacao': plano_info['data_ativacao'],
                'data_expiracao': plano_info.get('data_expiracao'),
                'metodo_pagamento': plano_info.get('metodo_pagamento'),
                'data_registro': datetime.now().isoformat()
            }
            
            self.db.collection('historico_planos').add(historico)
            
            self.logger.info("Histórico de plano registrado com sucesso", extra={
                'user_id': user_id,
                'tipo_plano': plano_info['tipo']
            })
            
        except Exception as e:
            self.logger.error("Erro ao registrar histórico de plano", extra={
                'error': str(e),
                'user_id': user_id,
                'tipo_plano': plano_info.get('tipo', 'unknown')
            })
            print(f"Erro ao registrar histórico de plano: {e}")

# Instância global do serviço de planos
plano_service = PlanoService()