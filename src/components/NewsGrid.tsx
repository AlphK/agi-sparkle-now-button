
import { ExternalLink, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'RESEARCH': 'bg-blue-100 text-blue-800',
      'COMMUNITY': 'bg-green-100 text-green-800',
      'TECH': 'bg-purple-100 text-purple-800',
      'BREAKTHROUGH': 'bg-red-100 text-red-800',
      'DEVELOPMENT': 'bg-indigo-100 text-indigo-800',
      'INDUSTRY': 'bg-emerald-100 text-emerald-800',
      'ACADEMIC': 'bg-yellow-100 text-yellow-800',
      'APPLICATIONS': 'bg-cyan-100 text-cyan-800',
      'HARDWARE': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, index) => (
        <Card
          key={index}
          className={`border-l-4 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-102 ${getRelevanceColor(item.relevance)}`}
          onClick={() => window.open(item.url, '_blank')}
        >
          <div className="flex items-start justify-between mb-3">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            {getRelevanceIcon(item.relevance)}
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-3 line-clamp-3 leading-relaxed hover:text-red-600 transition-colors">
            {item.title}
          </h4>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{item.source}</span>
              <span>•</span>
              <span>{item.time}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NewsGrid;
