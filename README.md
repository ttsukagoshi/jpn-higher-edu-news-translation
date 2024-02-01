# jpn-higher-edu-news-translation

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg?style=flat-square)](https://github.com/google/clasp) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

日本の高等教育関連の新着情報を読み取り、DeepL APIを使って翻訳した上で自身のGmailアカウントにメール通知するためのGoogle Apps Script。今のところは[文部科学省の新着情報](https://www.mext.go.jp/b_menu/news/index.html)のみに対応。

## はじめに

大学の国際化を語るときに、教員の外国人比率だけ見るのではなくて、意思決定層における外国人比率を高めることが大事だよね、でもそのためには日本を中心とした高等教育業界全体の知見を養っておく必要があるよね、という課題意識から作ったちょっとしたツール。

## 必要なもの

- Googleアカウント（無料のGmailでも可）
- DeepL APIアカウント（通常の翻訳で使用する「DeepL」「DeepL Pro」アカウントとは異なることに注意）

## 実行準備

1. スタンドアロン型のGoogle Apps Scriptファイルを作成する。（参考：[【初心者向け】GASの2種類のスクリプトの作成方法！](https://www.teijitaisya.com/gas-create-script/)）
2. 本レポジトリの[`src/code.js`](https://github.com/ttsukagoshi/jpn-higher-edu-news-translation/blob/main/src/code.js)内のコードをコピペする。
3. スクリプトプロパティに、自身のDeepL API Keyを登録する。プロパティ名は「`DEEPL_API_KEY`」。（参考：[GASで環境変数(スクリプトプロパティ)を使う方法](https://zenn.dev/u1e2k/articles/2cbdeb9db4b3cc)）
4. 時間型トリガーを設定する。本スクリプトは1日1回、目的のウェブページの内容をスクレイピングして前日分の新着情報を取得する設計となっているので、最頻でも1回/日がおすすめ。それ以上の頻度でもできるが、当然ながらスクレイピング先のサーバに余計な負荷をかけないよう、良識の範囲内で行うこと。

## ライセンス

Apache-2.0のもと、自己責任でご活用ください→[jpn-higher-edu-news-translation/LICENSE](https://github.com/ttsukagoshi/jpn-higher-edu-news-translation/blob/main/LICENSE)
