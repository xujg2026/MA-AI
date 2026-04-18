import axios from 'axios';
import * as cheerio from 'cheerio';

export const crawlSources = [
  {
    name: '国家市场监督管理总局',
    baseUrl: 'https://www.samr.gov.cn',
    rssUrl: null,
    enabled: true,
    type: 'policy'
  },
  {
    name: '国家认监委',
    baseUrl: 'https://www.cnca.gov.cn',
    rssUrl: null,
    enabled: true,
    type: 'policy'
  },
  {
    name: '华测检测',
    baseUrl: 'https://www.cti-cert.com',
    rssUrl: null,
    enabled: true,
    type: 'company'
  },
  {
    name: '广电计量',
    baseUrl: 'https://www.grgtest.com',
    rssUrl: null,
    enabled: true,
    type: 'company'
  },
  {
    name: '中国汽研',
    baseUrl: 'https://www.caeri.com.cn',
    rssUrl: null,
    enabled: true,
    type: 'company'
  }
];

let crawlStatus = {
  isRunning: false,
  lastRun: null,
  sourcesCompleted: 0,
  totalSources: crawlSources.filter(s => s.enabled).length,
  itemsCrawled: 0,
  errors: []
};

export function getCrawlStatus() {
  return { ...crawlStatus };
}

export async function crawlSource(source) {
  const { name, baseUrl, type } = source;

  try {
    console.log(`Crawling ${name}...`);

    // In a real implementation, we would:
    // 1. Fetch the homepage or news page
    // 2. Parse HTML with cheerio
    // 3. Extract article titles, URLs, summaries, dates
    // 4. Store in database

    // For demo purposes, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulated articles found
    const simulatedArticles = generateSimulatedArticles(name, type);

    crawlStatus.itemsCrawled += simulatedArticles.length;
    crawlStatus.sourcesCompleted++;

    return simulatedArticles;
  } catch (error) {
    console.error(`Error crawling ${name}:`, error.message);
    crawlStatus.errors.push({ source: name, error: error.message });
    return [];
  }
}

function generateSimulatedArticles(source, type) {
  const categories = ['ma', 'policy', 'company'];
  const sentiments = ['positive', 'neutral', 'negative'];

  const templates = {
    ma: [
      { title: `${source}完成重大收购，拓展业务版图`, summary: '该公司近日宣布完成一起重要收购，交易金额达数亿元。' },
      { title: `${source}战略投资某检测机构`, summary: '为强化在某领域的检测能力，该公司进行了战略性投资。' }
    ],
    policy: [
      { title: `监管部门发布${source}相关新规`, summary: '为规范行业发展，监管部门出台了新的管理规定。' },
      { title: `${source}领域迎政策利好`, summary: '国家出台相关政策，支持该领域健康发展。' }
    ],
    company: [
      { title: `${source}发布年度业绩报告`, summary: '公司全年营收和净利润均实现同比增长。' },
      { title: `${source}实验室通过重要资质认证`, summary: '该公司旗下实验室近日获得重要认证资质。' }
    ]
  };

  const categoryTemplates = templates[type] || templates.company;

  return categoryTemplates.map(t => ({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    title: t.title,
    summary: t.summary,
    content: `${t.title}\n\n${t.summary}\n\n详细报道请访问${source}官网了解更多信息。`,
    source: source,
    url: `https://example.com/news/${Date.now()}`,
    publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    category: type,
    tags: JSON.stringify([source, type === 'ma' ? '并购' : type === 'policy' ? '政策' : '公司动态']),
    sentiment: sentiments[Math.floor(Math.random() * sentiments.length)]
  }));
}

export async function runFullCrawl() {
  if (crawlStatus.isRunning) {
    console.log('Crawl already in progress');
    return;
  }

  crawlStatus.isRunning = true;
  crawlStatus.lastRun = new Date().toISOString();
  crawlStatus.sourcesCompleted = 0;
  crawlStatus.itemsCrawled = 0;
  crawlStatus.errors = [];

  const enabledSources = crawlSources.filter(s => s.enabled);

  for (const source of enabledSources) {
    await crawlSource(source);
  }

  crawlStatus.isRunning = false;
  console.log(`Crawl complete. Total items: ${crawlStatus.itemsCrawled}`);
}
