
import { ExternalLink, Clock, Tag } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface SitePreviewProps {
  item: NewsItem;
}

const SitePreview = ({ item }: SitePreviewProps) => {
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
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleOpenSite = () => {
    window.open(item.url, '_blank');
  };

  return (
    <div className={`h-full w-full ${getRelevanceColor(item.relevance)} border-l-4 p-8 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getSourceIcon(item.source)}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{item.source}</h2>
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{item.time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="w-4 h-4" />
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.relevance === 'critical' ? 'bg-red-100 text-red-800' :
                  item.relevance === 'high' ? 'bg-orange-100 text-orange-800' :
                  item.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.relevance.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenSite}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm font-medium">Abrir sitio</span>
        </button>
      </div>

      {/* Content Preview */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-8 border">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
          {item.title}
        </h1>
        
        {/* Simulated content layout */}
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-24 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{getSourceIcon(item.source)}</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              <div className="h-3 bg-gray-200 rounded w-3/5"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-gray-600 mb-4">Contenido disponible en el sitio original</p>
              <button
                onClick={handleOpenSite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Ver contenido completo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* URL Bar */}
      <div className="mt-6 bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600 font-mono">
        {item.url}
      </div>
    </div>
  );
};

export default SitePreview;
