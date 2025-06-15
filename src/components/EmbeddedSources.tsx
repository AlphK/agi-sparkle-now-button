
import { useState } from 'react';
import { X, RefreshCw, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface EmbeddedSourcesProps {
  sources: NewsItem[];
}

const EmbeddedSources = ({ sources }: EmbeddedSourcesProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [closedTabs, setClosedTabs] = useState<Set<number>>(new Set());

  const visibleSources = sources.filter((_, index) => !closedTabs.has(index));

  const closeTab = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setClosedTabs(prev => new Set([...prev, index]));
    
    // Si cerramos la pestaña activa, cambiar a la siguiente disponible
    if (index === activeTab) {
      const nextTab = visibleSources.findIndex((_, i) => 
        sources.indexOf(visibleSources[i]) > index && !closedTabs.has(sources.indexOf(visibleSources[i]))
      );
      if (nextTab >= 0) {
        setActiveTab(sources.indexOf(visibleSources[nextTab]));
      } else if (visibleSources.length > 1) {
        setActiveTab(sources.indexOf(visibleSources[0]));
      }
    }
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      'ArXiv': '📄',
      'Reddit': '🔴',
      'Hacker News': '🟠',
      'GitHub': '⚫',
      'Twitter': '🐦',
      'Medium': '📝'
    };
    return icons[source] || '🌐';
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      default: return 'border-blue-500';
    }
  };

  if (visibleSources.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">Todas las pestañas han sido cerradas</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Browser-like tabs */}
      <div className="bg-gray-200 border-b border-gray-300 flex items-end overflow-x-auto">
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex min-w-max">
            {visibleSources.map((source, index) => {
              const originalIndex = sources.indexOf(source);
              const isActive = originalIndex === activeTab;
              
              return (
                <div
                  key={originalIndex}
                  onClick={() => setActiveTab(originalIndex)}
                  className={`group min-w-[280px] max-w-[320px] h-10 flex items-center px-4 cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-white border-t border-l border-r border-gray-300 rounded-t-lg -mb-px z-10' 
                      : 'bg-gray-100 hover:bg-gray-50 border-r border-gray-300 last:border-r-0'
                  }`}
                >
                  <span className="text-lg mr-2">{getSourceIcon(source.source)}</span>
                  <span className="flex-1 truncate text-sm font-medium text-gray-800">
                    {source.title}
                  </span>
                  <button
                    onClick={(e) => closeTab(originalIndex, e)}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Browser controls */}
      <div className="bg-white border-b border-gray-300 px-4 py-2 flex items-center space-x-2">
        <button className="p-2 rounded hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-600 border">
          {sources.find((_, i) => i === activeTab)?.url || ''}
        </div>
        <button 
          onClick={() => window.open(sources.find((_, i) => i === activeTab)?.url, '_blank')}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {sources.map((source, index) => {
          if (closedTabs.has(index) || index !== activeTab) return null;
          
          return (
            <div key={index} className="w-full h-full">
              <div className={`absolute top-0 left-0 w-1 h-full ${getRelevanceColor(source.relevance)}`} />
              <iframe
                src={source.url}
                className="w-full h-full border-none"
                title={source.title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-1 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>{visibleSources.length} pestañas abiertas</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Conexión segura</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {sources.find((_, i) => i === activeTab) && (
            <>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                sources.find((_, i) => i === activeTab)?.relevance === 'critical' ? 'bg-red-100 text-red-800' :
                sources.find((_, i) => i === activeTab)?.relevance === 'high' ? 'bg-orange-100 text-orange-800' :
                sources.find((_, i) => i === activeTab)?.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {sources.find((_, i) => i === activeTab)?.relevance?.toUpperCase()}
              </span>
              <span>{sources.find((_, i) => i === activeTab)?.time}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbeddedSources;
