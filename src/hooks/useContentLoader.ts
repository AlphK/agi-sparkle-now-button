
import { useState, useCallback } from 'react';
import { ContentState, NewsSource } from '@/types/carousel';

export const useContentLoader = () => {
  const [contentStates, setContentStates] = useState<{ [key: number]: ContentState }>({});

  const loadContent = useCallback(async (index: number, source: NewsSource) => {
    console.log(`🔄 Loading content for ${source.title}...`);
    
    setContentStates(prev => ({
      ...prev,
      [index]: { isLoaded: false, hasError: false, isScreenshot: false, content: 'loading' }
    }));

    try {
      // Simple iframe loading test
      await new Promise<void>((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.src = source.url;
        iframe.style.display = 'none';
        
        const timeout = setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(new Error('Timeout'));
        }, 5000);

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
        const screenshotUrl = `https://image.thum.io/get/width/600/crop/800/${encodeURIComponent(source.originalUrl || source.url)}`;
        
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Screenshot failed'));
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
  }, []);

  const refreshContent = useCallback((index: number, source: NewsSource) => {
    console.log(`🔄 Refreshing content for ${source.title}`);
    setContentStates(prev => {
      const newStates = { ...prev };
      delete newStates[index];
      return newStates;
    });
    loadContent(index, source);
  }, [loadContent]);

  return {
    contentStates,
    loadContent,
    refreshContent,
    setContentStates
  };
};
