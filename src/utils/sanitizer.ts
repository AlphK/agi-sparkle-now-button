
import DOMPurify from 'dompurify';

interface SanitizedContent {
  title: string;
  source: string;
  reasoning?: string;
  keyInsights?: string[];
}

export const sanitizeContent = {
  text: (text: string): string => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  },

  newsItem: (item: any): SanitizedContent => {
    return {
      title: DOMPurify.sanitize(item.title || '', { ALLOWED_TAGS: [] }),
      source: DOMPurify.sanitize(item.source || '', { ALLOWED_TAGS: [] }),
      reasoning: item.reasoning ? DOMPurify.sanitize(item.reasoning, { ALLOWED_TAGS: [] }) : undefined,
      keyInsights: item.keyInsights?.map((insight: string) => 
        DOMPurify.sanitize(insight, { ALLOWED_TAGS: [] })
      )
    };
  },

  url: (url: string): string => {
    try {
      const sanitized = DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });
      // Basic URL validation
      new URL(sanitized);
      return sanitized;
    } catch {
      return '#';
    }
  }
};
