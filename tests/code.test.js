// Jestでのsrc/code.jsのテストコード

const {
  MEXT_DOMAIN,
  MAIL_SUBJECT_PREFIX,
  main,
  Utils,
  Mext,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('../src/code');
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

describe('[Utils] composeEmailBody', () => {
  const translatedNewsItemsShort = [
    {
      title: 'Summary of Something',
      url: '',
      tags: ['Education', 'Council Information'],
    },
    {
      title: 'Tax Exemption Measures of Something',
      url: '',
      tags: ['Other Topics', 'Tax'],
    },
  ];
  it('should return an email body string', () => {
    const newsItemsShort = expectedNewsItems.slice(0, 2);
    const expectedMailBody =
      '[1] Summary of Something\n' +
      'Tags: #Education #Council Information\n' +
      `URL: ${MEXT_DOMAIN}/b_menu/test/url.html\n` +
      'Title (Jpn): なにかの議事録\n' +
      'Tags (Jpn): #教育 #審議会情報\n\n' +
      '[2] Tax Exemption Measures of Something\n' +
      'Tags: #Other Topics #Tax\n' +
      `URL: ${MEXT_DOMAIN}/a_menu/kaikei/zeisei/test.htm\n` +
      'Title (Jpn): なんらかの非課税措置(租税特別措置法第91条の3第1項)\n' +
      'Tags (Jpn): #その他の分野 #税制等\n';
    const emailBody = Utils.composeEmailBody(
      newsItemsShort,
      translatedNewsItemsShort,
    );
    expect(emailBody).toBe(expectedMailBody);
  });
  it('should return an error if 翻訳元の新着情報と翻訳後の新着情報の件数が一致しないとき', () => {
    expect(() => {
      Utils.composeEmailBody(expectedNewsItems, translatedNewsItemsShort);
    }).toThrow(
      new Error('翻訳元の新着情報と翻訳後の新着情報の件数が一致しません。'),
    );
  });
});

describe('[Utils] formatDates', () => {
  it('should return an array of date strings', () => {
    global.Utilities = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      formatDate: jest.fn().mockImplementation((date, timezone, format) => {
        if (format === 'yyyy-MM-dd') {
          return date.toLocaleDateString('en-CA', {
            timezone: timezone,
          });
        } else if (format === 'MMMM dd, yyyy') {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timezone: timezone,
          });
        }
      }),
    };
    const dates = Utils.formatDates(new Date('2024-01-29'));
    expect(dates[0]).toBe('2024-01-29');
    expect(dates[1]).toBe('January 29, 2024');
  });
});

describe('[Utils] convertJapaneseDateToISO8601', () => {
  it('should return ISO8601 date string', () => {
    const date = Utils.convertJapaneseDateToISO8601('令和6年5月31日');
    expect(date).toBe('2024-05-31');
  });
  it('should return ISO8601 date string for 令和元年', () => {
    const date = Utils.convertJapaneseDateToISO8601('令和元年10月2日');
    expect(date).toBe('2019-10-02');
  });
});

describe('[Utils] deeplTranslate', () => {
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
    const translatedText = Utils.deeplTranslate('This is a test.', 'JA');
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
    const translatedText = Utils.deeplTranslate('This is a test.', 'JA');
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
      Utils.deeplTranslate('This is a test.', 'JA');
    }).toThrow(
      new Error(
        'DeepL API Keyが設定されていません。スクリプトプロパティに「DEEPL_API_KEY」を設定してください。',
      ),
    );
  });
});

describe('[Mext] getParsedMextNews', () => {
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
    const parsedNews = Mext.getParsedMextNews(
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
    const parsedNews = Mext.getParsedMextNews(
      'https://example.com',
      targetDate,
    );
    expect(Array.isArray(parsedNews)).toBe(true);
    expect(parsedNews.length).toBe(0);
  });
});

describe('[Mext] parseMextNewsWebpage', () => {
  it('should return array of announcement HTML strings', () => {
    const parsedNews = Mext.parseMextNewsWebpage(mockHtml);
    expect(parsedNews.length).toBe(2);
    expect(Object.keys(parsedNews[0])).toEqual(['date', 'newsHtmlString']);
    expect(parsedNews[0].date).toBe('2024-01-29');
    expect(parsedNews[1].date).toBe('2024-01-26');
    expect(parsedNews[0].newsHtmlString).toContain(
      '<a href="/b_menu/test/url.html">なにかの議事録</a>',
    );
  });
  it('should return an empty string for newsHtmlString if there were no announcements for that date', () => {
    const parsedNews = Mext.parseMextNewsWebpage(
      mockHtml.replaceAll(
        /<ul class="news_list">[\s\S]*?<\/ul>/g,
        '<ul class="news_list"></ul>',
      ),
    );
    expect(typeof parsedNews[0].newsHtmlString).toBe('string');
    expect(parsedNews[0].newsHtmlString.length).toBe(0);
  });
  it('should return an empty array if the structure of webpage is modified', () => {
    const parsedNews = Mext.parseMextNewsWebpage(
      mockHtml.replaceAll(
        /<h3 class="information-date">/g,
        '<h3 class="information-date-modified">',
      ),
    );
    expect(Array.isArray(parsedNews)).toBe(true);
    expect(parsedNews.length).toBe(0);
  });
  it('should return an empty array if the input is of 0 length', () => {
    const parsedNews = Mext.parseMextNewsWebpage('');
    expect(Array.isArray(parsedNews)).toBe(true);
    expect(parsedNews.length).toBe(0);
  });
});

