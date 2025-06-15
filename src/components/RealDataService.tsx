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
  private requestDelay = 1000; // 1 second delay between requests
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

  initializeAI() {
    try {
      this.openAIService = OpenAIService.getInstance();
      console.log('🧠 OpenAI Service inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando OpenAI Service:', error);
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
      console.log('📄 Fetching ArXiv papers...');
      
      const response = await secureApiClient.secureRequest(
        'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending',
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
      console.log(`✅ ArXiv: Found ${papers.length} papers`);
      return papers;
    } catch (error) {
      console.error('❌ Error fetching ArXiv papers:', error);
      return [];
    }
  }

  async fetchRedditMLPosts(): Promise<NewsItem[]> {
    try {
      await this.delayRequest();
      console.log('🔴 Fetching Reddit posts...');
      
      const [mlResponse, singularityResponse] = await Promise.all([
        secureApiClient.secureRequest('https://www.reddit.com/r/MachineLearning/hot.json?limit=5', {
          method: 'GET',
          headers: { 'User-Agent': 'AGI-Detector-Secure/1.0' }
        }),
        secureApiClient.secureRequest('https://www.reddit.com/r/singularity/hot.json?limit=3', {
          method: 'GET',
          headers: { 'User-Agent': 'AGI-Detector-Secure/1.0' }
        })
      ]);

      const [mlData, singularityData] = await Promise.all([
        mlResponse.json(),
        singularityResponse.json()
      ]);
      
      const posts: NewsItem[] = [
        ...mlData.data.children.slice(0, 3).map((post: any) => {
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
        ...singularityData.data.children.slice(0, 2).map((post: any) => {
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
      
      console.log(`✅ Reddit: Found ${posts.length} posts`);
      return posts;
    } catch (error) {
      console.error('❌ Error fetching Reddit posts:', error);
      return [];
    }
  }

  async fetchHackerNewsPosts(): Promise<NewsItem[]> {
    try {
      await this.delayRequest();
      console.log('🟠 Fetching Hacker News posts...');
      
      // Use algolia search instead of top stories to avoid rate limits
      const response = await secureApiClient.secureRequest(
        'https://hn.algolia.com/api/v1/search?query=artificial+intelligence+OR+machine+learning+OR+AGI&tags=story&hitsPerPage=8',
        {
          method: 'GET',
          headers: {}
        }
      );
      
      const data = await response.json();
      const stories: NewsItem[] = [];
      
      for (const hit of data.hits.slice(0, 4)) {
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
      
      console.log(`✅ Hacker News: Found ${stories.length} stories`);
      return stories;
    } catch (error) {
      console.error('❌ Error fetching Hacker News:', error);
      return [];
    }
  }

  async fetchRSSFeeds(): Promise<NewsItem[]> {
    const priorityFeeds = [
      { url: 'https://openai.com/blog/rss/', source: 'OpenAI', category: 'INDUSTRY' },
      { url: 'https://ai.googleblog.com/feeds/posts/default', source: 'Google DeepMind', category: 'RESEARCH' },
      { url: 'https://blogs.microsoft.com/ai/feed/', source: 'Microsoft AI', category: 'INDUSTRY' },
      { url: 'https://importai.substack.com/feed', source: 'Import AI', category: 'ANALYSIS' },
      { url: 'https://garymarcus.substack.com/feed', source: 'Gary Marcus', category: 'ANALYSIS' },
      { url: 'https://towardsdatascience.com/feed', source: 'Towards Data Science', category: 'COMMUNITY' },
      { url: 'https://www.technologyreview.com/feed/', source: 'MIT Technology Review', category: 'TECH' }
    ];

    const allFeedItems: NewsItem[] = [];

    for (const feed of priorityFeeds) {
      try {
        await this.delayRequest();
        console.log(`📡 Fetching RSS from ${feed.source}...`);
        
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
          console.log(`✅ ${feed.source}: Found content`);
        }
      } catch (error) {
        console.error(`❌ Error fetching RSS feed from ${feed.source}:`, error);
      }
    }

    console.log(`✅ RSS Total: Found ${allFeedItems.length} items`);
    return allFeedItems.slice(0, 8);
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
    console.log('🔍 INICIANDO BÚSQUEDA INTELIGENTE CON IA...');
    
    // Inicializar OpenAI si no está disponible
    if (!this.openAIService) {
      console.log('🧠 Inicializando servicio OpenAI...');
      this.initializeAI();
    }

    this.toast({
      title: "🧠 Análisis IA Activo",
      description: "Usando OpenAI para análisis inteligente...",
    });

    const [arxivPapers, redditPosts, hnPosts, rssFeeds] = await Promise.all([
      this.fetchArXivPapers(),
      this.fetchRedditMLPosts(), 
      this.fetchHackerNewsPosts(),
      this.fetchRSSFeeds()
    ]);

    const allNews = [...arxivPapers, ...redditPosts, ...hnPosts, ...rssFeeds];
    console.log(`📊 Total items recolectados: ${allNews.length}`);

    // Verificar que OpenAI esté disponible
    if (!this.openAIService) {
      console.log('❌ OpenAI no disponible, usando análisis básico');
      return this.performBasicAGIScan(allNews);
    }

    try {
      console.log('🤖 Enviando noticias a OpenAI para análisis...');
      
      const analysisInput = allNews.slice(0, 15).map(item => ({
        title: item.title,
        source: item.source
      }));

      const batchAnalysis = await this.openAIService.batchAnalyzeNews(analysisInput);
      console.log('✅ Análisis OpenAI completado:', batchAnalysis);

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

      // Ordenar por relevancia IA
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

      console.log(`✅ ANÁLISIS IA COMPLETADO. Detección: ${batchAnalysis.overallAgiDetection.detected}, Confianza: ${batchAnalysis.overallAgiDetection.confidence}%`);

      return {
        detected: batchAnalysis.overallAgiDetection.detected,
        confidence: batchAnalysis.overallAgiDetection.confidence,
        reasoning: `[IA] ${batchAnalysis.overallAgiDetection.reasoning}`,
        sources: ['OpenAI Analysis', 'ArXiv', 'Reddit', 'Hacker News', 'OpenAI Blog', 'Google DeepMind', 'MIT Tech Review'],
        newsWithAnalysis
      };

    } catch (error) {
      console.error('❌ OpenAI analysis failed, usando análisis básico:', error);
      this.toast({
        title: "⚠️ IA Analysis Failed",
        description: "Usando análisis básico como respaldo",
        variant: "destructive",
      });
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
    console.log('🔍 EJECUTANDO ANÁLISIS BÁSICO (SIN IA)...');
    
    const criticalNews = allNews.filter(item => item.relevance === 'critical');
    const agiKeywords = ['agi', 'artificial general intelligence', 'consciousness', 'sentient'];
    const hasAGIIndicators = allNews.some(item => 
      agiKeywords.some(keyword => item.title.toLowerCase().includes(keyword))
    );

    const confidence = Math.min(95, criticalNews.length * 15 + (hasAGIIndicators ? 30 : 0));
    
    return {
      detected: confidence > 80,
      confidence,
      reasoning: `[BÁSICO] Found ${criticalNews.length} critical items con ${hasAGIIndicators ? 'AGI' : 'no AGI'} indicators`,
      sources: ['ArXiv', 'Reddit', 'Hacker News', 'OpenAI Blog', 'Google DeepMind'],
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
