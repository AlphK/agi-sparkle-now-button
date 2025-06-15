
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface NewsSource {
  title: string;
  url: string;
  category: string;
}

interface ContentState {
  isLoaded: boolean;
  hasError: boolean;
  content: 'loading' | 'iframe' | 'error';
}

const NEWS_SOURCES: NewsSource[] = [
  {
    title: "OpenAI News",
    url: "https://openai.com/news/",
    category: "Industry"
  },
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
  const [contentStates, setContentStates] = useState<{ [key: number]: ContentState }>({});
  const carouselRef = useRef<HTMLElement>(null);

  const getCardTransform = (index: number) => {
    const diff = index - activeIndex;
    
    if (diff === 0) {
      return {
        transform: 'translateZ(160px) rotateY(0deg) scale(1)',
        zIndex: 10,
        opacity: 1
      };
    } else if (diff === 1 || (diff === -(NEWS_SOURCES.length - 1))) {
      return {
        transform: 'translateX(220px) rotateY(-40deg) scale(0.8)',
        zIndex: 5,
        opacity: 0.7
      };
    } else if (diff === -1 || (diff === (NEWS_SOURCES.length - 1))) {
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
    setActiveIndex((prev) => (prev + 1) % NEWS_SOURCES.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + NEWS_SOURCES.length) % NEWS_SOURCES.length);
  };

  const loadContent = async (index: number) => {
    const source = NEWS_SOURCES[index];
    
    console.log(`🔄 Cargando contenido para ${source.title}...`);
    
    setContentStates(prev => ({
      ...prev,
      [index]: { isLoaded: false, hasError: false, content: 'loading' }
    }));

    // Simular carga exitosa
    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1500);
      });

      console.log(`✅ Contenido cargado para ${source.title}`);
      setContentStates(prev => ({
        ...prev,
        [index]: { isLoaded: true, hasError: false, content: 'iframe' }
      }));

    } catch (error) {
      console.log(`❌ Error cargando ${source.title}:`, error);
      setContentStates(prev => ({
        ...prev,
        [index]: { isLoaded: true, hasError: true, content: 'error' }
      }));
    }
  };

  const refreshContent = (index: number) => {
    console.log(`🔄 Refrescando contenido para ${NEWS_SOURCES[index].title}`);
    setContentStates(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      return newStates;
    });
    loadContent(index);
  };

  useEffect(() => {
    // Cargar contenido para tarjetas visibles
    const indicesToLoad = [
      activeIndex,
      (activeIndex + 1) % NEWS_SOURCES.length,
      (activeIndex - 1 + NEWS_SOURCES.length) % NEWS_SOURCES.length
    ];

    indicesToLoad.forEach((index, i) => {
      if (!contentStates[index]) {
        setTimeout(() => {
          loadContent(index);
        }, i * 300);
      }
    });
  }, [activeIndex]);

  const renderContent = (source: NewsSource, index: number) => {
    const state = contentStates[index];
    const isActive = index === activeIndex;
    
    if (!state || state.content === 'loading') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-500">Cargando {source.title}...</div>
          </div>
        </div>
      );
    }

    if (state.content === 'iframe') {
      return (
        <iframe
          src={source.url}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none', 
            borderRadius: '12px'
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          referrerPolicy="no-referrer"
          title={`Content from ${source.title}`}
          scrolling="yes"
        />
      );
    }

    if (state.content === 'error') {
      return (
        <div className="flex items-center justify-center h-full bg-white rounded-lg">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Contenido no disponible</h3>
            <p className="text-gray-600 mb-4">Visita directamente:</p>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:-translate-y-1 shadow-lg"
            >
              Visitar {source.title}
            </a>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <section 
      ref={carouselRef}
      className="min-h-screen bg-white p-8 relative overflow-hidden"
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
        }

        .coverflow-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .coverflow-card.active {
          border-color: #3b82f6;
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
          cursor: default;
        }

        .coverflow-card:not(.active) {
          cursor: pointer;
        }

        .card-iframe-container {
          width: 100%;
          height: 100%;
          overflow: auto;
          background: white;
          border-radius: 12px;
          position: relative;
        }

        .card-iframe-container iframe {
          pointer-events: auto;
        }

        .coverflow-card:not(.active) .card-iframe-container iframe {
          pointer-events: none;
        }
      `}</style>

      <div className="flex items-center justify-center" style={{ perspective: '1200px' }}>
        <div className="w-full max-w-6xl relative">
          <div className="relative flex items-center justify-center" style={{ height: '800px' }}>
            {NEWS_SOURCES.map((source, index) => {
              const cardStyle = getCardTransform(index);
              const isActive = index === activeIndex;
              
              return (
                <article
                  key={index}
                  className={`coverflow-card ${isActive ? 'active' : ''}`}
                  style={cardStyle}
                  onClick={() => !isActive && setActiveIndex(index)}
                >
                  <div className="h-full p-4 flex flex-col relative">
                    <div className="card-header mb-4 relative z-20 bg-white/95 backdrop-blur rounded-lg p-3">
                      <div className="flex gap-2 mb-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-gray-800">{source.title}</div>
                          <div className="text-sm text-gray-600">{source.category}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshContent(index);
                            }}
                            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            title="Refresh content"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(source.url, '_blank');
                            }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 card-iframe-container">
                      {renderContent(source, index)}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Controles de navegación */}
          <div className="flex justify-center mt-8 space-x-2">
            {NEWS_SOURCES.map((_, index) => (
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-30"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-30"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EmbeddedCoverFlow;
