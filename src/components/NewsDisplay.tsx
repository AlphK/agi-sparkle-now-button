import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { RealDataService } from './RealDataService';
import { useToast } from '@/hooks/use-toast';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface NewsDisplayProps {
  useRealData?: boolean;
}

const NewsDisplay = ({ useRealData = false }: NewsDisplayProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (useRealData) {
        setLoading(true);
        try {
          const dataService = RealDataService.getInstance(toast);
          const [arxivPapers, redditPosts, hnPosts] = await Promise.all([
            dataService.fetchArXivPapers(),
            dataService.fetchRedditMLPosts(),
            dataService.fetchHackerNewsPosts()
          ]);
          
          const allNews = [...arxivPapers, ...redditPosts, ...hnPosts]
            .sort((a, b) => {
              const relevanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
              return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
            })
            .slice(0, 12);
          
          setNews(allNews);
        } catch (error) {
          console.error('Error fetching real data:', error);
          // Fallback to mock data
          setNews(getMockNews());
        }
        setLoading(false);
      } else {
        setNews(getMockNews());
      }
    };

    fetchData();

    // Auto-refresh every 5 minutes if using real data
    if (useRealData) {
      const interval = setInterval(fetchData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [useRealData, toast]);

  useEffect(() => {
    if (news.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % news.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [news.length]);

  const getMockNews = (): NewsItem[] => {
    return [
      {
        title: "OpenAI's GPT-5 shows unprecedented reasoning capabilities in new benchmarks",
        source: "Nature AI",
        time: "3 min ago",
        url: "#",
        relevance: "critical",
        category: "BREAKTHROUGH"
      },
      {
        title: "Google DeepMind announces AlphaCode 3.0 with autonomous programming",
        source: "MIT Technology Review",
        time: "8 min ago", 
        url: "#",
        relevance: "critical",
        category: "DEVELOPMENT"
      },
      {
        title: "Anthropic's Claude 4 demonstrates emergent self-improvement behaviors",
        source: "ArXiv Preprint",
        time: "15 min ago",
        url: "#",
        relevance: "high",
        category: "RESEARCH"
      },
      {
        title: "Microsoft reports AGI milestone in internal testing environments",
        source: "Reuters Technology",
        time: "23 min ago",
        url: "#",
        relevance: "critical",
        category: "INDUSTRY"
      },
      {
        title: "Stanford researchers publish paper on artificial consciousness indicators",
        source: "Science Journal",
        time: "35 min ago",
        url: "#",
        relevance: "high",
        category: "ACADEMIC"
      },
      {
        title: "Tesla's FSD v13 achieves human-level decision making in complex scenarios",
        source: "TechCrunch",
        time: "42 min ago",
        url: "#",
        relevance: "medium",
        category: "APPLICATIONS"
      },
      {
        title: "Meta's LLaMA 4 demonstrates recursive self-improvement capabilities",
        source: "The Verge",
        time: "1 hour ago",
        url: "#",
        relevance: "high",
        category: "DEVELOPMENT"
      },
      {
        title: "IBM's quantum-neural hybrid system passes Turing test variations",
        source: "IEEE Spectrum",
        time: "1 hour ago",
        url: "#",
        relevance: "medium",
        category: "HARDWARE"
      }
    ];
  };

  const getRelevanceStyle = (relevance: string) => {
    switch (relevance) {
      case 'critical': return 'border-l-red-500 bg-red-500/10 shadow-red-500/20';
      case 'high': return 'border-l-orange-500 bg-orange-500/10 shadow-orange-500/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10 shadow-yellow-500/20';
      default: return 'border-l-blue-500 bg-blue-500/10 shadow-blue-500/20';
    }
  };

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'BREAKTHROUGH': 'bg-red-500/20 text-red-300 border-red-500/30',
      'DEVELOPMENT': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'RESEARCH': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'INDUSTRY': 'bg-green-500/20 text-green-300 border-green-500/30',
      'ACADEMIC': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'APPLICATIONS': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'HARDWARE': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <Card className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 p-6 shadow-2xl shadow-emerald-500/10 transform transition-all duration-500 hover:border-teal-500/30">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <h3 className="text-2xl font-bold text-emerald-400">
              {useRealData ? 'FEED EN VIVO' : 'MODO DEMO'}
            </h3>
          </div>
          <div className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full flex items-center space-x-2">
            {loading && <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>}
            <span>{useRealData ? 'Actualizando cada 5min' : 'Datos simulados'}</span>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          {useRealData 
            ? 'Monitoreando ArXiv, Reddit r/MachineLearning, Hacker News'
            : 'Datos de ejemplo para demostración'
          }
        </p>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-hidden">
        {news.map((item, index) => (
          <div
            key={index}
            className={`border-l-4 p-4 rounded-r-xl transition-all duration-500 cursor-pointer shadow-lg transform ${getRelevanceStyle(item.relevance)} ${
              index === currentIndex 
                ? 'translate-x-2 shadow-xl scale-102 border-l-emerald-500' 
                : 'opacity-70 hover:opacity-100'
            }`}
            onClick={() => window.open(item.url, '_blank')}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full border font-bold ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  {getRelevanceIcon(item.relevance)}
                </div>
                <h4 className="text-sm font-semibold text-gray-100 mb-2 line-clamp-2 leading-relaxed hover:text-emerald-300 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <span className="font-medium text-teal-300">{item.source}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-emerald-400 transition-colors ml-3 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span>{useRealData ? `Conectado a ${news.length} artículos` : 'Modo demostración'}</span>
        </div>
        <span>Última actualización: {new Date().toLocaleTimeString()}</span>
      </div>
    </Card>
  );
};

export default NewsDisplay;
