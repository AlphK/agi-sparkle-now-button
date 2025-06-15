
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
    if (this.isRateLimited()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL provided');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      this.recordRequest();
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'User-Agent': 'AGI-Detector-Secure/1.0'
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}

export const secureApiClient = new SecureApiClient();
