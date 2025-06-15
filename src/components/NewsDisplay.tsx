
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Clock } from 'lucide-react';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'high' | 'medium' | 'low';
}

const NewsDisplay = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Simulamos noticias relacionadas con IA (en una app real usaríamos APIs reales)
    const mockNews: NewsItem[] = [
      {
        title: "OpenAI announces new breakthrough in reasoning capabilities",
        source: "TechCrunch",
        time: "2 min ago",
        url: "#",
        relevance: "high"
      },
      {
        title: "Google DeepMind's latest model shows emergent behaviors",
        source: "Nature",
        time: "15 min ago", 
        url: "#",
        relevance: "high"
      },
      {
        title: "Anthropic publishes new paper on AI alignment",
        source: "ArXiv",
        time: "1 hour ago",
        url: "#",
        relevance: "medium"
      },
      {
        title: "MIT researchers develop new neural architecture",
        source: "MIT News",
        time: "3 hours ago",
        url: "#",
        relevance: "medium"
      }
    ];

    setNews(mockNews);
  }, []);

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'border-l-red-500 bg-red-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      default: return 'border-l-blue-500 bg-blue-500/10';
    }
  };

  return (
    <Card className="cyber-border bg-black/40 backdrop-blur-lg p-6 max-w-2xl w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-cyan-400 mb-2">
          🔴 NOTICIAS EN TIEMPO REAL
        </h3>
        <p className="text-sm text-gray-400">
          Monitoreando desarrollos relacionados con AGI
        </p>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {news.map((item, index) => (
          <div
            key={index}
            className={`border-l-4 p-3 rounded-r-lg transition-all hover:bg-opacity-20 cursor-pointer ${getRelevanceColor(item.relevance)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-200 mb-1 line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-purple-400 transition-colors ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </Card>
  );
};

export default NewsDisplay;
