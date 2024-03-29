/* eslint-disable no-irregular-whitespace */

// Jestテストを実行するための、文科省新着情報一覧ページのmock

const mockMextHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">
  <head> </head>
  <body>
    <a name="top" id="top"></a>
    <div id="wrapper">
      <div id="wrapperInner">
        <!-- ========== noJS message ========== -->
        <noscript></noscript>
        <!-- ========== /noJS message ========== -->
        <dl id="breadCrumbs"></dl>
        <!--/breadCrumbs-->
        <div id="contents" class="baseColumn1">
          <a name="contentsStart" id="contentsStart"></a>
          <div id="contentsInner">
            <div id="contentsMain">
              <div id="contentsTitle">
                <h1>新着情報　最新1か月分の一覧</h1>
              </div>
              <!--/contentsTitle-->
              <div class="wysiwyg"></div>
              <h2>新着情報</h2>
              <div class="dateList icon">
                <h3 class="information-date">令和6年1月29日</h3>
                <ul class="news_list">
                  <li>
                    <div class="area_tag tag2">
                      <span class="tag contents_fieldicon_01">教育</span>
                      <span class="tag genre_10">審議会情報</span>
                    </div>
                    <span class="link"><a href="/b_menu/test/url.html">なにかの議事録</a></span>
                  </li>
                  <li>
                    <div class="area_tag tag2">
                      <span class="tag contents_fieldicon_05">その他の分野</span>
                      <span class="tag genre_07">税制等</span>
                    </div>
                    <span class="link"><a href="https://www.mext.go.jp/a_menu/kaikei/zeisei/test.htm">なんらかの非課税措置(租税特別措置法第91条の3第1項)</a></span>
                  </li>
                  <li>
                    <div class="area_tag tag2">
                      <span class="tag contents_fieldicon_02">科学技術・学術</span>
                      <span class="tag genre_10">審議会情報</span>
                      <span class="tag genre_13">報道発表</span>
                    </div>
                    <span class="link"><a href="/b_menu/shingi/chousa/test.htm">なんらかの審査会（第66回）を開催します</a></span>
                  </li>
                  <li>
                    <div class="area_tag tag2">
                      <span class="tag contents_fieldicon_05">その他の分野</span>
                      <span class="tag genre_12">その他</span>
                    </div>
                    <span class="link"><a href="/a_menu/jisin/test.html">◯◯地震について（被害情報（第99次報）mm/dd 12:00時点）を掲載しました </a></span>
                  </li>
                </ul>
                <h3 class="information-date">令和6年1月26日</h3>
                <ul class="news_list">
                  <li>
                    <div class="area_tag tag2">
                      <span class="tag contents_fieldicon_06">分野横断</span>
                      <span class="tag genre_03">大臣会見</span>
                    </div>
                    <span class="link"><a href="/b_menu/daijin/detail/test.html">いまの文部科学大臣記者会見録（令和6年1月26日）</a></span>
                  </li>
                </ul>
              </div>
            </div>
            <!--/contentsMain-->
          </div>
          <!--/contentsInner-->
        </div>
        <!--/contents-->
        <div id="footerGuidance"></div>
        <!--/footerGuidance-->
        <div id="area_footer" class="area_footer"></div>
      </div>
    </div>
    <script type="text/javascript"></script>
  </body>
</html>`;

module.exports = mockMextHtml;
