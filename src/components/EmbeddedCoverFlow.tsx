
import { useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsSource {
  title: string;
  url: string;
  category: string;
}

interface EmbeddedCoverFlowProps {
  sources?: NewsSource[];
}

const VERIFIED_NEWS_SOURCES: NewsSource[] = [
  {
    title: "Hacker News AI",
    url: "https://hn.algolia.com/?q=artificial+intelligence",
    category: "Tech"
  },
  {
    title: "Wired AI",
    url: "https://www.wired.com/tag/artificial-intelligence/",
    category: "News"
  },
  {
    title: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/",
    category: "News"
  },
  {
    title: "The Next Web AI",
    url: "https://thenextweb.com/neural",
    category: "Tech"
  },
  {
    title: "Analytics India AI",
    url: "https://analyticsindiamag.com/category/ai/",
    category: "Tech"
  }
];

const EmbeddedCoverFlow = ({ sources = VERIFIED_NEWS_SOURCES }: EmbeddedCoverFlowProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSources, setLoadedSources] = useState<Set<number>>(new Set());

  const getCardTransform = (index: number) => {
    const diff = index - activeIndex;
    
    if (diff === 0) {
      return {
        transform: 'translateZ(160px) rotateY(0deg) scale(1)',
        zIndex: 10,
        opacity: 1
      };
    } else if (diff === 1 || (diff === -(sources.length - 1))) {
      return {
        transform: 'translateX(220px) rotateY(-40deg) scale(0.8) translateZ(0px)',
        zIndex: 5,
        opacity: 0.7
      };
    } else if (diff === -1 || (diff === (sources.length - 1))) {
      return {
        transform: 'translateX(-220px) rotateY(40deg) scale(0.8) translateZ(0px)',
        zIndex: 5,
        opacity: 0.7
      };
    } else if (diff === 2 || diff === -(sources.length - 2)) {
      return {
        transform: 'translateX(320px) rotateY(-50deg) scale(0.6) translateZ(-80px)',
        zIndex: 2,
        opacity: 0.4
      };
    } else if (diff === -2 || diff === (sources.length - 2)) {
      return {
        transform: 'translateX(-320px) rotateY(50deg) scale(0.6) translateZ(-80px)',
        zIndex: 2,
        opacity: 0.4
      };
    } else {
      return {
        transform: 'translateX(400px) rotateY(-60deg) scale(0.4) translateZ(-160px)',
        zIndex: 1,
        opacity: 0.2
      };
    }
  };

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % sources.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + sources.length) % sources.length);
  };

  const handleIframeLoad = (index: number) => {
    setLoadedSources(prev => new Set(prev).add(index));
    console.log(`Cargó: ${sources[index].title}`);
  };

  const handleIframeError = (index: number, error: any) => {
    console.error(`Error en ${sources[index].title}:`, error);
  };

  // Manejar scroll para navegación
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Element;
      const activeCard = document.querySelector('.coverflow-card.active');
      const isOnActiveCard = target.closest('.coverflow-card') === activeCard;
      
      if (!isOnActiveCard) {
        event.preventDefault();
        if (event.deltaY > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8 relative overflow-hidden">
      <style>{`
        :root {
          --card-width: 600px;
          --card-height: 800px;
          --spacing: 220px;
          --rotation: 40deg;
          --transition: 0.3s ease-in-out;
        }

        .card-iframe-container {
          width: 100%;
          height: 100%;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          background: white;
          border-radius: 12px;
        }

        .card-iframe-container iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
          border-radius: 12px;
        }

        .card-dots {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .card-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .card-dot.red { background-color: #ef4444; }
        .card-dot.yellow { background-color: #eab308; }
        .card-dot.green { background-color: #22c55e; }

        .coverflow-card {
          position: absolute;
          width: var(--card-width);
          height: var(--card-height);
          cursor: pointer;
          transition: all var(--transition);
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform-style: preserve-3d;
        }

        .coverflow-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .coverflow-card.active {
          border-color: #3b82f6;
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
        }
      `}</style>

      <div className="w-full max-w-6xl relative" style={{ perspective: '1200px' }}>
        <div className="relative h-96 flex items-center justify-center" style={{ height: 'var(--card-height)' }}>
          {sources.map((source, index) => {
            const cardStyle = getCardTransform(index);
            const isActive = index === activeIndex;
            
            return (
              <article
                key={index}
                className={`coverflow-card ${isActive ? 'active' : ''}`}
                style={cardStyle}
                onClick={() => handleCardClick(index)}
              >
                <div className="h-full p-4 flex flex-col relative overflow-hidden">
                  <div className="card-header mb-4 relative z-10">
                    <div className="card-dots">
                      <span className="card-dot red"></span>
                      <span className="card-dot yellow"></span>
                      <span className="card-dot green"></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-800 truncate">{source.title}</div>
                        <div className="text-sm text-gray-600">{source.category}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(source.url, '_blank');
                        }}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Abrir en nueva pestaña"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 card-iframe-container relative z-10">
                    {!loadedSources.has(index) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-gray-500">Cargando {source.title}...</div>
                      </div>
                    )}
                    <iframe
                      src={source.url}
                      loading="lazy"
                      sandbox="allow-same-origin allow-scripts"
                      referrerPolicy="no-referrer"
                      onLoad={() => handleIframeLoad(index)}
                      onError={(e) => handleIframeError(index, e)}
                      style={{ 
                        display: loadedSources.has(index) ? 'block' : 'none'
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {sources.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default EmbeddedCoverFlow;
