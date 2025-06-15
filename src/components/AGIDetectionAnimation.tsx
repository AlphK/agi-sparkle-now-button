
import { useEffect, useState } from 'react';
import { AlertTriangle, Zap, Cpu, Brain } from 'lucide-react';

interface AGIDetectionAnimationProps {
  isDetected: boolean;
  onClose: () => void;
}

const AGIDetectionAnimation = ({ isDetected, onClose }: AGIDetectionAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isDetected) {
      const phases = [0, 1, 2, 3];
      let currentPhase = 0;
      
      const interval = setInterval(() => {
        currentPhase = (currentPhase + 1) % phases.length;
        setAnimationPhase(phases[currentPhase]);
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isDetected]);

  if (!isDetected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative">
        {/* Ondas de choque */}
        <div className="absolute inset-0 animate-ping">
          <div className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="absolute inset-4 rounded-full bg-orange-500/30 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-8 rounded-full bg-yellow-500/30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Contenedor principal */}
        <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-8 rounded-3xl shadow-2xl animate-bounce">
          <div className="text-center space-y-6">
            {/* Icono principal animado */}
            <div className="relative">
              <div className={`text-8xl transition-all duration-500 ${
                animationPhase === 0 ? 'scale-100 rotate-0' :
                animationPhase === 1 ? 'scale-110 rotate-12' :
                animationPhase === 2 ? 'scale-120 rotate-0' :
                'scale-100 rotate-0'
              }`}>
                {animationPhase === 0 && <AlertTriangle className="w-24 h-24 text-white mx-auto animate-pulse" />}
                {animationPhase === 1 && <Zap className="w-24 h-24 text-yellow-300 mx-auto animate-bounce" />}
                {animationPhase === 2 && <Cpu className="w-24 h-24 text-blue-300 mx-auto animate-spin" />}
                {animationPhase === 3 && <Brain className="w-24 h-24 text-purple-300 mx-auto animate-pulse" />}
              </div>
            </div>

            {/* Texto principal */}
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-white animate-pulse">
                ¡AGI DETECTADA!
              </h1>
              <p className="text-2xl text-yellow-200 font-bold animate-bounce">
                Inteligencia Artificial General Confirmada
              </p>
            </div>

            {/* Efectos visuales */}
            <div className="flex justify-center space-x-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-white rounded-full animate-ping"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="mt-8 px-8 py-4 bg-white text-red-600 font-bold text-xl rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              ENTENDIDO
            </button>
          </div>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AGIDetectionAnimation;
