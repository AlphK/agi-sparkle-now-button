
import { z } from 'zod';
import { AnalysisResultSchema, BatchAnalysisResultSchema, type AnalysisResult, type BatchAnalysisResult } from '@/schemas/openai';
import { sanitizeContent } from '@/utils/sanitizer';

export class OpenAIService {
  private static instance: OpenAIService;
  private proxyUrl: string;
  private authToken: string;
  private model: string;

  constructor() {
    this.proxyUrl = 'https://prubeandoal--9915a12a4a0d11f0aa8a76b3cceeab13.web.val.run';
    this.authToken = '0204';
    this.model = 'gpt-4o-mini';
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async analyzeNewsItem(title: string, source: string): Promise<AnalysisResult> {
    const sanitizedTitle = sanitizeContent.text(title);
    const sanitizedSource = sanitizeContent.text(source);

    const prompt = `Analiza este titular de noticias AI/tech para relevancia AGI:

Título: "${sanitizedTitle}"
Fuente: ${sanitizedSource}

Evalúa en una escala donde:
- critical: Avances revolucionarios AGI, claims de consciencia, IA nivel humano
- high: Capacidades mayores de IA, avances en razonamiento, benchmarks importantes
- medium: Investigación estándar IA, mejoras incrementales
- low: Tangencialmente relacionado con IA

Responde con JSON:
{
  "relevance": "critical|high|medium|low",
  "agiProbability": 0-100,
  "reasoning": "explicación breve",
  "keyInsights": ["insight1", "insight2"]
}`;

    try {
      console.log('Haciendo petición al proxy OpenAI:', this.proxyUrl);
      
      const response = await fetch(`${this.proxyUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': this.authToken,
          'Content-Type': 'application/json',
          'Origin': 'https://agi-check.lovable.app'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 300
        })
      });

      console.log('Estado de respuesta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Respuesta de error:', errorText);
        throw new Error(`Error del proxy: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Respuesta OpenAI:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Estructura de respuesta inválida');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch {
        throw new Error('JSON inválido en respuesta');
      }

      const validatedAnalysis = AnalysisResultSchema.parse(parsedContent);
      
      return {
        relevance: validatedAnalysis.relevance,
        agiProbability: validatedAnalysis.agiProbability,
        reasoning: sanitizeContent.text(validatedAnalysis.reasoning),
        keyInsights: validatedAnalysis.keyInsights.map(insight => sanitizeContent.text(insight))
      };
    } catch (error) {
      console.error('Análisis OpenAI falló:', error);
      return this.fallbackAnalysis(sanitizedTitle);
    }
  }

  async batchAnalyzeNews(newsItems: Array<{ title: string; source: string }>): Promise<BatchAnalysisResult> {
    const sanitizedItems = newsItems.map(item => ({
      title: sanitizeContent.text(item.title),
      source: sanitizeContent.text(item.source)
    }));

    const titles = sanitizedItems.map(item => `- ${item.title} (${item.source})`).join('\n');
    
    const prompt = `Analiza estos titulares de noticias AI para detección de AGI:

${titles}

Para cada titular, determina:
1. Nivel de relevancia (critical/high/medium/low)
2. Probabilidad AGI (0-100)
3. Razonamiento breve

Luego proporciona evaluación general de detección AGI.

Responde con JSON:
{
  "items": [
    {
      "title": "titular",  
      "analysis": {
        "relevance": "nivel",
        "agiProbability": numero,
        "reasoning": "explicación",
        "keyInsights": ["insight1"]
      }
    }
  ],
  "overallAgiDetection": {
    "detected": boolean,
    "confidence": numero,
    "reasoning": "evaluación general"
  }
}`;

    try {
      console.log('Haciendo análisis batch al proxy OpenAI:', this.proxyUrl);
      
      const response = await fetch(`${this.proxyUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': this.authToken,
          'Content-Type': 'application/json',
          'Origin': 'https://agi-check.lovable.app'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 2000
        })
      });

      console.log('Estado de respuesta análisis batch:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error respuesta análisis batch:', errorText);
        throw new Error(`Error del proxy: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Respuesta análisis batch OpenAI:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Estructura de respuesta inválida');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch {
        throw new Error('JSON inválido en respuesta');
      }

      const validatedResult = BatchAnalysisResultSchema.parse(parsedContent);
      
      return {
        items: validatedResult.items.map(item => ({
          title: sanitizeContent.text(item.title),
          analysis: {
            relevance: item.analysis.relevance,
            agiProbability: item.analysis.agiProbability,
            reasoning: sanitizeContent.text(item.analysis.reasoning),
            keyInsights: item.analysis.keyInsights.map(insight => sanitizeContent.text(insight))
          }
        })),
        overallAgiDetection: {
          detected: validatedResult.overallAgiDetection.detected,
          confidence: validatedResult.overallAgiDetection.confidence,
          reasoning: sanitizeContent.text(validatedResult.overallAgiDetection.reasoning)
        }
      };
    } catch (error) {
      console.error('Análisis batch falló:', error);
      return this.fallbackBatchAnalysis(sanitizedItems);
    }
  }

  private fallbackAnalysis(title: string): AnalysisResult {
    const criticalKeywords = ['agi', 'artificial general intelligence', 'consciousness', 'sentient', 'breakthrough', 'superintelligence'];
    const highKeywords = ['gpt-5', 'reasoning', 'autonomous', 'benchmark', 'milestone', 'capabilities'];
    
    const titleLower = title.toLowerCase();
    const hasCritical = criticalKeywords.some(keyword => titleLower.includes(keyword));
    const hasHigh = highKeywords.some(keyword => titleLower.includes(keyword));
    
    if (hasCritical) {
      return {
        relevance: 'critical',
        agiProbability: 85,
        reasoning: 'Contains AGI-related keywords',
        keyInsights: ['Keyword-based detection']
      };
    } else if (hasHigh) {
      return {
        relevance: 'high',
        agiProbability: 60,
        reasoning: 'Contains high-relevance AI keywords',
        keyInsights: ['Advanced AI capabilities mentioned']
      };
    } else {
      return {
        relevance: 'medium',
        agiProbability: 25,
        reasoning: 'Standard AI content',
        keyInsights: ['General AI news']
      };
    }
  }

  private fallbackBatchAnalysis(newsItems: Array<{ title: string; source: string }>): BatchAnalysisResult {
    const items = newsItems.map(item => ({
      title: item.title,
      analysis: this.fallbackAnalysis(item.title)
    }));

    const criticalCount = items.filter(item => item.analysis.relevance === 'critical').length;
    const highCount = items.filter(item => item.analysis.relevance === 'high').length;
    const avgProbability = items.reduce((sum, item) => sum + item.analysis.agiProbability, 0) / items.length;

    return {
      items,
      overallAgiDetection: {
        detected: criticalCount > 0 && avgProbability > 70,
        confidence: Math.min(95, criticalCount * 30 + highCount * 15),
        reasoning: `Found ${criticalCount} critical and ${highCount} high-relevance items`
      }
    };
  }
}
