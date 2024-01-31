/**
 * 文部科学省（MEXT）が掲載している新着情報を読み取り、
 * DeepL APIを使って翻訳した上で自身のGmailアカウントにメール通知するためのGoogle Apps Script
 *
 * 1日1回のスクレイピング対象とするのは
 * 文科省ウェブサイト トップ＞新着情報一覧ページ https://www.mext.go.jp/b_menu/news/index.html
 *
 * 事前準備として、以下の設定が必要：
 * 1. DeepL API Key（認証キー）を取得 https://support.deepl.com/hc/ja/articles/360020695820-%E8%AA%8D%E8%A8%BC%E3%82%AD%E3%83%BC
 * 2. Google Apps Scriptのスクリプトプロパティに、上記のAPI Keyを設定。
 *    プロパティ名は「DEEPL_API_KEY」とする（あるいは、下記のSP_KEY_DEEPL_API_KEYの値を変更し自由に設定する）。
 */

// 文科省関連設定
const MEXT_DOMAIN = 'https://www.mext.go.jp'; // 文科省のドメイン
const MEXT_ANNOUNCEMENTS_URL = `${MEXT_DOMAIN}/b_menu/news/index.html`; // 新着情報一覧ページのURL
const MEXT_TAGS_TRANSLATION = {
  // 文科省新着情報に付されているタグと、その翻訳。追加があればここに追記する。
  // ここにないタグが付されている場合は、そのままの文字列をDeepLで翻訳する。
  '科学技術・学術': 'Science, Technology, and Academia',
  審議会情報: 'Council Information',
  その他の分野: 'Other Topics',
  採用案内: 'Recruitment',
  教育: 'Education',
  公募情報: 'Public Offering',
  大臣会見: 'Ministerial Press Conference',
  報道発表: 'Press Release',
  分野横断: 'Cross-Disciplinary',
};

// DeepL関連設定
const DEEPL_SOURCE_LANG = 'JA'; // 翻訳元の言語
const DEEPL_TARGET_LANG = 'EN-US'; // 翻訳先の言語
const SP_KEY_DEEPL_API_KEY = 'DEEPL_API_KEY'; // DeepL API Keyをスクリプトプロパティに設定する際のプロパティ名

// メール関連設定
const MAIL_SUBJECT_PREFIX = '[MEXT-NEWS]'; // 本ツールが送信するメールの件名のプレフィックス
const MAIL_BODY_PREFIX = `Please find below the DeepL translation`; // 本ツールが送信するメールの本文のプレフィックス
const MAIL_BODY_SUFFIX = `\n-----\nThis email was sent using mext-announcement-translation by ttsukagoshi. Translations are made by DeepL API. You can see the whole script at https://github.com/ttsukagoshi/mext-announcement-translation\nPlease note that neither the contents of this email, the accuracy of the translation, nor `;
const ADMIN_MAIL_BODY_SUFFIX = `\n-----\n`;

/**
 * メイン関数。この処理を時間ベースのトリガーで定期実行する。
 * トリガーは1日1回、午前8時台の実行とし、前日の新着情報を取得、翻訳してメール通知することを想定。
 */
function main() {
  // メール通知の送付先
  const adminRecipient = Session.getActiveUser().getEmail();
  const mailRecipient = adminRecipient; // 今のところはメール通知先＝管理者としておく
  console.log('mailRecipient: ', mailRecipient); /////////
  // 前日の日付（ISO8601形式）を取得
  const targetDateString = MextTranslate.formatDate(
    new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
  );
  try {
    // 文科省の新着情報一覧ページから、当該日付の新着情報を取得してparseする
    const news = MextTranslate.getParsedNews(
      MEXT_ANNOUNCEMENTS_URL,
      targetDateString,
    );
    if (news.length === 0) {
      // 当該日付の新着情報がなければ何もしない？メッセージ出す？
      console.log('news.length === 0'); /////////
    } else {
      // DeepL APIを使って翻訳
      const translatedNews = news.map((item) => ({
        title: MextTranslate.deeplTranslate(
          item.title,
          DEEPL_SOURCE_LANG,
          DEEPL_TARGET_LANG,
        ),
        url: item.url,
        tags: item.tags.map((tag) =>
          Object.keys(MEXT_TAGS_TRANSLATION).includes(tag)
            ? MEXT_TAGS_TRANSLATION[tag]
            : MextTranslate.deeplTranslate(
                tag,
                DEEPL_SOURCE_LANG,
                DEEPL_TARGET_LANG,
              ),
        ),
      }));
      // メール通知
      console.log(JSON.stringify(translatedNews, null, 2)); /////////
    }
  } catch (error) {
    // adminRecipientへのエラーメール通知
    console.error(error.stack); /////////////////
  }
}

//////////////////////
// 以下、ヘルパー関数 //
//////////////////////

class MextTranslate {
  /**
   * 与えられた日付を、ISO8601形式の日付文字列（yyyy-MM-dd）に変換する。
   * timezoneはAsia/Tokyoとする。
   * @param {date} date
   * @returns {string} ISO8601形式の日付文字列（yyyy-MM-dd）
   */
  static formatDate(date) {
    return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
  }

