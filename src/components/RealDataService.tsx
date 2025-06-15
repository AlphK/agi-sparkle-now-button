
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
  private requestDelay = 1000;
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

  private isRecentEnough(dateString: string, maxHoursAgo: number): boolean {
    try {
      const itemDate = new Date(dateString);
      const maxAgoDate = new Date();
      maxAgoDate.setHours(maxAgoDate.getHours() - maxHoursAgo);
      return itemDate > maxAgoDate;
    } catch {
      return false;
    }
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
      console.log('📄 Fetching ArXiv papers (last 3 days only)...');
      
      // ArXiv: últimos 3 días únicamente
      const threeDaysAgo = this.getRecentDateString(3);
      const response = await secureApiClient.secureRequest(
        `https://export.arxiv.org/api/query?search_query=(cat:cs.AI OR cat:cs.LG OR cat:cs.CL) AND submittedDate:[${threeDaysAgo} TO *]&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`,
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
      for (let i = 0; i < Math.min(entries.length, 5); i++) {
        const entry = entries[i];
        const title = entry.getElementsByTagName('title')[0]?.textContent || '';
        const updated = entry.getElementsByTagName('updated')[0]?.textContent || '';
        const id = entry.getElementsByTagName('id')[0]?.textContent || '';
        
        // Verificación estricta de fecha reciente (últimos 3 días)
        if (!this.isRecentEnough(updated, 72)) {
          console.log(`⏰ Skipping old ArXiv paper: ${title} (${updated})`);
          continue;
        }
        
        const sanitized = sanitizeContent.newsItem({
          title,
          source: 'ArXiv'
        });
        
        papers.push({
          title: sanitized.title.replace(/\s+/g, ' ').trim(),
          source: sanitized.source,
          time: this.getTimeAgo(new Date(updated)),
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
      console.log('🔴 Fetching Reddit posts (last 24 hours only)...');
      
      const [mlResponse, singularityResponse] = await Promise.all([
        secureApiClient.secureRequest('https://www.reddit.com/r/MachineLearning/new.json?limit=15&t=day', {
          method: 'GET',
          headers: { 'User-Agent': 'AGI-Detector-Secure/1.0' }
        }),
        secureApiClient.secureRequest('https://www.reddit.com/r/singularity/new.json?limit=10&t=day', {
          method: 'GET',
          headers: { 'User-Agent': 'AGI-Detector-Secure/1.0' }
        })
      ]);

      const [mlData, singularityData] = await Promise.all([
        mlResponse.json(),
        singularityResponse.json()
      ]);
      
      // Filtrar por últimas 24 horas únicamente
      const twentyFourHoursAgo = this.getRecentTimestamp(24);
      
      const posts: NewsItem[] = [
        ...mlData.data.children
          .filter((post: any) => post.data.created_utc > twentyFourHoursAgo)
          .slice(0, 4)
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
          .filter((post: any) => post.data.created_utc > twentyFourHoursAgo)
          .slice(0, 2)
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
      
      console.log(`✅ Reddit: Found ${posts.length} recent posts (last 24h)`);
      return posts;
    } catch (error) {
      console.error('❌ Error fetching Reddit posts:', error);
      return [];
    }
  }

  async fetchHackerNewsPosts(): Promise<NewsItem[]> {
    try {
      await this.delayRequest();
      console.log('🟠 Fetching Hacker News posts (last 24 hours only)...');
      
      // HN: últimas 24 horas únicamente
      const twentyFourHoursAgo = this.getRecentTimestamp(24);
      const response = await secureApiClient.secureRequest(
        `https://hn.algolia.com/api/v1/search?query=artificial+intelligence+OR+machine+learning+OR+AGI+OR+neural+OR+LLM&tags=story&hitsPerPage=20&numericFilters=created_at_i>${twentyFourHoursAgo}`,
        {
          method: 'GET',
          headers: {}
        }
      );
      
      const data = await response.json();
      const stories: NewsItem[] = [];
      
      for (const hit of data.hits.slice(0, 4)) {
        if (hit.title && this.isAIRelated(hit.title)) {
          // Verificación adicional de fecha
          if (hit.created_at_i <= twentyFourHoursAgo) {
            console.log(`⏰ Skipping old HN story: ${hit.title}`);
            continue;
          }

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
      
      console.log(`✅ Hacker News: Found ${stories.length} recent stories (last 24h)`);
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
      { url: 'https://blogs.microsoft.com/ai/feed/', source: 'Microsoft AI', category: 'INDUSTRY' }
    ];

    const allFeedItems: NewsItem[] = [];
    // RSS feeds: últimas 48 horas únicamente
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    for (const feed of priorityFeeds) {
      try {
        await this.delayRequest();
        console.log(`📡 Fetching RSS from ${feed.source} (last 48 hours only)...`);
        
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
          
          for (let i = 0; i < Math.min(items.length, 2); i++) {
            const item = items[i];
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.getAttribute('href') || 
                        item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate, published')?.textContent || '';
            
            // Filtro estricto de fecha (últimas 48 horas)
            if (!pubDate || !this.isRecentEnough(pubDate, 48)) {
              console.log(`⏰ Skipping old RSS item: ${title} (${pubDate})`);
              continue;
            }
            
            if (title && this.isAIRelated(title)) {
              const sanitized = sanitizeContent.newsItem({
                title,
                source: feed.source
              });
              
              allFeedItems.push({
                title: sanitized.title.replace(/\s+/g, ' ').trim(),
                source: sanitized.source,
                time: this.getTimeAgo(new Date(pubDate)),
                url: sanitizeContent.url(link),
                relevance: this.determineRelevance(sanitized.title),
                category: feed.category
              });
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error fetching RSS feed from ${feed.source}:`, error);
      }
    }

    console.log(`✅ RSS Total: Found ${allFeedItems.length} recent items (last 48h)`);
    return allFeedItems;
  }

  private isAIRelated(title: string): boolean {
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'gpt', 'llm', 'chatgpt', 'openai', 'anthropic',
      'deepmind', 'transformer', 'automation', 'robot', 'claude',
      'gemini', 'reasoning', 'autonomous', 'chatbot', 'language model'
    ];
    
    return aiKeywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private determineRelevance(title: string): 'critical' | 'high' | 'medium' | 'low' {
    // Criterios MÁS ESTRICTOS para evitar falsos positivos
    const criticalKeywords = [
      'agi achieved', 'artificial general intelligence breakthrough', 
      'human-level ai', 'passes turing test completely',
      'ai consciousness confirmed', 'sentient ai verified',
      'superintelligence emergence'
    ];
    
    const highKeywords = [
      'gpt-5', 'gpt-4', 'claude-4', 'major breakthrough', 'reasoning breakthrough',
      'autonomous agents', 'multimodal breakthrough', 'robotics breakthrough',
      'planning capabilities', 'tool use mastery'
    ];
    
    const titleLower = title.toLowerCase();
    
    // Búsqueda exacta para critical (evitar falsos positivos)
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
      description: "Scanning only recent news (24-72 hours)...",
    });

    console.log('🔍 Starting strict AGI scan with recent content only...');

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

      // Ordenar por relevancia y probabilidad AGI
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
        sources: ['ArXiv', 'Reddit', 'Hacker News', 'OpenAI', 'Meta Research', 'Microsoft AI'],
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
    // Criterios MÁS ESTRICTOS para evitar falsos positivos
    const criticalNews = allNews.filter(item => item.relevance === 'critical');
    const strictAgiKeywords = ['agi achieved', 'artificial general intelligence breakthrough', 'human-level ai', 'ai consciousness confirmed'];
    const hasStrictAGIIndicators = allNews.some(item => 
      strictAgiKeywords.some(keyword => item.title.toLowerCase().includes(keyword))
    );

    // Reducir sensibilidad para evitar falsos positivos
    const confidence = Math.min(95, criticalNews.length * 25 + (hasStrictAGIIndicators ? 50 : 0));
    
    return {
      detected: confidence > 90 && hasStrictAGIIndicators, // Umbral más alto
      confidence,
      reasoning: `Found ${criticalNews.length} critical recent items with ${hasStrictAGIIndicators ? 'strict AGI' : 'no AGI'} indicators from recent sources (24-72h)`,
      sources: ['ArXiv', 'Reddit', 'Hacker News', 'OpenAI', 'Meta Research', 'Microsoft AI'],
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
