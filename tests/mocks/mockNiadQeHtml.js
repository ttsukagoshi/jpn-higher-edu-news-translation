// Jestテストを実行するための、「NIAD-QE 海外高等教育質保証動向ニュース」バックナンバーページのmock

const mockNiadQeHtml = `<!doctype html>
<html lang="ja">
  <head></head>
  <body onclose="javascript:location.href='/bm/mng/logout.php';">
    <noscript></noscript>
    <div class="wrapper">
      <section class="main">
        <section class="aside">
          <h2>バックナンバー</h2>

          <ul class="backnumber-list">
            <li class="preview">
              <dl>
                <dt>2024/01/24 (Wed) 10:00</dt>
                <dd>【最新記事見出し】ほかニュース vol.xxx</dd>
              </dl>

              <div class="btn_area"></div>
            </li>
            <li class="preview">
              <dl>
                <dt>2023/12/26 (Tue) 11:00</dt>
                <dd>特別号：【別の記事見出し】〇〇フォーラムを開催しました―ニュース</dd>
              </dl>

              <div class="btn_area"></div>
            </li>
            <li class="preview">
              <dl>
                <dt>2023/12/21 (Thu) 10:00</dt>
                <dd>【過去の記事見出し】ほかニュース vol.xxx</dd>
              </dl>

              <div class="btn_area"></div>
            </li>
          </ul>
        </section>
        <!-- aside close -->
        <section class="contents">
          <div class="contents-inner">
            <article>
              <section class="preview">
                <h3>【最新記事見出し】ほかニュース vol.xxx</h3>
                <div class="deta">2024/01/24 (Wed) 10:00</div>
                <div class="txt">
                  ここがメール本文<br />
                  <br />
                  いろいろ改行コードつき<br />
                </div>
              </section>
            </article>
          </div>
        </section>
      </section>
      <!-- main close -->
    </div>
  </body>
</html>
<!--  -->`;

module.exports = mockNiadQeHtml;
