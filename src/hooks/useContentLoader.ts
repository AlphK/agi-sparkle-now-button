
import { useState, useCallback } from 'react';
import { ContentState, NewsSource } from '@/types/carousel';
import { validateUrl, sanitizeUrl } from '@/utils/trustedDomains';
import { securityLogger } from '@/utils/securityLogger';

export const useContentLoader = () => {
  const [contentStates, setContentStates] = useState<{ [key: number]: ContentState }>({});

  const loadContent = useCallback(async (index: number, source: NewsSource) => {
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
