
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselControlsProps {
  activeIndex: number;
  totalSources: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
}

export const CarouselControls = ({
  activeIndex,
  totalSources,
  onPrevious,
  onNext,
  onDotClick
}: CarouselControlsProps) => {
  return (
    <>
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalSources }, (_, index) => (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-blue-500 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-30"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-30"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </>
  );
};
