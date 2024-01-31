// Jestでのsrc/code.jsのテストコード

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MEXT_DOMAIN, MextTranslate } = require('../src/code');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockHtml = require('./mocks/mockMextHtml');

const expectedNewsItems = [
  {
    title: 'なにかの議事録',
    url: `${MEXT_DOMAIN}/b_menu/test/url.html`,
    tags: ['教育', '審議会情報'],
  },
  {
    title: 'なんらかの非課税措置(租税特別措置法第91条の3第1項)',
    url: `${MEXT_DOMAIN}/a_menu/kaikei/zeisei/test.htm`,
    tags: ['その他の分野', '税制等'],
  },
  {
    title: 'なんらかの審査会（第66回）を開催します',
    url: `${MEXT_DOMAIN}/b_menu/shingi/chousa/test.htm`,
    tags: ['科学技術・学術', '審議会情報', '報道発表'],
  },
  {
    title:
      '◯◯地震について（被害情報（第99次報）mm/dd 12:00時点）を掲載しました ',
    url: `${MEXT_DOMAIN}/a_menu/jisin/test.html`,
    tags: ['その他の分野', 'その他'],
  },
];

describe('formatDate', () => {
  it('should return ISO8601 date string', () => {
    global.Utilities = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      formatDate: jest.fn().mockImplementation((date, timezone, format) => {
        return date.toLocaleDateString('en-CA', {
          timezone: timezone,
        });
      }),
    };
    const date = MextTranslate.formatDate(new Date('2024-01-29'));
    expect(date).toBe('2024-01-29');
  });
});

describe('getParsedNews', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return array of news objects', () => {
    const targetDate = '2024-01-29';
    global.UrlFetchApp = {
      fetch: jest.fn().mockReturnValue({
        getContentText: () => mockHtml,
      }),
    };
    const parsedNews = MextTranslate.getParsedNews(
      'https://example.com',
      targetDate,
    );
    expect(parsedNews.length).toBe(expectedNewsItems.length);
    parsedNews.forEach((item, index) => {
      expect(item.title).toBe(expectedNewsItems[index].title);
      expect(item.url).toBe(expectedNewsItems[index].url);
      expect(item.tags).toEqual(expectedNewsItems[index].tags);
    });
  });
  it('should return an empty array when there were no news', () => {
    const targetDate = '2024-01-29';
    global.UrlFetchApp = {
      fetch: jest.fn().mockReturnValue({
        getContentText: () => '',
      }),
    };
    const parsedNews = MextTranslate.getParsedNews(
      'https://example.com',
      targetDate,
    );
    expect(Array.isArray(parsedNews)).toBe(true);
    expect(parsedNews.length).toBe(0);
  });
});

describe('parseMextNewsWebpage', () => {
  it('should return array of announcement HTML strings', () => {
    const parsedNews = MextTranslate.parseMextNewsWebpage(mockHtml);
    expect(parsedNews.length).toBe(2);
    expect(Object.keys(parsedNews[0])).toEqual(['date', 'newsHtmlString']);
    expect(parsedNews[0].date).toBe('2024-01-29');
    expect(parsedNews[1].date).toBe('2024-01-26');
    expect(parsedNews[0].newsHtmlString).toContain(
      '<a href="/b_menu/test/url.html">なにかの議事録</a>',
    );
  });
  it('should return an empty string for newsHtmlString if there were no announcements for that date', () => {
    const parsedNews = MextTranslate.parseMextNewsWebpage(
      mockHtml.replaceAll(
        /<ul class="news_list">[\s\S]*?<\/ul>/g,
        '<ul class="news_list"></ul>',
      ),
    );
    expect(typeof parsedNews[0].newsHtmlString).toBe('string');
    expect(parsedNews[0].newsHtmlString.length).toBe(0);
  });
  it('should return an empty array if the structure of webpage is modified', () => {
    const parsedNews = MextTranslate.parseMextNewsWebpage(
      mockHtml.replaceAll(
        /<h3 class="information-date">/g,
        '<h3 class="information-date-modified">',
      ),
    );
    expect(Array.isArray(parsedNews)).toBe(true);
    expect(parsedNews.length).toBe(0);
  });
  it('should return an empty array if the input is of 0 length', () => {
    const parsedNews = MextTranslate.parseMextNewsWebpage('');
    expect(Array.isArray(parsedNews)).toBe(true);
    expect(parsedNews.length).toBe(0);
  });
});

describe('parseMextNewsItems', () => {
  it('should return array of news objects', () => {
    const parsedNews = MextTranslate.parseMextNewsWebpage(mockHtml);
    const parsedNewsItems = MextTranslate.parseMextNewsItems(
      parsedNews[0].newsHtmlString,
    );
    expect(parsedNewsItems.length).toBe(expectedNewsItems.length);
    expect(Object.keys(parsedNewsItems[0])).toEqual(['title', 'url', 'tags']);
    parsedNewsItems.forEach((item, index) => {
      expect(item.title).toBe(expectedNewsItems[index].title);
      expect(item.url).toBe(expectedNewsItems[index].url);
      expect(item.tags).toEqual(expectedNewsItems[index].tags);
    });
  });
  it('should return an empty array if there were no announcements for that date', () => {
    const parsedNewsItems = MextTranslate.parseMextNewsItems('');
    expect(Array.isArray(parsedNewsItems)).toBe(true);
    expect(parsedNewsItems.length).toBe(0);
  });
});

describe('convertJapaneseDateToISO8601', () => {
  it('should return ISO8601 date string', () => {
    const date = MextTranslate.convertJapaneseDateToISO8601('令和6年5月31日');
    expect(date).toBe('2024-05-31');
  });
  it('should return ISO8601 date string for 令和元年', () => {
    const date = MextTranslate.convertJapaneseDateToISO8601('令和元年10月2日');
    expect(date).toBe('2019-10-02');
  });
});

describe('deeplTranslate', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return translated text', () => {
    global.PropertiesService = {
      getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn().mockReturnValue('hogehogefugafuga'),
      }),
    };
    global.UrlFetchApp = {
      fetch: jest.fn().mockReturnValue({
        getContentText: () =>
          JSON.stringify({ translations: [{ text: 'これはテストです。' }] }),
      }),
    };
    const translatedText = MextTranslate.deeplTranslate(
      'This is a test.',
      'JA',
    );
    expect(translatedText).toBe('これはテストです。');
  });
  it('should return translated text using the free API endpoint', () => {
    global.PropertiesService = {
      getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn().mockReturnValue('hogehogefugafuga:fx'),
      }),
    };
    global.UrlFetchApp = {
      fetch: jest.fn().mockImplementation(() => ({
        getContentText: () =>
          JSON.stringify({ translations: [{ text: 'これはテストです。' }] }),
      })),
    };
    const translatedText = MextTranslate.deeplTranslate(
      'This is a test.',
      'JA',
    );
    expect(translatedText).toBe('これはテストです。');
    expect(global.UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://api-free.deepl.com/v2/translate',
      expect.anything(),
    );
  });
  it('should return an error when API key is empty', () => {
    global.PropertiesService = {
      getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn().mockReturnValue(null),
      }),
    };
    global.UrlFetchApp = {
      fetch: jest.fn().mockReturnValue({
        getContentText: () =>
          JSON.stringify({
            translations: [{ text: 'これはエラーが起きるテストです。' }],
          }),
      }),
    };
    expect(() => {
      MextTranslate.deeplTranslate('This is a test.', 'JA');
    }).toThrow(
      'DeepL API Keyが設定されていません。スクリプトプロパティに「DEEPL_API_KEY」を設定してください。',
    );
  });
});
