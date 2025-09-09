'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Shield, 
  Bell, 
  CreditCard, 
  Award, 
  BookOpen, 
  Target, 
  TrendingUp,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Download
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  birthDate?: string;
  city?: string;
  state?: string;
  avatar?: string;
  plan: string;
  joinedAt: string;
  lastLogin: string;
  stats: {
    totalQuestions: number;
    accuracy: number;
    streak: number;
    level: number;
    points: number;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    studyReminders: boolean;
    weeklyReports: boolean;
  };
}

const MOCK_USER_PROFILE: UserProfile = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  cpf: '123.456.789-00',
  phone: '(11) 99999-9999',
  birthDate: '1995-05-15',
  city: 'São Paulo',
  state: 'SP',
  avatar: '/api/placeholder/150/150',
  plan: 'Premium',
  joinedAt: '2023-03-15T10:00:00Z',
  lastLogin: '2024-01-15T14:30:00Z',
  stats: {
    totalQuestions: 1247,
    accuracy: 87.3,
    streak: 12,
    level: 8,
    points: 8950
  },
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    weeklyReports: false
  }
};

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function PerfilPage() {
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento do perfil
      // const profileData = await userService.getProfile(user.id);
      setTimeout(() => {
        setProfile(MOCK_USER_PROFILE);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setIsLoading(false);
    }
  };

  const handleEditStart = () => {
    setEditForm({
      name: profile.name,
      phone: profile.phone,
      birthDate: profile.birthDate,
      city: profile.city,
      state: profile.state
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    setIsLoading(true);
    try {
      // Simular atualização do perfil
      // await userService.updateProfile(user.id, editForm);
      
      setProfile(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
      setEditForm({});
      
      // Atualizar contexto de autenticação se necessário
      if (editForm.name) {
        updateUser({ ...user!, name: editForm.name });
      }
      
      setTimeout(() => {
        setIsLoading(false);
        alert('Perfil atualizado com sucesso!');
      }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setIsLoading(false);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setIsLoading(true);
    try {
      // Simular mudança de senha
      // await userService.changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      
      setTimeout(() => {
        setIsLoading(false);
        setShowPasswordChange(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Senha alterada com sucesso!');
      }, 1000);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setIsLoading(false);
      alert('Erro ao alterar senha. Verifique sua senha atual.');
    }
  };

  const handlePreferenceChange = async (key: keyof UserProfile['preferences'], value: boolean) => {
    try {
      const updatedPreferences = { ...profile.preferences, [key]: value };
      setProfile(prev => ({ ...prev, preferences: updatedPreferences }));
      
      // Simular atualização das preferências
      // await userService.updatePreferences(user.id, updatedPreferences);
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho do arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsLoading(true);
    try {
      // Simular upload da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        setProfile(prev => ({ ...prev, avatar: avatarUrl }));
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setIsLoading(false);
      alert('Erro ao fazer upload da imagem.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.'
    );
    
    if (!confirmation) return;

    const secondConfirmation = window.prompt(
      'Digite "EXCLUIR" para confirmar a exclusão da conta:'
    );
    
    if (secondConfirmation !== 'EXCLUIR') {
      alert('Confirmação incorreta. Conta não foi excluída.');
      return;
    }

    setIsLoading(true);
    try {
      // Simular exclusão da conta
      // await userService.deleteAccount(user.id);
      
      setTimeout(() => {
        logout();
        alert('Conta excluída com sucesso.');
      }, 2000);
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setIsLoading(false);
      alert('Erro ao excluir conta. Tente novamente.');
    }
  };

  const exportUserData = async () => {
    try {
      // Simular exportação de dados
      const userData = {
        profile: profile,
        exportDate: new Date().toISOString(),
        dataTypes: ['profile', 'stats', 'preferences', 'activity']
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gabarita-ai-dados-${profile.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute feature="perfil">
      <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">👤 Meu Perfil</h1>
            <p className="text-xl opacity-90">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'profile', name: 'Perfil', icon: User },
                  { id: 'security', name: 'Segurança', icon: Shield },
                  { id: 'preferences', name: 'Preferências', icon: Settings },
                  { id: 'stats', name: 'Estatísticas', icon: TrendingUp }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Avatar e Info Básica */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={profile.avatar || '/api/placeholder/150/150'}
                        alt={profile.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(profile.plan)}`}>
                      Plano {profile.plan}
                    </span>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Membro desde {formatDate(profile.joinedAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      Último acesso: {formatDate(profile.lastLogin)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                    {!isEditing ? (
                      <button
                        onClick={handleEditStart}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEditSave}
                          disabled={isLoading}
                          className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>Salvar</span>
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{profile.email}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                      <p className="text-gray-900">{profile.cpf}</p>
                      <p className="text-xs text-gray-500 mt-1">O CPF não pode ser alterado</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(11) 99999-9999"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{profile.phone || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.birthDate || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.birthDate ? formatDate(profile.birthDate) : 'Não informado'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.city || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="São Paulo"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{profile.city || 'Não informado'}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      {isEditing ? (
                        <select
                          value={editForm.state || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione o estado</option>
                          {BRAZILIAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900">{profile.state || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Segurança da Conta
                </h3>

                <div className="space-y-6">
                  {/* Alterar Senha */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Senha</h4>
                        <p className="text-sm text-gray-600">Última alteração há 30 dias</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Alterar Senha
                      </button>
                    </div>

                    {showPasswordChange && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handlePasswordChange}
                            disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Salvar Nova Senha
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordChange(false);
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exportar Dados */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Exportar Dados</h4>
                        <p className="text-sm text-gray-600">Baixe uma cópia de todos os seus dados</p>
                      </div>
                      <button
                        onClick={exportUserData}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                      </button>
                    </div>
                  </div>

                  {/* Excluir Conta */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-900">Excluir Conta</h4>
                        <p className="text-sm text-red-600">Esta ação não pode ser desfeita</p>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir Conta</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Preferências de Notificação
              </h3>

              <div className="space-y-6">
                {[
                  {
                    key: 'emailNotifications' as keyof UserProfile['preferences'],
                    title: 'Notificações por E-mail',
                    description: 'Receba atualizações importantes por e-mail'
                  },
                  {
                    key: 'pushNotifications' as keyof UserProfile['preferences'],
                    title: 'Notificações Push',
                    description: 'Receba notificações no navegador'
                  },
                  {
                    key: 'studyReminders' as keyof UserProfile['preferences'],
                    title: 'Lembretes de Estudo',
                    description: 'Receba lembretes para manter sua rotina de estudos'
                  },
                  {
                    key: 'weeklyReports' as keyof UserProfile['preferences'],
                    title: 'Relatórios Semanais',
                    description: 'Receba um resumo semanal do seu progresso'
                  }
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{pref.title}</h4>
                      <p className="text-sm text-gray-600">{pref.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.preferences[pref.key]}
                        onChange={(e) => handlePreferenceChange(pref.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {profile.stats.totalQuestions.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Questões Respondidas</h3>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {profile.stats.accuracy.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Precisão Geral</h3>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {profile.stats.level}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Nível Atual</h3>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {profile.stats.streak}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Sequência Atual</h3>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Award className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {profile.stats.points.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Pontos Totais</h3>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                  <span className={`text-2xl font-bold ${getPlanColor(profile.plan).split(' ')[1]}`}>
                    {profile.plan}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Plano Atual</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}