
import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Tag } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface StackedSitesProps {
  sources: NewsItem[];
}

const StackedSites = ({ sources }: StackedSitesProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Solo mostrar los 3 primeros sitios
  const topSites = sources.slice(0, 3);

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      'ArXiv': '📄',
      'Reddit r/MachineLearning': '🔴', 
      'Hacker News': '🟠',
      'GitHub': '⚫',
      'Twitter': '🐦',
      'Medium': '📝'
    };
    return icons[source] || '🌐';
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'critical': return 'border-red-400 bg-gradient-to-br from-red-50 to-red-100';
      case 'high': return 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100';
      case 'medium': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100';
      default: return 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100';
    }
  };

  const handleSiteClick = (url: string) => {
    window.open(url, '_blank');
  };

  if (topSites.length === 0) {
    return <div className="text-center text-gray-500">No hay sitios disponibles</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="relative w-full max-w-4xl">
        {/* Stack de sitios con efecto 3D */}
        <div className="relative h-96" style={{ perspective: '1000px' }}>
          {topSites.map((site, index) => {
            const isSelected = index === selectedIndex;
            const offset = index - selectedIndex;
            
            return (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-out cursor-pointer ${
                  getRelevanceColor(site.relevance)
                } border-2 rounded-2xl shadow-lg hover:shadow-xl`}
                style={{
                  transform: `
                    translateX(${offset * 60}px) 
                    translateY(${offset * -40}px) 
                    rotateY(${offset * -15}deg)
                    ${isSelected ? 'scale(1)' : 'scale(0.95)'}
                  `,
                  zIndex: 10 - Math.abs(offset),
                  opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.2
                }}
                onClick={() => setSelectedIndex(index)}
              >
                <div className="h-full p-8 flex flex-col">
                  {/* Header del sitio */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{getSourceIcon(site.source)}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{site.source}</h2>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{site.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="w-4 h-4" />
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              site.relevance === 'critical' ? 'bg-red-200 text-red-800' :
                              site.relevance === 'high' ? 'bg-orange-200 text-orange-800' :
                              site.relevance === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {site.relevance.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSiteClick(site.url);
                      }}
                      className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">Abrir</span>
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 bg-white/80 backdrop-blur rounded-xl p-6 shadow-inner">
                    <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                      {site.title}
                    </h1>
                    
                    {/* Contenido simulado */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{getSourceIcon(site.source)}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="mt-4 bg-gray-100/80 backdrop-blur rounded-lg px-4 py-2 text-xs text-gray-600 font-mono truncate">
                    {site.url}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-center mt-8 space-x-2">
          {topSites.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === selectedIndex 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Navegación con flechas */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <button
            onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
            disabled={selectedIndex === 0}
            className="p-3 bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200"
          >
            ←
          </button>
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <button
            onClick={() => setSelectedIndex(Math.min(topSites.length - 1, selectedIndex + 1))}
            disabled={selectedIndex === topSites.length - 1}
            className="p-3 bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StackedSites;
