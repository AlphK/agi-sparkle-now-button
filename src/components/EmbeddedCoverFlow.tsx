
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface NewsSource {
  title: string;
  url: string;
  category: string;
  originalUrl?: string;
}

const VERIFIED_NEWS_SOURCES: NewsSource[] = [
  {
    title: "Hacker News AI",
    url: "https://cors-anywhere.herokuapp.com/https://hn.algolia.com/?q=artificial+intelligence",
    originalUrl: "https://hn.algolia.com/?q=artificial+intelligence",
    category: "Tech"
  },
  {
    title: "Wired AI", 
    url: "https://cors-anywhere.herokuapp.com/https://www.wired.com/tag/artificial-intelligence/",
    originalUrl: "https://www.wired.com/tag/artificial-intelligence/",
    category: "News"
  },
  {
    title: "VentureBeat AI",
    url: "https://cors-anywhere.herokuapp.com/https://venturebeat.com/category/ai/",
    originalUrl: "https://venturebeat.com/category/ai/",
    category: "News"
  },
  {
    title: "The Next Web AI",
    url: "https://thenextweb.com/neural/amp/",
    originalUrl: "https://thenextweb.com/neural",
    category: "Tech"
  },
  {
    title: "Analytics India AI",
    url: "https://cors-anywhere.herokuapp.com/https://analyticsindiamag.com/category/ai/",
    originalUrl: "https://analyticsindiamag.com/category/ai/",
    category: "Tech"
  }
];

