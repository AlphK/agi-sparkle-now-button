
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealDataService } from '@/components/RealDataService';
import EmbeddedSources from '@/components/EmbeddedSources';

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
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    
    try {
      const dataService = RealDataService.getInstance(toast);
      
      // Fetch all data in parallel
      const [arxivPapers, redditPosts, hnPosts] = await Promise.all([
        dataService.fetchArXivPapers(),
        dataService.fetchRedditMLPosts(),
        dataService.fetchHackerNewsPosts()
      ]);
      
      const allNews = [...arxivPapers, ...redditPosts, ...hnPosts]
        .sort((a, b) => {
          const relevanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
        });
      
      setNewsData(allNews);
      setHasScanned(true);
      
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-12">
          <h1 className="text-8xl md:text-9xl font-black text-gray-900 mb-4">
            AGI
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-4">
            DETECTOR EN TIEMPO REAL
          </h2>
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
                <span className="text-xl font-bold">ESCANEANDO</span>
              </>
            ) : (
              <>
                <Search className="w-12 h-12" />
                <span className="text-2xl font-bold">ESCANEAR</span>
                <span className="text-sm">AHORA</span>
              </>
            )}
          </div>
        </Button>

        {/* Status */}
        {isScanning && (
          <p className="mt-6 text-gray-600 animate-pulse">
            Conectando con fuentes en tiempo real...
          </p>
        )}
      </div>

      {/* Embedded Sources Section */}
      {hasScanned && newsData.length > 0 && (
        <div className="w-full animate-fade-in">
          <EmbeddedSources sources={newsData} />
        </div>
      )}
    </div>
  );
};

export default Index;
