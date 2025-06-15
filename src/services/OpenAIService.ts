
interface OpenAIConfig {
  apiKey: string;
  model?: string;
}

interface AnalysisResult {
  relevance: 'critical' | 'high' | 'medium' | 'low';
  agiProbability: number;
  reasoning: string;
  keyInsights: string[];
}

interface BatchAnalysisResult {
  items: Array<{
    title: string;
    analysis: AnalysisResult;
  }>;
  overallAgiDetection: {
    detected: boolean;
    confidence: number;
    reasoning: string;
  };
}

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private model: string;

  constructor(config: OpenAIConfig) {
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
    const prompt = `Analyze this AI/tech news headline for AGI relevance:

Title: "${title}"
Source: ${source}

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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      
      return {
        relevance: analysis.relevance,
        agiProbability: analysis.agiProbability,
        reasoning: analysis.reasoning,
        keyInsights: analysis.keyInsights || []
      };
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      // Fallback to basic keyword analysis
      return this.fallbackAnalysis(title);
    }
  }

  async batchAnalyzeNews(newsItems: Array<{ title: string; source: string }>): Promise<BatchAnalysisResult> {
    const titles = newsItems.map(item => `- ${item.title} (${item.source})`).join('\n');
    
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14', // Use more capable model for batch analysis
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Batch analysis failed:', error);
      // Fallback to individual analysis
      return this.fallbackBatchAnalysis(newsItems);
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
