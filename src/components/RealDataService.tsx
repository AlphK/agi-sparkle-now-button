
import { useToast } from '@/hooks/use-toast';

interface NewsItem {
  title: string;
  source: string;
  time: string;
  url: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

export class RealDataService {
  private static instance: RealDataService;
  private toast: any;

  constructor(toast: any) {
    this.toast = toast;
  }

  static getInstance(toast: any): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService(toast);
    }
    return RealDataService.instance;
  }

  async fetchArXivPapers(): Promise<NewsItem[]> {
    try {
      const response = await fetch(
        'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending'
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
        
        papers.push({
          title: title.replace(/\s+/g, ' ').trim(),
          source: 'ArXiv',
          time: this.getTimeAgo(new Date(updated)),
          url: id,
          relevance: this.determineRelevance(title),
          category: 'RESEARCH'
        });
      }
      return papers;
    } catch (error) {
      console.error('Error fetching ArXiv papers:', error);
      return [];
    }
  }

  async fetchRedditMLPosts(): Promise<NewsItem[]> {
    try {
      const response = await fetch('https://www.reddit.com/r/MachineLearning/hot.json?limit=10', {
        headers: {
          'User-Agent': 'AGI-Detector/1.0'
        }
      });
      const data = await response.json();
      
      const posts: NewsItem[] = data.data.children.slice(0, 5).map((post: any) => ({
        title: post.data.title,
        source: 'Reddit r/MachineLearning',
        time: this.getTimeAgo(new Date(post.data.created_utc * 1000)),
        url: `https://reddit.com${post.data.permalink}`,
        relevance: this.determineRelevance(post.data.title),
        category: 'COMMUNITY'
      }));
      
      return posts;
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      return [];
    }
  }

  async fetchHackerNewsPosts(): Promise<NewsItem[]> {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = await response.json();
      
      const stories: NewsItem[] = [];
      for (let i = 0; i < Math.min(storyIds.length, 20); i++) {
        try {
          const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`);
          const story = await storyResponse.json();
          
          if (story.title && this.isAIRelated(story.title)) {
            stories.push({
              title: story.title,
              source: 'Hacker News',
              time: this.getTimeAgo(new Date(story.time * 1000)),
              url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
              relevance: this.determineRelevance(story.title),
              category: 'TECH'
            });
            
            if (stories.length >= 3) break;
          }
        } catch (error) {
          console.error('Error fetching HN story:', error);
        }
      }
      
      return stories;
    } catch (error) {
      console.error('Error fetching Hacker News:', error);
      return [];
    }
  }

  private isAIRelated(title: string): boolean {
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'gpt', 'llm', 'chatgpt', 'openai', 'anthropic',
      'deepmind', 'transformer', 'agi', 'automation', 'robot'
    ];
    
    return aiKeywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private determineRelevance(title: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalKeywords = ['agi', 'artificial general intelligence', 'consciousness', 'sentient', 'breakthrough'];
    const highKeywords = ['gpt-5', 'gpt-4', 'claude', 'gemini', 'reasoning', 'autonomous'];
    
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

  async performAGIScan(): Promise<{ detected: boolean; confidence: number; sources: string[] }> {
    this.toast({
      title: "🔍 Conectando a fuentes reales",
      description: "ArXiv, Reddit, Hacker News...",
    });

    const [arxivPapers, redditPosts, hnPosts] = await Promise.all([
      this.fetchArXivPapers(),
      this.fetchRedditMLPosts(),
      this.fetchHackerNewsPosts()
    ]);

    const allNews = [...arxivPapers, ...redditPosts, ...hnPosts];
    const criticalNews = allNews.filter(item => item.relevance === 'critical');
    
    // Análisis simple de detección de AGI
    const agiKeywords = ['agi', 'artificial general intelligence', 'consciousness', 'sentient'];
    const hasAGIIndicators = allNews.some(item => 
      agiKeywords.some(keyword => item.title.toLowerCase().includes(keyword))
    );

    const confidence = Math.min(95, criticalNews.length * 15 + (hasAGIIndicators ? 30 : 0));
    
    return {
      detected: confidence > 80,
      confidence,
      sources: ['ArXiv', 'Reddit', 'Hacker News']
    };
  }
}
