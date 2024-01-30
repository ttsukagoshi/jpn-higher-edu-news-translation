/**
 * 文部科学省（MEXT）が掲載している新着情報を読み取り、
 * DeepL APIを使って翻訳した上で自身のGmailアカウントにメール通知するためのGoogle Apps Script
 *
 * 1日1回のスクレイピング対象とするのは
 * 文科省ウェブサイト トップ＞新着情報一覧ページ https://www.mext.go.jp/b_menu/news/index.html
 *
 */

const MEXT_ANNOUNCEMENTS_URL = 'https://www.mext.go.jp/b_menu/news/index.html';

function getMextNewAnnouncements() {
  console.log(UrlFetchApp.fetch(MEXT_ANNOUNCEMENTS_URL).getContentText());
}
