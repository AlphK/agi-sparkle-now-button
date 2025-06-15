
import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface CoverFlowNewsProps {
  sources: NewsItem[];
}

const CoverFlowNews = ({ sources }: CoverFlowNewsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Limitar a 5 sitios para mejor experiencia visual
  const topSites = sources.slice(0, 5);

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

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % topSites.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + topSites.length) % topSites.length);
  };

  const getCardTransform = (index: number) => {
    const diff = index - activeIndex;
    
    if (diff === 0) {
      // Tarjeta activa - centro
      return {
        transform: 'translateZ(160px) rotateY(0deg) scale(1)',
        zIndex: 10,
        opacity: 1
      };
    } else if (diff === 1 || (diff === -(topSites.length - 1))) {
      // Tarjeta siguiente (derecha)
      return {
        transform: 'translateX(220px) rotateY(-40deg) scale(0.8) translateZ(0px)',
        zIndex: 5,
        opacity: 0.7
      };
    } else if (diff === -1 || (diff === (topSites.length - 1))) {
      // Tarjeta anterior (izquierda)
      return {
        transform: 'translateX(-220px) rotateY(40deg) scale(0.8) translateZ(0px)',
        zIndex: 5,
        opacity: 0.7
      };
    } else if (diff === 2 || diff === -(topSites.length - 2)) {
      // Segunda a la derecha
      return {
        transform: 'translateX(320px) rotateY(-50deg) scale(0.6) translateZ(-80px)',
        zIndex: 2,
        opacity: 0.4
      };
    } else if (diff === -2 || diff === (topSites.length - 2)) {
      // Segunda a la izquierda
      return {
        transform: 'translateX(-320px) rotateY(50deg) scale(0.6) translateZ(-80px)',
        zIndex: 2,
        opacity: 0.4
      };
    } else {
      // Tarjetas lejanas (ocultas)
      return {
        transform: 'translateX(400px) rotateY(-60deg) scale(0.4) translateZ(-160px)',
        zIndex: 1,
        opacity: 0.2
      };
    }
  };

  if (topSites.length === 0) {
    return <div className="text-center text-gray-500">No hay sitios disponibles</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 relative overflow-hidden">
      <div className="w-full max-w-6xl relative" style={{ perspective: '1200px' }}>
        
        {/* Cover Flow Container */}
        <div className="relative h-96 flex items-center justify-center">
          {topSites.map((site, index) => {
            const cardStyle = getCardTransform(index);
            
            return (
              <div
                key={index}
                className={`absolute w-80 h-80 cursor-pointer transition-all duration-500 ease-out ${
                  getRelevanceColor(site.relevance)
                } border-2 rounded-2xl shadow-xl hover:shadow-2xl`}
                style={cardStyle}
                onClick={() => setActiveIndex(index)}
              >
                <div className="h-full p-6 flex flex-col relative overflow-hidden">
                  {/* Reflejo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
                  
                  {/* Header del sitio */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getSourceIcon(site.source)}</span>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800 truncate">{site.source}</h2>
                        <div className="flex items-center text-xs text-gray-600 space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{site.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      site.relevance === 'critical' ? 'bg-red-200 text-red-800' :
                      site.relevance === 'high' ? 'bg-orange-200 text-orange-800' :
                      site.relevance === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {site.relevance.toUpperCase()}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 bg-white/90 backdrop-blur rounded-xl p-4 shadow-inner relative z-10">
                    <h1 className="text-md font-bold text-gray-900 mb-3 leading-tight line-clamp-3">
                      {site.title}
                    </h1>
                    
                    {/* Preview simulado */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                          <span className="text-sm">{getSourceIcon(site.source)}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="h-1.5 bg-gray-200 rounded"></div>
                          <div className="h-1.5 bg-gray-200 rounded w-4/5"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 bg-gray-200 rounded"></div>
                          <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de abrir */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSiteClick(site.url);
                    }}
                    className="mt-3 flex items-center justify-center space-x-2 bg-white/80 px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border hover:scale-105 relative z-10"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="text-xs font-medium">Abrir</span>
                  </button>
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
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Flechas de navegación */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default CoverFlowNews;
