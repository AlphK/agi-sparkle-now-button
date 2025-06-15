
import { NewsSource, ContentState } from '@/types/carousel';

interface ContentRendererProps {
  source: NewsSource;
  index: number;
  state: ContentState | undefined;
}

export const ContentRenderer = ({ source, index, state }: ContentRendererProps) => {
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
        src={source.url}
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        title={`Preview of ${source.title}`}
      />
    );
  }

  if (state.content === 'screenshot') {
    const screenshotUrl = `https://image.thum.io/get/width/600/crop/800/${encodeURIComponent(source.originalUrl || source.url)}`;
    return (
      <div className="relative w-full h-full">
        <img
          src={screenshotUrl}
          alt={`Screenshot of ${source.title}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          onError={(e) => {
            console.error(`Screenshot failed to load: ${screenshotUrl}`);
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
            href={source.originalUrl || source.url} 
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
