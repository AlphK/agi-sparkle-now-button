
import { useEffect } from 'react';
import { VERIFIED_NEWS_SOURCES } from '@/config/newsSources';
import { getCardTransform } from '@/utils/cardTransforms';
import { useContentLoader } from '@/hooks/useContentLoader';
import { useCarouselNavigation } from '@/hooks/useCarouselNavigation';
import { CarouselCard } from './carousel/CarouselCard';
import { CarouselControls } from './carousel/CarouselControls';
import '@/styles/carousel.css';

const EmbeddedCoverFlow = () => {
  const { activeIndex, setActiveIndex, nextSlide, prevSlide, carouselRef } = useCarouselNavigation(VERIFIED_NEWS_SOURCES.length);
  const { contentStates, loadContent, refreshContent } = useContentLoader();

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
          loadContent(index, VERIFIED_NEWS_SOURCES[index]);
        }, i * 500);
      }
    });
  }, [activeIndex, contentStates, loadContent]);

  const handleRefresh = (index: number) => {
    refreshContent(index, VERIFIED_NEWS_SOURCES[index]);
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
      <div className="flex items-center justify-center" style={{ perspective: '1200px' }}>
        <div className="w-full max-w-6xl relative">
          <div className="relative flex items-center justify-center" style={{ height: '800px' }}>
            {VERIFIED_NEWS_SOURCES.map((source, index) => {
              const cardStyle = getCardTransform(index, activeIndex, VERIFIED_NEWS_SOURCES.length);
              const isActive = index === activeIndex;
              const state = contentStates[index];
              
              return (
                <CarouselCard
                  key={index}
                  source={source}
                  index={index}
                  isActive={isActive}
                  state={state}
                  cardStyle={cardStyle}
                  onCardClick={setActiveIndex}
                  onRefresh={handleRefresh}
                />
              );
            })}
          </div>

          <CarouselControls
            activeIndex={activeIndex}
            totalSources={VERIFIED_NEWS_SOURCES.length}
            onPrevious={prevSlide}
            onNext={nextSlide}
            onDotClick={setActiveIndex}
          />
        </div>
      </div>
    </section>
  );
};

export default EmbeddedCoverFlow;
