from datetime import datetime, timedelta
from firebase_admin import firestore
from ..config.firebase_config import firebase_config

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
    
    def listar_planos_disponiveis(self):
        """Lista todos os planos disponíveis com dados dinâmicos"""
        try:
            planos = []
            
            for tipo_plano in self.TIPOS_PLANOS.values():
                recursos_lista = self._formatar_recursos_lista(tipo_plano)
                
                plano = {
                    'id': tipo_plano,
                    'nome': self._obter_nome_plano(tipo_plano),
                    'preco': self.PRECOS_PLANOS.get(tipo_plano, 0.00),
                    'periodo': self._obter_periodo_plano(tipo_plano),
                    'descricao': self._obter_descricao_plano(tipo_plano),
                    'recursos': recursos_lista,
                    'popular': self._plano_popular(tipo_plano),
                    'duracao': self._obter_duracao_plano(tipo_plano),
                    'tipo': tipo_plano,
                    'pode_renovar': self.RENOVACAO_PLANOS.get(tipo_plano, False),
                    'disponivel': True,
                    'created_at': datetime.now().isoformat()
                }
                
                planos.append(plano)
            
            return planos
            
        except Exception as e:
            print(f"Erro ao listar planos disponíveis: {e}")
            return []
    
    def _obter_nome_plano(self, tipo_plano):
        """Obtém o nome formatado do plano"""
        nomes = {
            'gratuito': 'Gratuito/Trial',
            'trial': 'Trial',
            'promo': 'Promo (Semanal)',
            'lite': 'Lite (Mensal)',
            'premium': 'Premium (Bimestral)',
            'premium_plus': 'Premium Plus',
            'black': 'Black CNU ⭐'
        }
        return nomes.get(tipo_plano, tipo_plano.title())
    
    def _obter_periodo_plano(self, tipo_plano):
        """Obtém o período do plano"""
        periodos = {
            'gratuito': 'ilimitado',
            'trial': 'ilimitado',
            'promo': '7 dias',
            'lite': '30 dias',
            'premium': '60 dias',
            'premium_plus': '60 dias',
            'black': 'até 5 de dezembro de 2025'
        }
        return periodos.get(tipo_plano, 'indefinido')
    
    def _obter_descricao_plano(self, tipo_plano):
        """Obtém a descrição do plano"""
        descricoes = {
            'gratuito': 'Experimente gratuitamente com recursos básicos',
            'trial': 'Período de teste com recursos limitados',
            'promo': 'Acesso completo por 1 semana com ótimo custo-benefício',
            'lite': 'Acesso completo por 1 mês - ideal para estudos regulares',
            'premium': 'Acesso completo por 2 meses - melhor valor',
            'premium_plus': 'Recursos avançados com macetes e modo foco',
            'black': 'Plano completo com todos os recursos premium'
        }
        return descricoes.get(tipo_plano, 'Plano personalizado')
    
    def _obter_duracao_plano(self, tipo_plano):
        """Obtém a duração do plano"""
        if tipo_plano in ['gratuito', 'trial']:
            return 'ilimitado'
        elif tipo_plano == 'black':
            return 'até 5 de dezembro de 2025'
        else:
            duracao = self.DURACAO_PLANOS.get(tipo_plano)
            return f'{duracao} dias' if duracao else 'indefinido'
    
    def _plano_popular(self, tipo_plano):
        """Verifica se o plano é popular"""
        return tipo_plano in ['premium', 'black']
    
    def _formatar_recursos_lista(self, tipo_plano):
        """Formata a lista de recursos do plano"""
        recursos = self.RECURSOS_PLANOS.get(tipo_plano, {})
        lista_recursos = []
        
        if recursos.get('questoes_limitadas'):
            limite = recursos.get('limite_questoes', 3)
            lista_recursos.append(f'✅ {limite} questões limitadas')
        else:
            lista_recursos.append('✅ Questões ilimitadas')
        
        recursos_map = {
            'simulados': 'Simulados',
            'relatorios': 'Relatórios',
            'ranking': 'Ranking',
            'suporte': 'Suporte',
            'macetes': 'Macetes',
            'modo_foco': 'Modo foco',
            'redacao': 'Redação'
        }
        
        for key, nome in recursos_map.items():
            if key == 'questoes_limitadas':
                continue
            
            if recursos.get(key, False):
                lista_recursos.append(f'✅ {nome}')
            else:
                lista_recursos.append(f'❌ {nome}')
        
        # Recursos especiais para planos premium
        if tipo_plano == 'black':
            lista_recursos.extend([
                '✅ Chat tira-dúvidas',
                '✅ Pontos centrais',
                '✅ Outras explorações'
            ])
        elif tipo_plano == 'premium_plus':
            lista_recursos.append('✅ Todos os recursos anteriores')
        
        return lista_recursos
    
    def obter_plano_usuario(self, user_id):
        """Obtém o plano atual do usuário"""
        try:
            if not self.db:
                return self._plano_padrao()
            
            user_doc = self.db.collection('usuarios').document(user_id).get()
            if not user_doc.exists:
                return self._plano_padrao()
            
            user_data = user_doc.to_dict()
            plano_info = user_data.get('plano', {})
            
            # Verificar se o plano ainda está válido
            if self._plano_expirado(plano_info):
                # Plano expirado, reverter para gratuito
                self._reverter_plano_gratuito(user_id)
                return self._plano_padrao()
            
            return plano_info
            
        except Exception as e:
            print(f"Erro ao obter plano do usuário: {e}")
            return self._plano_padrao()
    
    def ativar_plano(self, user_id, tipo_plano, metodo_pagamento=None):
        """Ativa um plano para o usuário"""
        try:
            if tipo_plano not in self.TIPOS_PLANOS.values():
                raise ValueError(f"Tipo de plano inválido: {tipo_plano}")
            
            # Verificar se usuário já usou plano promo
            if tipo_plano == 'promo' and self._usuario_ja_usou_promo(user_id):
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
            
            # Atualizar no Firestore
            self.db.collection('usuarios').document(user_id).update({
                'plano': plano_info,
                'data_ultima_atualizacao': datetime.now().isoformat()
            })
            
            # Registrar histórico de planos
            self._registrar_historico_plano(user_id, plano_info)
            
            return plano_info
            
        except Exception as e:
            print(f"Erro ao ativar plano: {e}")
            raise e
    
    def verificar_acesso_recurso(self, user_id, recurso):
        """Verifica se o usuário tem acesso a um recurso específico"""
        try:
            plano = self.obter_plano_usuario(user_id)
            tipo_plano = plano.get('tipo', 'gratuito')
            
            recursos = self.RECURSOS_PLANOS.get(tipo_plano, self.RECURSOS_PLANOS['gratuito'])
            return recursos.get(recurso, False)
            
        except Exception as e:
            print(f"Erro ao verificar acesso ao recurso: {e}")
            return False
    
    def obter_limite_questoes(self, user_id):
        """Obtém o limite de questões para o usuário"""
        try:
            plano = self.obter_plano_usuario(user_id)
            tipo_plano = plano.get('tipo', 'gratuito')
            
            recursos = self.RECURSOS_PLANOS.get(tipo_plano, self.RECURSOS_PLANOS['gratuito'])
            
            if recursos.get('questoes_limitadas', True):
                return recursos.get('limite_questoes', 3)
            else:
                return None  # Ilimitado
                
        except Exception as e:
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
    
    def _registrar_historico_plano(self, user_id, plano_info):
        """Registra o histórico de planos do usuário"""
        try:
            if not self.db:
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
            
        except Exception as e:
            print(f"Erro ao registrar histórico de plano: {e}")

# Instância global do serviço de planos
plano_service = PlanoService()