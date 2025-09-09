'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'
import { ConteudoEdital, Cargo, Grupo } from '@/types'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signup } = useAuth()
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    conteudoEditalId: '',
    cargoId: '',
    grupoId: '',
    plano: searchParams.get('plano') || 'gratuito',
    acceptTerms: false
  })
  
  const [conteudosEdital, setConteudosEdital] = useState<ConteudoEdital[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Carregar conteúdos de edital ao montar o componente
  useEffect(() => {
    loadConteudosEdital()
  }, [])

  // Carregar cargos quando conteúdo de edital for selecionado
  useEffect(() => {
    if (formData.conteudoEditalId) {
      const conteudo = conteudosEdital.find(c => c.id === formData.conteudoEditalId)
      if (conteudo) {
        setCargos(conteudo.cargos)
        setFormData(prev => ({ ...prev, cargoId: '', grupoId: '' }))
        setGrupos([])
      }
    }
  }, [formData.conteudoEditalId, conteudosEdital])

  // Carregar grupos quando cargo for selecionado
  useEffect(() => {
    if (formData.cargoId) {
      const cargo = cargos.find(c => c.id === formData.cargoId)
      if (cargo) {
        setGrupos(cargo.grupos)
        setFormData(prev => ({ ...prev, grupoId: '' }))
      }
    }
  }, [formData.cargoId, cargos])

  const loadConteudosEdital = async () => {
    try {
      setLoadingData(true)
      const response = await apiService.getConteudosEdital()
      if (response.success && response.data) {
        setConteudosEdital(response.data)
      } else {
        // Fallback com dados mock se API não estiver disponível
        setConteudosEdital([
          {
            id: '1',
            nome: 'Concurso Público Federal',
            descricao: 'Conteúdos para concursos federais',
            ativo: true,
            cargos: [
              {
                id: '1',
                nome: 'Analista Administrativo',
                descricao: 'Cargo de nível superior',
                grupos: [
                  {
                    id: '1',
                    nome: 'Conhecimentos Gerais',
                    descricao: 'Matérias básicas',
                    materias: ['Português', 'Matemática', 'Informática']
                  },
                  {
                    id: '2',
                    nome: 'Conhecimentos Específicos',
                    descricao: 'Matérias específicas do cargo',
                    materias: ['Administração Pública', 'Direito Administrativo']
                  }
                ]
              }
            ]
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos de edital:', error)
      setError('Erro ao carregar dados. Usando dados padrão.')
    } finally {
      setLoadingData(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.nome.trim()) errors.nome = 'Nome é obrigatório'
    if (!formData.email.trim()) errors.email = 'Email é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }
    if (!formData.cpf.trim()) errors.cpf = 'CPF é obrigatório'
    if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      errors.cpf = 'CPF deve ter 11 dígitos'
    }
    if (!formData.password) errors.password = 'Senha é obrigatória'
    if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem'
    }
    if (!formData.conteudoEditalId) errors.conteudoEditalId = 'Selecione um conteúdo de edital'
    if (!formData.cargoId) errors.cargoId = 'Selecione um cargo'
    if (!formData.grupoId) errors.grupoId = 'Selecione um grupo'
    if (!formData.acceptTerms) errors.acceptTerms = 'Você deve aceitar os termos'
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await signup({
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        password: formData.password,
        conteudoEditalId: formData.conteudoEditalId,
        cargoId: formData.cargoId,
        grupoId: formData.grupoId,
        plano: formData.plano
      })
      
      setSuccess('Cadastro realizado com sucesso! Redirecionando...')
      
      // Redirecionar baseado no plano selecionado
      setTimeout(() => {
        if (formData.plano !== 'gratuito') {
          router.push(`/pagamento?plano=${formData.plano}`)
        } else {
          router.push('/dashboard')
        }
      }, 2000)
      
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados do sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Image 
              src="/logo-gabarita.png" 
              alt="Gabarita AI" 
              width={60} 
              height={60}
              className="mx-auto rounded-2xl shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Criar Conta
          </CardTitle>
          <CardDescription>
            Preencha seus dados para começar a estudar
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alertas */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={fieldErrors.nome ? 'border-red-500' : ''}
                    placeholder="Seu nome completo"
                  />
                  {fieldErrors.nome && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.nome}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={fieldErrors.email ? 'border-red-500' : ''}
                    placeholder="seu@email.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => handleInputChange('cpf', e.target.value.replace(/\D/g, ''))}
                    className={fieldErrors.cpf ? 'border-red-500' : ''}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {fieldErrors.cpf && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.cpf}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Conteúdos de Edital */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Conteúdos de Edital</h3>
              
              <div>
                <Label htmlFor="conteudoEdital">Conteúdo de Edital *</Label>
                <Select
                  value={formData.conteudoEditalId}
                  onValueChange={(value) => handleInputChange('conteudoEditalId', value)}
                >
                  <SelectTrigger className={fieldErrors.conteudoEditalId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o conteúdo de edital" />
                  </SelectTrigger>
                  <SelectContent>
                    {conteudosEdital.map((conteudo) => (
                      <SelectItem key={conteudo.id} value={conteudo.id}>
                        {conteudo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.conteudoEditalId && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.conteudoEditalId}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Select
                    value={formData.cargoId}
                    onValueChange={(value) => handleInputChange('cargoId', value)}
                    disabled={!formData.conteudoEditalId}
                  >
                    <SelectTrigger className={fieldErrors.cargoId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos.map((cargo) => (
                        <SelectItem key={cargo.id} value={cargo.id}>
                          {cargo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.cargoId && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.cargoId}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="grupo">Grupo *</Label>
                  <Select
                    value={formData.grupoId}
                    onValueChange={(value) => handleInputChange('grupoId', value)}
                    disabled={!formData.cargoId}
                  >
                    <SelectTrigger className={fieldErrors.grupoId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.id}>
                          {grupo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.grupoId && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.grupoId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Senha</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={fieldErrors.password ? 'border-red-500' : ''}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                      placeholder="Repita a senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Termos */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange('acceptTerms', checked.toString())}
              />
              <Label htmlFor="terms" className="text-sm">
                Aceito os{' '}
                <Link href="/termos" className="text-blue-600 hover:underline">
                  termos de uso
                </Link>{' '}
                e{' '}
                <Link href="/privacidade" className="text-blue-600 hover:underline">
                  política de privacidade
                </Link>
              </Label>
            </div>
            {fieldErrors.acceptTerms && (
              <p className="text-sm text-red-600">{fieldErrors.acceptTerms}</p>
            )}

            {/* Botão de Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}