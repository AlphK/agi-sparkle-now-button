import { useToast } from '@/hooks/use-toast';
import { OpenAIService } from '@/services/OpenAIService';
import { sanitizeContent } from '@/utils/sanitizer';
import { secureApiClient } from '@/utils/secureApiClient';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  aiAnalysis?: {
    reasoning: string;
    keyInsights: string[];
    agiProbability: number;
  };
}

export class RealDataService {
  private static instance: RealDataService;
  private toast: any;
  private openAIService?: OpenAIService;
  private requestDelay = 1000; // Reduced to 1 second
  private lastRequestTime = 0;

  constructor(toast: any) {
    this.toast = toast;
  }

  static getInstance(toast: any): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService(toast);
    }
    return RealDataService.instance;
  }

  private async delayRequest() {
    const now = Date.now();
    const timeElapsed = now - this.lastRequestTime;
    if (timeElapsed < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeElapsed));
    }
    this.lastRequestTime = Date.now();
  }

  private getRecentTimestamp(hoursAgo: number): number {
    return Math.floor((Date.now() - (hoursAgo * 60 * 60 * 1000)) / 1000);
  }

  private getRecentDateString(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  initializeAI() {
    try {
      this.openAIService = OpenAIService.getInstance();
    } catch (error) {
      this.toast({
        title: "⚠️ AI Service Warning",
        description: "AI analysis will use fallback mode",
        variant: "destructive",
      });
      throw error;
    }
  }

  async fetchArXivPapers(): Promise<NewsItem[]> {
    try {
      await this.delayRequest();
      console.log('📄 Fetching recent ArXiv papers (last 7 days)...');
      
      // ArXiv: últimos 7 días
      const weekAgo = this.getRecentDateString(7);
      const response = await secureApiClient.secureRequest(
        `https://export.arxiv.org/api/query?search_query=(cat:cs.AI OR cat:cs.LG OR cat:cs.CL) AND submittedDate:[${weekAgo} TO *]&start=0&max_results=15&sortBy=submittedDate&sortOrder=descending`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/atom+xml'
          }
        }
      );
      
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const entries = xmlDoc.getElementsByTagName('entry');
      
      const papers: NewsItem[] = [];
      for (let i = 0; i < Math.min(entries.length, 8); i++) {
        const entry = entries[i];
        const title = entry.getElementsByTagName('title')[0]?.textContent || '';
        const updated = entry.getElementsByTagName('updated')[0]?.textContent || '';
        const id = entry.getElementsByTagName('id')[0]?.textContent || '';
        
        // Verificar que sea realmente reciente
        const submittedDate = new Date(updated);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        if (submittedDate < sevenDaysAgo) continue;
        
        const sanitized = sanitizeContent.newsItem({
          title,
          source: 'ArXiv'
        });
        
        papers.push({
          title: sanitized.title.replace(/\s+/g, ' ').trim(),
          source: sanitized.source,
          time: this.getTimeAgo(submittedDate),
          url: sanitizeContent.url(id),
          relevance: this.determineRelevance(sanitized.title),
          category: 'RESEARCH'
        });
      }
      console.log(`✅ ArXiv: Found ${papers.length} recent papers`);
      return papers;
    } catch (error) {
      console.error('❌ Error fetching ArXiv papers:', error);
      return [];
    }
  }

  async fetchRedditMLPosts(): Promise<NewsItem[]> {
    try {
      await this.delayRequest();
      console.log('🔴 Fetching recent Reddit posts (last 48 hours)...');
      
      const [mlResponse, singularityResponse] = await Promise.all([
        secureApiClient.secureRequest('https://www.reddit.com/r/MachineLearning/new.json?limit=20&t=day', {
          method: 'GET',
          headers: { 'User-Agent': 'AGI-Detector-Secure/1.0' }
        }),
        secureApiClient.secureRequest('https://www.reddit.com/r/singularity/new.json?limit=15&t=day', {
          method: 'GET',
          headers: { 'User-Agent': 'AGI-Detector-Secure/1.0' }
        })
      ]);

      const [mlData, singularityData] = await Promise.all([
        mlResponse.json(),
        singularityResponse.json()
      ]);
      
      // Filtrar por últimas 48 horas
      const fortyEightHoursAgo = this.getRecentTimestamp(48);
      
      const posts: NewsItem[] = [
        ...mlData.data.children
          .filter((post: any) => post.data.created_utc > fortyEightHoursAgo)
          .slice(0, 5)
          .map((post: any) => {
            const sanitized = sanitizeContent.newsItem({
              title: post.data.title,
              source: 'Reddit r/MachineLearning'
            });
            return {
              title: sanitized.title,
              source: sanitized.source,
              time: this.getTimeAgo(new Date(post.data.created_utc * 1000)),
              url: sanitizeContent.url(`https://reddit.com${post.data.permalink}`),
              relevance: this.determineRelevance(sanitized.title),
              category: 'COMMUNITY'
            };
          }),
        ...singularityData.data.children
          .filter((post: any) => post.data.created_utc > fortyEightHoursAgo)
          .slice(0, 3)
          .map((post: any) => {
            const sanitized = sanitizeContent.newsItem({
              title: post.data.title,
              source: 'Reddit r/singularity'
            });
            return {
              title: sanitized.title,
              source: sanitized.source,
              time: this.getTimeAgo(new Date(post.data.created_utc * 1000)),
              url: sanitizeContent.url(`https://reddit.com${post.data.permalink}`),
              relevance: this.determineRelevance(sanitized.title),
              category: 'FUTURISM'
            };
          })
      ];
      
      console.log(`✅ Reddit: Found ${posts.length} recent posts`);
      return posts;
    } catch (error) {
      console.error('❌ Error fetching Reddit posts:', error);
      return [];
    }
  }

  async fetchHackerNewsPosts(): Promise<NewsItem[]> {
    try {
      await this.delayRequest();
      console.log('🟠 Fetching recent Hacker News posts (last 48 hours)...');
      
      // HN: últimas 48 horas usando timestamp correcto
      const fortyEightHoursAgo = this.getRecentTimestamp(48);
      const response = await secureApiClient.secureRequest(
        `https://hn.algolia.com/api/v1/search?query=artificial+intelligence+OR+machine+learning+OR+AGI+OR+neural+OR+LLM&tags=story&hitsPerPage=25&numericFilters=created_at_i>${fortyEightHoursAgo}`,
        {
          method: 'GET',
          headers: {}
        }
      );
      
      const data = await response.json();
      const stories: NewsItem[] = [];
      
      for (const hit of data.hits.slice(0, 6)) {
        if (hit.title && this.isAIRelated(hit.title)) {
          const sanitized = sanitizeContent.newsItem({
            title: hit.title,
            source: 'Hacker News'
          });
          
          stories.push({
            title: sanitized.title,
            source: sanitized.source,
            time: this.getTimeAgo(new Date(hit.created_at)),
            url: sanitizeContent.url(hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`),
            relevance: this.determineRelevance(sanitized.title),
            category: 'TECH'
          });
        }
      }
      
      console.log(`✅ Hacker News: Found ${stories.length} recent stories`);
      return stories;
    } catch (error) {
      console.error('❌ Error fetching Hacker News:', error);
      return [];
    }
  }

  async fetchExpandedRSSFeeds(): Promise<NewsItem[]> {
    const priorityFeeds = [
      { url: 'https://openai.com/blog/rss/', source: 'OpenAI', category: 'INDUSTRY' },
      { url: 'https://research.fb.com/feed', source: 'Meta Research', category: 'RESEARCH' },
      { url: 'https://blogs.microsoft.com/ai/feed/', source: 'Microsoft AI', category: 'INDUSTRY' },
      { url: 'https://importai.substack.com/feed', source: 'Import AI', category: 'ANALYSIS' },
      { url: 'https://garymarcus.substack.com/feed', source: 'Gary Marcus', category: 'ANALYSIS' },
      { url: 'https://www.technologyreview.com/feed/', source: 'MIT Technology Review', category: 'TECH' }
    ];

    const allFeedItems: NewsItem[] = [];
    // Filtrar por últimas 72 horas para RSS feeds
    const seventyTwoHoursAgo = new Date();
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

    for (const feed of priorityFeeds) {
      try {
        await this.delayRequest();
        console.log(`📡 Fetching recent RSS from ${feed.source} (last 72 hours)...`);
        
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
        const response = await secureApiClient.secureRequest(proxyUrl, {
          method: 'GET',
          headers: {}
        });
        const data = await response.json();
        
        if (data.contents) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
          const items = xmlDoc.querySelectorAll('item, entry');
          
          for (let i = 0; i < Math.min(items.length, 3); i++) {
            const item = items[i];
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.getAttribute('href') || 
                        item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate, published')?.textContent || '';
            
            // Filtrar por fecha reciente
            if (pubDate) {
              const itemDate = new Date(pubDate);
              if (itemDate < seventyTwoHoursAgo) continue;
            }
            
            if (title && this.isAIRelated(title)) {
              const sanitized = sanitizeContent.newsItem({
                title,
                source: feed.source
              });
              
              allFeedItems.push({
                title: sanitized.title.replace(/\s+/g, ' ').trim(),
                source: sanitized.source,
                time: pubDate ? this.getTimeAgo(new Date(pubDate)) : 'Recent',
                url: sanitizeContent.url(link),
                relevance: this.determineRelevance(sanitized.title),
                category: feed.category
              });
            }
          }
          console.log(`✅ ${feed.source}: Found recent content`);
        }
      } catch (error) {
        console.error(`❌ Error fetching RSS feed from ${feed.source}:`, error);
      }
    }

    console.log(`✅ RSS Total: Found ${allFeedItems.length} recent items`);
    return allFeedItems.slice(0, 10);
  }

  private isAIRelated(title: string): boolean {
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'gpt', 'llm', 'chatgpt', 'openai', 'anthropic',
      'deepmind', 'transformer', 'agi', 'automation', 'robot', 'claude',
      'gemini', 'reasoning', 'autonomous', 'consciousness', 'sentient',
      'benchmark', 'evaluation', 'chatbot', 'language model', 'ai safety',
      'alignment', 'superintelligence', 'capabilities', 'emergence'
    ];
    
    return aiKeywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private determineRelevance(title: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalKeywords = [
      'agi', 'artificial general intelligence', 'consciousness', 'sentient', 
      'breakthrough', 'superintelligence', 'human-level', 'passes turing test',
      'self-improving', 'recursive improvement', 'intelligence explosion'
    ];
    const highKeywords = [
      'gpt-5', 'gpt-4', 'claude', 'gemini', 'reasoning', 'autonomous',
      'benchmark', 'milestone', 'evaluation', 'capabilities', 'frontier',
      'multimodal', 'robotics', 'embodied', 'planning', 'tool use'
    ];
    
    const titleLower = title.toLowerCase();
    
    if (criticalKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'critical';
    }
    if (highKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'high';
    }
    if (this.isAIRelated(title)) {
      return 'medium';
    }
    return 'low';
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  }

  async performIntelligentAGIScan(): Promise<{ 
    detected: boolean; 
    confidence: number; 
    sources: string[];
    reasoning: string;
    newsWithAnalysis: NewsItem[];
  }> {
    this.toast({
      title: "🧠 AI-Powered Analysis",
      description: "Scanning recent news with improved date filters...",
    });

    console.log('🔍 Starting comprehensive AGI scan with recent content only...');

    const [arxivPapers, redditPosts, hnPosts, rssFeeds] = await Promise.all([
      this.fetchArXivPapers(),
      this.fetchRedditMLPosts(), 
      this.fetchHackerNewsPosts(),
      this.fetchExpandedRSSFeeds()
    ]);

    const allNews = [...arxivPapers, ...redditPosts, ...hnPosts, ...rssFeeds];
    console.log(`📊 Total recent items collected: ${allNews.length}`);

    if (!this.openAIService) {
      this.initializeAI();
    }

    if (!this.openAIService) {
      return this.performBasicAGIScan(allNews);
    }

    try {
      const analysisInput = allNews.map(item => ({
        title: item.title,
        source: item.source
      }));

      const batchAnalysis = await this.openAIService.batchAnalyzeNews(analysisInput);

      const newsWithAnalysis = allNews.map((item, index) => {
        const analysis = batchAnalysis.items[index]?.analysis;
        return {
          ...item,
          relevance: analysis?.relevance || item.relevance,
          aiAnalysis: analysis ? {
            reasoning: analysis.reasoning,
            keyInsights: analysis.keyInsights,
            agiProbability: analysis.agiProbability
          } : undefined
        };
      });

      newsWithAnalysis.sort((a, b) => {
        const relevanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        const aRelevance = relevanceOrder[a.relevance];
        const bRelevance = relevanceOrder[b.relevance];
        
        if (aRelevance !== bRelevance) {
          return aRelevance - bRelevance;
        }
        
        const aProb = a.aiAnalysis?.agiProbability || 0;
        const bProb = b.aiAnalysis?.agiProbability || 0;
        return bProb - aProb;
      });

      console.log(`✅ Analysis complete. Detection: ${batchAnalysis.overallAgiDetection.detected}`);

      return {
        detected: batchAnalysis.overallAgiDetection.detected,
        confidence: batchAnalysis.overallAgiDetection.confidence,
        reasoning: batchAnalysis.overallAgiDetection.reasoning,
        sources: ['ArXiv', 'Reddit', 'Hacker News', 'OpenAI', 'Meta Research', 'Microsoft AI', 'Import AI', 'Gary Marcus', 'MIT Tech Review'],
        newsWithAnalysis
      };

    } catch (error) {
      console.error('OpenAI analysis failed, falling back to basic scan:', error);
      return this.performBasicAGIScan(allNews);
    }
  }

  private performBasicAGIScan(allNews: NewsItem[]): { 
    detected: boolean; 
    confidence: number; 
    sources: string[];
    reasoning: string;
    newsWithAnalysis: NewsItem[];
  } {
    const criticalNews = allNews.filter(item => item.relevance === 'critical');
    const agiKeywords = ['agi', 'artificial general intelligence', 'consciousness', 'sentient'];
    const hasAGIIndicators = allNews.some(item => 
      agiKeywords.some(keyword => item.title.toLowerCase().includes(keyword))
    );

    const confidence = Math.min(95, criticalNews.length * 15 + (hasAGIIndicators ? 30 : 0));
    
    return {
      detected: confidence > 80,
      confidence,
      reasoning: `Found ${criticalNews.length} critical recent items with ${hasAGIIndicators ? 'AGI' : 'no AGI'} indicators from recent sources`,
      sources: ['ArXiv', 'Reddit', 'Hacker News', 'OpenAI', 'Meta Research', 'Microsoft AI', 'Import AI', 'Gary Marcus', 'MIT Tech Review'],
      newsWithAnalysis: allNews.sort((a, b) => {
        const relevanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
      })
    };
  }

  async performAGIScan(): Promise<{ detected: boolean; confidence: number; sources: string[] }> {
    const result = await this.performIntelligentAGIScan();
    return {
      detected: result.detected,
      confidence: result.confidence,
      sources: result.sources
    };
  }
}
