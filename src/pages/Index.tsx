
import React, { useState } from 'react';
import { Brain, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RealDataService } from '@/components/RealDataService';
import EmbeddedCoverFlow from '@/components/EmbeddedCoverFlow';
import LatestAGINews from '@/components/LatestAGINews';
import AGIDetectionAnimation from '@/components/AGIDetectionAnimation';
import SecurityAlert from '@/components/SecurityAlert';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  aiAnalysis?: {
    reasoning: string;
    keyInsights: string[];
    agiProbability: number;
  };
}

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [agiDetected, setAgiDetected] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    setNewsData([]);
    setHasScanned(false);
    setAgiDetected(false);
    
    try {
      const dataService = RealDataService.getInstance(toast);
      
      let scanResult;
      if (useAI) {
        console.log('Iniciando búsqueda inteligente de AGI...');
        scanResult = await dataService.performIntelligentAGIScan();
        setNewsData(scanResult.newsWithAnalysis);
        
        toast({
          title: "🧠 Análisis IA Completado",
          description: `${scanResult.reasoning}`,
        });

        // Verificar si se detectó AGI
        if (scanResult.detected) {
          setTimeout(() => setAgiDetected(true), 1000);
        }
      } else {
        console.log('Iniciando búsqueda básica...');
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
        
        // Análisis básico de AGI
        const criticalItems = allNews.filter(item => item.relevance === 'critical');
        const agiKeywords = ['agi', 'artificial general intelligence', 'superintelligence', 'consciousness'];
        const hasAgiSigns = criticalItems.some(item => 
          agiKeywords.some(keyword => item.title.toLowerCase().includes(keyword))
        );
        
        scanResult = { detected: hasAgiSigns, confidence: hasAgiSigns ? 75 : 0 };
      }

      if (testMode) {
        setTimeout(() => setAgiDetected(true), 1000);
      }
      
      console.log('Búsqueda completada:', scanResult, newsData.length);
      setHasScanned(true);
      
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      toast({
        title: "❌ Error",
        description: "Error al conectar con las fuentes. Intenta de nuevo.",
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
          <div className="text-center">
            <span className="text-xl font-bold text-white">
              ANALIZANDO
            </span>
            <div className="flex justify-center space-x-1 mt-2">
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
      <AGIDetectionAnimation 
        isDetected={agiDetected} 
        onClose={() => setAgiDetected(false)} 
      />

      {/* Sección principal del escáner */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {useAI && (
          <div className="absolute top-16 left-4 right-4 max-w-md mx-auto">
            <SecurityAlert
              type="info"
              title="Análisis IA Seguro"
              message="Usando conexión proxy segura para detección de AGI con IA."
            />
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
            <span className="text-sm">Test AGI</span>
            <Switch checked={testMode} onCheckedChange={setTestMode} />
          </div>
          
          <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-lg">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm">IA Mejorada</span>
            <Switch 
              checked={useAI} 
              onCheckedChange={setUseAI}
            />
          </div>
        </div>

        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="w-48 h-48 rounded-full bg-red-500 hover:bg-red-600 text-white border-none shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70"
        >
          {getButtonContent()}
        </Button>

        {useAI && (
          <div className="mt-4 flex items-center space-x-2 text-blue-600">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Detección IA Segura Activa</span>
          </div>
        )}
      </div>

      {/* Carrusel de sitios de AI */}
      <EmbeddedCoverFlow />

      {/* Sección de análisis AGI */}
      {hasScanned && newsData.length > 0 && (
        <LatestAGINews newsData={newsData} agiDetected={agiDetected} />
      )}
    </div>
  );
};

export default Index;
