
import { securityLogger } from './securityLogger';
import { validateUrl } from './trustedDomains';

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeout?: number;
}

interface RateLimiter {
  requests: number[];
  maxRequests: number;
  windowMs: number;
}

class SecureApiClient {
  private rateLimiter: RateLimiter = {
    requests: [],
    maxRequests: 10,
    windowMs: 60000 // 1 minute
  };

  private isRateLimited(): boolean {
    const now = Date.now();
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      time => now - time < this.rateLimiter.windowMs
    );
    
    return this.rateLimiter.requests.length >= this.rateLimiter.maxRequests;
  }

  private recordRequest(): void {
    this.rateLimiter.requests.push(Date.now());
  }

  async secureRequest(url: string, options: RequestOptions): Promise<Response> {
    // Verificar rate limiting
    if (this.isRateLimited()) {
      securityLogger.log('rate_limit_exceeded', 'Too many requests in time window', url);
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Validar URL con lista de dominios confiables
    if (!validateUrl(url)) {
      securityLogger.log('url_validation_failed', 'URL failed security validation', url);
      throw new Error('URL not allowed by security policy');
    }

    // Validar tamaño del cuerpo de la petición
    if (options.body && options.body.length > 1024 * 1024) { // 1MB
      securityLogger.log('url_validation_failed', 'Request body too large', url);
      throw new Error('Request body too large');
    }

    const controller = new AbortController();
    const timeout = Math.min(options.timeout || 30000, 60000); // Max 60 segundos
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      this.recordRequest();
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'User-Agent': 'AGI-Detector-Secure/1.0',
          'X-Requested-With': 'XMLHttpRequest',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        // Configuraciones adicionales de seguridad
        credentials: 'omit', // No enviar cookies
        mode: 'cors',
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        securityLogger.log('iframe_load_failed', `HTTP ${response.status}: ${response.statusText}`, url);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Verificar content-type si es esperado
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
        securityLogger.log('url_validation_failed', `Unexpected content-type: ${contentType}`, url);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        securityLogger.log('iframe_load_failed', 'Request timeout', url);
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}

export const secureApiClient = new SecureApiClient();
