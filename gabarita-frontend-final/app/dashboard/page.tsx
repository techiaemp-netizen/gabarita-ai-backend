'use client';

import React from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BookOpen, Clock, Trophy, Target, Calendar, Play, FileText, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout title="Dashboard" subtitle="Acompanhe seu progresso nos estudos">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mb-6">
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Cronograma
        </Button>
        <Button>
          <Play className="w-4 h-4 mr-2" />
          Novo Simulado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Questões Resolvidas</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">1,247</div>
            <p className="text-xs text-emerald-600 mt-1">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Acerto</CardTitle>
            <Target className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">85%</div>
            <p className="text-xs text-emerald-600 mt-1">
              +5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tempo de Estudo</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">42h</div>
            <p className="text-xs text-slate-600 mt-1">
              Esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ranking</CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">#23</div>
            <p className="text-xs text-slate-600 mt-1">
              Entre 1,250 usuários
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Resolver Questões
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Iniciar Simulado
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Relatórios
            </Button>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-slate-800">Próximos Simulados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div>
                  <p className="font-medium text-slate-800">ENEM 2024</p>
                  <p className="text-sm text-slate-600">Matemática</p>
                </div>
                <span className="text-sm text-blue-600 font-medium">Hoje, 14h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div>
                  <p className="font-medium text-slate-800">Concurso TRT</p>
                  <p className="text-sm text-slate-600">Português</p>
                </div>
                <span className="text-sm text-emerald-600 font-medium">Amanhã, 9h</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-slate-800">Metas da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Questões Resolvidas</span>
                  <span className="font-medium text-slate-800">45/50</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Horas de Estudo</span>
                  <span className="font-medium text-slate-800">8/10</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Simulados</span>
                  <span className="font-medium text-slate-800">2/3</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: '67%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}