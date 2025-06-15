
import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface AIInsightsReportProps {
  newsData: NewsItem[];
  aiInsights?: {
    summary: string;
    keyTrends: string[];
    riskAssessment: string;
    recommendations: string[];
    agiProbability: number;
  };
  isLoading?: boolean;
}

const AIInsightsReport: React.FC<AIInsightsReportProps> = ({ 
  newsData, 
  aiInsights, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="animate-spin">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">🧠 Generando Reporte IA...</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-blue-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!aiInsights) {
    return null;
  }

  const getRiskColor = (probability: number) => {
    if (probability >= 80) return 'text-red-600 bg-red-100';
    if (probability >= 60) return 'text-orange-600 bg-orange-100';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border border-blue-200 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-8 h-8 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-800">🧠 Reporte de Inteligencia IA</h3>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Resumen Ejecutivo
        </h4>
        <p className="text-gray-700 bg-white/60 backdrop-blur rounded-lg p-4 leading-relaxed">
          {aiInsights.summary}
        </p>
      </div>

      {/* Probabilidad AGI */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-white/60 backdrop-blur rounded-lg p-4">
          <span className="font-semibold text-gray-800">Probabilidad de Avance AGI:</span>
          <span className={`px-3 py-1 rounded-full font-bold ${getRiskColor(aiInsights.agiProbability)}`}>
            {aiInsights.agiProbability}%
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tendencias Clave */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Tendencias Detectadas
          </h4>
          <div className="space-y-2">
            {aiInsights.keyTrends.map((trend, index) => (
              <div key={index} className="bg-white/60 backdrop-blur rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-gray-700 text-sm">{trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendaciones */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Recomendaciones
          </h4>
          <div className="space-y-2">
            {aiInsights.recommendations.map((rec, index) => (
              <div key={index} className="bg-white/60 backdrop-blur rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">💡</span>
                  <span className="text-gray-700 text-sm">{rec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluación de Riesgo */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Evaluación de Riesgo
        </h4>
        <div className="bg-white/60 backdrop-blur rounded-lg p-4">
          <p className="text-gray-700">{aiInsights.riskAssessment}</p>
        </div>
      </div>

      {/* Footer con estadísticas */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>📊 {newsData.length} fuentes analizadas</span>
          <span>🔍 {newsData.filter(n => n.relevance === 'critical').length} críticas</span>
          <span>⚡ Análisis en tiempo real</span>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsReport;
