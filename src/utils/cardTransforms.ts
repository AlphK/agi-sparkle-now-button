
import { CardTransform } from '@/types/carousel';

export const getCardTransform = (index: number, activeIndex: number, totalSources: number): CardTransform => {
  const diff = index - activeIndex;
  
  if (diff === 0) {
    return {
      transform: 'translateZ(160px) rotateY(0deg) scale(1)',
      zIndex: 10,
      opacity: 1
    };
  } else if (diff === 1 || (diff === -(totalSources - 1))) {
    return {
      transform: 'translateX(220px) rotateY(-40deg) scale(0.8)',
      zIndex: 5,
      opacity: 0.7
    };
  } else if (diff === -1 || (diff === (totalSources - 1))) {
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
