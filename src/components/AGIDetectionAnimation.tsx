
import { useEffect, useState } from 'react';

interface AGIDetectionAnimationProps {
  isDetected: boolean;
  onClose: () => void;
}

const AGIDetectionAnimation = ({ isDetected, onClose }: AGIDetectionAnimationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isDetected) {
      setShowConfetti(true);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isDetected, onClose]);

  if (!isDetected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Confeti animado */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 7)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-lg mx-4">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ¡AGI ACHIEVED!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          La Singularidad ha llegado
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default AGIDetectionAnimation;
