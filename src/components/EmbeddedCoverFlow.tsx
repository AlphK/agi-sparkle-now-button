
import React, { useEffect } from 'react';
import { VERIFIED_NEWS_SOURCES } from '@/config/newsSources';
import { useContentLoader } from '@/hooks/useContentLoader';
import { useCarouselNavigation } from '@/hooks/useCarouselNavigation';
import { getCardTransform } from '@/utils/cardTransforms';
import { CarouselCard } from './carousel/CarouselCard';
import { CarouselControls } from './carousel/CarouselControls';
import '@/styles/carousel.css';

const EmbeddedCoverFlow = () => {
  const { contentStates, loadContent, refreshContent } = useContentLoader();
  const { activeIndex, setActiveIndex, nextSlide, prevSlide, carouselRef } = useCarouselNavigation(VERIFIED_NEWS_SOURCES.length);

  useEffect(() => {
    // Load content for the active card and adjacent cards
    const indicesToLoad = [
      (activeIndex - 1 + VERIFIED_NEWS_SOURCES.length) % VERIFIED_NEWS_SOURCES.length,
      activeIndex,
      (activeIndex + 1) % VERIFIED_NEWS_SOURCES.length
    ];

    indicesToLoad.forEach(index => {
      if (!contentStates[index]?.isLoaded) {
        loadContent(index, VERIFIED_NEWS_SOURCES[index]);
      }
    });
  }, [activeIndex, contentStates, loadContent]);

  const handleCardClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleRefresh = (index: number) => {
    refreshContent(index, VERIFIED_NEWS_SOURCES[index]);
  };

  return (
    <section 
      ref={carouselRef as React.RefObject<HTMLElement>}
      className="relative py-16 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center overflow-hidden"
      style={{ perspective: '2000px' }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Latest AI News Sources
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse through curated AI news sources. Click on cards to activate them and interact with the content.
        </p>
      </div>

      <div className="relative w-full h-[800px] flex items-center justify-center">
        {VERIFIED_NEWS_SOURCES.map((source, index) => {
          const cardStyle = getCardTransform(index, activeIndex, VERIFIED_NEWS_SOURCES.length);
          
          return (
            <CarouselCard
              key={index}
              source={source}
              index={index}
              isActive={index === activeIndex}
              state={contentStates[index]}
              cardStyle={cardStyle}
              onCardClick={handleCardClick}
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
    </section>
  );
};

export default EmbeddedCoverFlow;
