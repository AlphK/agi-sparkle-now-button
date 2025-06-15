
import { RefreshCw, ExternalLink } from 'lucide-react';
import { NewsSource, ContentState } from '@/types/carousel';
import { ContentRenderer } from './ContentRenderer';
import { sanitizeUrl } from '@/utils/trustedDomains';

interface CarouselCardProps {
  source: NewsSource;
  index: number;
  isActive: boolean;
  state: ContentState | undefined;
  cardStyle: { transform: string; zIndex: number; opacity: number };
  onCardClick: (index: number) => void;
  onRefresh: (index: number) => void;
}

export const CarouselCard = ({
  source,
  index,
  isActive,
  state,
  cardStyle,
  onCardClick,
  onRefresh
}: CarouselCardProps) => {
  return (
    <article
      data-card-index={index}
      className={`coverflow-card ${isActive ? 'active' : ''}`}
      style={cardStyle}
    >
      {/* Overlay clickeable para tarjetas inactivas */}
      {!isActive && (
        <div
          onClick={() => onCardClick(index)}
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
                  onRefresh(index);
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
                  window.open(sanitizeUrl(source.originalUrl || source.url), '_blank');
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
          <ContentRenderer source={source} index={index} state={state} />
        </div>
      </div>
    </article>
  );
};