const EmbeddedCoverFlow = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSources, setLoadedSources] = useState<Set<number>>(new Set());
  const [errorSources, setErrorSources] = useState<Set<number>>(new Set());
  const [screenshotSources, setScreenshotSources] = useState<Set<number>>(new Set());
  const carouselRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);
  const cache = new Map<string, string>();

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

  const loadIframe = (index: number, url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.loading = 'lazy';
      iframe.sandbox.add('allow-same-origin', 'allow-scripts', 'allow-popups', 'allow-forms', 'allow-top-navigation');
      iframe.referrerPolicy = 'no-referrer';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      
      const timeout = setTimeout(() => {
        reject(new Error('Iframe load timeout'));
      }, 10000);

      iframe.onload = () => {
        clearTimeout(timeout);
        setLoadedSources(prev => new Set(prev).add(index));
        resolve();
      };
      
      iframe.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Iframe load error'));
      };

      const container = document.querySelector(`[data-card-index="${index}"] .card-iframe-container`);
      if (container) {
        container.innerHTML = '';
        container.appendChild(iframe);
      }
    });
  };

  const loadScreenshot = (index: number, url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      // Usando un servicio de screenshot público (puedes cambiar por otro)
      img.src = `https://api.urlbox.io/v1/ca482d7e-9417-4569-90fe-80f7c5e1c781/png?url=${encodeURIComponent(url)}&width=600&height=800`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '12px';
      img.alt = `Screenshot of ${VERIFIED_NEWS_SOURCES[index].title}`;
      
      img.onload = () => {
        setScreenshotSources(prev => new Set(prev).add(index));
        resolve();
      };
      
      img.onerror = () => reject(new Error('Screenshot load error'));

      const container = document.querySelector(`[data-card-index="${index}"] .card-iframe-container`);
      if (container) {
        container.innerHTML = '';
        container.appendChild(img);
      }
    });
  };

  const showErrorState = (index: number) => {
    const source = VERIFIED_NEWS_SOURCES[index];
    const container = document.querySelector(`[data-card-index="${index}"] .card-iframe-container`);
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <div class="text-center p-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No se pudo cargar el contenido</h3>
            <p class="text-gray-600 mb-4">Intenta visitar directamente:</p>
            <a href="${source.originalUrl || source.url}" target="_blank" class="visit-button inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:-translate-y-1 shadow-lg">
              Visitar ${source.title}
            </a>
          </div>
        </div>
      `;
      setErrorSources(prev => new Set(prev).add(index));
    }
  };

  const loadContent = async (index: number) => {
    const source = VERIFIED_NEWS_SOURCES[index];
    const cacheKey = source.url;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      const container = document.querySelector(`[data-card-index="${index}"] .card-iframe-container`);
      if (container) {
        container.innerHTML = cache.get(cacheKey)!;
        setLoadedSources(prev => new Set(prev).add(index));
      }
      return;
    }

    try {
      console.log(`🔄 Intentando cargar iframe: ${source.title}`);
      await loadIframe(index, source.url);
      console.log(`✅ Iframe cargado: ${source.title}`);
      
      // Cache the successful load
      const container = document.querySelector(`[data-card-index="${index}"] .card-iframe-container`);
      if (container) {
        cache.set(cacheKey, container.innerHTML);
      }
    } catch (iframeError) {
      console.log(`❌ Error en iframe ${source.title}, intentando screenshot...`, iframeError);
      
      try {
        await loadScreenshot(index, source.originalUrl || source.url);
        console.log(`📸 Screenshot cargado: ${source.title}`);
      } catch (screenshotError) {
        console.log(`❌ Error en screenshot ${source.title}, mostrando estado de error...`, screenshotError);
        showErrorState(index);
      }
    }
  };

  const refreshContent = (index: number) => {
    const source = VERIFIED_NEWS_SOURCES[index];
    cache.delete(source.url);
    setLoadedSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setErrorSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setScreenshotSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    loadContent(index);
  };

  useEffect(() => {
    // Load content for visible cards
    const indicesToLoad = [
      activeIndex,
      (activeIndex + 1) % VERIFIED_NEWS_SOURCES.length,
      (activeIndex - 1 + VERIFIED_NEWS_SOURCES.length) % VERIFIED_NEWS_SOURCES.length
    ];

    indicesToLoad.forEach(index => {
      if (!loadedSources.has(index) && !errorSources.has(index)) {
        loadContent(index);
      }
    });
  }, [activeIndex]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Element;
      const isInCarousel = carousel.contains(target);
      
      if (isInCarousel && !isScrollingRef.current) {
        // Check if we're scrolling inside an active iframe or screenshot
        const activeCard = carousel.querySelector(`[data-card-index="${activeIndex}"]`);
        const isInActiveContent = activeCard && activeCard.contains(target);
        
        // Only prevent scroll if we're not inside the active content
        if (!isInActiveContent) {
          event.preventDefault();
          event.stopPropagation();
          
          isScrollingRef.current = true;
          
          if (event.deltaY > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 300);
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

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      carousel.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex]);

  return (
    <section 
      ref={carouselRef}
      id="ai-carousel-section" 
      className="min-h-screen bg-white p-8 relative overflow-hidden"
      style={{ 
        scrollSnapType: 'none',
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
        }

        /* Allow interaction only with active card */
        .coverflow-card:not(.active) {
          pointer-events: none;
        }

        .coverflow-card.active {
          pointer-events: auto;
        }

        .coverflow-card:not(.active) .card-iframe-container {
          pointer-events: none;
        }

        .coverflow-card.active .card-iframe-container {
          pointer-events: auto;
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

        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: white;
        }

        .visit-button {
          text-decoration: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .visit-button:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="flex items-center justify-center" style={{ perspective: '1200px' }}>
        <div className="w-full max-w-6xl relative">
          <div className="relative flex items-center justify-center" style={{ height: '800px' }}>
            {VERIFIED_NEWS_SOURCES.map((source, index) => {
              const cardStyle = getCardTransform(index);
              const isActive = index === activeIndex;
              const isLoaded = loadedSources.has(index);
              const hasError = errorSources.has(index);
              const isScreenshot = screenshotSources.has(index);
              
              return (
                <article
                  key={index}
                  data-card-index={index}
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
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <span>{source.category}</span>
                            {isScreenshot && <span className="text-blue-600">📸 Screenshot</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshContent(index);
                            }}
                            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            title="Recargar contenido"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(source.originalUrl || source.url, '_blank');
                            }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Abrir en nueva pestaña"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 card-iframe-container relative">
                      {!isLoaded && !hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-20">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <div className="text-gray-500">Cargando {source.title}...</div>
                          </div>
                        </div>
                      )}
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
