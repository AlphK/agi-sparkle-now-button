import { z } from 'zod';
import { AnalysisResultSchema, BatchAnalysisResultSchema, type AnalysisResult, type BatchAnalysisResult } from '@/schemas/openai';
import { sanitizeContent } from '@/utils/sanitizer';
import { secureApiClient } from '@/utils/secureApiClient';

interface OpenAIConfig {
  apiKey: string;
  model?: string;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private model: string;

  constructor(config: OpenAIConfig) {
    // Validate API key format
    if (!config.apiKey || !config.apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4.1-mini-2025-04-14';
  }

  static getInstance(config: OpenAIConfig): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService(config);
    }
    return OpenAIService.instance;
  }

  async analyzeNewsItem(title: string, source: string): Promise<AnalysisResult> {
    // Sanitize inputs
    const sanitizedTitle = sanitizeContent.text(title);
    const sanitizedSource = sanitizeContent.text(source);

    const prompt = `Analyze this AI/tech news headline for AGI relevance:

Title: "${sanitizedTitle}"
Source: ${sanitizedSource}

Evaluate on a scale where:
- critical: Breakthrough AGI achievements, consciousness claims, human-level AI
- high: Major AI capabilities, reasoning advances, significant benchmarks
- medium: Standard AI research, incremental improvements
- low: Tangentially related to AI

Respond with JSON:
{
  "relevance": "critical|high|medium|low",
  "agiProbability": 0-100,
  "reasoning": "brief explanation",
  "keyInsights": ["insight1", "insight2"]
}`;

    try {
      const response = await secureApiClient.secureRequest('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 300
        }),
        timeout: 30000
      });

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure');
      }

      // Parse and validate JSON response
      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch {
        throw new Error('Invalid JSON in response');
      }

      // Validate with Zod schema
      const validatedAnalysis = AnalysisResultSchema.parse(parsedContent);
      
      // Sanitize the validated content
      return {
        relevance: validatedAnalysis.relevance,
        agiProbability: validatedAnalysis.agiProbability,
        reasoning: sanitizeContent.text(validatedAnalysis.reasoning),
        keyInsights: validatedAnalysis.keyInsights.map(insight => sanitizeContent.text(insight))
      };
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      return this.fallbackAnalysis(sanitizedTitle);
    }
  }

  async batchAnalyzeNews(newsItems: Array<{ title: string; source: string }>): Promise<BatchAnalysisResult> {
    // Sanitize all inputs
    const sanitizedItems = newsItems.map(item => ({
      title: sanitizeContent.text(item.title),
      source: sanitizeContent.text(item.source)
    }));

    const titles = sanitizedItems.map(item => `- ${item.title} (${item.source})`).join('\n');
    
    const prompt = `Analyze these AI news headlines for AGI detection:

${titles}

For each headline, determine:
1. Relevance level (critical/high/medium/low)
2. AGI probability (0-100)
3. Brief reasoning

Then provide overall AGI detection assessment.

Respond with JSON:
{
  "items": [
    {
      "title": "headline",  
      "analysis": {
        "relevance": "level",
        "agiProbability": number,
        "reasoning": "explanation",
        "keyInsights": ["insight1"]
      }
    }
  ],
  "overallAgiDetection": {
    "detected": boolean,
    "confidence": number,
    "reasoning": "overall assessment"
  }
}`;

    try {
      const response = await secureApiClient.secureRequest('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 2000
        }),
        timeout: 45000
      });

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch {
        throw new Error('Invalid JSON in response');
      }

      // Validate with Zod schema
      const validatedResult = BatchAnalysisResultSchema.parse(parsedContent);
      
      // Sanitize all content in the result
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
      console.error('Batch analysis failed:', error);
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
