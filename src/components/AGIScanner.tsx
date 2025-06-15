
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const AGIScanner = () => {
  const [progress, setProgress] = useState(0);
  const [currentSource, setCurrentSource] = useState('');
  
  const sources = [
    'ArXiv Papers',
    'Google DeepMind',
    'OpenAI Research',
    'Anthropic Papers',
    'MIT Research',
    'Stanford AI Lab',
    'GitHub Repositories',
    'AI News Sources'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 100);

    const sourceInterval = setInterval(() => {
      setCurrentSource(sources[Math.floor(Math.random() * sources.length)]);
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(sourceInterval);
    };
  }, []);

  return (
    <Card className="cyber-border bg-black/60 backdrop-blur-lg p-6 max-w-lg w-full mb-8 scan-line">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">
            ANÁLISIS EN PROGRESO
          </h3>
          <p className="text-sm text-gray-300">
            Escaneando: <span className="text-purple-400 font-mono">{currentSource}</span>
          </p>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Papers analizados:</span>
              <span className="text-green-400 font-mono">{Math.floor(progress * 1.23)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Repositorios:</span>
              <span className="text-blue-400 font-mono">{Math.floor(progress * 0.87)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">APIs consultadas:</span>
              <span className="text-purple-400 font-mono">{Math.floor(progress * 0.45)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Precisión:</span>
              <span className="text-yellow-400 font-mono">99.{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>BÚSQUEDA ACTIVA</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AGIScanner;
