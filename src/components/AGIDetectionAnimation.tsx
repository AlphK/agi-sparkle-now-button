
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
      
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isDetected, onClose]);

  if (!isDetected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti explosión */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-bounce"
              style={{
                left: `${45 + Math.random() * 10}%`,
                top: `${45 + Math.random() * 10}%`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'][Math.floor(Math.random() * 10)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                transform: `
                  translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px) 
                  rotate(${Math.random() * 360}deg)
                `,
                transition: 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Mensaje simple */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 z-10">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ¡AGI ACHIEVED!
        </h1>
        <p className="text-gray-600 mb-6">
          La Singularidad ha llegado
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default AGIDetectionAnimation;
