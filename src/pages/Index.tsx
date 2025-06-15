
import { useState, useEffect } from 'react';
import { Brain, Zap, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AGIScanner from '@/components/AGIScanner';
import NewsDisplay from '@/components/NewsDisplay';
import FloatingParticles from '@/components/FloatingParticles';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [agiStatus, setAgiStatus] = useState<'unknown' | 'scanning' | 'detected' | 'not-detected'>('unknown');
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScanForAGI = async () => {
    setIsScanning(true);
    setAgiStatus('scanning');
    
    // Simulamos búsqueda en múltiples fuentes
    toast({
      title: "🔍 Iniciando escaneo de AGI",
      description: "Buscando en fuentes de información globales...",
    });

    try {
      // Aquí simularemos la búsqueda (en una implementación real conectaríamos APIs)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Por ahora siempre devolvemos "no detectada" para mantener el suspense
      setAgiStatus('not-detected');
      setLastScanTime(new Date().toLocaleString());
      
      toast({
        title: "🤖 Escaneo completado",
        description: "AGI aún no detectada. La búsqueda continúa...",
      });
    } catch (error) {
      console.error('Error scanning for AGI:', error);
      setAgiStatus('unknown');
      toast({
        title: "❌ Error en el escaneo",
        description: "No se pudo completar la búsqueda. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusColor = () => {
    switch (agiStatus) {
      case 'detected': return 'text-green-400';
      case 'not-detected': return 'text-red-400';
      case 'scanning': return 'text-blue-400';
      default: return 'text-purple-400';
    }
  };

  const getStatusIcon = () => {
    switch (agiStatus) {
      case 'detected': return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'not-detected': return <AlertCircle className="w-8 h-8 text-red-400" />;
      case 'scanning': return <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />;
      default: return <Brain className="w-8 h-8 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Fondo con efectos */}
      <div className="absolute inset-0 matrix-bg"></div>
      <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid"></div>
      <FloatingParticles />
      
      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Header */}
        <div className="text-center mb-12 animate-float">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 holographic-text">
            AGI DETECTOR
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            ¿Se ha logrado la Inteligencia General Artificial?
          </p>
          <p className="text-sm text-gray-500">
            Conectado a fuentes de información globales en tiempo real
          </p>
        </div>

        {/* Status Card */}
        <Card className="cyber-border bg-black/40 backdrop-blur-lg p-8 mb-8 max-w-md w-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
              {agiStatus === 'detected' && 'AGI DETECTADA'}
              {agiStatus === 'not-detected' && 'AGI NO DETECTADA'}
              {agiStatus === 'scanning' && 'ESCANEANDO...'}
              {agiStatus === 'unknown' && 'ESTADO DESCONOCIDO'}
            </h3>
            {lastScanTime && (
              <p className="text-sm text-gray-400">
                Último escaneo: {lastScanTime}
              </p>
            )}
          </div>
        </Card>

        {/* Botón principal */}
        <div className="mb-12">
          <Button
            onClick={handleScanForAGI}
            disabled={isScanning}
            className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold py-6 px-12 rounded-full text-2xl transition-all duration-300 transform hover:scale-105 animate-glow-pulse"
          >
            <div className="flex items-center space-x-3">
              {isScanning ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>ESCANEANDO...</span>
                </>
              ) : (
                <>
                  <Search className="w-8 h-8" />
                  <span>DETECTAR AGI</span>
                  <Zap className="w-8 h-8" />
                </>
              )}
            </div>
            {/* Efecto shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
          </Button>
        </div>

        {/* Scanner Component */}
        {isScanning && <AGIScanner />}

        {/* News Display */}
        <NewsDisplay />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-12">
          <p>Fuentes monitoreadas: ArXiv, Google Scholar, OpenAI, DeepMind, Anthropic</p>
          <p className="mt-2">🤖 Preparado para el momento más importante de la humanidad</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
