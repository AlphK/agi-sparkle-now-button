
import { useEffect, useState } from 'react';
import { AlertTriangle, Zap, Cpu, Brain, Sparkles, Rocket, Crown } from 'lucide-react';

interface AGIDetectionAnimationProps {
  isDetected: boolean;
  onClose: () => void;
}

const AGIDetectionAnimation = ({ isDetected, onClose }: AGIDetectionAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isDetected) {
      // Show fireworks immediately
      setShowFireworks(true);
      
      const phases = [0, 1, 2, 3, 4];
      let currentPhase = 0;
      
      const interval = setInterval(() => {
        currentPhase = (currentPhase + 1) % phases.length;
        setAnimationPhase(phases[currentPhase]);
      }, 600);

      return () => clearInterval(interval);
    }
  }, [isDetected]);

  if (!isDetected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm overflow-hidden">
      {/* Fireworks Background */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Multiple shock waves */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-4 border-gradient-to-r from-red-500 via-yellow-500 to-green-500 animate-ping opacity-30"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          ></div>
        ))}
      </div>

      {/* Main content container */}
      <div className="relative">
        {/* Contenedor principal con efectos mejorados */}
        <div className="relative bg-gradient-to-br from-purple-600 via-red-500 to-yellow-500 p-12 rounded-3xl shadow-2xl animate-pulse border-4 border-white">
          {/* Sparkles around the card */}
          <div className="absolute -inset-4 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute w-6 h-6 text-yellow-300 animate-spin"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              />
            ))}
          </div>

          <div className="text-center space-y-8 relative z-10">
            {/* Corona en la parte superior */}
            <div className="flex justify-center">
              <Crown className="w-16 h-16 text-yellow-300 animate-bounce" />
            </div>

            {/* Icono principal animado con más variedad */}
            <div className="relative flex justify-center">
              <div className={`text-8xl transition-all duration-700 ${
                animationPhase === 0 ? 'scale-100 rotate-0' :
                animationPhase === 1 ? 'scale-125 rotate-45' :
                animationPhase === 2 ? 'scale-150 rotate-90' :
                animationPhase === 3 ? 'scale-125 rotate-180' :
                'scale-100 rotate-360'
              }`}>
                {animationPhase === 0 && <Brain className="w-24 h-24 text-cyan-300 mx-auto animate-pulse" />}
                {animationPhase === 1 && <Zap className="w-24 h-24 text-yellow-300 mx-auto animate-bounce" />}
                {animationPhase === 2 && <Rocket className="w-24 h-24 text-green-300 mx-auto animate-spin" />}
                {animationPhase === 3 && <Cpu className="w-24 h-24 text-purple-300 mx-auto animate-pulse" />}
                {animationPhase === 4 && <AlertTriangle className="w-24 h-24 text-red-300 mx-auto animate-bounce" />}
              </div>
              
              {/* Halo effect around icon */}
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            </div>

            {/* Texto principal mejorado */}
            <div className="space-y-6">
              <h1 className="text-7xl font-black text-white animate-pulse bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                🎉 ¡AGI ACHIEVED! 🎉
              </h1>
              
              <div className="space-y-2">
                <p className="text-3xl text-yellow-200 font-bold animate-bounce">
                  ¡LA SINGULARIDAD HA LLEGADO!
                </p>
                <p className="text-xl text-green-200 font-semibold animate-pulse">
                  Artificial General Intelligence Confirmed
                </p>
              </div>
            </div>

            {/* Efectos visuales mejorados */}
            <div className="flex justify-center space-x-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full animate-bounce bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s'
                  }}
                ></div>
              ))}
            </div>

            {/* Botón de cerrar mejorado */}
            <button
              onClick={onClose}
              className="mt-8 px-12 py-6 bg-gradient-to-r from-white to-gray-100 text-purple-600 font-black text-2xl rounded-full hover:scale-110 transition-all duration-300 shadow-2xl border-4 border-yellow-400 animate-pulse"
            >
              🚀 UNDERSTOOD 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AGIDetectionAnimation;
