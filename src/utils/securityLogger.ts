
interface SecurityEvent {
  type: 'url_validation_failed' | 'iframe_load_failed' | 'csp_violation' | 'rate_limit_exceeded';
  details: string;
  timestamp: number;
  url?: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 100;

  log(type: SecurityEvent['type'], details: string, url?: string) {
    const event: SecurityEvent = {
      type,
      details,
      timestamp: Date.now(),
      url
    };

    this.events.unshift(event);
    
    // Mantener solo los últimos eventos
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Log en consola con formato de seguridad
    console.warn(`🔒 [SECURITY] ${type.toUpperCase()}: ${details}`, url ? `URL: ${url}` : '');
  }

  getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  clearEvents() {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();
