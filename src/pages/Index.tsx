
import { useState, useEffect } from 'react';
import { Brain, Zap, Search, AlertCircle, CheckCircle, Loader2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AGIScanner from '@/components/AGIScanner';
import NewsDisplay from '@/components/NewsDisplay';
import FloatingParticles from '@/components/FloatingParticles';
import { RealDataService } from '@/components/RealDataService';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [agiStatus, setAgiStatus] = useState<'unknown' | 'scanning' | 'detected' | 'not-detected'>('unknown');
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const { toast } = useToast();

  const handleScanForAGI = async () => {
    setIsScanning(true);
    setAgiStatus('scanning');
    setPulseAnimation(true);
    
    try {
      const dataService = RealDataService.getInstance(toast);
      const results = await dataService.performAGIScan();
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simular análisis
      
      setScanResults(results);
      setAgiStatus(results.detected ? 'detected' : 'not-detected');
      setLastScanTime(new Date().toLocaleString());
      setPulseAnimation(false);
      
      if (results.detected) {
        toast({
          title: "🚨 ¡AGI DETECTADA!",
          description: `Confianza: ${results.confidence}%. Verificando fuentes...`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "🤖 Análisis completado",
          description: `Confianza AGI: ${results.confidence}%. Continuando monitoreo...`,
        });
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Fondo mejorado con colores únicos */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950/50 to-black"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0ZjQ2ZTUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] animate-pulse"></div>
      <FloatingParticles />
      
      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header con nuevos colores */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative mb-8">
            <h1 className="text-7xl md:text-9xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
              AGI
            </h1>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            DETECTOR EN TIEMPO REAL
          </h2>
          <p className="text-lg text-gray-300 mb-2 max-w-2xl mx-auto leading-relaxed">
            Sistema conectado a fuentes reales: ArXiv, Reddit, Hacker News
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>CONECTADO A FUENTES REALES</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Status con nuevos colores */}
        <Card className="bg-black/40 backdrop-blur-xl border border-teal-500/30 p-6 mb-12 max-w-sm w-full shadow-2xl shadow-teal-500/10">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-teal-500/20 border border-teal-500/30">
                {getStatusIcon()}
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${getStatusColor()}`}>
              {agiStatus === 'detected' && 'AGI CONFIRMADA'}
              {agiStatus === 'not-detected' && 'AGI NO DETECTADA'}
              {agiStatus === 'scanning' && 'ESCANEANDO...'}
              {agiStatus === 'unknown' && 'ESPERANDO ANÁLISIS'}
            </h3>
            {scanResults && (
              <p className="text-xs text-teal-300">
                Confianza: {scanResults.confidence}%
              </p>
            )}
            {lastScanTime && (
              <p className="text-xs text-gray-400">
                Último escaneo: {lastScanTime}
              </p>
            )}
          </div>
        </Card>

        {/* Botón 3D realista con colores únicos */}
        <div className="mb-16 relative perspective-1000">
          {/* Sombra base profunda */}
          <div className="absolute inset-0 top-6 rounded-full bg-black/40 blur-2xl scale-110"></div>
          
          {/* Glow exterior */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 blur-xl opacity-60 ${pulseAnimation ? 'animate-pulse scale-110' : ''}`}></div>
          
          <Button
            onClick={handleScanForAGI}
            disabled={isScanning}
            className={`relative w-52 h-52 rounded-full transition-all duration-300 transform-gpu group
              ${isScanning 
                ? 'animate-spin shadow-2xl shadow-teal-500/50' 
                : 'hover:scale-105 hover:shadow-3xl hover:shadow-emerald-500/30 active:scale-95'
              }
              bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500
              hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400
              border-4 border-white/20
              shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_2px_10px_rgba(255,255,255,0.1),inset_0_-2px_10px_rgba(0,0,0,0.2)]
              before:absolute before:inset-2 before:rounded-full before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
              after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-br after:from-transparent after:via-transparent after:to-black/10`}
          >
            <div className="relative z-10 flex flex-col items-center space-y-3 text-white">
              {isScanning ? (
                <>
                  <Loader2 className="w-14 h-14 animate-spin drop-shadow-lg" />
                  <span className="text-xl font-black tracking-wider drop-shadow-lg">ANALIZANDO</span>
                  <span className="text-xs opacity-90 font-medium">Fuentes reales...</span>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-1">
                    <Search className="w-12 h-12 drop-shadow-lg group-hover:scale-110 transition-transform" />
                    <Zap className="w-10 h-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-2xl font-black tracking-wider drop-shadow-lg">DETECTAR</span>
                  <span className="text-sm opacity-90 font-semibold tracking-wide">AGI AHORA</span>
                </>
              )}
            </div>
            
            {/* Efecto de brillo animado */}
            {!isScanning && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            )}
          </Button>
          
          {/* Anillos de energía */}
          <div className={`absolute inset-0 rounded-full border-2 border-emerald-400/30 scale-125 ${pulseAnimation ? 'animate-ping' : ''}`}></div>
          <div className={`absolute inset-0 rounded-full border border-teal-400/20 scale-150 ${pulseAnimation ? 'animate-ping animation-delay-200' : ''}`}></div>
        </div>

        {/* Scanner Component con transición mejorada */}
        {isScanning && (
          <div className="mb-12 animate-fade-in transform transition-all duration-500 scale-105">
            <AGIScanner />
          </div>
        )}

        {/* News Display con datos reales */}
        <div className="w-full max-w-4xl transform transition-all duration-700 hover:scale-102">
          <NewsDisplay useRealData={true} />
        </div>

        {/* Footer con indicadores de fuentes reales */}
        <div className="text-center text-gray-400 text-sm mt-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs">ArXiv Live</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Reddit r/ML</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Hacker News</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Google Scholar</span>
            </div>
          </div>
          <p className="text-xs opacity-60">
            🤖 Conectado a fuentes reales de investigación e información
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
