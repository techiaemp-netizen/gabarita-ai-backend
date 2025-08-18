'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, CreditCard, Save, Edit, LogOut } from 'lucide-react';

export default function PerfilPage() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: user?.cpf || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUser(formData);
      setEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para ver seu perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Informações Pessoais</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>{editing ? 'Cancelar' : 'Editar'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            {editing && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            )}
          </form>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Estatísticas</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{user.level}</div>
              <div className="text-sm text-gray-600">Nível</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{user.xp.toLocaleString()}</div>
              <div className="text-sm text-gray-600">XP Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{user.accuracy}%</div>
              <div className="text-sm text-gray-600">Precisão</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {user.plan === 'free' ? 'Gratuito' : 'Premium'}
              </div>
              <div className="text-sm text-gray-600">Plano</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

