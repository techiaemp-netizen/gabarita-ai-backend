'use client';

import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  birthDate: string;
  avatar?: string;
  plan: string;
  joinDate: string;
}

interface UserStats {
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  studyStreak: number;
  simulationsCompleted: number;
  averageScore: number;
}

const mockProfile: UserProfile = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(11) 99999-9999',
  city: 'São Paulo',
  state: 'SP',
  birthDate: '1990-05-15',
  plan: 'Premium',
  joinDate: '2024-01-15'
};

const mockStats: UserStats = {
  questionsAnswered: 1250,
  correctAnswers: 875,
  accuracy: 70,
  studyStreak: 15,
  simulationsCompleted: 45,
  averageScore: 72
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [stats] = useState<UserStats>(mockStats);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    weeklyReport: false
  });

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditing(false);
    // Aqui seria feita a chamada para a API
  };

  const handleCancelEdit = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    // Validar senhas e fazer chamada para API
    console.log('Alterando senha...');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-2">
                    Plano {profile.plan}
                  </span>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Precisão</span>
                    </div>
                    <span className="font-semibold text-green-600">{stats.accuracy}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Sequência</span>
                    </div>
                    <span className="font-semibold text-purple-600">{stats.studyStreak} dias</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Simulados</span>
                    </div>
                    <span className="font-semibold text-blue-600">{stats.simulationsCompleted}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Informações Pessoais
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Segurança
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Notificações
                </button>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Salvar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      {isEditing ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{profile.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      {isEditing ? (
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Nascimento
                      </label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editForm.birthDate}
                          onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(profile.birthDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      {isEditing ? (
                        <Input
                          value={editForm.city}
                          onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{profile.city}, {profile.state}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      {isEditing ? (
                        <select
                          value={editForm.state}
                          onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="SP">São Paulo</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="RS">Rio Grande do Sul</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{profile.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Alterar Senha</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Senha Atual
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                          </label>
                          <Input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                          </label>
                          <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          />
                        </div>

                        <Button onClick={handlePasswordChange} className="w-full">
                          Alterar Senha
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Notificações por Email</h4>
                        <p className="text-sm text-gray-600">Receba atualizações importantes por email</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('emailNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Notificações Push</h4>
                        <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('pushNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Lembretes de Estudo</h4>
                        <p className="text-sm text-gray-600">Receba lembretes para manter sua rotina de estudos</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('studyReminders')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.studyReminders ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.studyReminders ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Relatório Semanal</h4>
                        <p className="text-sm text-gray-600">Receba um resumo do seu progresso semanal</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('weeklyReport')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.weeklyReport ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}