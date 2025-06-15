
import React from 'react';
import { Clock, Brain, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  aiAnalysis?: {
    reasoning: string;
    keyInsights: string[];
    agiProbability: number;
  };
}

interface LatestAGINewsProps {
  newsData: NewsItem[];
  agiDetected: boolean;
}

const LatestAGINews = ({ newsData, agiDetected }: LatestAGINewsProps) => {
  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high': return <Brain className="w-5 h-5 text-orange-500" />;
      case 'medium': return <CheckCircle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (newsData.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Análisis de AGI - Última Revisión
          </h2>
          <p className="text-xl text-gray-600">
            Contenido analizado por IA para detectar señales de Inteligencia General Artificial
          </p>
          
          {agiDetected && (
            <div className="mt-6 inline-flex items-center px-6 py-3 bg-red-100 border border-red-300 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <span className="text-red-800 font-semibold">¡POSIBLE AGI DETECTADA!</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newsData.slice(0, 12).map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-lg border-l-4 ${getRelevanceColor(item.relevance)} p-6 hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getRelevanceIcon(item.relevance)}
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    item.relevance === 'critical' ? 'bg-red-200 text-red-800' :
                    item.relevance === 'high' ? 'bg-orange-200 text-orange-800' :
                    item.relevance === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {item.relevance.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => window.open(item.url, '_blank')}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Abrir enlace"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3 line-clamp-3 leading-tight">
                {item.title}
              </h3>

              <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{item.time}</span>
                </div>
                <span className="font-medium">{item.source}</span>
              </div>

              {item.aiAnalysis && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Análisis IA</span>
                    <span className={`text-sm font-bold ${
                      item.aiAnalysis.agiProbability > 70 ? 'text-red-600' :
                      item.aiAnalysis.agiProbability > 40 ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {item.aiAnalysis.agiProbability}% AGI
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.aiAnalysis.reasoning}
                  </p>
                  {item.aiAnalysis.keyInsights.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Puntos clave:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {item.aiAnalysis.keyInsights.slice(0, 2).map((insight, i) => (
                          <li key={i} className="flex items-start space-x-1">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {newsData.length > 12 && (
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Mostrando 12 de {newsData.length} artículos analizados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestAGINews;
