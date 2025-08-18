"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Cadastro page
 *
 * User registration form with complete fields for account creation
 */
export default function CadastroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/painel');
    }
  }, [user, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCPF = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Apply CPF mask: 000.000.000-00
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({
      ...prev,
      cpf: formatted
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically call your registration API
      console.log('Dados do cadastro:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to login after successful registration
      router.push('/login?message=Cadastro realizado com sucesso!');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErrors({ submit: 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Gabarit-AI" width={40} height={40} className="mr-3" />
          <span className="text-xl font-bold text-gray-800">Gabarit-AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">12 NÍVEL</span>
          <span className="text-sm text-gray-600">8 450 ACERTOS</span>
          <span className="text-sm text-gray-600">73%</span>
          <span className="text-sm font-medium text-blue-600">CNU 2025</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-500">⚠️ Sem plano ativo</span>
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium">
              Desempenho
            </button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
              Planos
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="Gabarit-AI" width={60} height={60} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Criar Conta</h1>
            <p className="text-gray-600">Crie sua conta e comece a estudar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  👤
                </span>
                <input
                  type="text"
                  id="nomeCompleto"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nomeCompleto ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.nomeCompleto && (
                <p className="text-red-500 text-sm mt-1">{errors.nomeCompleto}</p>
              )}
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  📄
                </span>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cpf ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.cpf && (
                <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ✉️
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="Sua senha"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.senha ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.senha && (
                <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  placeholder="Confirme sua senha"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.confirmarSenha && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Fazer Login
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Voltar ao Início
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}