
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { validateUrl, sanitizeUrl } from '@/utils/trustedDomains';
import { securityLogger } from '@/utils/securityLogger';

interface NewsSource {
  title: string;
  url: string;
  category: string;
  originalUrl?: string;
  ampUrl?: string;
}

interface ContentState {
  isLoaded: boolean;
  hasError: boolean;
  isScreenshot: boolean;
  content: 'loading' | 'iframe' | 'screenshot' | 'error';
}

const VERIFIED_NEWS_SOURCES: NewsSource[] = [
  {
    title: "OpenAI News",
    url: "https://openai.com/news/",
    originalUrl: "https://openai.com/news/",
    category: "Industry"
  },
  {
    title: "Hacker News AI",
    url: "https://hn.algolia.com/?q=artificial+intelligence",
    originalUrl: "https://hn.algolia.com/?q=artificial+intelligence",
    category: "Tech"
  },
  {
    title: "Wired AI",
    url: "https://www.wired.com/tag/artificial-intelligence/",
    originalUrl: "https://www.wired.com/tag/artificial-intelligence/",
    category: "News"
  },
  {
    title: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/",
    originalUrl: "https://venturebeat.com/category/ai/",
    category: "News"
  },
  {
    title: "The Next Web AI",
    url: "https://thenextweb.com/neural",
    originalUrl: "https://thenextweb.com/neural",
    category: "Tech"
  },
  {
    title: "Analytics India AI",
    url: "https://analyticsindiamag.com/category/ai/",
    originalUrl: "https://analyticsindiamag.com/category/ai/",
    category: "Tech"
  }
];

