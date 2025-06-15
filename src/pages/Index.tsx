
import React, { useState } from 'react';
import { Loader2, Zap, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RealDataService } from '@/components/RealDataService';
import CoverFlowNews from '@/components/CoverFlowNews';
import AGIDetectionAnimation from '@/components/AGIDetectionAnimation';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [agiDetected, setAgiDetected] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [showScrollMessage, setShowScrollMessage] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    setShowScrollMessage(false);
    
    try {
      const dataService = RealDataService.getInstance(toast);
      
      // Fetch all data in parallel
      const [arxivPapers, redditPosts, hnPosts, rssFeeds] = await Promise.all([
        dataService.fetchArXivPapers(),
        dataService.fetchRedditMLPosts(),
        dataService.fetchHackerNewsPosts(),
        dataService.fetchRSSFeeds()
      ]);
      
      const allNews = [...arxivPapers, ...redditPosts, ...hnPosts, ...rssFeeds]
        .sort((a, b) => {
          const relevanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
        });
      
      console.log('All news fetched:', allNews.length, allNews);
      setNewsData(allNews);
      setHasScanned(true);

      // Detectar AGI
      if (testMode) {
        setTimeout(() => {
          setAgiDetected(true);
        }, 1000);
      } else {
        const hasCriticalNews = allNews.some(item => item.relevance === 'critical');
        const hasAGIKeywords = allNews.some(item => 
          item.title.toLowerCase().includes('agi') || 
          item.title.toLowerCase().includes('artificial general intelligence') ||
          item.title.toLowerCase().includes('consciousness') ||
          item.title.toLowerCase().includes('sentient')
        );

        if (hasCriticalNews && hasAGIKeywords) {
          setTimeout(() => {
            setAgiDetected(true);
          }, 1000);
        } else {
          // Mostrar mensaje de scroll solo por 4 segundos
          setShowScrollMessage(true);
          setTimeout(() => {
            setShowScrollMessage(false);
          }, 4000);
        }
      }
      
    } catch (error) {
      console.error('Error scanning:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo conectar a las fuentes",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getButtonContent = () => {
    if (isScanning) {
      return (
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <Brain className="w-12 h-12 animate-pulse text-blue-300" />
            <Sparkles className="w-6 h-6 absolute -top-2 -right-2 animate-bounce text-yellow-300" />
            <Zap className="w-4 h-4 absolute -bottom-1 -left-1 animate-ping text-green-300" />
          </div>
          <div className="text-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              ANALYZING
            </span>
            <div className="flex justify-center space-x-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return <span className="text-2xl font-bold">AGI</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Animación de detección AGI */}
      <AGIDetectionAnimation 
        isDetected={agiDetected} 
        onClose={() => setAgiDetected(false)} 
      />

      {/* Header Section - Siempre visible */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Interruptor temporal para testing */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
          <span className="text-sm">Test AGI</span>
          <Switch 
            checked={testMode} 
            onCheckedChange={setTestMode}
          />
        </div>

        {/* Big Red Button */}
        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="w-48 h-48 rounded-full bg-red-500 hover:bg-red-600 text-white border-none shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 relative overflow-hidden"
        >
          {/* Scanning effect overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-spin rounded-full"></div>
          )}
          <div className="relative z-10">
            {getButtonContent()}
          </div>
        </Button>

        {/* Mensaje temporal de scroll - Solo aparece 4 segundos después del escaneo */}
        {showScrollMessage && (
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-gray-600 text-lg mb-3">Latest AI news below ↓</p>
            <div className="w-8 h-8 mx-auto border-2 border-gray-400 rounded-full flex items-center justify-center animate-bounce">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Cover Flow News Section - Aparece abajo después del scan solo si no hay AGI */}
      {hasScanned && !agiDetected && newsData.length > 0 && (
        <div className="min-h-screen">
          <CoverFlowNews sources={newsData} />
        </div>
      )}
    </div>
  );
};

export default Index;
