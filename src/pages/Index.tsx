
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RealDataService } from '@/components/RealDataService';
import StackedSites from '@/components/StackedSites';
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
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    
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
      
      setNewsData(allNews);
      setHasScanned(true);

      // Detectar AGI - ya sea por modo test o por contenido real
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

  const getButtonText = () => {
    if (isScanning) return "SCANNING...";
    return "AGI";
  };

  const getStatusText = () => {
    if (hasScanned && !agiDetected) return "Not yet";
    return "";
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
          className="w-48 h-48 rounded-full bg-red-500 hover:bg-red-600 text-white border-none shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70"
        >
          <div className="flex flex-col items-center space-y-3">
            {isScanning ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="text-xl font-bold">{getButtonText()}</span>
              </>
            ) : (
              <span className="text-2xl font-bold">{getButtonText()}</span>
            )}
          </div>
        </Button>

        {/* Status Text */}
        {getStatusText() && (
          <div className="mt-6 text-2xl font-bold text-gray-600">
            {getStatusText()}
          </div>
        )}

        {/* Scroll hint when data is available */}
        {hasScanned && !agiDetected && (
          <div className="mt-8 text-center animate-bounce">
            <p className="text-gray-500 mb-2">Latest AI news below ↓</p>
            <div className="w-8 h-8 mx-auto border-2 border-gray-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Stacked Sites Section - Aparece abajo después del scan solo si no hay AGI */}
      {hasScanned && !agiDetected && (
        <div className="min-h-screen">
          <StackedSites sources={newsData} />
        </div>
      )}
    </div>
  );
};

export default Index;