  /**
   * 文科省の新着情報一覧ページから、指定した日付に掲載された新着情報を取得する。
   * @param {string} url 文科省の新着情報一覧ページのURL
   * @param {string} dateString ISO8601形式の日付文字列（例：2020-10-01）
   * @returns {any[]} 当該日付の新着情報の件名、URL、タグ一覧を格納したオブジェクトの配列。もし当該日付の新着情報がなければ空配列を返す。
   */
  static getParsedNews(url, dateString) {
    const parsedNewsWebpage = this.parseMextNewsWebpage(
      UrlFetchApp.fetch(url).getContentText(),
    );
    const targetNews = parsedNewsWebpage.filter(
      (item) => item.date === dateString,
    );
    if (!targetNews || targetNews.length === 0) {
      return [];
    } else {
      return targetNews.map((targetNewsItem) =>
        this.parseMextNewsItems(targetNewsItem.newsHtmlString),
      )[0];
    }
  }

  /**
   * 文科省の新着情報一覧ページから、日付ごとの新着情報一覧を取得して当該部分のHTML文字列を返す。
   * @param {string} htmlString 文科省の新着情報一覧ページのHTML文字列
   * @returns {any[]} 日付（date）とその日の新着情報のHTML文字列（announcementsHtmlString）を格納したオブジェクトの配列
   */
  static parseMextNewsWebpage(htmlString) {
    const regexp =
      /<h3 class="information-date">(令和\d+年\d+月\d+日)<\/h3>\s+<ul class="news_list">([\s\S]*?)<\/ul>/g;
    const matches = [...htmlString.matchAll(regexp)];
    return matches.map((match) => ({
      date: this.convertJapaneseDateToISO8601(match[1]),
      newsHtmlString: match[2].trim(),
    }));
  }

  /**
   * parseMextNewsWebpageで取得した、日付ごとの新着情報一覧のHTML文字列（announcementsHtmlString）をparseして、
   * 新着情報の件名、URL、タグ一覧を格納したオブジェクトの配列を返す。
   * htmlStringの例：
   * ```
   * <li>
   *    <div class="area_tag tag2">
   *      <span class="tag contents_fieldicon_01">教育</span>
   *      <span class="tag genre_10">審議会情報</span>
   *    </div>
   *    <span class="link">
   *      <a href="/b_menu/test/url.html">なにかの議事録</a>
   *    </span>
   * </li>
   * <li> ... </li>
   * ```
   * @param {string} htmlString parseMextNewsWebpageで取得した、日付ごとの新着情報一覧のHTML文字列
   * @returns {any[]} 新着情報の件名、URL、タグ一覧を格納したオブジェクトの配列
   */
  static parseMextNewsItems(htmlString) {
    if (htmlString.length === 0) {
      return [];
    }
    // まずは、<li>タグで分割
    const newsItems = htmlString
      .split(/<\/?li>/)
      .filter((item) => item.trim().length > 0); // 空またはwhitespaceのみの文字列を除去
    // 次に、<li>タグの中身をparse
    return newsItems.map((newsItem) => {
      // 記事タグを抽出するための正規表現
      const tagsRegExp = /<span class="tag .*?">(.*?)<\/span>/g;
      // 記事タイトルとURLを抽出するための正規表現
      const titleAndUrlRegExp = /<a href="(?<url>.+?)">(?<title>.+?)<\/a>/;
      // 記事タイトルとURLを抽出
      const titleAndUrl = newsItem.match(titleAndUrlRegExp);
      return {
        title: titleAndUrl.groups.title,
        url: titleAndUrl.groups.url.startsWith('http')
          ? titleAndUrl.groups.url
          : `${MEXT_DOMAIN}${titleAndUrl.groups.url}`,
        tags: [...newsItem.matchAll(tagsRegExp)].map((match) => match[1]),
      };
    });
  }

  /**
   * 和暦で記載された日付を、ISO8601形式の日付文字列に変換する。
   * 令和にのみ対応。
   * @param {string} japaneseDate 和暦で記載された年月日（例：令和2年10月1日）
   * @returns {string} ISO8601形式の日付文字列（例：2020-10-01）
   */
  static convertJapaneseDateToISO8601(japaneseDate) {
    const reiwaYear = japaneseDate.match(/令和(\d+|元)年/)[1];
    const year =
      reiwaYear === '元'
        ? 2019 // 令和元年 -> 西暦2019年
        : parseInt(reiwaYear) + 2018; // 令和2年 -> 西暦2020年
    const month = japaneseDate.match(/(\d+)月/)[1].padStart(2, '0');
    const day = japaneseDate.match(/(\d+)日/)[1].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * DeepL APIを使って翻訳する。
   * @param {string} textToTranslate 翻訳元の文字列
   * @param {string} sourceLang 翻訳元の言語コード（例：JA）
   * @param {string} targetLang 翻訳先の言語コード（例：EN-US）
   * @returns {string} 翻訳結果の文字列
   */
  static deeplTranslate(textToTranslate, sourceLang, targetLang) {
    const apiKey =
      PropertiesService.getScriptProperties().getProperty(SP_KEY_DEEPL_API_KEY);
    if (!apiKey) {
      throw new Error(
        'DeepL API Keyが設定されていません。スクリプトプロパティに「DEEPL_API_KEY」を設定してください。',
      );
    }
    const apiBaseUrl = apiKey.endsWith(':fx')
      ? 'https://api-free.deepl.com'
      : 'https://api.deepl.com';
    const response = UrlFetchApp.fetch(`${apiBaseUrl}/v2/translate`, {
      method: 'post',
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
      payload: {
        text: textToTranslate,
        source_lang: sourceLang,
        target_lang: targetLang,
      },
    });
    const json = JSON.parse(response.getContentText());
    return json.translations[0].text;
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    MEXT_DOMAIN,
    main,
    MextTranslate,
  };
}
