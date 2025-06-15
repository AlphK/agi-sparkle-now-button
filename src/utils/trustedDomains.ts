
// Lista de dominios confiables para iframes y contenido externo
export const TRUSTED_DOMAINS = [
  'openai.com',
  'hn.algolia.com',
  'www.wired.com',
  'venturebeat.com',
  'thenextweb.com',
  'analyticsindiamag.com',
  'arxiv.org',
  'www.reddit.com',
  'news.ycombinator.com',
  'github.com',
  'twitter.com',
  'medium.com',
  'lovable.dev',
  'lovable.app'
];

export const TRUSTED_PROTOCOLS = ['https:', 'http:'];

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Verificar protocolo
    if (!TRUSTED_PROTOCOLS.includes(urlObj.protocol)) {
      console.warn(`🔒 Protocolo no confiable: ${urlObj.protocol}`);
      return false;
    }
    
    // Verificar dominio
    const hostname = urlObj.hostname.toLowerCase();
    const isTrusted = TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!isTrusted) {
      console.warn(`🔒 Dominio no confiable: ${hostname}`);
      return false;
    }
    
    // Verificar longitud de URL
    if (url.length > 2048) {
      console.warn(`🔒 URL demasiado larga: ${url.length} caracteres`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('🔒 Error validando URL:', error);
    return false;
  }
};

export const sanitizeUrl = (url: string): string => {
  if (!validateUrl(url)) {
    return '#';
  }
  return url;
};
