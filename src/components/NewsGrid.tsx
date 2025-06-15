
import { ExternalLink, Clock, AlertTriangle, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface NewsGridProps {
  news: NewsItem[];
}

const NewsGrid = ({ news }: NewsGridProps) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'critical': return 'border-l-red-500 bg-gradient-to-r from-red-50 to-white';
      case 'high': return 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-white';
      case 'medium': return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white';
      default: return 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white';
    }
  };

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high': return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'RESEARCH': 'bg-blue-500 text-white',
      'COMMUNITY': 'bg-green-500 text-white',
      'TECH': 'bg-purple-500 text-white',
      'BREAKTHROUGH': 'bg-red-500 text-white',
      'DEVELOPMENT': 'bg-indigo-500 text-white',
      'INDUSTRY': 'bg-emerald-500 text-white',
      'ACADEMIC': 'bg-yellow-500 text-white',
      'APPLICATIONS': 'bg-cyan-500 text-white',
      'HARDWARE': 'bg-pink-500 text-white'
    };
    return colors[category] || 'bg-gray-500 text-white';
  };

  const getEmbedUrl = (url: string) => {
    // Para ArXiv, podemos mostrar el PDF embebido
    if (url.includes('arxiv.org')) {
      const arxivId = url.match(/arxiv\.org\/abs\/(.+)/)?.[1];
      return arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : null;
    }
    return null;
  };

  const toggleExpand = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {news.map((item, index) => {
        const isExpanded = expandedCard === index;
        const embedUrl = getEmbedUrl(item.url);
        
        return (
          <Card
            key={index}
            className={`border-l-4 overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 transform cursor-pointer group ${getRelevanceColor(item.relevance)} ${
              isExpanded ? 'shadow-2xl scale-[1.02]' : 'shadow-lg'
            }`}
            style={{
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-wide ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  {getRelevanceIcon(item.relevance)}
                </div>
                
                <div className="flex items-center space-x-2">
                  {embedUrl && (
                    <button
                      onClick={(e) => toggleExpand(index, e)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                      title="Ver contenido embebido"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => window.open(item.url, '_blank')}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 hover:scale-110"
                    title="Abrir fuente original"
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Title */}
              <h4 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-red-600 transition-colors duration-300">
                {item.title}
              </h4>
              
              {/* Source info */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold bg-gray-100 px-2 py-1 rounded">{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors duration-300 group-hover:translate-x-1" />
              </div>

              {/* Progress bar indicator */}
              <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
                <div 
                  className={`h-1 rounded-full transition-all duration-1000 ease-out ${
                    item.relevance === 'critical' ? 'bg-red-500 w-full' :
                    item.relevance === 'high' ? 'bg-orange-500 w-3/4' :
                    item.relevance === 'medium' ? 'bg-yellow-500 w-1/2' : 'bg-blue-500 w-1/4'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
            </div>

            {/* Expanded content */}
            <div 
              className={`transition-all duration-500 ease-out overflow-hidden ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {embedUrl && (
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h5 className="font-semibold text-gray-800 mb-3">Vista previa del documento:</h5>
                    <iframe
                      src={embedUrl}
                      className="w-full h-64 rounded border"
                      title={`Preview of ${item.title}`}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Vista previa limitada. Haz clic en el botón de arriba para ver el documento completo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default NewsGrid;