describe('[Mext] parseMextNewsItems', () => {
  it('should return array of news objects', () => {
    const parsedNews = Mext.parseMextNewsWebpage(mockHtml);
    const parsedNewsItems = Mext.parseMextNewsItems(
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
    const parsedNewsItems = Mext.parseMextNewsItems('');
    expect(Array.isArray(parsedNewsItems)).toBe(true);
    expect(parsedNewsItems.length).toBe(0);
  });
});

describe('main', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should send an email without errors', () => {
    global.Session = {
      getActiveUser: jest.fn().mockReturnValue({
        getEmail: () => 'admin@recipient.com',
      }),
    };
    global.Utilities = {
      formatDate: jest.fn().mockImplementation((date, timezone, format) => {
        if (format === 'yyyy-MM-dd') {
          return '2024-01-29';
        } else if (format === 'MMMM dd, yyyy') {
          return 'January 29, 2024';
        }
      }),
    };
    global.UrlFetchApp = {
      fetch: jest
        .fn()
        .mockReturnValueOnce({
          getContentText: () => mockHtml,
        })
        .mockReturnValue({
          getContentText: () =>
            JSON.stringify({ translations: [{ text: 'TestTranslation' }] }),
        }),
    };
    global.ScriptApp = { getScriptId: jest.fn().mockReturnValue('1234567890') };
    global.MailApp = { sendEmail: jest.fn() };
    global.PropertiesService = {
      getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn().mockReturnValue('apikeyhogehoge'),
      }),
    };
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    main();
    expect(global.MailApp.sendEmail).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(
      `${MAIL_SUBJECT_PREFIX} MEXT News for January 29, 2024 sent to admin@recipient.com`,
    );
    expect(console.error).not.toHaveBeenCalled();
  });
  it('should leave console.info that there were no news for that day', () => {
    global.Session = {
      getActiveUser: jest.fn().mockReturnValue({
        getEmail: () => 'admin@recipient.com',
      }),
    };
    global.Utilities = {
      formatDate: jest.fn().mockImplementation((date, timezone, format) => {
        if (format === 'yyyy-MM-dd') {
          return '2024-01-31';
        } else if (format === 'MMMM dd, yyyy') {
          return 'January 31, 2024';
        }
      }),
    };
    global.UrlFetchApp = {
      fetch: jest
        .fn()
        .mockReturnValueOnce({
          getContentText: () => mockHtml,
        })
        .mockReturnValue({
          getContentText: () =>
            JSON.stringify({ translations: [{ text: 'TestTranslation' }] }),
        }),
    };
    global.MailApp = {
      sendEmail: jest.fn(),
    };
    global.PropertiesService = {
      getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn().mockReturnValue('apikeyhogehoge'),
      }),
    };
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    main();
    expect(global.MailApp.sendEmail).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(
      `${MAIL_SUBJECT_PREFIX} No news for January 31, 2024`,
    );
    expect(console.error).not.toHaveBeenCalled();
  });
  it('should leave an error on console.error', () => {
    global.Session = {
      getActiveUser: jest.fn().mockReturnValue({
        getEmail: () => 'admin@recipient.com',
      }),
    };
    global.Utilities = {
      formatDate: jest.fn().mockImplementation((date, timezone, format) => {
        if (format === 'yyyy-MM-dd') {
          return '2024-01-29';
        } else if (format === 'MMMM dd, yyyy') {
          return 'January 29, 2024';
        }
      }),
    };
    global.UrlFetchApp = {
      fetch: jest
        .fn()
        .mockReturnValueOnce({
          getContentText: () => mockHtml,
        })
        .mockReturnValue({
          getContentText: () =>
            JSON.stringify({ translations: [{ text: 'TestTranslation' }] }),
        }),
    };
    global.ScriptApp = { getScriptId: jest.fn().mockReturnValue('1234567890') };
    global.MailApp = { sendEmail: jest.fn() };
    global.PropertiesService = {
      getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn().mockReturnValue(null),
      }),
    };
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    main();
    expect(global.MailApp.sendEmail).toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
