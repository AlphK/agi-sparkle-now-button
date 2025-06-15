
import React, { useState, useEffect } from 'react';
import { Brain, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RealDataService } from '@/components/RealDataService';
import EmbeddedCoverFlow from '@/components/EmbeddedCoverFlow';
import LatestAGINews from '@/components/LatestAGINews';
import AIInsightsReport from '@/components/AIInsightsReport';
import AGIDetectionAnimation from '@/components/AGIDetectionAnimation';
import SecurityAlert from '@/components/SecurityAlert';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface AIInsights {
  summary: string;
  keyTrends: string[];
  riskAssessment: string;
  recommendations: string[];
  agiProbability: number;
}

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [agiDetected, setAgiDetected] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | undefined>();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  // Timer para mostrar el prompt después de 30 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isScanning && !hasScanned) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isScanning, hasScanned]);

  useEffect(() => {
    if (isScanning) {
      setShowPrompt(false);
    }
  }, [isScanning]);

  const handleScan = async () => {
    setIsScanning(true);
    setNewsData([]);
    setHasScanned(false);
    setAgiDetected(false);
    setShowPrompt(false);
    setAiInsights(undefined);
    
    try {
      console.log('🔍 Iniciando búsqueda AGI...');
      const dataService = RealDataService.getInstance(toast);
      
      let scanResult;
      if (useAI) {
        console.log('🧠 Modo IA: Búsqueda + Reporte Inteligente...');
        scanResult = await dataService.performIntelligentAGIScan();
        setNewsData(scanResult.newsWithAnalysis);
        
        if (scanResult.aiInsights) {
          setIsGeneratingReport(true);
          // Simular tiempo de procesamiento del reporte
          setTimeout(() => {
            setAiInsights(scanResult.aiInsights);
            setIsGeneratingReport(false);
          }, 2000);
        }
        
        toast({
          title: "🧠 Análisis IA Completado",
          description: `${scanResult.reasoning}`,
        });

        if (scanResult.detected) {
          setTimeout(() => setAgiDetected(true), 1000);
        }
      } else {
        console.log('🔍 Búsqueda básica con análisis de keywords...');
        const [arxivPapers, redditPosts, hnPosts, rssFeeds] = await Promise.all([
          dataService.fetchArXivPapers(),
          dataService.fetchRedditMLPosts(),
          dataService.fetchHackerNewsPosts(),
          dataService.fetchExpandedRSSFeeds()
        ]);
        
        const allNews = [...arxivPapers, ...redditPosts, ...hnPosts, ...rssFeeds]
          .sort((a, b) => {
            const relevanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
            return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
          });
        
        setNewsData(allNews);
        
        const criticalItems = allNews.filter(item => item.relevance === 'critical');
        const agiKeywords = [
          'agi', 'artificial general intelligence', 'superintelligence', 
          'consciousness', 'sentient', 'self-aware', 'breakthrough'
        ];
        
        const hasAgiSigns = criticalItems.some(item => 
          agiKeywords.some(keyword => 
            item.title.toLowerCase().includes(keyword) ||
            item.category.toLowerCase().includes(keyword)
          )
        );
        
        console.log('🎯 Análisis básico:', { hasAgiSigns, criticalItems: criticalItems.length });
        scanResult = { detected: hasAgiSigns, confidence: hasAgiSigns ? 75 : 0 };
      }

      if (testMode) {
        console.log('🧪 Modo test activado - simulando detección AGI');
        setTimeout(() => setAgiDetected(true), 1000);
      }
      
      console.log('✅ Búsqueda completada:', scanResult, 'Items encontrados:', newsData.length);
      setHasScanned(true);
      
    } catch (error) {
      console.error('❌ Error en la búsqueda AGI:', error);
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
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
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
      <div className="flex flex-col items-center justify-center min-h-screen px-4 relative">
        {useAI && (
          <div className="absolute top-4 left-4 right-4 max-w-sm mx-auto">
            <SecurityAlert
              type="info"
              title="🛡️ IA Segura"
              message="Usando proxy seguro para análisis IA"
            />
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col space-y-3">
          <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl shadow-sm">
            <span className="text-sm font-medium text-gray-700">Test Mode</span>
            <Switch 
              checked={testMode} 
              onCheckedChange={setTestMode}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          
          <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-xl shadow-sm">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI Report</span>
            <Switch 
              checked={useAI} 
              onCheckedChange={setUseAI}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>

        {/* Prompt de inactividad */}
        {showPrompt && (
          <div className="absolute top-32 animate-bounce">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium">👆 Push the button!</span>
            </div>
          </div>
        )}

        {/* Botón 3D mejorado */}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="relative w-48 h-48 rounded-full bg-gradient-to-b from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 text-white border-none shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 transform-gpu"
          style={{
            boxShadow: `
              0 20px 40px rgba(239, 68, 68, 0.4),
              inset 0 -8px 0 rgba(153, 27, 27, 0.3),
              inset 0 4px 0 rgba(248, 113, 113, 0.3)
            `,
            background: isScanning 
              ? 'linear-gradient(to bottom, #ef4444, #dc2626, #991b1b)'
              : 'linear-gradient(to bottom, #f87171, #ef4444, #dc2626)'
          }}
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-b from-red-300 to-transparent opacity-30"></div>
          {getButtonContent()}
        </button>

        {useAI && (
          <div className="mt-6 flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Detección + Reporte IA Activo</span>
          </div>
        )}
      </div>

      {/* Carrusel de sitios de AI */}
      <EmbeddedCoverFlow />

      {/* Reporte de IA */}
      {useAI && hasScanned && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <AIInsightsReport 
            newsData={newsData}
            aiInsights={aiInsights}
            isLoading={isGeneratingReport}
          />
        </div>
      )}

      {/* Sección de análisis AGI */}
      {hasScanned && newsData.length > 0 && (
        <LatestAGINews newsData={newsData} agiDetected={agiDetected} />
      )}
    </div>
  );
};

export default Index;
