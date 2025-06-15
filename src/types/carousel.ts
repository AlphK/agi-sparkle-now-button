
export interface NewsSource {
  title: string;
  url: string;
  category: string;
  originalUrl?: string;
  ampUrl?: string;
}

export interface ContentState {
  isLoaded: boolean;
  hasError: boolean;
  isScreenshot: boolean;
  content: 'loading' | 'iframe' | 'screenshot' | 'error';
}

export interface CardTransform {
  transform: string;
  zIndex: number;
  opacity: number;
}
