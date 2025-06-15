
import { useState, useEffect, useRef, useCallback } from 'react';

export const useCarouselNavigation = (totalSources: number) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSources);
  }, [totalSources]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalSources) % totalSources);
  }, [totalSources]);

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
  }, [activeIndex, nextSlide, prevSlide]);

  return {
    activeIndex,
    setActiveIndex,
    nextSlide,
    prevSlide,
    carouselRef
  };
};
