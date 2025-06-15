
import { useState, useEffect } from 'react';
import { Brain, Zap, Search, AlertCircle, CheckCircle, Loader2, Activity } from 'lucide-react';
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
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const { toast } = useToast();

  const handleScanForAGI = async () => {
    setIsScanning(true);
    setAgiStatus('scanning');
    setPulseAnimation(true);
    
    toast({
      title: "🔍 Iniciando escaneo de AGI",
      description: "Conectando con fuentes globales de información...",
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      setAgiStatus('not-detected');
      setLastScanTime(new Date().toLocaleString());
      setPulseAnimation(false);
      
      toast({
        title: "🤖 Análisis completado",
        description: "AGI aún no detectada. Continuando monitoreo...",
      });
    } catch (error) {
      console.error('Error scanning for AGI:', error);
      setAgiStatus('unknown');
      setPulseAnimation(false);
      toast({
        title: "❌ Error en conexión",
        description: "Falló la conexión con fuentes. Reintentando...",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusColor = () => {
    switch (agiStatus) {
      case 'detected': return 'text-green-400';
      case 'not-detected': return 'text-orange-400';
      case 'scanning': return 'text-cyan-400';
      default: return 'text-purple-400';
    }
  };

  const getStatusIcon = () => {
    switch (agiStatus) {
      case 'detected': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'not-detected': return <Activity className="w-6 h-6 text-orange-400" />;
      case 'scanning': return <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />;
      default: return <Brain className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Fondo animado mejorado */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-black"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23a855f7" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      <FloatingParticles />
      
      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header mejorado */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative mb-8">
            <h1 className="text-7xl md:text-9xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
              AGI
            </h1>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            DETECTOR EN TIEMPO REAL
          </h2>
          <p className="text-lg text-gray-300 mb-2 max-w-2xl mx-auto leading-relaxed">
            Sistema avanzado de monitoreo continuo para detectar el momento exacto 
            en que se logre la Inteligencia General Artificial
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>CONECTADO A FUENTES GLOBALES</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Status mejorado */}
        <Card className="bg-black/30 backdrop-blur-xl border border-purple-500/20 p-6 mb-12 max-w-sm w-full shadow-2xl shadow-purple-500/10">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
                {getStatusIcon()}
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${getStatusColor()}`}>
              {agiStatus === 'detected' && 'AGI CONFIRMADA'}
              {agiStatus === 'not-detected' && 'AGI NO DETECTADA'}
              {agiStatus === 'scanning' && 'ESCANEANDO...'}
              {agiStatus === 'unknown' && 'ESPERANDO ANÁLISIS'}
            </h3>
            {lastScanTime && (
              <p className="text-xs text-gray-400">
                Último escaneo: {lastScanTime}
              </p>
            )}
          </div>
        </Card>

        {/* Botón circular espectacular */}
        <div className="mb-16 relative">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 blur-xl opacity-75 ${pulseAnimation ? 'animate-pulse' : ''}`}></div>
          <Button
            onClick={handleScanForAGI}
            disabled={isScanning}
            className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white font-bold transition-all duration-500 transform hover:scale-105 border-4 border-white/20 shadow-2xl ${isScanning ? 'animate-spin' : 'hover:shadow-purple-500/50'}`}
          >
            <div className="flex flex-col items-center space-y-3">
              {isScanning ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <span className="text-lg font-black">ANALIZANDO</span>
                  <span className="text-xs opacity-80">Por favor espera...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Search className="w-10 h-10" />
                    <Zap className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-black">DETECTAR</span>
                  <span className="text-sm opacity-80">AGI AHORA</span>
                </>
              )}
            </div>
            
            {/* Anillo exterior animado */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 opacity-75 blur-sm animate-pulse"></div>
            
            {/* Efecto shimmer */}
            {!isScanning && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            )}
          </Button>
        </div>

        {/* Scanner Component */}
        {isScanning && (
          <div className="mb-12 animate-fade-in">
            <AGIScanner />
          </div>
        )}

        {/* News Display mejorado */}
        <div className="w-full max-w-4xl">
          <NewsDisplay />
        </div>

        {/* Footer mejorado */}
        <div className="text-center text-gray-400 text-sm mt-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs">ArXiv</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs">OpenAI</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs">DeepMind</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Anthropic</span>
            </div>
          </div>
          <p className="text-xs opacity-60">
            🤖 Preparado para documentar el momento más importante en la historia de la humanidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
