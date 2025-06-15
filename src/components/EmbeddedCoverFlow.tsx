
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsSource {
  title: string;
  url: string;
  category: string;
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

const EmbeddedCoverFlow = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSources, setLoadedSources] = useState<Set<number>>(new Set());
  const carouselRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);

  const getCardTransform = (index: number) => {
    const diff = index - activeIndex;
    
    if (diff === 0) {
      return {
        transform: 'translateZ(160px) rotateY(0deg) scale(1)',
        zIndex: 10,
        opacity: 1
      };
    } else if (diff === 1 || (diff === -(VERIFIED_NEWS_SOURCES.length - 1))) {
      return {
        transform: 'translateX(220px) rotateY(-40deg) scale(0.8)',
        zIndex: 5,
        opacity: 0.7
      };
    } else if (diff === -1 || (diff === (VERIFIED_NEWS_SOURCES.length - 1))) {
      return {
        transform: 'translateX(-220px) rotateY(40deg) scale(0.8)',
        zIndex: 5,
        opacity: 0.7
      };
    } else {
      return {
        transform: 'translateX(400px) rotateY(-60deg) scale(0.4)',
        zIndex: 1,
        opacity: 0.2
      };
    }
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % VERIFIED_NEWS_SOURCES.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + VERIFIED_NEWS_SOURCES.length) % VERIFIED_NEWS_SOURCES.length);
  };

  const handleIframeLoad = (index: number) => {
    setLoadedSources(prev => new Set(prev).add(index));
    console.log(`✅ Cargó iframe: ${VERIFIED_NEWS_SOURCES[index].title}`);
  };

  const handleIframeError = (index: number, error: any) => {
    console.error(`❌ Error en iframe ${VERIFIED_NEWS_SOURCES[index].title}:`, error);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (event: WheelEvent) => {
      // Solo interceptar scroll si estamos en el área del carrusel
      const target = event.target as Element;
      const isInCarousel = carousel.contains(target);
      
      if (isInCarousel) {
        // Verificar si el scroll viene de dentro de un iframe activo
        const activeCard = carousel.querySelector('.coverflow-card.active');
        const isInActiveIframe = activeCard && activeCard.contains(target);
        
        if (!isInActiveIframe && !isScrollingRef.current) {
          event.preventDefault();
          event.stopPropagation();
          
          isScrollingRef.current = true;
          
          if (event.deltaY > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          
          // Liberar el scroll después de un pequeño delay
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 500);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      }
    };

    // Usar capture para interceptar eventos antes que lleguen a los iframes
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('wheel', handleWheel, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <section 
      ref={carouselRef}
      id="ai-carousel-section" 
      className="min-h-screen bg-white p-8 relative overflow-hidden"
      style={{ 
        scrollBehavior: 'auto',
        overscrollBehavior: 'contain'
      }}
    >
      <style>{`
        .coverflow-card {
          position: absolute;
          width: 600px;
          height: 800px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform-style: preserve-3d;
          will-change: transform;
          isolation: isolate;
        }

        .coverflow-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .coverflow-card.active {
          border-color: #3b82f6;
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
        }

        .card-iframe-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: white;
          border-radius: 12px;
          position: relative;
          isolation: isolate;
        }

        .card-iframe-container iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
          border-radius: 12px;
          display: block;
        }

        /* Mejorar la gestión de eventos en iframes */
        .coverflow-card:not(.active) {
          pointer-events: none;
        }

        .coverflow-card.active {
          pointer-events: auto;
        }

        .coverflow-card:not(.active) .card-iframe-container {
          pointer-events: none;
          user-select: none;
        }

        .coverflow-card.active .card-iframe-container {
          pointer-events: auto;
          user-select: auto;
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

        /* Prevenir conflictos de scroll */
        #ai-carousel-section {
          scroll-snap-type: none;
          overscroll-behavior: contain;
          touch-action: pan-y;
        }

        /* Asegurar que los iframes activos pueden recibir eventos */
        .coverflow-card.active iframe {
          pointer-events: auto !important;
        }
      `}</style>

      <div className="flex items-center justify-center" style={{ perspective: '1200px' }}>
        <div className="w-full max-w-6xl relative">
          <div className="relative flex items-center justify-center" style={{ height: '800px' }}>
            {VERIFIED_NEWS_SOURCES.map((source, index) => {
              const cardStyle = getCardTransform(index);
              const isActive = index === activeIndex;
              
              return (
                <article
                  key={index}
                  className={`coverflow-card ${isActive ? 'active' : ''}`}
                  style={cardStyle}
                  onClick={() => setActiveIndex(index)}
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
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors z-20"
                          title="Abrir en nueva pestaña"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 card-iframe-container relative z-10">
                      {!loadedSources.has(index) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-20">
                          <div className="text-gray-500">Cargando {source.title}...</div>
                        </div>
                      )}
                      <iframe
                        src={source.url}
                        loading="lazy"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-pointer-lock"
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={() => handleIframeLoad(index)}
                        onError={(e) => handleIframeError(index, e)}
                        style={{ 
                          display: 'block',
                          visibility: loadedSources.has(index) ? 'visible' : 'hidden',
                          pointerEvents: isActive ? 'auto' : 'none'
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {VERIFIED_NEWS_SOURCES.map((_, index) => (
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-30"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-30"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EmbeddedCoverFlow;