const EmbeddedCoverFlow = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentStates, setContentStates] = useState<{ [key: number]: ContentState }>({});
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

  const loadContent = async (index: number) => {
    const source = VERIFIED_NEWS_SOURCES[index];
    
    // Validación de seguridad antes de cargar
    if (!validateUrl(source.url)) {
      console.error(`🔒 URL no confiable rechazada: ${source.url}`);
      securityLogger.log('url_validation_failed', `Rejected untrusted URL for ${source.title}`, source.url);
      setContentStates(prev => ({
        ...prev,
        [index]: { isLoaded: true, hasError: true, isScreenshot: false, content: 'error' }
      }));
      return;
    }
    
    console.log(`🔄 Loading content for ${source.title}...`);
    
    setContentStates(prev => ({
      ...prev,
      [index]: { isLoaded: false, hasError: false, isScreenshot: false, content: 'loading' }
    }));

    try {
      // Try loading iframe first with security timeout
      await new Promise<void>((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.src = sanitizeUrl(source.url);
        iframe.style.display = 'none';
        
        // Configuración de seguridad del iframe
        iframe.sandbox.add(
          'allow-same-origin', 
          'allow-scripts', 
          'allow-popups', 
          'allow-forms',
          'allow-top-navigation-by-user-activation'
        );
        
        // Headers de seguridad adicionales
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.loading = 'lazy';
        
        const timeout = setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          securityLogger.log('iframe_load_failed', `Timeout loading ${source.title}`, source.url);
          reject(new Error('Timeout'));
        }, 5000); // Timeout más corto

        iframe.onload = () => {
          clearTimeout(timeout);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve();
        };
        
        iframe.onerror = () => {
          clearTimeout(timeout);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          securityLogger.log('iframe_load_failed', `Iframe error for ${source.title}`, source.url);
          reject(new Error('Iframe failed'));
        };
        
        document.body.appendChild(iframe);
      });

      console.log(`✅ Iframe loaded successfully for ${source.title}`);
      setContentStates(prev => ({
        ...prev,
        [index]: { isLoaded: true, hasError: false, isScreenshot: false, content: 'iframe' }
      }));

    } catch (error) {
      console.log(`❌ Iframe failed for ${source.title}, trying screenshot...`);
      
      try {
        // Try screenshot fallback with validation
        const screenshotUrl = `https://image.thum.io/get/width/600/crop/800/${encodeURIComponent(source.originalUrl || source.url)}`;
        
        if (!validateUrl(screenshotUrl)) {
          throw new Error('Screenshot URL validation failed');
        }
        
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => {
            securityLogger.log('iframe_load_failed', `Screenshot failed for ${source.title}`, screenshotUrl);
            reject(new Error('Screenshot failed'));
          };
          img.src = screenshotUrl;
        });

        console.log(`✅ Screenshot loaded for ${source.title}`);
        setContentStates(prev => ({
          ...prev,
          [index]: { isLoaded: true, hasError: false, isScreenshot: true, content: 'screenshot' }
        }));

      } catch (screenshotError) {
        console.log(`❌ Screenshot also failed for ${source.title}, showing error state`);
        setContentStates(prev => ({
          ...prev,
          [index]: { isLoaded: true, hasError: true, isScreenshot: false, content: 'error' }
        }));
      }
    }
  };

  const refreshContent = (index: number) => {
    console.log(`🔄 Refreshing content for ${VERIFIED_NEWS_SOURCES[index].title}`);
    setContentStates(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      return newStates;
    });
    loadContent(index);
  };

  useEffect(() => {
    // Load content for visible cards with delay
    const indicesToLoad = [
      activeIndex,
      (activeIndex + 1) % VERIFIED_NEWS_SOURCES.length,
      (activeIndex - 1 + VERIFIED_NEWS_SOURCES.length) % VERIFIED_NEWS_SOURCES.length
    ];

    indicesToLoad.forEach((index, i) => {
      if (!contentStates[index]) {
        // Add delay between requests to avoid rate limiting
        setTimeout(() => {
          loadContent(index);
        }, i * 500);
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
        const activeCard = carousel.querySelector(`[data-card-index="${activeIndex}"]`);
        const iframe = activeCard?.querySelector('iframe');
        const cardHeader = activeCard?.querySelector('.card-header');
        const cardButtons = activeCard?.querySelector('.flex.space-x-2');
        
        // Solo interceptar wheel si NO está sobre el iframe, header o botones de la tarjeta activa
        const isOverActiveIframe = iframe && iframe.contains(target);
        const isOverCardHeader = cardHeader && cardHeader.contains(target);
        const isOverCardButtons = cardButtons && cardButtons.contains(target);
        
        if (!isOverActiveIframe && !isOverCardHeader && !isOverCardButtons) {
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
      // Solo manejar teclas si no hay elementos activos que necesiten el teclado
      const activeElement = document.activeElement;
      const isInputActive = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).isContentEditable
      );

      if (!isInputActive) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          prevSlide();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          nextSlide();
        }
      }
    };

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      carousel.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex]);

  const renderContent = (source: NewsSource, index: number) => {
    const state = contentStates[index];
    
    if (!state || state.content === 'loading') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-500">Loading {source.title}...</div>
          </div>
        </div>
      );
    }

    if (state.content === 'iframe') {
      return (
        <iframe
          src={sanitizeUrl(source.url)}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={`Preview of ${source.title}`}
        />
      );
    }

    if (state.content === 'screenshot') {
      const screenshotUrl = sanitizeUrl(`https://image.thum.io/get/width/600/crop/800/${encodeURIComponent(source.originalUrl || source.url)}`);
      return (
        <div className="relative w-full h-full">
          <img
            src={screenshotUrl}
            alt={`Screenshot of ${source.title}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            onError={(e) => {
              console.error(`Screenshot failed to load: ${screenshotUrl}`);
              securityLogger.log('iframe_load_failed', `Screenshot image failed to load for ${source.title}`, screenshotUrl);
            }}
          />
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            📸 Preview
          </div>
        </div>
      );
    }

    if (state.content === 'error') {
      return (
        <div className="flex items-center justify-center h-full bg-white rounded-lg">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Content unavailable</h3>
            <p className="text-gray-600 mb-4">Visit directly:</p>
            <a 
              href={sanitizeUrl(source.originalUrl || source.url)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:-translate-y-1 shadow-lg"
            >
              Visit {source.title}
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

        .coverflow-card:not(.active) {
          pointer-events: auto;
        }

        .coverflow-card.active {
          pointer-events: auto;
        }

        .coverflow-card:not(.active) .card-iframe-container iframe {
          pointer-events: none;
        }

        .coverflow-card.active .card-iframe-container iframe {
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
      `}</style>

      <div className="flex items-center justify-center" style={{ perspective: '1200px' }}>
        <div className="w-full max-w-6xl relative">
          <div className="relative flex items-center justify-center" style={{ height: '800px' }}>
            {VERIFIED_NEWS_SOURCES.map((source, index) => {
              const cardStyle = getCardTransform(index);
              const isActive = index === activeIndex;
              const state = contentStates[index];
              
              return (
                <article
                  key={index}
                  data-card-index={index}
                  className={`coverflow-card ${isActive ? 'active' : ''}`}
                  style={cardStyle}
                >
                  {/* Overlay clickeable para tarjetas inactivas */}
                  {!isActive && (
                    <div
                      onClick={() => setActiveIndex(index)}
                      className="absolute inset-0 z-30 cursor-pointer bg-transparent hover:bg-black/5 transition-colors"
                      title={`Activar ${source.title}`}
                    />
                  )}
                  
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
                            {state?.isScreenshot && <span className="text-blue-600">📸 Preview</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              refreshContent(index);
                            }}
                            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors z-40 relative"
                            title="Refresh content"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              window.open(source.originalUrl || source.url, '_blank');
                            }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors z-40 relative"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 card-iframe-container relative">
                      {renderContent(source, index)}
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
