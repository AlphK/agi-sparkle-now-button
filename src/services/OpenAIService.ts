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
      console.log('Making request to OpenAI proxy:', this.proxyUrl);
      
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

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error from proxy: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch {
        throw new Error('Invalid JSON in response');
      }

      const validatedAnalysis = AnalysisResultSchema.parse(parsedContent);
      
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
      console.log('Making batch analysis request to OpenAI proxy:', this.proxyUrl);
      
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

      console.log('Batch analysis response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Batch analysis error response:', errorText);
        throw new Error(`Error from proxy: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Batch analysis OpenAI response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch {
        throw new Error('Invalid JSON in response');
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
